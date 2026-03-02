'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { LayoutDashboard, Users, Settings, LogOut, Star, Mail } from 'lucide-react';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/models', label: 'Models', icon: Users },
    { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
    { href: '/admin/enquiries', label: 'Enquiries', icon: Mail },
    { href: '/admin/settings', label: 'Site Settings', icon: Settings },
];


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
        router.refresh();
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand">
                    <h2>Elara Admin</h2>
                    <p>Content Manager</p>
                </div>
                <nav className="admin-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={16} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div style={{ padding: '1rem' }}>
                    <button className="admin-nav-item btn-ghost" onClick={handleLogout} style={{ width: '100%', border: 'none', background: 'none', color: 'var(--text-muted)' }}>
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>
            <main className="admin-main">{children}</main>
        </div>
    );
}
