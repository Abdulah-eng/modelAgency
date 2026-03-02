export default function ContactSection({
    telegramLink,
}: {
    telegramLink?: string;
}) {
    return (
        <section className="contact-section" id="contact">
            <span className="section-eyebrow">Get In Touch</span>
            <h2 className="contact-section-title">Work With Us</h2>
            <p className="contact-section-sub">
                Interested in booking a model or joining our agency? Reach out to us directly via Telegram.
            </p>
            {telegramLink ? (
                <a
                    href={telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-tg-btn"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z" />
                    </svg>
                    Contact on Telegram
                </a>
            ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Telegram link not configured yet. Add it in Admin → Settings.
                </p>
            )}
        </section>
    );
}
