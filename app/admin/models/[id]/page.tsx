'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Trash2, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { UploadBox, uploadViaApi, MultiUploadBox } from '@/app/admin/AdminUpload';
import AdminReviewsSection from './AdminReviewsSection';
import type { ModelPhoto } from '@/types';

interface ModelRow {
    id: string;
    name: string;
    age: number;
    height: string;
    weight: string;
    category: string[];
    bio: string;
    is_featured: boolean;
    cover_photo: string;
    skills: { label: string; percent: number }[];
    telegram_link?: string;
    whatsapp_link?: string;
    viber_link?: string;
}

export default function EditModelPage({ params }: { params: { id: string } }) {
    const [model, setModel] = useState<ModelRow | null>(null);
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [category, setCategory] = useState('Fashion');
    const [bio, setBio] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    const [skills, setSkills] = useState<{ label: string; percent: number }[]>([]);
    const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
    const [telegram, setTelegram] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [viber, setViber] = useState('');
    const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function load() {
            const [{ data: m }, { data: p }] = await Promise.all([
                supabase.from('models').select('*').eq('id', params.id).single(),
                supabase.from('model_photos').select('*').eq('model_id', params.id).order('sort_order'),
            ]);
            if (m) {
                const md = m as ModelRow;
                setModel(md);
                setName(md.name); setAge(String(md.age)); setHeight(md.height || '');
                setWeight(md.weight || '');
                setCategory(Array.isArray(md.category) ? md.category.join(', ') : (md.category || ''));
                setBio(md.bio || ''); setIsFeatured(md.is_featured);
                setSkills(Array.isArray(md.skills) ? md.skills : []);
                setCoverPhotoUrl(md.cover_photo || '');
                setTelegram(md.telegram_link || '');
                setWhatsapp(md.whatsapp_link || '');
                setViber(md.viber_link || '');
            }
            const photoUrls = (p as ModelPhoto[])?.map(ph => ph.url) || [];
            setGalleryUrls(photoUrls);
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/models/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name, age: parseInt(age), height, weight,
                    category: category.split(',').map(c => c.trim()).filter(Boolean),
                    bio, is_featured: isFeatured,
                    skills: skills.filter(s => s.label.trim()),
                    cover_photo: coverPhotoUrl,
                    telegram_link: telegram,
                    whatsapp_link: whatsapp,
                    viber_link: viber,
                    gallery: galleryUrls,
                }),
            });
            const json = await res.json();
            if (!res.ok || json.error) throw new Error(json.error);
            toast.success('Model updated!');
            router.refresh();
        } catch (err: unknown) {
            toast.error((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    if (!model) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading…</div>;

    return (
        <>
            <Link href="/admin/models" className="back-btn">← Back to Models</Link>
            <div className="admin-header">
                <h1 className="admin-page-title">Edit Model</h1>
                <p className="admin-page-subtitle">{model.name}</p>
            </div>

            <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Basic Info */}
                        <div className="admin-card">
                            <h3 className="admin-card-title">Basic Info</h3>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Age</label>
                                    <input type="number" className="form-input" value={age} onChange={e => setAge(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category (multiple? comma-separated)</label>
                                    <input className="form-input" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Fashion, Petite, Commercial" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Bio</label>
                                <textarea className="form-textarea" value={bio} onChange={e => setBio(e.target.value)} rows={3} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Telegram Link</label>
                                    <input className="form-input" value={telegram} onChange={e => setTelegram(e.target.value)} placeholder="https://t.me/…" />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">WhatsApp Link / Number</label>
                                    <input className="form-input" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="https://wa.me/…" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Viber Link / Number</label>
                                    <input className="form-input" value={viber} onChange={e => setViber(e.target.value)} placeholder="viber://chat?number=…" />
                                </div>
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <input type="checkbox" id="featured" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
                                <label htmlFor="featured" className="form-label" style={{ margin: 0 }}>Featured model</label>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="admin-card">
                            <h3 className="admin-card-title">Stats</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Height</label>
                                    <input className="form-input" value={height} onChange={e => setHeight(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Weight</label>
                                    <input className="form-input" value={weight} onChange={e => setWeight(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Skill Bars */}
                        <div className="admin-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 className="admin-card-title" style={{ margin: 0 }}>Skill Bars</h3>
                                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSkills(s => [...s, { label: '', percent: 80 }])}>
                                    <Plus size={13} /> Add Skill
                                </button>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                Animated progress bars on the model page
                            </p>
                            {skills.length === 0 && (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '0.5rem 0' }}>
                                    No skills. Click &quot;Add Skill&quot;.
                                </p>
                            )}
                            {skills.map((sk, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 32px', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                    <input className="form-input" placeholder="Label" value={sk.label} onChange={e => setSkills(s => s.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} style={{ padding: '0.55rem' }} />
                                    <input type="number" min={1} max={100} className="form-input" value={sk.percent} onChange={e => setSkills(s => s.map((x, idx) => idx === i ? { ...x, percent: parseInt(e.target.value) || 0 } : x))} style={{ padding: '0.55rem' }} />
                                    <button type="button" onClick={() => setSkills(s => s.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right column: cover + album */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Cover Photo */}
                        <div className="admin-card">
                            <h3 className="admin-card-title">Cover Photo</h3>
                            <UploadBox
                                label="Click to change cover photo"
                                hint="Portrait 2:3 ratio"
                                folder="covers"
                                previewUrl={coverPhotoUrl}
                                onUrl={setCoverPhotoUrl}
                                aspect="2/3"
                            />
                        </div>

                        {/* Photo Album */}
                        <div className="admin-card">
                            <MultiUploadBox
                                label="Photo Gallery"
                                hint="Select multiple portfolio photos (appears as auto-scrolling gallery)"
                                folder={`gallery/${params.id}`}
                                urls={galleryUrls}
                                onUrls={setGalleryUrls}
                            />
                        </div>

                        {/* Admin Reviews */}
                        <AdminReviewsSection modelId={params.id} />
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</button>
                    <Link href="/admin/models" className="btn btn-ghost">Cancel</Link>
                </div>
            </form>
        </>
    );
}
