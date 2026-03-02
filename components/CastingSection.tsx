import Image from 'next/image';

export default function CastingSection({
    castingImageUrl,
    castingText,
    managerName,
    managerRole,
    telegramLink,
}: {
    castingImageUrl?: string;
    castingText?: string;
    managerName?: string;
    managerRole?: string;
    telegramLink?: string;
}) {
    return (
        <section className="casting-section">
            {/* Left: dark photo */}
            <div className="casting-photo">
                {castingImageUrl ? (
                    <Image src={castingImageUrl} alt="Casting" fill style={{ objectFit: 'cover', objectPosition: 'top' }} sizes="50vw" />
                ) : (
                    <div className="casting-photo-fallback" />
                )}
                <div className="casting-photo-overlay" />
            </div>

            {/* Right: content */}
            <div className="casting-content">
                <span className="casting-eyebrow">Join Us</span>
                <h2 className="casting-title">Successful Faces</h2>
                <p className="casting-body">
                    {castingText ||
                        'A dedicated team of highly experienced professionals have worked to sustain our success and bring the best talent to the fashion world. We represent some of the most successful faces in the industry.'}
                </p>

                {managerName && (
                    <div className="casting-manager">
                        <span className="casting-manager-name">{managerName}</span>
                        <span className="casting-manager-role">{managerRole || 'Casting Manager'}</span>
                    </div>
                )}

                {telegramLink && (
                    <a
                        href={telegramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="casting-btn"
                    >
                        Schedule Casting
                    </a>
                )}
            </div>
        </section>
    );
}
