'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { Star, User, MessageSquare, LogIn, Camera, X, ImageIcon, Trash2 } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import type { Review } from '@/types';

interface ModelReviewsProps {
    modelId: string;
    modelName: string;
}

export default function ModelReviews({ modelId, modelName }: ModelReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [screenshots, setScreenshots] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pathname = usePathname();
    const supabase = createClient();

    useEffect(() => {
        const fetchReviews = async () => {
            // Priority 1: Full join with profiles
            let { data, error } = await supabase
                .from('model_reviews')
                .select('*, profiles:user_id(email)')
                .eq('model_id', modelId)
                .order('created_at', { ascending: false });

            // Priority 2: Fallback if join relationship is missing
            if (error?.code === 'PGRST200' || error?.message?.includes('relationship')) {
                console.warn('Review join failed, falling back to manual profiles fetch');
                const { data: revs, error: revsErr } = await supabase
                    .from('model_reviews')
                    .select('*')
                    .eq('model_id', modelId)
                    .order('created_at', { ascending: false });

                if (!revsErr && revs) {
                    const userIds = revs.map(r => r.user_id).filter(Boolean);
                    const { data: profs } = await supabase
                        .from('profiles')
                        .select('id, email')
                        .in('id', userIds);

                    data = revs.map(r => ({
                        ...r,
                        profiles: profs?.find(p => p.id === r.user_id) || null
                    })) as any;
                    error = null;
                }
            }

            if (!error && data) {
                // @ts-ignore
                setReviews(data);
            }
            setLoading(false);
        };

        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };

        fetchReviews();
        checkUser();
    }, [modelId, supabase]);

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setScreenshots(prev => [...prev, ...newFiles].slice(0, 5)); // Limit to 5
        }
    };

    const removeFile = (index: number) => {
        setScreenshots(prev => prev.filter((_, i) => i !== index));
    };

    const uploadScreenshots = async (): Promise<string[]> => {
        const urls: string[] = [];
        for (const file of screenshots) {
            const ext = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
            const filePath = `reviews/${modelId}/${fileName}`;

            const { data, error } = await supabase.storage
                .from('model-photos') // Using correct bucket name
                .upload(filePath, file);

            if (data) {
                const { data: { publicUrl } } = supabase.storage.from('model-photos').getPublicUrl(filePath);
                urls.push(publicUrl);
            } else if (error) {
                console.error('Upload error:', error);
            }
        }
        return urls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        if (!turnstileToken) {
            toast.error('Please complete the CAPTCHA');
            return;
        }

        setSubmitting(true);
        try {
            let uploadedUrls: string[] = [];
            if (screenshots.length > 0) {
                setUploading(true);
                uploadedUrls = await uploadScreenshots();
                setUploading(false);
            }

            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model_id: modelId,
                    rating,
                    comment,
                    screenshots: uploadedUrls,
                    turnstileToken,
                }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to submit review');

            toast.success('Review submitted! Thank you.');

            // Optimistic update
            const newReview: Review = {
                id: Math.random().toString(),
                model_id: modelId,
                user_id: user.id,
                rating,
                comment,
                screenshots: uploadedUrls,
                created_at: new Date().toISOString(),
                profiles: { email: user.email }
            };
            setReviews([newReview, ...reviews]);
            setRating(0);
            setComment('');
            setScreenshots([]);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
            setUploading(false);
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm('Are you sure you want to delete your review?')) return;

        try {
            const { error } = await supabase
                .from('model_reviews')
                .delete()
                .eq('id', reviewId)
                .eq('user_id', user.id);

            if (error) throw error;

            toast.success('Review deleted');
            setReviews(prev => prev.filter(r => r.id !== reviewId));
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const hasUserReviewed = user && reviews.some(r => r.user_id === user.id);

    return (
        <section className="reviews-section">
            <div className="section-header">
                <span className="section-eyebrow">Feedback</span>
                <h2 className="section-title">Model Reviews</h2>
                {averageRating && (
                    <div className="avg-rating-display">
                        <Star className="star-filled" size={24} fill="var(--accent)" />
                        <span className="avg-val">{averageRating}</span>
                        <span className="avg-count">({reviews.length} reviews)</span>
                    </div>
                )}
            </div>

            <div className="reviews-container">
                {/* Submit Form */}
                <div className="review-form-card">
                    {user ? (
                        hasUserReviewed ? (
                            <div className="reviewed-already">
                                <MessageSquare size={32} />
                                <h3>You&apos;ve already reviewed {modelName}</h3>
                                <p>Thank you for sharing your feedback with the community.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <h3>Write a Review</h3>
                                <p>Share your experience with {modelName}</p>

                                <div className="rating-picker">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className="star-btn"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(0)}
                                        >
                                            <Star
                                                size={28}
                                                fill={(hover || rating) >= star ? 'var(--accent)' : 'none'}
                                                color={(hover || rating) >= star ? 'var(--accent)' : 'rgba(255,255,255,0.2)'}
                                            />
                                        </button>
                                    ))}
                                    <span className="rating-label">{rating ? `${rating} Stars` : 'Select rating'}</span>
                                </div>

                                <div className="form-group">
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Tell us what you think..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={4}
                                    />
                                </div>

                                {/* Screenshot Upload */}
                                <div className="screenshot-upload-section">
                                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Add Screenshots (Max 5)</span>
                                        <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{screenshots.length}/5</span>
                                    </label>
                                    <div className="screenshot-previews">
                                        {screenshots.map((file, i) => (
                                            <div key={i} className="preview-item">
                                                <Image src={URL.createObjectURL(file)} alt="" fill style={{ objectFit: 'cover' }} />
                                                <button type="button" className="remove-btn" onClick={() => removeFile(i)}><X size={12} /></button>
                                            </div>
                                        ))}
                                        {screenshots.length < 5 && (
                                            <button type="button" className="add-screenshot-btn" onClick={() => fileInputRef.current?.click()}>
                                                <Camera size={20} />
                                                <span>Upload</span>
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        multiple
                                        style={{ display: 'none' }}
                                    />
                                </div>

                                <div className="review-captcha" style={{ marginTop: '1.5rem' }}>
                                    {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
                                        <Turnstile
                                            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                                            onSuccess={(token) => setTurnstileToken(token)}
                                            onExpire={() => setTurnstileToken(null)}
                                            onError={() => setTurnstileToken(null)}
                                            options={{ theme: 'dark' }}
                                        />
                                    ) : (
                                        <p style={{ color: '#e74c3c', fontSize: '0.8rem' }}>CAPTCHA Site Key missing</p>
                                    )}
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={submitting || uploading} style={{ marginTop: '1.5rem', width: '100%' }}>
                                    {submitting ? (uploading ? 'Uploading Images...' : 'Submitting...') : 'Post Review'}
                                </button>
                            </form>
                        )
                    ) : (
                        <div className="login-prompt">
                            <LogIn size={40} />
                            <h3>Login to Review</h3>
                            <p>You must be signed in to rate and review models.</p>
                            <Link href={`/auth/login?redirect=${pathname}`} className="btn btn-accent">
                                Sign In Now
                            </Link>
                        </div>
                    )}
                </div>

                {/* Reviews List */}
                <div className="reviews-list">
                    {loading ? (
                        <div className="reviews-loading">Loading reviews...</div>
                    ) : reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.id} className="review-card">
                                <div className="review-header">
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <span className="user-email">{(review.profiles?.email || 'Anonymous').split('@')[0]}</span>
                                            <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div className="review-stars">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={14}
                                                    fill={i < review.rating ? 'var(--accent)' : 'none'}
                                                    color={i < review.rating ? 'var(--accent)' : 'rgba(255,255,255,0.2)'}
                                                />
                                            ))}
                                        </div>
                                        {user && user.id === review.user_id && (
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="delete-review-btn"
                                                title="Delete your review"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {review.comment && (
                                    <p className="review-comment">{review.comment}</p>
                                )}

                                {review.screenshots && review.screenshots.length > 0 && (
                                    <div className="review-screenshots">
                                        {review.screenshots.map((url, i) => (
                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="review-screenshot-item">
                                                <Image src={url} alt={`Screenshot ${i + 1}`} fill style={{ objectFit: 'cover' }} sizes="100px" />
                                                <div className="zoom-overlay"><ImageIcon size={16} /></div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="no-reviews">
                            <MessageSquare size={48} />
                            <p>No reviews yet. Be the first to share your feedback!</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .reviews-section {
                    padding: 4rem 2rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .avg-rating-display {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-top: 1rem;
                }
                .avg-val {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: white;
                }
                .avg-count {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }
                .reviews-container {
                    display: grid;
                    grid-template-columns: 400px 1fr;
                    gap: 3rem;
                    margin-top: 3rem;
                }
                .review-form-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 2rem;
                    border-radius: 12px;
                    height: fit-content;
                    position: sticky;
                    top: 2rem;
                }
                .rating-picker {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    margin: 1.5rem 0;
                }
                .star-btn {
                    background: none;
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .star-btn:hover {
                    transform: scale(1.1);
                }
                .rating-label {
                    margin-left: 0.75rem;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }
                .screenshot-upload-section {
                    margin-top: 1.5rem;
                }
                .screenshot-previews {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.75rem;
                    margin-top: 0.75rem;
                }
                .preview-item {
                    aspect-ratio: 1;
                    position: relative;
                    border-radius: 6px;
                    overflow: hidden;
                    background: rgba(255,255,255,0.05);
                }
                .remove-btn {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    background: rgba(0,0,0,0.6);
                    color: white;
                    border: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 10;
                }
                .add-screenshot-btn {
                    aspect-ratio: 1;
                    background: rgba(255,255,255,0.03);
                    border: 1px dashed rgba(255,255,255,0.1);
                    border-radius: 6px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.4rem;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .add-screenshot-btn:hover {
                    background: rgba(255,255,255,0.06);
                    border-color: var(--accent);
                    color: var(--accent);
                }
                .add-screenshot-btn span {
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .login-prompt, .reviewed-already {
                    text-align: center;
                    padding: 2rem 1rem;
                }
                .login-prompt h3, .reviewed-already h3 {
                    margin: 1.5rem 0 0.5rem;
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.8rem;
                }
                .login-prompt p, .reviewed-already p {
                    color: var(--text-muted);
                    margin-bottom: 2rem;
                    font-size: 0.95rem;
                }
                .reviews-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .review-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    padding: 1.5rem;
                    border-radius: 8px;
                }
                .review-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .user-avatar {
                    width: 32px;
                    height: 32px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .user-email {
                    display: block;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: white;
                }
                .review-date {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
                .review-comment {
                    color: var(--text-muted);
                    line-height: 1.6;
                    font-size: 0.95rem;
                    margin-bottom: 1rem;
                }
                .review-screenshots {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    margin-top: 1rem;
                }
                .review-screenshot-item {
                    width: 80px;
                    height: 80px;
                    position: relative;
                    border-radius: 4px;
                    overflow: hidden;
                    cursor: zoom-in;
                }
                .zoom-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .review-screenshot-item:hover .zoom-overlay {
                    opacity: 1;
                }
                .no-reviews {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: var(--text-muted);
                    background: rgba(255,255,255,0.01);
                    border-radius: 12px;
                }
                .no-reviews p {
                    margin-top: 1rem;
                }
                .delete-review-btn {
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.2);
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .delete-review-btn:hover {
                    color: #e74c3c;
                    transform: scale(1.1);
                }

                @media (max-width: 900px) {
                    .reviews-container {
                        grid-template-columns: 1fr;
                    }
                    .review-form-card {
                        position: static;
                    }
                }
            `}</style>
        </section>
    );
}
