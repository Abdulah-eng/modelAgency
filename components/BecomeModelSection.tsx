'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export default function BecomeModelSection({
    backgroundUrl,
    description,
    telegramLink,
}: {
    backgroundUrl?: string;
    description?: string;
    telegramLink?: string;
}) {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        if (telegramLink) {
            window.open(telegramLink, '_blank');
        } else {
            window.open(`mailto:?subject=Model Application&body=Email: ${email}`, '_blank');
        }
        setSubmitted(true);
        setEmail('');
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <section className="become-section">
            {backgroundUrl ? (
                <div className="become-bg" style={{ backgroundImage: `url(${backgroundUrl})` }} />
            ) : (
                <div className="become-bg become-bg-fallback" />
            )}
            <div className="become-overlay" />
            <div className="become-content">
                <span className="become-eyebrow">Become</span>
                <h2 className="become-title">Our Model</h2>
                <p className="become-desc">
                    {description ||
                        "If you are 5ft 8in and above and think you have what it takes to be a model, send us your headshot and full length shot along with all your parameters."}
                </p>
                {submitted ? (
                    <p className="become-success">✓ Thank you! We&apos;ll be in touch soon.</p>
                ) : (
                    <form className="become-form" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            className="become-input"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" className="become-submit" aria-label="Submit">
                            <Send size={16} />
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}
