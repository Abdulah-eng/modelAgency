'use client';

import { useState } from 'react';
import type { Model } from '@/types';
import ModelGrid from './ModelGrid';
import { parseCategories } from '@/lib/categories';

export default function CategoryFilter({ models }: { models: Model[] }) {
    const [active, setActive] = useState('All');

    // Get only categories that have models
    const availableCategories = [
        'All',
        ...Array.from(new Set(models.flatMap((m) => parseCategories(m.category))))
    ];

    const filtered =
        active === 'All'
            ? models
            : models.filter((m) => parseCategories(m.category).includes(active));

    return (
        <div className="models-listing-container">
            {/* Category tabs */}
            <div className="categories-section">
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

            {/* Model Grid */}
            <div className="models-grid-container">
                <ModelGrid models={filtered} />
            </div>
        </div>
    );
}
