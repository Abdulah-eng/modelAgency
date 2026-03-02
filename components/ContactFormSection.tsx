'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

export default function ContactFormSection({
    siteName,
    phone,
    email,
    address,
    telegramLink,
}: {
    siteName?: string;
    phone?: string;
    email?: string;
    address?: string;
    telegramLink?: string;
}) {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', city: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Save to Database
        try {
            await fetch('/api/admin/enquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message,
                    enquiry_type: 'general',
                }),
            });
        } catch (err) {
            console.error('Failed to save enquiry to DB:', err);
        }

        // 2. Open Email Client
        const body = encodeURIComponent(
            `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nCity: ${formData.city}\n\nMessage:\n${formData.message}`
        );
        if (email) {
            window.open(`mailto:${email}?subject=Contact Enquiry&body=${body}`, '_blank');
        } else if (telegramLink) {
            window.open(telegramLink, '_blank');
        }
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', city: '', message: '' });
        setTimeout(() => setSubmitted(false), 6000);
    };

    return (
        <section className="contact-form-section" id="contact">
            {/* Left info panel */}
            <div className="contact-form-info">
                <span className="contact-form-agency">{siteName || 'Agency'}</span>
                <h2 className="contact-form-title">Contact Us</h2>

                <div className="contact-details">
                    {phone && (
                        <div className="contact-detail-row">
                            <span className="contact-detail-label">Phone:</span>
                            <div>
                                {phone.split(',').map((p, i) => (
                                    <a key={i} href={`tel:${p.trim().replace(/\s+/g, '')}`} className="contact-detail-value">{p.trim()}</a>
                                ))}
                            </div>
                        </div>
                    )}
                    {email && (
                        <div className="contact-detail-row">
                            <span className="contact-detail-label">Email:</span>
                            <a href={`mailto:${email}`} className="contact-detail-value">{email}</a>
                        </div>
                    )}
                    {address && (
                        <div className="contact-detail-row">
                            <span className="contact-detail-label">Address:</span>
                            <span className="contact-detail-value" style={{ whiteSpace: 'pre-line' }}>{address}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Right form */}
            <div className="contact-form-right">
                {submitted ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <p style={{ fontSize: '1.2rem', color: 'var(--accent)', fontFamily: 'Cormorant Garamond,serif' }}>✓ Message sent!</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>We&apos;ll get back to you soon.</p>
                    </div>
                ) : (
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="contact-form-grid">
                            <div className="contact-field">
                                <User size={14} color="var(--accent)" />
                                <input
                                    className="contact-input"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                />
                            </div>
                            <div className="contact-field">
                                <Mail size={14} color="var(--accent)" />
                                <input
                                    className="contact-input"
                                    type="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                                />
                            </div>
                            <div className="contact-field">
                                <Phone size={14} color="var(--accent)" />
                                <input
                                    className="contact-input"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                                />
                            </div>
                            <div className="contact-field">
                                <MapPin size={14} color="var(--accent)" />
                                <input
                                    className="contact-input"
                                    placeholder="Your City"
                                    value={formData.city}
                                    onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="contact-field" style={{ marginTop: '0.75rem' }}>
                            <MessageSquare size={14} color="var(--accent)" style={{ alignSelf: 'flex-start', marginTop: '0.1rem' }} />
                            <textarea
                                className="contact-input contact-textarea"
                                placeholder="Your Message"
                                value={formData.message}
                                onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                                rows={4}
                            />
                        </div>
                        <button type="submit" className="contact-submit-btn">
                            Send Message
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}
