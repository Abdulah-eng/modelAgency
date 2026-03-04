import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

import { createPublicSupabaseClient } from '@/lib/supabase-server';

export async function generateMetadata(): Promise<Metadata> {
    const supabase = createPublicSupabaseClient();
    const { data: settings } = await supabase.from('site_settings').select('site_name, site_favicon').limit(1).maybeSingle();

    const baseUrl = 'https://merakispamanila.online';
    const siteTitle = settings?.site_name ? `${settings.site_name} — Premium Model Agency` : 'Meraki Spa Manila — Premium Model Agency';
    const siteDescription = 'A curated selection of professional models in Manila. Browse our portfolio and connect with premium talent for fashion, editorial, and commercial projects.';

    return {
        title: siteTitle,
        description: siteDescription,
        keywords: ['Meraki Spa Manila', 'Spa Manila', 'Massage Manila', 'Luxury Spa Philippines', 'Best Manila Spa', 'Model Agency Manila', 'Elara Models'],
        alternates: {
            canonical: baseUrl,
        },
        openGraph: {
            title: siteTitle,
            description: siteDescription,
            url: baseUrl,
            siteName: settings?.site_name || 'Meraki Spa Manila',
            locale: 'en_PH',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: siteTitle,
            description: siteDescription,
        },
        icons: {
            icon: settings?.site_favicon || '/favicon.ico',
        },
    };
}


export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                {children}
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: '#1a1a1a',
                            color: '#f5f5f0',
                            border: '1px solid rgba(255,255,255,0.08)',
                            fontSize: '0.85rem',
                        },
                    }}
                />
            </body>
        </html>
    );
}
