'use client';

import { Send, MessageCircle, Phone } from 'lucide-react';

interface ModelSocialContactProps {
    telegram?: string;
    whatsapp?: string;
    viber?: string;
    name: string;
}

export default function ModelSocialContact({ telegram, whatsapp, viber, name }: ModelSocialContactProps) {
    if (!telegram && !whatsapp && !viber) return null;

    const telegramLink = telegram ? (telegram.startsWith('http') ? telegram : `https://t.me/${telegram.replace('@', '')}`) : null;
    const whatsappLink = whatsapp ? (whatsapp.startsWith('http') ? whatsapp : `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`) : null;
    const viberLink = viber ? (viber.startsWith('viber') || viber.startsWith('http') ? viber : `viber://chat?number=${viber.replace(/[^0-9]/g, '')}`) : null;

    return (
        <div className="model-social-panel">
            <h3 className="social-title">Contact with us</h3>

            <div className="social-buttons-grid">
                {telegramLink && (
                    <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="social-btn telegram">
                        <Send size={18} /> Contact via Telegram
                    </a>
                )}
                {whatsappLink && (
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="social-btn whatsapp">
                        <MessageCircle size={18} /> Message on WhatsApp
                    </a>
                )}
                {viberLink && (
                    <a href={viberLink} target="_blank" rel="noopener noreferrer" className="social-btn viber">
                        <Phone size={18} /> Chat on Viber
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
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-top: 0.5rem;
                }
                .social-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 1rem;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    transition: all 0.3s;
                    border: 1px solid rgba(0, 136, 204, 0.3);
                    background: rgba(0, 136, 204, 0.1);
                    color: #0088cc;
                }
                .social-btn.whatsapp {
                    border-color: rgba(37, 211, 102, 0.3);
                    background: rgba(37, 211, 102, 0.1);
                    color: #25d366;
                }
                .social-btn.whatsapp:hover {
                    background: #25d366;
                    color: white;
                    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
                }
                .social-btn.viber {
                    border-color: rgba(115, 74, 155, 0.3);
                    background: rgba(115, 74, 155, 0.1);
                    color: #734a9b;
                }
                .social-btn.viber:hover {
                    background: #734a9b;
                    color: white;
                    box-shadow: 0 4px 12px rgba(115, 74, 155, 0.3);
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
