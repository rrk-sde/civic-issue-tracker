'use client';

export const dynamic = 'force-dynamic';

export default function NotFound() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: 16,
            fontFamily: 'var(--font-body, sans-serif)',
        }}>
            <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--amber, #F59E0B)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                // 404
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-0, #FFFDF7)', letterSpacing: '-0.02em' }}>
                Page Not Found
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-2, #A89880)', maxWidth: 340, textAlign: 'center' }}>
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <a href="/" style={{
                marginTop: 8,
                background: 'var(--amber, #F59E0B)',
                color: '#0d0b14',
                border: 'none',
                borderRadius: 10,
                padding: '10px 24px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                textDecoration: 'none',
                display: 'inline-block',
            }}>
                Go Home
            </a>
        </div>
    );
}
