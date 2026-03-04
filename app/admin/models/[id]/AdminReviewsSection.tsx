'use client';

import { useState, useRef, useEffect } from 'react';
import { Star, Camera, X, MessageSquare, Trash2, ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Review {
    id: string;
    rating: number;
    comment: string;
    screenshots: string[];
    created_at: string;
}

export default function AdminReviewsSection({ modelId }: { modelId: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [userName, setUserName] = useState(''); // Admin can specify who this is from
    const [screenshots, setScreenshots] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchReviews = async () => {
            const { data, error } = await supabase
                .from('model_reviews')
                .select('*')
                .eq('model_id', modelId)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setReviews(data);
            }
            setFetching(false);
        };
        fetchReviews();
    }, [modelId, supabase]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setScreenshots(prev => [...prev, ...newFiles].slice(0, 5));
        }
    };

    const removeFile = (index: number) => {
        setScreenshots(prev => prev.filter((_, i) => i !== index));
    };

    const uploadScreenshots = async (): Promise<string[]> => {
        const urls: string[] = [];
        for (const file of screenshots) {
            const ext = file.name.split('.').pop();
            const fileName = `admin-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
            const filePath = `reviews/${modelId}/${fileName}`;

            const { data, error } = await supabase.storage
                .from('model-photos')
                .upload(filePath, file);

            if (data) {
                const { data: { publicUrl } } = supabase.storage.from('model-photos').getPublicUrl(filePath);
                urls.push(publicUrl);
            }
        }
        return urls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const uploadedUrls = await uploadScreenshots();

            const res = await fetch('/api/admin/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model_id: modelId,
                    rating,
                    comment,
                    screenshots: uploadedUrls,
                    user_email: userName, // Optional name/email info
                }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to save review');

            toast.success('Review added successfully!');
            setReviews([json.data, ...reviews]);
            setRating(5);
            setComment('');
            setUserName('');
            setScreenshots([]);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm('Delete this review?')) return;
        try {
            const { error } = await supabase.from('model_reviews').delete().eq('id', reviewId);
            if (error) throw error;
            setReviews(prev => prev.filter(r => r.id !== reviewId));
            toast.success('Review deleted');
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <div className="admin-card">
            <h3 className="admin-card-title">Manage Reviews</h3>
            <p className="admin-page-subtitle" style={{ fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                Add screenshot reviews from WhatsApp/Telegram or delete existing ones.
            </p>

            <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '1rem' }}>
                    <div className="form-group">
                        <label className="form-label">Customer Name/Email (Manual)</label>
                        <input className="form-input" value={userName} onChange={e => setUserName(e.target.value)} placeholder="e.g. John D." />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Rating</label>
                        <select className="form-input" value={rating} onChange={e => setRating(parseInt(e.target.value))}>
                            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Review Comment</label>
                    <textarea className="form-textarea" value={comment} onChange={e => setComment(e.target.value)} rows={2} placeholder="Optional comment..." />
                </div>

                <div className="form-group">
                    <label className="form-label">Screenshots (Max 5)</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {screenshots.map((file, i) => (
                            <div key={i} style={{ width: 60, height: 60, position: 'relative', borderRadius: 4, overflow: 'hidden' }}>
                                <Image src={URL.createObjectURL(file)} alt="" fill style={{ objectFit: 'cover' }} />
                                <button type="button" onClick={() => removeFile(i)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', color: 'white', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                        {screenshots.length < 5 && (
                            <button type="button" onClick={() => fileInputRef.current?.click()} style={{ width: 60, height: 60, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <Camera size={20} />
                            </button>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple style={{ display: 'none' }} />
                </div>

                <button type="submit" className="btn btn-primary btn-sm" disabled={loading} style={{ marginTop: '0.5rem' }}>
                    {loading ? 'Adding...' : 'Add Review'}
                </button>
            </form>

            <div className="reviews-list-admin">
                {fetching ? <p>Loading reviews...</p> : reviews.length === 0 ? <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No reviews yet.</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {reviews.map(r => (
                            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', gap: '2px', marginBottom: '0.25rem' }}>
                                            {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < r.rating ? 'var(--accent)' : 'none'} color={i < r.rating ? 'var(--accent)' : 'rgba(255,255,255,0.2)'} />)}
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: 'white' }}>{r.comment || '(No comment)'}</p>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            {r.screenshots?.map((url, i) => (
                                                <div key={i} style={{ width: 40, height: 40, position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                                                    <Image src={url} alt="" fill style={{ objectFit: 'cover' }} sizes="40px" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(r.id)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
