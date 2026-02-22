'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomSelect from '@/components/CustomSelect';
import { useToast } from '@/components/Toast';
import useAnimatedCounter from '@/hooks/useAnimatedCounter';
import DashboardMap from '@/components/DashboardMap';
import DashboardCharts from '@/components/DashboardCharts';
import { Activity, AlertTriangle, CheckCircle, Clock, RefreshCw, AlertCircle, MapPin, TrendingUp, UserCheck, ArrowUp, X, Eye, FileText, Image, Download } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'Open', label: 'Open', color: '#93C5FD' },
    { value: 'In Progress', label: 'In Progress', color: '#FBBF24' },
    { value: 'Resolved', label: 'Resolved', color: '#6EE7B7' },
    { value: 'Closed', label: 'Closed', color: '#6B5D4F' },
];

const STAFF_OPTIONS = [
    { value: '', label: 'Select Staff' },
    { value: 'Ramesh Kumar', label: 'Ramesh Kumar' },
    { value: 'Suresh Singh', label: 'Suresh Singh' },
    { value: 'Pradeep Verma', label: 'Pradeep Verma' },
    { value: 'Meena Devi', label: 'Meena Devi' },
    { value: 'Arun Yadav', label: 'Arun Yadav' },
    { value: 'Kavita Patel', label: 'Kavita Patel' },
];

const STATUS_MAP = {
    'Open': 'status-open',
    'In Progress': 'status-progress',
    'Resolved': 'status-resolved',
    'Closed': 'status-closed',
};

const ESCALATION_LABELS = ['Ward Officer', 'Block Officer', 'Sub-Divisional Officer', 'District Collector'];

function slaInfo(expiry) {
    const h = (new Date(expiry) - Date.now()) / 3600000;
    if (h < 0) return { label: 'Breached', cls: 'sla-breach', short: `${Math.abs(Math.round(h))}h over` };
    if (h < 24) return { label: 'At Risk', cls: 'sla-risk', short: `${Math.round(h)}h left` };
    const d = Math.floor(h / 24);
    return { label: 'On Track', cls: 'sla-ok', short: `${d}d left` };
}

const STAT_CONFIG = [
    { key: 'total', label: 'Total Filed', color: 'var(--amber)', icon: Activity },
    { key: 'pending', label: 'Pending Actions', color: '#FBBF24', icon: AlertTriangle },
    { key: 'resolved', label: 'Resolved', color: '#6EE7B7', icon: CheckCircle },
];

/* ========== SKELETON LOADER ========== */
function Skeleton({ w = '100%', h = 20, r = 8, mb = 0 }) {
    return (
        <div style={{ width: w, height: h, borderRadius: r, background: 'var(--border-0)', animation: 'skeleton-pulse 1.5s ease-in-out infinite', marginBottom: mb }} />
    );
}

function StatSkeleton() {
    return (
        <div className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <Skeleton w={80} h={10} />
                <Skeleton w={16} h={16} r="50%" />
            </div>
            <Skeleton w={60} h={36} />
        </div>
    );
}

function TableSkeleton() {
    return Array.from({ length: 3 }).map((_, i) => (
        <tr key={i}>
            <td><Skeleton w={140} h={14} mb={6} /><Skeleton w={180} h={12} /></td>
            <td><Skeleton w={50} h={12} /></td>
            <td><Skeleton w={70} h={22} r={12} /></td>
            <td><Skeleton w={60} h={22} r={12} /></td>
            <td><Skeleton w={120} h={30} /></td>
            <td><Skeleton w={110} h={30} /></td>
            <td><Skeleton w={50} h={12} /></td>
        </tr>
    ));
}

/* ========== ANIMATED STAT CARD ========== */
function AnimatedStat({ value, label, color, icon: Icon }) {
    const animated = useAnimatedCounter(value || 0);
    return (
        <div className="card card-glow animate-up" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                <Icon size={16} color={color} style={{ opacity: 0.8 }} />
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color, lineHeight: 1 }}>{animated}</p>
        </div>
    );
}

