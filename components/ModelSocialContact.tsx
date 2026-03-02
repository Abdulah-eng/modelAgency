'use client';

import { Instagram, Send, Phone } from 'lucide-react';

interface ModelSocialContactProps {
    instagram?: string;
    telegram?: string;
    whatsapp?: string;
    contactEmail?: string;
    name: string;
}

export default function ModelSocialContact({ instagram, telegram, whatsapp, contactEmail, name }: ModelSocialContactProps) {
    return (
        <div className="model-social-panel">
            <h3 className="social-title">Contact {name.split(' ')[0]}</h3>
            <p className="social-subtitle">Connect with this model directly via their social media or secure channels.</p>

            <div className="social-buttons-grid">
                {instagram && (
                    <a href={instagram} target="_blank" rel="noopener noreferrer" className="social-btn instagram">
                        <Instagram size={18} /> Instagram
                    </a>
                )}
                {telegram && (
                    <a href={`https://t.me/${telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="social-btn telegram">
                        <Send size={18} /> Telegram
                    </a>
                )}
                {whatsapp && (
                    <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="social-btn whatsapp">
                        <Phone size={18} /> WhatsApp
                    </a>
                )}
                {contactEmail && (
                    <a href={`mailto:${contactEmail}`} className="social-btn email">
                        Email Agency
                    </a>
                )}
            </div>

            <style jsx>{`
                .model-social-panel {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 2.5rem;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    max-width: 500px;
                    width: 100%;
                }
                .social-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 2.2rem;
                    color: white;
                    margin: 0;
                }
                .social-subtitle {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    line-height: 1.6;
                }
                .social-buttons-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-top: 0.5rem;
                }
                .social-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 0.85rem;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    transition: all 0.3s;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                }
                .social-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateY(-2px);
                }
                .instagram:hover { color: #E1306C; border-color: #E1306C; }
                .telegram:hover { color: #0088cc; border-color: #0088cc; }
                .whatsapp:hover { color: #25D366; border-color: #25D366; }
                .email {
                    grid-column: span 2;
                    background: var(--accent);
                    color: black;
                    border: none;
                }
                .email:hover {
                    background: white;
                    color: black;
                }

                @media (max-width: 1200px) {
                    .model-social-panel {
                        max-width: none;
                        padding: 2rem;
                    }
                }
            `}</style>
        </div>
    );
}
