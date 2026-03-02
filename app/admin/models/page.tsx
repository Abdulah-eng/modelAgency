import Link from 'next/link';
import Image from 'next/image';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import DeleteModelButton from './DeleteModelButton';
import type { Model } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminModelsPage() {
    const supabase = createServerSupabaseClient();
    const { data: models } = await supabase
        .from('models')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <>
            <div className="admin-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <h1 className="admin-page-title">Models</h1>
                    <p className="admin-page-subtitle">Manage your model roster</p>
                </div>
                <Link href="/admin/models/new" className="btn btn-primary">+ Add Model</Link>
            </div>

            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Photo</th>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Category</th>
                            <th>Height</th>
                            <th>Featured</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(models as Model[])?.map((model) => (
                            <tr key={model.id}>
                                <td>
                                    {model.cover_photo ? (
                                        <Image
                                            src={model.cover_photo}
                                            alt={model.name}
                                            width={48}
                                            height={64}
                                            className="admin-table-img"
                                        />
                                    ) : (
                                        <div style={{ width: 48, height: 64, background: 'var(--dark-3)', borderRadius: 4 }} />
                                    )}
                                </td>
                                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{model.name}</td>
                                <td>{model.age}</td>
                                <td>
                                    <span className="badge badge-gold">{model.category}</span>
                                </td>
                                <td>{model.height || '—'}</td>
                                <td>
                                    <span className={`badge ${model.is_featured ? 'badge-gold' : 'badge-gray'}`}>
                                        {model.is_featured ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Link href={`/admin/models/${model.id}`} className="btn btn-ghost btn-sm">Edit</Link>
                                        <DeleteModelButton id={model.id} name={model.name} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {(!models || models.length === 0) && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                                    No models yet. <Link href="/admin/models/new" style={{ color: 'var(--accent)' }}>Add your first model →</Link>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
