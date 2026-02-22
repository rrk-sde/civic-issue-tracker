'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Landmark, LayoutGrid, UserRound, LogOut, LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
    const path = usePathname();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [score, setScore] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('civic_user');
        if (stored) {
            const parsedUser = JSON.parse(stored);
            setUser(parsedUser);

            // Real Civic Karma logic: fetch 50 pts per submitted complaint
            if (parsedUser.role === 'Citizen') {
                fetch(`/api/complaints/score?name=${encodeURIComponent(parsedUser.name)}`)
                    .then(r => r.json())
                    .then(data => setScore(data.score))
                    .catch(() => setScore(0));
            }
        } else {
            setUser(null);
            setScore(null);
        }
    }, [path]); // re-read on route change

    const logout = () => {
        localStorage.removeItem('civic_user');
        setUser(null);
        router.push('/login');
    };

    return (
        <header className="topbar">
            <div className="sys-nav">

                {/* Logo */}
                <Link href={user?.role === 'Officer' || user?.role === 'Admin' ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <Landmark size={18} color="var(--amber)" strokeWidth={2} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em' }}>
                        <span className="gradient-text">Civic</span>
                        <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>Track</span>
                        <span style={{ color: 'var(--amber)', fontSize: 12, fontFamily: 'var(--font-mono)', marginLeft: 2 }}>·ai</span>
                    </span>
                </Link>

                {/* Nav */}
                <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Link href="/" className={`nav-link ${path === '/' ? 'active-citizen' : ''}`}>
                        <UserRound size={13} /> Citizen
                    </Link>
                    {(user?.role === 'Officer' || user?.role === 'Admin') && (
                        <Link href="/dashboard" className={`nav-link ${path === '/dashboard' ? 'active-dashboard' : ''}`}>
                            <LayoutGrid size={13} /> Dashboard
                        </Link>
                    )}
                </nav>

                {/* Right — user info + LIVE dot */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="hide-mobile" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-0)', fontWeight: 600 }}>{user.name}</p>
                                    {user.role === 'Citizen' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(245,158,11,0.2)' }} title="Civic Contribution Score">
                                            <span style={{ fontSize: 10 }}>🏆</span>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', fontWeight: 700 }}>{score !== null ? score : '...'} pts</span>
                                        </div>
                                    )}
                                </div>
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--amber)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{user.role}</p>
                            </div>
                            <button onClick={logout} style={{ background: 'none', border: '1px solid var(--border-0)', borderRadius: 8, padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#FCA5A5'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-0)'; e.currentTarget.style.color = 'var(--text-2)'; }}
                                title="Logout">
                                <LogOut size={14} />
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--amber)', textDecoration: 'none', border: '1px solid var(--border-1)', borderRadius: 8, padding: '6px 12px', transition: 'all 0.2s' }}>
                            <LogIn size={13} /> Login
                        </Link>
                    )}
                    <ThemeToggle />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E', display: 'inline-block' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.05em' }}>LIVE</span>
                    </div>
                </div>

            </div>
        </header>
    );
}
