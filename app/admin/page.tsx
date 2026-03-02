import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const supabase = createServerSupabaseClient();

    const [{ count: modelCount }, { data: settings }] = await Promise.all([
        supabase.from('models').select('*', { count: 'exact', head: true }),
        supabase.from('site_settings').select('site_name, telegram_link').single(),
    ]);

    const { count: photoCount } = await supabase
        .from('model_photos')
        .select('*', { count: 'exact', head: true });

    return (
        <>
            <div className="admin-header">
                <h1 className="admin-page-title">Dashboard</h1>
                <p className="admin-page-subtitle">Welcome to your model agency CMS</p>
            </div>

            <div className="admin-stats">
                <div className="stat-card">
                    <p className="stat-card-label">Total Models</p>
                    <p className="stat-card-value">{modelCount ?? 0}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-card-label">Total Photos</p>
                    <p className="stat-card-value">{photoCount ?? 0}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-card-label">Telegram</p>
                    <p className="stat-card-value" style={{ fontSize: '1rem', marginTop: '0.5rem', wordBreak: 'break-all', color: 'var(--text-secondary)' }}>
                        {settings?.telegram_link || 'Not set'}
                    </p>
                </div>
            </div>

            <div className="admin-card" style={{ marginTop: '2rem' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', marginBottom: '1rem' }}>Quick Actions</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <a href="/admin/models/new" className="btn btn-primary">+ Add Model</a>
                    <a href="/admin/models" className="btn btn-ghost">Manage Models</a>
                    <a href="/admin/settings" className="btn btn-ghost">Edit Site Settings</a>
                    <a href="/" target="_blank" className="btn btn-ghost">View Public Site ↗</a>
                </div>
            </div>
        </>
    );
}
