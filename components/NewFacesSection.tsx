import Image from 'next/image';
import Link from 'next/link';
import type { Model } from '@/types';

export default function NewFacesSection({
    models,
    siteName,
}: {
    models: Model[];
    siteName?: string;
}) {
    const featuredModel = models[0] || null;
    const listModels = models.slice(0, 5);

    return (
        <section className="new-faces-section">
            {/* Left panel */}
            <div className="new-faces-left">
                <div className="new-faces-heading">
                    <span className="new-faces-agency">{siteName || 'Agency'}</span>
                    <h2 className="new-faces-title">New Faces</h2>
                </div>
                <ul className="new-faces-list">
                    {listModels.map((model, i) => (
                        <li key={model.id}>
                            <Link href={`/models/${model.slug}`} className="new-faces-item">
                                <div className="new-faces-thumb">
                                    {model.cover_photo && (
                                        <Image src={model.cover_photo} alt={model.name} fill style={{ objectFit: 'cover', objectPosition: 'top' }} sizes="80px" />
                                    )}
                                </div>
                                <div className="new-faces-info">
                                    <p className="new-faces-name">{model.name}</p>
                                    <p className="new-faces-age">Age {model.age}</p>
                                </div>
                            </Link>
                            {i < listModels.length - 1 && <div className="new-faces-divider" />}
                        </li>
                    ))}
                </ul>
                {models.length > 5 && (
                    <Link href="/#models" className="new-faces-view-all">View All Models →</Link>
                )}
            </div>

            {/* Right panel: featured model big photo */}
            <div className="new-faces-right">
                {featuredModel?.cover_photo ? (
                    <Image
                        src={featuredModel.cover_photo}
                        alt={featuredModel.name}
                        fill
                        style={{ objectFit: 'cover', objectPosition: 'top center' }}
                        sizes="65vw"
                        priority
                    />
                ) : (
                    <div style={{ background: 'var(--dark-3)', width: '100%', height: '100%' }} />
                )}
                {featuredModel && (
                    <div className="new-faces-featured-overlay">
                        <Link href={`/models/${featuredModel.slug}`} className="new-faces-featured-link">
                            View Profile →
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
