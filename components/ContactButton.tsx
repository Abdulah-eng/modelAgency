import { MessageCircle } from 'lucide-react';

export default function ContactButton({ link }: { link: string }) {
    if (!link) return null;

    const href = link.startsWith('http') ? link : `https://wa.me/${link.replace(/[^0-9]/g, '')}`;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-btn contact-btn-floating"
            aria-label="Contact via WhatsApp"
        >
            <MessageCircle size={18} />
            Contact Us
        </a>
    );
}
