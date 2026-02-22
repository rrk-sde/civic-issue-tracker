import { Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="sys-footer" style={{
            borderTop: '1px solid var(--border-0)',
            marginTop: 60,
            background: 'var(--bg-1)',
            backdropFilter: 'blur(24px)'
        }}>
            <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'space-between' }}>

                {/* Brand */}
                <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-0)', marginBottom: 8, letterSpacing: '-0.02em' }}>
                        CivicTrack<span style={{ color: 'var(--amber)' }}>.ai</span>
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 280, lineHeight: 1.6 }}>
                        Modernizing grassroots grievance redressal. Enabling citizens, empowering local authorities.
                    </p>
                </div>

                {/* Links */}
                <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap' }}>
                    <div>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-0)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 16 }}>Platform</p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <li><a href="#" style={{ fontSize: 13, color: 'var(--text-2)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--amber)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}>About Us</a></li>
                            <li><a href="#" style={{ fontSize: 13, color: 'var(--text-2)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--amber)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}>How it Works</a></li>
                            <li><a href="#" style={{ fontSize: 13, color: 'var(--text-2)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--amber)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}>Open Data API</a></li>
                        </ul>
                    </div>

                    <div>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-0)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 16 }}>Tech Stack</p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <li><span style={{ fontSize: 13, color: 'var(--text-2)' }}>Next.js 16</span></li>
                            <li><span style={{ fontSize: 13, color: 'var(--text-2)' }}>MongoDB + Mongoose</span></li>
                            <li><span style={{ fontSize: 13, color: 'var(--text-2)' }}>Cloudinary (Image Hosting)</span></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1240, margin: '40px auto 0', paddingTop: 24, borderTop: '1px solid var(--border-0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>
                    © {new Date().getFullYear()} CivicTrack Initiative. Open Source for Public Good.
                </p>
                <div style={{ display: 'flex', gap: 16 }}>
                    <a href="#" style={{ color: 'var(--text-3)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}><Github size={16} /></a>
                    <a href="#" style={{ color: 'var(--text-3)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}><Twitter size={16} /></a>
                    <a href="#" style={{ color: 'var(--text-3)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}><Mail size={16} /></a>
                </div>
            </div>
        </footer>
    );
}
