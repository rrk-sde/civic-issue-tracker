'use client';
import dynamic from 'next/dynamic';

const MapInner = dynamic(() => import('./MapInner'), {
    ssr: false,
    loading: () => (
        <div className="card" style={{ padding: 24, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>// LOADING MAP...</p>
        </div>
    )
});

export default function DashboardMap({ complaints }) {
    return <MapInner complaints={complaints} />;
}
