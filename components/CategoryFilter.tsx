'use client';

import { useState } from 'react';
import type { Model } from '@/types';
import AutoScrollRow from './AutoScrollRow';

const ALL_CATEGORIES = ['All', 'Fashion', 'Commercial', 'Runway', 'Editorial', 'Fitness', 'Plus Size', 'Petite', 'Other'];

export default function CategoryFilter({ models }: { models: Model[] }) {
    const [active, setActive] = useState('All');

    // Get only categories that have models
    const availableCategories = [
        'All',
        ...Array.from(new Set(models.flatMap((m) => {
            if (Array.isArray(m.category)) return m.category;
            if (typeof m.category === 'string' && m.category) return [m.category];
            return [];
        })))
    ];

    const filtered =
        active === 'All'
            ? models
            : models.filter((m) =>
                Array.isArray(m.category)
                    ? m.category.includes(active)
                    : m.category === active
            );

    return (
        <>
            {/* Category tabs */}
            <div className="categories-section" id="models">
                {availableCategories.map((cat) => (
                    <button
                        key={cat}
                        className={`category-btn ${active === cat ? 'active' : ''}`}
                        onClick={() => setActive(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Model carousel */}
            <div style={{ padding: '3rem 0 4rem' }}>
                {filtered.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        No models in this category yet.
                    </p>
                ) : (
                    <AutoScrollRow models={filtered} />
                )}
            </div>
        </>
    );
}
