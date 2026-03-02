'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Plus } from 'lucide-react';
import Image from 'next/image';
import { UploadBox, uploadViaApi } from '@/app/admin/AdminUpload';
import { createClient } from '@/lib/supabase';

interface Testimonial {
    id: string; name: string; role: string; quote: string;
    photo_url: string; sort_order: number; is_active: boolean;
}

const empty = { name: '', role: '', quote: '', photo_url: '', sort_order: 0, is_active: true };

export default function TestimonialsAdminPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    // Use service-role API for saves, browser client for reads
    useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    async function load() {
        const { data } = await supabase.from('testimonials').select('*').order('sort_order');
        setTestimonials((data as Testimonial[]) || []);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            if (editId) {
                // Use service-role PATCH
                const res = await fetch(`/api/admin/testimonials/${editId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                });
                const json = await res.json();
                if (!res.ok || json.error) throw new Error(json.error);
            } else {
                const res = await fetch('/api/admin/testimonials', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                });
                const json = await res.json();
                if (!res.ok || json.error) throw new Error(json.error);
            }
            toast.success(editId ? 'Updated!' : 'Added!');
            setForm(empty);
            setEditId(null);
            load();
        } catch (err: unknown) { toast.error((err as Error).message); }
        finally { setLoading(false); }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this testimonial?')) return;
        await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
        load();
        toast.success('Deleted');
    }

    function handleEdit(t: Testimonial) {
        setEditId(t.id);
        setForm({ name: t.name, role: t.role, quote: t.quote, photo_url: t.photo_url, sort_order: t.sort_order, is_active: t.is_active });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (
        <>
            <div className="admin-header">
                <h1 className="admin-page-title">Testimonials</h1>
                <p className="admin-page-subtitle">Manage client reviews shown on the homepage</p>
            </div>

            {/* Add / Edit Form */}
            <div className="admin-card" style={{ marginBottom: '2rem' }}>
                <h3 className="admin-card-title">{editId ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
                <form onSubmit={handleSave}>
                    {/* Photo upload */}
                    <div className="form-group">
                        <label className="form-label">Photo (circular portrait)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1rem', alignItems: 'start' }}>
                            <div>
                                {form.photo_url ? (
                                    <div style={{ position: 'relative', width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)' }}>
                                        <Image src={form.photo_url} alt="" fill style={{ objectFit: 'cover' }} sizes="120px" />
                                    </div>
                                ) : (
                                    <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'var(--dark-2)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Plus size={24} color="var(--text-muted)" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <UploadBox
                                    label="Upload photo"
                                    hint="Square image recommended"
                                    folder="testimonials"
                                    previewUrl=""
                                    onUrl={url => setForm(p => ({ ...p, photo_url: url }))}
                                    aspect="1/1"
                                />
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>— or paste URL —</p>
                                <input className="form-input" value={form.photo_url} onChange={e => setForm(p => ({ ...p, photo_url: e.target.value }))} placeholder="https://..." style={{ marginTop: '0.25rem' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Full Name *</label>
                            <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Role / Title</label>
                            <input className="form-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="Photographer, Designer…" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Quote *</label>
                        <textarea className="form-textarea" value={form.quote} onChange={e => setForm(p => ({ ...p, quote: e.target.value }))} rows={3} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 80px', gap: '1rem', alignItems: 'end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} />
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Order</label>
                            <input type="number" className="form-input" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) }))} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Active</label>
                            <input type="checkbox" style={{ width: 20, height: 20, accentColor: 'var(--accent)', marginTop: 12 }} checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : editId ? 'Save Changes' : 'Add Testimonial'}</button>
                        {editId && (
                            <button type="button" className="btn btn-ghost" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>
                        )}
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="admin-card">
                <h3 className="admin-card-title">All Testimonials ({testimonials.length})</h3>
                {testimonials.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No testimonials yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {testimonials.map(t => (
                            <div key={t.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: 'var(--dark-2)', borderRadius: 6 }}>
                                {t.photo_url && (
                                    <div style={{ position: 'relative', width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                                        <Image src={t.photo_url} alt={t.name} fill style={{ objectFit: 'cover' }} sizes="56px" />
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{t.name}</p>
                                    <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', margin: '0.15rem 0 0.4rem' }}>{t.role}</p>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>&ldquo;{t.quote}&rdquo;</p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                    <span className={`badge ${t.is_active ? 'badge-pink' : 'badge-gray'}`}>{t.is_active ? 'Active' : 'Hidden'}</span>
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(t)}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}><Trash2 size={13} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
