'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export interface Testimonial {
    id: string;
    name: string;
    role: string;
    quote: string;
    photo_url?: string;
}

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (testimonials.length <= 1) return;
        const t = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 6000);
        return () => clearInterval(t);
    }, [testimonials.length]);

    if (!testimonials.length) return null;

    const t = testimonials[index];

    return (
        <section className="testimonials-section">
            {/* Big decorative circles in bg */}
            <div className="testimonials-bg-circle testimonials-bg-circle-1" />
            <div className="testimonials-bg-circle testimonials-bg-circle-2" />

            <div className="testimonials-inner">
                {/* Portrait */}
                <div className="testimonials-photo">
                    {t.photo_url ? (
                        <Image src={t.photo_url} alt={t.name} fill style={{ objectFit: 'cover' }} sizes="140px" />
                    ) : (
                        <div className="testimonials-photo-placeholder">
                            {t.name[0]}
                        </div>
                    )}
                </div>

                {/* Name + role */}
                <p className="testimonials-name">{t.name}</p>
                <p className="testimonials-role">{t.role}</p>

                {/* Quote */}
                <div className="testimonials-quote-wrap">
                    <span className="testimonials-quote-mark testimonials-quote-open">&ldquo;</span>
                    <p className="testimonials-quote-text">{t.quote}</p>
                    <span className="testimonials-quote-mark testimonials-quote-close">&rdquo;</span>
                </div>

                {/* Dots nav */}
                {testimonials.length > 1 && (
                    <div className="testimonials-dots">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                className={`testimonials-dot ${i === index ? 'active' : ''}`}
                                onClick={() => setIndex(i)}
                                aria-label={`Testimonial ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
