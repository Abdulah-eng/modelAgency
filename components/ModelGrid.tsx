'use client';

import ModelCard from './ModelCard';
import type { Model } from '@/types';

export default function ModelGrid({ models }: { models: Model[] }) {
    if (models.length === 0) {
        return (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No models in this category yet.
            </p>
        );
    }

    return (
        <div className="models-grid">
            {models.map((model) => (
                <div key={model.id} className="models-grid-item">
                    <ModelCard model={model} />
                </div>
            ))}
        </div>
    );
}
