'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, User, LogIn, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar({ siteName, phoneNumber, logoUrl }: { siteName?: string; phoneNumber?: string; logoUrl?: string }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };
        checkUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <>
            <nav className="navbar">
                {/* Logo */}
                <Link href="/" className="navbar-logo">
                    {logoUrl ? (
                        <div style={{ position: 'relative', height: '40px', width: '160px' }}>
                            <Image src={logoUrl} alt={siteName || 'Logo'} fill style={{ objectFit: 'contain', objectPosition: 'left' }} />
                        </div>
                    ) : (
                        <>
                            <span className="navbar-logo-main">
                                <span>{(siteName || 'Elara')[0]}</span>
                                {(siteName || 'Elara').slice(1)}
                            </span>
                            <span className="navbar-logo-sub">Model Agency</span>
                        </>
                    )}
                </Link>

                {/* Phone number */}
                {phoneNumber && (
                    <div className="navbar-phone">
                        <span className="navbar-phone-accent">{phoneNumber.split(' ')[0]}</span>
                        <span className="navbar-phone-number">{phoneNumber.split(' ').slice(1).join(' ')}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="navbar-actions">
                    {user ? (
                        <>
                            <button className="navbar-icon-btn" onClick={handleSignOut} title="Sign Out">
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <Link href="/auth/login" className="navbar-icon-btn" title="Login">
                            <LogIn size={18} />
                        </Link>
                    )}
                    <button className="navbar-icon-btn" aria-label="Profile">
                        <User size={18} />
                    </button>
                    <button
                        className="navbar-menu-btn"
                        onClick={() => setMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <Search size={15} />
                        MENU
                    </button>
                </div>
            </nav>

            {/* Full-screen overlay nav */}
            <div className={`nav-overlay ${menuOpen ? 'open' : ''}`}>
                <button
                    className="nav-overlay-close"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
                >×</button>
                <ul className="nav-overlay-links">
                    <li><Link href="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
                    <li><Link href="/#models" onClick={() => setMenuOpen(false)}>Our Models</Link></li>
                    <li><Link href="/#about" onClick={() => setMenuOpen(false)}>About</Link></li>
                    <li><Link href="/#contact" onClick={() => setMenuOpen(false)}>Contact</Link></li>
                </ul>
            </div>
        </>
    );
}
