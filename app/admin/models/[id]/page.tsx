'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Trash2, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { UploadBox, uploadViaApi, MultiUploadBox } from '@/app/admin/AdminUpload';
import type { ModelPhoto } from '@/types';

const CATEGORIES = ['Fashion', 'Commercial', 'Runway', 'Editorial', 'Fitness', 'Plus Size', 'Petite', 'Other'];

interface ModelRow {
    id: string; name: string; age: number; height: string; weight: string;
    measurements: string; eyes_color: string; hair_color: string;
    dress_size: string; bust: string; waist: string; hips: string; shoe_size: string;
    category: string; bio: string; is_featured: boolean; cover_photo: string;
    contact_model_email: string; skills: { label: string; percent: number }[];
    instagram_link?: string; telegram_link?: string; whatsapp_number?: string;
}

export default function EditModelPage({ params }: { params: { id: string } }) {
    const [model, setModel] = useState<ModelRow | null>(null);
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [measurements, setMeasurements] = useState('');
    const [eyesColor, setEyesColor] = useState('');
    const [hairColor, setHairColor] = useState('');
    const [dressSize, setDressSize] = useState('');
    const [bust, setBust] = useState('');
    const [waist, setWaist] = useState('');
    const [hips, setHips] = useState('');
    const [shoeSize, setShoeSize] = useState('');
    const [category, setCategory] = useState('Fashion');
    const [bio, setBio] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    const [skills, setSkills] = useState<{ label: string; percent: number }[]>([]);
    const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
    const [telegram, setTelegram] = useState('');
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
                setWeight(md.weight || ''); setMeasurements(md.measurements || '');
                setEyesColor(md.eyes_color || ''); setHairColor(md.hair_color || '');
                setDressSize(md.dress_size || ''); setBust(md.bust || '');
                setWaist(md.waist || ''); setHips(md.hips || '');
                setShoeSize(md.shoe_size || ''); setCategory(md.category);
                setBio(md.bio || ''); setIsFeatured(md.is_featured);
                setSkills(Array.isArray(md.skills) ? md.skills : []);
                setCoverPhotoUrl(md.cover_photo || '');
                setTelegram(md.telegram_link || '');
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
                    name, age: parseInt(age), height, weight, measurements,
                    eyes_color: eyesColor, hair_color: hairColor,
                    dress_size: dressSize, bust, waist, hips, shoe_size: shoeSize,
                    category, bio, is_featured: isFeatured,
                    skills: skills.filter(s => s.label.trim()),
                    cover_photo: coverPhotoUrl,
                    telegram_link: telegram,
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
                                    <label className="form-label">Category</label>
                                    <input className="form-input" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Petite, Runway" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Bio</label>
                                <textarea className="form-textarea" value={bio} onChange={e => setBio(e.target.value)} rows={3} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Contact Telegram *</label>
                                <input className="form-input" value={telegram} onChange={e => setTelegram(e.target.value)} placeholder="https://t.me/username" required />
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <input type="checkbox" id="featured" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
                                <label htmlFor="featured" className="form-label" style={{ margin: 0 }}>Featured model</label>
                            </div>
                        </div>


                        {/* Measurements */}
                        <div className="admin-card">
                            <h3 className="admin-card-title">Measurements</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                {[
                                    { label: 'Height', val: height, set: setHeight },
                                    { label: 'Weight', val: weight, set: setWeight },
                                    { label: 'Eyes Color', val: eyesColor, set: setEyesColor },
                                    { label: 'Hair Color', val: hairColor, set: setHairColor },
                                    { label: 'Dress Size', val: dressSize, set: setDressSize },
                                    { label: 'Bust', val: bust, set: setBust },
                                    { label: 'Waist', val: waist, set: setWaist },
                                    { label: 'Hips', val: hips, set: setHips },
                                    { label: 'Shoe Size', val: shoeSize, set: setShoeSize },
                                    { label: 'Measurements', val: measurements, set: setMeasurements },
                                ].map(({ label, val, set }) => (
                                    <div className="form-group" key={label}>
                                        <label className="form-label">{label}</label>
                                        <input className="form-input" value={val} onChange={e => set(e.target.value)} />
                                    </div>
                                ))}
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
