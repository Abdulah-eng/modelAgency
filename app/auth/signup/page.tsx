'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/login`,
            }
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Check your email to confirm your account!');
            router.push('/auth/login');
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Create Account</h1>
                <p>Sign up to start reviewing models</p>
                <form onSubmit={handleSignup}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="your@email.com"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                    >
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                    <div className="auth-footer">
                        Already have an account? <Link href="/auth/login">Sign In</Link>
                    </div>
                    <div className="auth-footer" style={{ marginTop: '0.5rem' }}>
                        <Link href="/" style={{ color: 'var(--text-muted)' }}>← Back to Home</Link>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .auth-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #050505;
                    padding: 2rem;
                }
                .auth-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 3rem;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 450px;
                    text-align: center;
                }
                h1 {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 2.5rem;
                    color: white;
                    margin-bottom: 0.5rem;
                }
                p {
                    color: var(--text-muted);
                    margin-bottom: 2.5rem;
                }
                .form-group {
                    text-align: left;
                    margin-bottom: 1.5rem;
                }
                .auth-footer {
                    margin-top: 1.5rem;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }
                .auth-footer a {
                    color: var(--accent);
                    text-decoration: none;
                    font-weight: 600;
                }
                .auth-footer a:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
}
