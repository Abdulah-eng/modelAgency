'use client';

import { useState } from 'react';
import { Send, Mail, Phone, User, MessageSquare } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';

export default function ContactModelForm({
    modelName,
    contactEmail,
    telegramLink,
}: {
    modelName: string;
    contactEmail?: string;
    telegramLink?: string;
}) {
    const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!turnstileToken) {
            alert('Please complete the CAPTCHA');
            return;
        }

        setLoading(true);
        try {
            // Save enquiry to DB via API (which handles Turnstile verification)
            const res = await fetch('/api/admin/enquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model_name: modelName,
                    full_name: form.name,
                    phone: form.phone,
                    email: form.email,
                    message: form.message,
                    enquiry_type: 'general',
                    turnstileToken,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to send message');
            }
        } catch (err: any) {
            console.error('Submission error:', err);
            // Even if DB fails, we usually still open email/telegram in the original code,
            // but for CAPTCHA failure we should stop. 
            // If it's a verification failure, res.ok will be false and we'll throw.
            setLoading(false);
            return;
        }

        const bodyText = `Hi, I'd like to contact ${modelName}.\n\nName: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\nMessage: ${form.message}`;
        if (contactEmail) {
            window.open(`mailto:${contactEmail}?subject=Enquiry for ${modelName}&body=${encodeURIComponent(bodyText)}`, '_blank');
        } else if (telegramLink) {
            window.open(telegramLink, '_blank');
        }

        setSubmitted(true);
        setLoading(false);
        setForm({ name: '', phone: '', email: '', message: '' });
        setTurnstileToken(null);
        setTimeout(() => setSubmitted(false), 6000);
    };

    const fields = [
        { key: 'name', placeholder: 'Full Name', icon: <User size={13} color="var(--accent)" />, type: 'text' },
        { key: 'phone', placeholder: 'Phone Number', icon: <Phone size={13} color="var(--accent)" />, type: 'tel' },
        { key: 'email', placeholder: 'Email Address', icon: <Mail size={13} color="var(--accent)" />, type: 'email' },
    ] as const;

    return (
        <div className="contact-model-form-wrap">
            <h3 className="contact-model-title">Contact Model</h3>
            {submitted ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <p style={{ color: 'var(--accent)', fontSize: '1.1rem', fontFamily: 'Cormorant Garamond,serif' }}>✓ Message sent!</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.4rem' }}>We&apos;ll be in touch soon.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="contact-model-form">
                    {fields.map(({ key, placeholder, icon, type }) => (
                        <div key={key} className="contact-model-field">
                            {icon}
                            <input
                                className="contact-model-input"
                                type={type}
                                placeholder={placeholder}
                                value={form[key]}
                                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                            />
                        </div>
                    ))}
                    <div className="contact-model-field contact-model-field-msg">
                        <MessageSquare size={13} color="var(--accent)" style={{ alignSelf: 'flex-start', marginTop: '0.15rem' }} />
                        <textarea
                            className="contact-model-input"
                            placeholder="Your Message"
                            value={form.message}
                            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                            rows={4}
                        />
                    </div>
                    <div className="contact-model-captcha" style={{ margin: '0.5rem 0' }}>
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
                    <button type="submit" className="contact-model-submit" disabled={loading}>
                        <Send size={14} /> {loading ? 'Sending…' : 'Send Message'}
                    </button>
                </form>
            )}
        </div>
    );
}