/* ========== DETAIL PANEL ========== */
function DetailPanel({ complaint: c, onClose }) {
    if (!c) return null;
    const sla = slaInfo(c.slaExpiry);
    return (
        <>
            <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998, animation: 'fade-in 0.2s ease-out' }} />
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: 440, zIndex: 999,
                background: 'var(--bg-1)', borderLeft: '1px solid var(--border-0)',
                overflowY: 'auto', animation: 'panel-in 0.3s ease-out',
                display: 'flex', flexDirection: 'column',
            }}>
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p className="mono" style={{ fontSize: 11, color: 'var(--amber)', marginBottom: 2 }}>{c.complaintId}</p>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-0)' }}>{c.title}</h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border-0)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-2)' }}>
                        <X size={15} />
                    </button>
                </div>

                <div style={{ padding: '20px 24px', flex: 1 }}>
                    {/* Status + SLA row */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                        <span className={`badge ${STATUS_MAP[c.status] || 'status-open'}`}>{c.status}</span>
                        <span className={`badge ${sla.cls}`}><Clock size={9} /> {sla.label} · {sla.short}</span>
                        {c.escalationLevel > 0 && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#FCA5A5', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '3px 10px', borderRadius: 'var(--r-pill)' }}>
                                ⚠️ L{c.escalationLevel} — {ESCALATION_LABELS[c.escalationLevel] || ''}
                            </span>
                        )}
                        {c.severity && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: c.severity === 'High' ? '#EF4444' : c.severity === 'Medium' ? 'var(--amber)' : '#93C5FD', background: 'transparent', border: `1px solid ${c.severity === 'High' ? 'rgba(239,68,68,0.3)' : c.severity === 'Medium' ? 'rgba(245,158,11,0.3)' : 'rgba(147,197,253,0.3)'}`, padding: '3px 10px', borderRadius: 'var(--r-pill)' }}>
                                {c.severity} Severity
                            </span>
                        )}
                        {c.category && c.category !== 'General' && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-1)', background: 'var(--bg-1)', border: '1px solid var(--border-1)', padding: '3px 10px', borderRadius: 'var(--r-pill)' }}>
                                {c.category}
                            </span>
                        )}
                    </div>

                    {/* Photo */}
                    {c.photoUrl && c.photoUrl !== 'local-photo-pending' && (
                        <div style={{ marginBottom: 20, borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--border-0)' }}>
                            <img src={c.photoUrl} alt="Complaint" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                        </div>
                    )}

                    {/* Description */}
                    <div style={{ marginBottom: 20 }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Description</p>
                        <p style={{ fontSize: 14, color: 'var(--text-1)', lineHeight: 1.7 }}>{c.description}</p>
                    </div>

                    {/* Location */}
                    <div style={{ marginBottom: 20, padding: 16, borderRadius: 'var(--r-md)', border: '1px solid var(--border-0)', background: 'var(--bg-card)' }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Location</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {c.location?.address && (
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <MapPin size={12} color="var(--amber)" />
                                    <span style={{ fontSize: 13, color: 'var(--text-1)' }}>{c.location.address}</span>
                                </div>
                            )}
                            {c.location?.ward && (
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--amber)', background: 'rgba(245,158,11,0.08)', border: '1px solid var(--border-0)', padding: '2px 10px', borderRadius: 4, alignSelf: 'flex-start' }}>{c.location.ward}</span>
                            )}
                            {c.location?.lat && c.location?.lng && (
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>📍 {c.location.lat.toFixed(5)}, {c.location.lng.toFixed(5)}</p>
                            )}
                        </div>
                    </div>

                    {/* Assignment */}
                    {c.assignedTo && (
                        <div style={{ marginBottom: 20, padding: 14, borderRadius: 'var(--r-md)', border: '1px solid rgba(16,185,129,0.15)', background: 'rgba(16,185,129,0.04)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <UserCheck size={14} color="#6EE7B7" />
                                <div>
                                    <p style={{ fontSize: 13, color: 'var(--text-0)', fontWeight: 600 }}>{c.assignedTo}</p>
                                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>Assigned Field Staff</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Activity Timeline */}
                    <div>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Activity Timeline</p>
                        <div style={{ position: 'relative', paddingLeft: 20 }}>
                            {/* Vertical line */}
                            <div style={{ position: 'absolute', left: 4, top: 4, bottom: 4, width: 1, background: 'var(--border-0)' }} />
                            {c.history?.map((h, i) => (
                                <div key={i} style={{ position: 'relative', marginBottom: i < c.history.length - 1 ? 18 : 0 }}>
                                    <div style={{ position: 'absolute', left: -20, top: 4, width: 9, height: 9, borderRadius: '50%', background: i === 0 ? 'var(--amber)' : 'var(--border-1)', border: i === 0 ? 'none' : '1px solid var(--border-1)' }} />
                                    <p style={{ fontSize: 13, color: 'var(--text-0)', fontWeight: 500, lineHeight: 1.4 }}>{h.action}</p>
                                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>
                                        {new Date(h.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {h.by}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-0)', display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>Filed: {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>By: {c.submittedBy}</p>
                </div>
            </div>
            <style>{`
                @keyframes panel-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </>
    );
}

/* ========== MAIN DASHBOARD ========== */
export default function Dashboard() {
    const router = useRouter();
    const toast = useToast();
    const [user, setUser] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
    const [refreshing, setRefreshing] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [filter, setFilter] = useState('All');
    const [wardFilter, setWardFilter] = useState('All Wards');
    const [assignMap, setAssignMap] = useState({});
    const [escalating, setEscalating] = useState(null);
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('civic_user');
        if (!stored) { router.push('/login'); return; }
        const u = JSON.parse(stored);
        if (u.role === 'Citizen') { router.push('/'); return; }
        setUser(u);
        fetchAll(u);
    }, []);

    const fetchAll = async (u = user) => {
        setRefreshing(true);
        try {
            const [c, s] = await Promise.all([
                fetch('/api/complaints').then(r => r.json()),
                fetch('/api/complaints/analytics').then(r => r.json()),
            ]);
            setComplaints(Array.isArray(c) ? c : []);
            setStats(s);
        } catch (e) { console.error(e); }
        setRefreshing(false);
        setInitialLoad(false);
    };

    const handleStatus = async (id, status) => {
        await fetch(`/api/complaints/${id}/status`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, officerName: user?.name, assignedTo: assignMap[id] || null }),
        });
        toast?.(`Status updated to "${status}"`, 'success');
        fetchAll();
    };

    const handleAssign = async (id, staff) => {
        if (!staff) return;
        setAssignMap(m => ({ ...m, [id]: staff }));
        await fetch(`/api/complaints/${id}/status`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'In Progress', officerName: user?.name, assignedTo: staff }),
        });
        toast?.(`Assigned to ${staff}`, 'success');
        fetchAll();
    };

    const handleEscalate = async (id) => {
        setEscalating(id);
        await fetch(`/api/complaints/${id}/escalate`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ by: user?.name }),
        });
        toast?.('Complaint escalated to higher authority', 'info');
        await fetchAll();
        setEscalating(null);
    };

    const exportToCSV = () => {
        if (!filtered || filtered.length === 0) {
            toast?.('No data to export', 'error');
            return;
        }

        const headers = ['Complaint ID', 'Title', 'Status', 'Ward', 'Assigned To', 'SLA Status', 'Escalation Level', 'Created At'];
        const csvRows = [headers.join(',')];

        filtered.forEach(c => {
            const row = [
                c.complaintId,
                `"${c.title.replace(/"/g, '""')}"`,
                c.status,
                c.location?.ward || 'Unassigned',
                c.assignedTo || 'None',
                (c.slaBreached ? 'Breached' : c.slaRisk ? 'At Risk' : 'Healthy'),
                c.escalationLevel || 0,
                new Date(c.createdAt).toLocaleDateString('en-IN')
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `CivicTrack_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast?.('Report downloaded successfully!', 'success');
    };

    const WARDS = ['All Wards', 'Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6'];
    const filtered = complaints.filter(c => {
        const statusOk = filter === 'All' || c.status === filter;
        const wardOk = wardFilter === 'All Wards' || c.location?.ward === wardFilter;
        return statusOk && wardOk;
    });
    const resolvedPct = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
    const animatedPct = useAnimatedCounter(resolvedPct);
    const breachCount = complaints.filter(c => c.slaBreach).length;

    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
                <Navbar />
                <main className="sys-container" style={{ paddingBottom: 60 }}>

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                        <div>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                                {user?.role === 'Admin' ? '// ADMIN CONSOLE' : '// OFFICER CONSOLE'} · {user?.ward}
                            </p>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em' }}>
                                Complaint Management
                            </h1>
                            <p style={{ color: 'var(--text-2)', fontSize: 14, marginTop: 4 }}>Monitor, assign, and resolve civic issues across your ward.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            {breachCount > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--r-pill)', padding: '7px 12px' }}>
                                    <span style={{ width: 7, height: 7, background: '#EF4444', borderRadius: '50%', animation: 'breach-pulse 2s ease-in-out infinite' }} />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FCA5A5', fontWeight: 700 }}>{breachCount} SLA Breach{breachCount > 1 ? 'es' : ''}</span>
                                </div>
                            )}
                            <button className="btn btn-primary" onClick={exportToCSV} disabled={refreshing || filtered.length === 0} style={{ padding: '9px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, var(--green), #059669)', border: 'none', color: '#fff' }}>
                                <Download size={13} /> Export .CSV
                            </button>
                            <button className="btn btn-ghost" onClick={() => fetchAll()} disabled={refreshing} style={{ padding: '9px 16px', fontSize: 13 }}>
                                <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} /> Refresh
                            </button>
                        </div>
                    </div>

                    {/* Stat Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
                        {initialLoad ? (
                            <>
                                <StatSkeleton />
                                <StatSkeleton />
                                <StatSkeleton />
                                <StatSkeleton />
                            </>
                        ) : (
                            <>
                                {STAT_CONFIG.map(({ key, label, color, icon }) => (
                                    <AnimatedStat key={key} value={stats[key]} label={label} color={color} icon={icon} />
                                ))}
                                {/* Resolution Rate */}
                                <div className="card animate-up" style={{ padding: 22 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Resolution Rate</p>
                                        <TrendingUp size={14} color="#6EE7B7" />
                                    </div>
                                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-0)', lineHeight: 1, marginBottom: 12 }}>
                                        {animatedPct}<span style={{ fontSize: 14, color: 'var(--text-2)' }}>%</span>
                                    </p>
                                    <div style={{ height: 3, background: 'var(--border-0)', borderRadius: 2, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${resolvedPct}%`, background: 'linear-gradient(90deg, var(--amber-d), #6EE7B7)', borderRadius: 2, transition: 'width 1s ease-out' }} />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>



                    {/* Table */}
                    <div className="card card-glow animate-up d4" style={{ overflow: 'hidden' }}>
                        {/* Filters */}
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-0)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 4 }}>// COMPLAINTS</p>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', background: 'var(--border-0)', padding: '2px 8px', borderRadius: 'var(--r-pill)', border: '1px solid var(--border-0)' }}>{filtered.length}</span>
                            <div style={{ flex: 1 }} />
                            {user?.role === 'Admin' && (
                                <CustomSelect
                                    options={WARDS.map(w => ({ value: w, label: w }))}
                                    value={wardFilter}
                                    onChange={setWardFilter}
                                    placeholder="All Wards"
                                    width={140}
                                    icon={MapPin}
                                />
                            )}
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(f => (
                                    <button key={f} onClick={() => setFilter(f)} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '4px 10px', borderRadius: 'var(--r-pill)', cursor: 'pointer', border: 'none', background: filter === f ? 'var(--amber)' : 'var(--border-0)', color: filter === f ? '#0d0b14' : 'var(--text-2)', fontWeight: filter === f ? 700 : 400, transition: 'all 0.15s' }}>{f}</button>
                                ))}
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table className="tbl">
                                <thead>
                                    <tr>
                                        <th>ID / Title</th>
                                        <th>Ward</th>
                                        <th>SLA</th>
                                        <th>Status</th>
                                        <th>Assign Staff</th>
                                        <th>Update</th>
                                        {user?.role === 'Admin' && <th>Escalate</th>}
                                        <th>Filed</th>
                                        <th style={{ width: 40 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {initialLoad ? <TableSkeleton /> : (
                                        <>
                                            {filtered.map(c => {
                                                const sla = slaInfo(c.slaExpiry);
                                                return (
                                                    <tr key={c._id} style={{ opacity: c.status === 'Closed' ? 0.6 : 1 }}>
                                                        <td>
                                                            <p className="mono" style={{ fontSize: 11, color: 'var(--amber)', marginBottom: 2 }}>{c.complaintId}</p>
                                                            <p style={{ color: 'var(--text-0)', fontWeight: 600, fontSize: 13, maxWidth: 200 }}>{c.title}</p>
                                                            {c.escalationLevel > 0 && (
                                                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#FCA5A5', marginTop: 2 }}>⚠️ Escalated L{c.escalationLevel}</p>
                                                            )}
                                                            {c.assignedTo && (
                                                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#6EE7B7', marginTop: 2 }}>👤 {c.assignedTo}</p>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)' }}>{c.location?.ward || '—'}</span>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <span className={`badge ${sla.cls}`}><Clock size={9} /> {sla.label}</span>
                                                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{sla.short}</p>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${STATUS_MAP[c.status] || 'status-open'}`}>{c.status}</span>
                                                        </td>
                                                        <td>
                                                            {c.status !== 'Closed' ? (
                                                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                                                    <CustomSelect
                                                                        options={STAFF_OPTIONS}
                                                                        value={assignMap[c._id] || c.assignedTo || ''}
                                                                        onChange={v => handleAssign(c._id, v)}
                                                                        placeholder="Select Staff"
                                                                        width={150}
                                                                        icon={UserCheck}
                                                                    />
                                                                </div>
                                                            ) : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{c.assignedTo || '—'}</span>}
                                                        </td>
                                                        <td>
                                                            <CustomSelect
                                                                options={STATUS_OPTIONS}
                                                                value={c.status}
                                                                onChange={v => handleStatus(c._id, v)}
                                                                disabled={c.status === 'Closed'}
                                                                width={140}
                                                            />
                                                        </td>
                                                        {user?.role === 'Admin' && (
                                                            <td>
                                                                {c.status !== 'Closed' && c.escalationLevel < 3 ? (
                                                                    <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 11 }}
                                                                        onClick={() => handleEscalate(c._id)} disabled={escalating === c._id}
                                                                        title="Escalate to higher authority">
                                                                        {escalating === c._id
                                                                            ? <span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                                                            : <><ArrowUp size={12} /> Escalate</>}
                                                                    </button>
                                                                ) : (
                                                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>
                                                                        {c.escalationLevel >= 3 ? 'Max level' : '—'}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        )}
                                                        <td>
                                                            <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>
                                                                {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button onClick={() => setSelectedComplaint(c)}
                                                                style={{ background: 'none', border: '1px solid var(--border-0)', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-3)', transition: 'all 0.15s' }}
                                                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--amber-d)'; e.currentTarget.style.color = 'var(--amber)'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-0)'; e.currentTarget.style.color = 'var(--text-3)'; }}
                                                                title="View details">
                                                                <Eye size={13} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {filtered.length === 0 && (
                                                <tr>
                                                    <td colSpan={user?.role === 'Admin' ? 9 : 8} style={{ textAlign: 'center', padding: 48, color: 'var(--text-3)' }}>
                                                        <AlertCircle size={24} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
                                                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>No complaints found.</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border-0)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>SLA Window: 3 days from submission</p>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>Auto-escalation triggers at SLA breach</p>
                        </div>
                    </div>

                    {/* Analytics Stretch Goals */}
                    {!initialLoad && complaints.length > 0 && (
                        <div className="animate-up d2" style={{ marginTop: 24 }}>
                            <DashboardCharts complaints={complaints} />
                            <DashboardMap complaints={complaints} />
                        </div>
                    )}
                </main>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <Footer />
            </div>

            {/* Detail Panel */}
            {selectedComplaint && <DetailPanel complaint={selectedComplaint} onClose={() => setSelectedComplaint(null)} />}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes skeleton-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
            `}</style>
        </div>
    );
}
