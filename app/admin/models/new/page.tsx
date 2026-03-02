'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { UploadBox, uploadViaApi, MultiUploadBox } from '@/app/admin/AdminUpload';

const CATEGORIES = ['Fashion', 'Commercial', 'Runway', 'Editorial', 'Fitness', 'Plus Size', 'Petite', 'Other'];

function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function NewModelPage() {
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
    const [contactEmail, setContactEmail] = useState('');
    const [skills, setSkills] = useState<{ label: string; percent: number }[]>([]);
    const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [instagram, setInstagram] = useState('');
    const [telegram, setTelegram] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
    const router = useRouter();

    const addSkill = () => setSkills(s => [...s, { label: '', percent: 80 }]);
    const removeSkill = (i: number) => setSkills(s => s.filter((_, idx) => idx !== i));
    const updateSkill = (i: number, key: 'label' | 'percent', val: string | number) =>
        setSkills(s => s.map((sk, idx) => idx === i ? { ...sk, [key]: val } : sk));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!coverPhotoUrl && !coverFile) { toast.error('Please upload a cover photo'); return; }
        setLoading(true);
        try {
            let photoUrl = coverPhotoUrl;
            if (coverFile) photoUrl = await uploadViaApi(coverFile, 'covers');

            const slug = slugify(name) + '-' + Date.now();
            const res = await fetch('/api/admin/models', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name, slug, age: parseInt(age),
                    height, weight, measurements,
                    eyes_color: eyesColor, hair_color: hairColor,
                    dress_size: dressSize, bust, waist, hips, shoe_size: shoeSize,
                    category, bio, is_featured: isFeatured,
                    contact_model_email: contactEmail,
                    skills: skills.filter(s => s.label.trim()),
                    cover_photo: photoUrl,
                    instagram_link: instagram,
                    telegram_link: telegram,
                    whatsapp_number: whatsapp,
                    gallery: galleryUrls,
                }),
            });
            const json = await res.json();
            if (!res.ok || json.error) throw new Error(json.error);
            toast.success('Model added!');
            router.push('/admin/models');
            router.refresh();
        } catch (err: unknown) {
            toast.error((err as Error).message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Link href="/admin/models" className="back-btn">← Back to Models</Link>
            <div className="admin-header">
                <h1 className="admin-page-title">Add New Model</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Basic Info */}
                        <div className="admin-card">
                            <h3 className="admin-card-title">Basic Info</h3>
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Age *</label>
                                    <input type="number" className="form-input" value={age} onChange={e => setAge(e.target.value)} required min="16" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category *</label>
                                    <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Bio</label>
                                <textarea className="form-textarea" value={bio} onChange={e => setBio(e.target.value)} rows={3} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Contact Email (for "Contact Model" form)</label>
                                <input type="email" className="form-input" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="model@example.com" />
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
                                    { label: 'Height', val: height, set: setHeight, ph: 'e.g. 183 cm' },
                                    { label: 'Weight', val: weight, set: setWeight, ph: 'e.g. 55 kg' },
                                    { label: 'Eyes Color', val: eyesColor, set: setEyesColor, ph: 'e.g. Blue' },
                                    { label: 'Hair Color', val: hairColor, set: setHairColor, ph: 'e.g. Brown' },
                                    { label: 'Dress Size', val: dressSize, set: setDressSize, ph: 'e.g. 4' },
                                    { label: 'Bust', val: bust, set: setBust, ph: 'e.g. 78 cm' },
                                    { label: 'Waist', val: waist, set: setWaist, ph: 'e.g. 58 cm' },
                                    { label: 'Hips', val: hips, set: setHips, ph: 'e.g. 86 cm' },
                                    { label: 'Shoe Size', val: shoeSize, set: setShoeSize, ph: 'e.g. 7.5' },
                                    { label: 'Measurements', val: measurements, set: setMeasurements, ph: '34-26-36' },
                                ].map(({ label, val, set, ph }) => (
                                    <div className="form-group" key={label}>
                                        <label className="form-label">{label}</label>
                                        <input className="form-input" value={val} onChange={e => set(e.target.value)} placeholder={ph} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="admin-card">
                            <h3 className="admin-card-title">Social Links</h3>
                            <div className="form-group">
                                <label className="form-label">Instagram Profile URL</label>
                                <input type="url" className="form-input" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/username" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Telegram Username</label>
                                <input className="form-input" value={telegram} onChange={e => setTelegram(e.target.value)} placeholder="@username" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">WhatsApp Number</label>
                                <input type="tel" className="form-input" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+1234567890" />
                            </div>
                        </div>

                        {/* Skill Bars */}
                        <div className="admin-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 className="admin-card-title" style={{ margin: 0 }}>Skill Bars</h3>
                                <button type="button" className="btn btn-ghost btn-sm" onClick={addSkill}><Plus size={13} /> Add Skill</button>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                Animated progress bars on the model page (e.g. Runway 85%)
                            </p>
                            {skills.length === 0 && (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '0.5rem 0' }}>
                                    No skills. Click &quot;Add Skill&quot;.
                                </p>
                            )}
                            {skills.map((sk, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 32px', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                    <input className="form-input" placeholder="Label (e.g. Runway)" value={sk.label} onChange={e => updateSkill(i, 'label', e.target.value)} style={{ padding: '0.55rem' }} />
                                    <input type="number" min={1} max={100} className="form-input" value={sk.percent} onChange={e => updateSkill(i, 'percent', parseInt(e.target.value) || 0)} style={{ padding: '0.55rem' }} />
                                    <button type="button" onClick={() => removeSkill(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cover Photo */}
                    <div className="admin-card">
                        <h3 className="admin-card-title">Cover Photo *</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Portrait orientation (2:3 ratio) recommended</p>
                        <UploadBox
                            label="Click to upload cover photo"
                            hint="Portrait 2:3 ratio — e.g. 800×1200px"
                            folder="covers"
                            onUrl={url => { setCoverPhotoUrl(url); setCoverFile(null); }}
                            aspect="2/3"
                        />

                        <MultiUploadBox
                            label="Photo Gallery"
                            hint="Select multiple portfolio photos (appears as auto-scrolling gallery)"
                            folder="gallery"
                            urls={galleryUrls}
                            onUrls={setGalleryUrls}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving…' : 'Add Model'}
                    </button>
                    <Link href="/admin/models" className="btn btn-ghost">Cancel</Link>
                </div>
            </form>
        </>
    );
}
