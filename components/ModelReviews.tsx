'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Star, User, MessageSquare, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    const [submitting, setSubmitting] = useState(false);
    const pathname = usePathname();
    const supabase = createClient();

    useEffect(() => {
        const fetchReviews = async () => {
            const { data, error } = await supabase
                .from('model_reviews')
                .select('*, profiles:user_id(email)')
                .eq('model_id', modelId)
                .order('created_at', { ascending: false });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model_id: modelId, rating, comment }),
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
                created_at: new Date().toISOString(),
                profiles: { email: user.email }
            };
            setReviews([newReview, ...reviews]);
            setRating(0);
            setComment('');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
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

                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Post Review'}
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
                                            <span className="user-email">{review.profiles?.email.split('@')[0]}</span>
                                            <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
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
                                </div>
                                {review.comment && (
                                    <p className="review-comment">{review.comment}</p>
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
