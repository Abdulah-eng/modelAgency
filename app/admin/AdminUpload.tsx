'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Upload, Video, Trash2 } from 'lucide-react';

// ── Shared upload helper (uses service-role API to bypass storage RLS) ─────────
export async function uploadViaApi(file: File, folder: string): Promise<string> {
    const form = new FormData();
    form.append('file', file);
    form.append('folder', folder);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || 'Upload failed');
    return json.url as string;
}

// ── UploadBox: reusable image upload widget ──────────────────────────────────
export function UploadBox({
    label, hint, folder, previewUrl, onUrl, aspect = '16/9',
}: {
    label: string; hint?: string; folder: string;
    previewUrl?: string; onUrl: (url: string) => void; aspect?: string;
}) {
    const [preview, setPreview] = useState(previewUrl || '');
    const [uploading, setUploading] = useState(false);
    const id = `upload-${label.replace(/\s+/g, '-').toLowerCase()}`;

    useEffect(() => { setPreview(previewUrl || ''); }, [previewUrl]);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        setUploading(true);
        try {
            const url = await uploadViaApi(file, folder);
            onUrl(url);
            toast.success('Uploaded!');
        } catch (err: unknown) {
            toast.error((err as Error).message);
        } finally { setUploading(false); }
    };

    return (
        <div>
            <label htmlFor={id} className="upload-area" style={{ cursor: 'pointer', display: 'block' }}>
                {uploading && <p style={{ textAlign: 'center', color: 'var(--accent)' }}>Uploading…</p>}
                {!uploading && preview ? (
                    <div style={{ position: 'relative', width: '100%', aspectRatio: aspect, borderRadius: 8, overflow: 'hidden' }}>
                        <Image src={preview} alt={label} fill style={{ objectFit: 'cover' }} />
                    </div>
                ) : !uploading ? (
                    <>
                        <Upload size={28} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
                        <p>{label}</p>
                        {hint && <p style={{ fontSize: '0.7rem' }}>{hint}</p>}
                    </>
                ) : null}
            </label>
            <input id={id} type="file" accept="image/*" onChange={handleChange} style={{ display: 'none' }} />
        </div>
    );
}

// ── VideoUploadBox: reusable video upload widget ─────────────────────────────
export function VideoUploadBox({
    label, hint, folder, currentUrl, onUrl,
}: {
    label: string; hint?: string; folder: string;
    currentUrl?: string; onUrl: (url: string) => void;
}) {
    const [url, setUrl] = useState(currentUrl || '');
    const [uploading, setUploading] = useState(false);
    const id = `video-upload-${label.replace(/\s+/g, '-').toLowerCase()}`;

    useEffect(() => { setUrl(currentUrl || ''); }, [currentUrl]);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const uploaded = await uploadViaApi(file, folder);
            setUrl(uploaded);
            onUrl(uploaded);
            toast.success('Video uploaded!');
        } catch (err: unknown) {
            toast.error((err as Error).message);
        } finally { setUploading(false); }
    };

    return (
        <div>
            <label htmlFor={id} className="upload-area" style={{ cursor: 'pointer', display: 'block', marginBottom: '0.5rem' }}>
                {uploading ? (
                    <p style={{ textAlign: 'center', color: 'var(--accent)' }}>Uploading video…</p>
                ) : url ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                        <Video size={20} color="var(--accent)" />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                            {url.split('/').pop()}
                        </span>
                    </div>
                ) : (
                    <>
                        <Video size={28} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
                        <p>{label}</p>
                        {hint && <p style={{ fontSize: '0.7rem' }}>{hint}</p>}
                    </>
                )}
            </label>
            <input id={id} type="file" accept="video/*,video/mp4,video/webm" onChange={handleChange} style={{ display: 'none' }} />
            {url && !uploading && (
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem', wordBreak: 'break-all' }}>
                    URL: {url}
                </p>
            )}
        </div>
    );
}

// ── MultiUploadBox: for bulk image uploads (gallery) ──────────────────────────
export function MultiUploadBox({
    label, hint, folder, urls = [], onUrls,
}: {
    label: string; hint?: string; folder: string;
    urls: string[]; onUrls: (urls: string[]) => void;
}) {
    const [uploading, setUploading] = useState(false);
    const id = `multi-upload-${label.replace(/\s+/g, '-').toLowerCase()}`;

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        const newUrls = [...urls];
        try {
            for (const file of files) {
                const url = await uploadViaApi(file, folder);
                newUrls.push(url);
            }
            onUrls(newUrls);
            toast.success(`${files.length} uploads complete!`);
        } catch (err: unknown) {
            toast.error((err as Error).message);
        } finally {
            setUploading(false);
        }
    };

    const removePhoto = (idx: number) => {
        const updated = urls.filter((_, i) => i !== idx);
        onUrls(updated);
    };

    return (
        <div className="admin-card" style={{ padding: '1.5rem' }}>
            <h3 className="admin-card-title">{label}</h3>
            {hint && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{hint}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                {urls.map((url, i) => (
                    <div key={i} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Image src={url} alt={`Gallery ${i}`} fill style={{ objectFit: 'cover' }} />
                        <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer', padding: 4, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}

                <label
                    htmlFor={id}
                    className="upload-area"
                    style={{
                        cursor: 'pointer',
                        aspectRatio: '1/1',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        border: '1px dashed rgba(255,255,255,0.2)',
                        borderRadius: 6,
                        margin: 0
                    }}
                >
                    <Upload size={20} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.65rem' }}>{uploading ? '...' : 'Add'}</span>
                </label>
            </div>
            <input id={id} type="file" accept="image/*" multiple onChange={handleChange} style={{ display: 'none' }} />
        </div>
    );
}
