'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Send, Mail, Phone, User, MessageSquare } from 'lucide-react';

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
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Save enquiry to DB
            await supabase.from('model_enquiries').insert({
                model_name: modelName,
                full_name: form.name,
                phone: form.phone,
                email: form.email,
                message: form.message,
            });
        } catch {
            // DB might not exist yet; still open email/telegram
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
                    <button type="submit" className="contact-model-submit" disabled={loading}>
                        <Send size={14} /> {loading ? 'Sending…' : 'Send Message'}
                    </button>
                </form>
            )}
        </div>
    );
}
