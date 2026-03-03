'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Model } from '@/types';

export default function ModelCard({ model }: { model: Model }) {
    const stats = [
        { label: 'Age', value: model.age },
        { label: 'Height', value: model.height || '—' },
        { label: 'Weight', value: model.weight || '—' },
        { label: 'Eyes', value: model.eyes_color || '—' },
        { label: 'Hair', value: model.hair_color || '—' },
        { label: 'Dress', value: model.dress_size || '—' },
        { label: 'Bust', value: model.bust || '—' },
        { label: 'Waist', value: model.waist || '—' },
        { label: 'Hips', value: model.hips || '—' },
        { label: 'Shoe', value: model.shoe_size || '—' },
    ].filter(s => s.value && s.value !== '—');

    return (
        <Link href={`/models/${model.slug}`} className="model-card" aria-label={`View ${model.name}`}>
            {/* Cover photo */}
            {model.cover_photo && (
                <Image
                    src={model.cover_photo}
                    alt={model.name}
                    fill
                    className="model-card-img"
                    sizes="(max-width: 600px) 50vw, (max-width: 1200px) 25vw, 20vw"
                />
            )}

            {/* Always-visible name bar */}
            <div className="model-card-namebar">
                <p className="model-card-cat">
                    {Array.isArray(model.category) ? model.category.join(' • ') : model.category}
                </p>
                <p className="model-card-name">{model.name}</p>
            </div>

            {/* Stats overlay — visible on hover */}
            <div className="model-card-stats">
                <p className="stats-name">{model.name}</p>
                <div className="stats-grid">
                    {stats.map((s) => (
                        <div key={s.label} className="stat-item">
                            <span className="stat-label">{s.label}</span>
                            <span className="stat-value">{String(s.value)}</span>
                        </div>
                    ))}
                </div>
                <div className="stats-view-btn">View Profile →</div>
            </div>
        </Link>
    );
}
