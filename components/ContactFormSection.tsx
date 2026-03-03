'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, MessageSquare, MessageCircle } from 'lucide-react';

export default function ContactFormSection({
    siteName,
    phone,
    email,
    address,
    telegramLink,
    whatsappLink,
    viberLink,
}: {
    siteName?: string;
    phone?: string;
    email?: string;
    address?: string;
    telegramLink?: string;
    whatsappLink?: string;
    viberLink?: string;
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

                <div className="agency-social-buttons" style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {telegramLink && (
                        <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="agency-social-btn" style={{ background: '#0088cc' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z" /></svg>
                            Connect on Telegram
                        </a>
                    )}
                    {whatsappLink && (
                        <a href={whatsappLink.startsWith('http') ? whatsappLink : `https://wa.me/${whatsappLink.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="agency-social-btn" style={{ background: '#25d366' }}>
                            <MessageCircle size={18} /> Message on WhatsApp
                        </a>
                    )}
                    {viberLink && (
                        <a href={viberLink.startsWith('viber') || viberLink.startsWith('http') ? viberLink : `viber://chat?number=${viberLink.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="agency-social-btn" style={{ background: '#734a9b' }}>
                            <Phone size={18} /> Chat on Viber
                        </a>
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
