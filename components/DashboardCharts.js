'use client';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];
const STATUS_COLORS = {
    'Open': '#3B82F6',
    'In Progress': '#F59E0B',
    'Resolved': '#10B981',
    'Closed': '#6B7280',
};

export default function DashboardCharts({ complaints }) {
    const wardData = useMemo(() => {
        const counts = {};
        complaints.forEach(c => {
            const w = c.location?.ward || 'Unspecified';
            counts[w] = (counts[w] || 0) + 1;
        });
        return Object.keys(counts).map(k => ({ name: k.replace('Ward ', 'W'), count: counts[k] })).sort((a, b) => b.count - a.count);
    }, [complaints]);

    const statusData = useMemo(() => {
        const counts = { 'Open': 0, 'In Progress': 0, 'Resolved': 0, 'Closed': 0 };
        complaints.forEach(c => {
            if (counts[c.status] !== undefined) counts[c.status]++;
        });
        return Object.keys(counts).map(k => ({ name: k, value: counts[k] })).filter(d => d.value > 0);
    }, [complaints]);

    if (!complaints || complaints.length === 0) return null;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16, marginBottom: 24 }} className="grid-bento">
            {/* Ward Bar Chart */}
            <div className="card" style={{ padding: 24, minHeight: 300, display: 'flex', flexDirection: 'column' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>// WARD DISTRIBUTION</p>
                <div style={{ flex: 1, minHeight: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={wardData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-3)', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                            <RechartsTooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ background: 'var(--bg-1)', border: '1px solid var(--border-0)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-mono)' }}
                                itemStyle={{ color: 'var(--text-0)' }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {wardData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Status Pie Chart */}
            <div className="card" style={{ padding: 24, minHeight: 300, display: 'flex', flexDirection: 'column' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>// STATUS SPREAD</p>
                <div style={{ flex: 1, minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#ccc'} />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                contentStyle={{ background: 'var(--bg-1)', border: '1px solid var(--border-0)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-mono)' }}
                                itemStyle={{ color: 'var(--text-0)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div style={{ position: 'absolute', pointerEvents: 'none', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--text-0)' }}>{complaints.length}</p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.05em' }}>TOTAL</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
