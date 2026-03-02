import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

import { createPublicSupabaseClient } from '@/lib/supabase-server';

export async function generateMetadata(): Promise<Metadata> {
    const supabase = createPublicSupabaseClient();
    const { data: settings } = await supabase.from('site_settings').select('site_name, site_favicon').limit(1).maybeSingle();

    return {
        title: settings?.site_name ? `${settings.site_name} — Premium Model Agency` : 'Elara Models — Premium Model Agency',
        description: 'A curated selection of professional models. Browse our portfolio and connect with talent.',
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
