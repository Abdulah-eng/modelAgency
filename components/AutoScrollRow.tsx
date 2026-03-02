'use client';

import { useState, useEffect, useRef } from 'react';
import ModelCard from './ModelCard';
import type { Model } from '@/types';

export default function AutoScrollRow({ models }: { models: Model[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const totalVisible = 5;
    const maxIndex = Math.max(0, models.length - totalVisible);

    useEffect(() => {
        if (isPaused || models.length <= totalVisible) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }, 3200);
        return () => clearInterval(timer);
    }, [isPaused, maxIndex, models.length]);

    // Each item is 20% wide; translate by multiples of 20%
    const offset = currentIndex * 20;

    return (
        <div
            className="models-carousel-wrap"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div
                className="models-carousel-track"
                style={{ transform: `translateX(-${offset}%)` }}
            >
                {models.map((model) => (
                    <div key={model.id} className="models-carousel-item">
                        <ModelCard model={model} />
                    </div>
                ))}
            </div>
        </div>
    );
}
