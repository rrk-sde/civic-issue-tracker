'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Landmark, Eye, EyeOff, LogIn, ShieldCheck, UserRound, LayoutGrid,
    MapPin, Camera, Clock, TrendingUp, CheckCircle, Zap, AlertTriangle, ArrowRight
} from 'lucide-react';

const DEMO_CREDS = [
    { role: 'Citizen', email: 'citizen@demo.com', password: 'citizen123', desc: 'Submit & track complaints', icon: UserRound, color: '#93C5FD', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
    { role: 'Officer', email: 'officer@ward1.com', password: 'officer123', desc: 'Manage & resolve issues', icon: ShieldCheck, color: 'var(--amber)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    { role: 'Admin', email: 'admin@civic.gov', password: 'admin123', desc: 'Full access + escalations', icon: LayoutGrid, color: '#6EE7B7', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
];

const FEATURES = [
    { icon: Camera, label: 'Photo Proof Upload', desc: 'Cloudinary-powered image storage per complaint', color: '#F97316' },
    { icon: MapPin, label: 'Geo-Tagged Location', desc: 'Browser geolocation for precise issue mapping', color: '#EF4444' },
    { icon: Clock, label: 'SLA Timer & Breach Alert', desc: '3-day resolution window with auto-escalation', color: '#FBBF24' },
    { icon: TrendingUp, label: 'Live Analytics', desc: 'Resolution rate and pending stats in real-time', color: '#6EE7B7' },
    { icon: ShieldCheck, label: 'Role-Based Access', desc: 'Citizen / Officer / Admin with JWT sessions', color: '#A78BFA' },
    { icon: Zap, label: 'Auto Escalation Engine', desc: 'Ward → Block → SDO → District Collector', color: '#F59E0B' },
];

function timeAgo(date) {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return `${Math.round(diff)}s ago`;
    if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
    return `${Math.round(diff / 86400)}d ago`;
}


export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activity, setActivity] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });

    useEffect(() => {
        fetch('/api/complaints').then(r => r.json()).then(data => {
            if (Array.isArray(data)) {
                const STATUS_COLORS = { 'Open': '#93C5FD', 'In Progress': '#FBBF24', 'Resolved': '#6EE7B7', 'Closed': '#6B5D4F' };
                setActivity(data.slice(0, 5).map(c => ({
                    id: c.complaintId,
                    action: c.status,
                    title: c.title,
                    time: timeAgo(c.createdAt),
                    color: STATUS_COLORS[c.status] || '#93C5FD',
                })));
            }
        }).catch(() => { });
        fetch('/api/complaints/analytics').then(r => r.json()).then(setStats).catch(() => { });
    }, []);

    const login = async (e, override = null) => {
        if (e) e.preventDefault();
        setLoading(true); setError('');
        const creds = override || { email, password };
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(creds),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Invalid credentials'); setLoading(false); return; }
            localStorage.setItem('civic_user', JSON.stringify({ token: data.token, role: data.role, name: data.name, ward: data.ward }));
            if (data.role === 'Citizen') router.push('/');
            else router.push('/dashboard');
        } catch { setError('Connection failed. Try again.'); }
        setLoading(false);
    };

    return (
        <div className="login-container" style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden' }}>

            {/* ======== LEFT PANEL ======== */}
            <div className="left-panel" style={{ flex: '0 0 55%', padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', zIndex: 1, borderRight: '1px solid var(--border-0)' }}>

                {/* Subtle glow */}
                <div style={{ position: 'absolute', top: '20%', left: '-10%', width: 500, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.05), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

                {/* Top — Logo + tagline */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
                        <Landmark size={22} color="var(--amber)" strokeWidth={2} />
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>
                            <span className="gradient-text">Civic</span>
                            <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>Track</span>
                            <span style={{ color: 'var(--amber)', fontSize: 13, fontFamily: 'var(--font-mono)', marginLeft: 3 }}>·ai</span>
                        </span>
                    </div>

                    <div style={{ marginBottom: 36 }}>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,3vw,48px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 14 }}>
                            Governance that<br /><span className="gradient-text">actually works.</span>
                        </h1>
                        <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 440 }}>
                            A digital complaint management platform for Panchayat / Ward-level governance. File issues, track resolution, and hold your ward accountable.
                        </p>
                    </div>

                    {/* Feature grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 36 }}>
                        {FEATURES.map(({ icon: Icon, label, desc, color }, i) => (
                            <div key={i} className="card" style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Icon size={14} color={color} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-0)', marginBottom: 2 }}>{label}</p>
                                    <p style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4 }}>{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom — Recent Activity Feed */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>LIVE WARD ACTIVITY</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {activity.length > 0 ? activity.map((a, i) => (
                            <div key={i} className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span className="mono" style={{ fontSize: 10, color: 'var(--amber)', flexShrink: 0 }}>{a.id}</span>
                                <span style={{ flex: 1, fontSize: 12, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: a.color, background: `${a.color}18`, border: `1px solid ${a.color}30`, padding: '2px 8px', borderRadius: 4, flexShrink: 0 }}>{a.action}</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', flexShrink: 0 }}>{a.time}</span>
                            </div>
                        )) : (
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', padding: '12px 0' }}>No complaints filed yet. Be the first!</p>
                        )}
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 }}>
                        {[
                            { n: stats.total, l: 'Total Filed', c: 'var(--amber)' },
                            { n: stats.resolved, l: 'Resolved', c: '#6EE7B7' },
                            { n: '3 days', l: 'SLA Window', c: '#93C5FD' },
                            { n: '4', l: 'Escalation Levels', c: '#A78BFA' },
                        ].map((s, i) => (
                            <div key={i} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-0)' }}>
                                <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: s.c, lineHeight: 1, marginBottom: 4 }}>{s.n}</p>
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ======== RIGHT PANEL — Login Form ======== */}
            <div className="right-panel" style={{ flex: '0 0 45%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 52px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '100%', maxWidth: 380 }}>

                    <div style={{ marginBottom: 32 }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-0)', marginBottom: 6 }}>Sign In</h2>
                        <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Access the Ward Civic Management System</p>
                    </div>

                    {/* Form */}
                    <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                        <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Email</label>
                                <input type="email" required placeholder="e.g., officer@ward1.com" className="field"
                                    value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                            </div>
                            <div>
                                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPw ? 'text' : 'password'} required placeholder="Enter password" className="field"
                                        style={{ paddingRight: 44 }} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
                                    <button type="button" onClick={() => setShowPw(v => !v)}
                                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }}>
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            {error && (
                                <p style={{ fontSize: 13, color: '#FCA5A5', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px' }}>{error}</p>
                            )}
                            <button type="submit" className="btn btn-amber" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
                                {loading
                                    ? <span style={{ width: 16, height: 16, border: '2px solid rgba(13,11,20,0.3)', borderTopColor: '#0d0b14', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    : <><LogIn size={15} /> Sign In</>}
                            </button>
                        </form>
                    </div>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--border-0)' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em' }}>DEMO ACCOUNTS</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border-0)' }} />
                    </div>

                    {/* Demo cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {DEMO_CREDS.map(({ role, email: e, password: p, desc, icon: Icon, color, bg, border }) => (
                            <button key={role} onClick={() => login(null, { email: e, password: p })}
                                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 'var(--r-md)', cursor: 'pointer', border: `1px solid ${border}`, background: bg, transition: 'all 0.2s', textAlign: 'left', width: '100%' }}
                                onMouseEnter={el => el.currentTarget.style.transform = 'translateX(4px)'}
                                onMouseLeave={el => el.currentTarget.style.transform = 'translateX(0)'}
                            >
                                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Icon size={16} color={color} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text-0)' }}>{role}</p>
                                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>{e} · {desc}</p>
                                </div>
                                <ArrowRight size={14} color={color} style={{ opacity: 0.6, flexShrink: 0 }} />
                            </button>
                        ))}
                    </div>

                    {/* Footer note */}
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textAlign: 'center', marginTop: 24, lineHeight: 1.6 }}>
                        Panchayat / Ward Civic Issue Tracker<br />
                        Built for Vibe-A-Thon 2026 · MongoDB + Next.js
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (max-width: 900px) {
                    .login-container { flex-direction: column !important; }
                    .left-panel { display: none !important; }
                    .right-panel { flex: 1 !important; padding: 32px 24px !important; }
                }
            `}</style>
        </div>
    );
}
