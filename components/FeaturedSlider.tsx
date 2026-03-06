'use client';

import { useState, useRef, useEffect } from 'react';
import type { Model } from '@/types';
import ModelCard from './ModelCard';

export default function FeaturedSlider({
    models,
    siteName,
}: {
    models: Model[];
    siteName?: string;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered || models.length <= 3) return; // Only scroll if needed and not hovered

        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    const itemWidth = scrollRef.current.firstElementChild?.clientWidth || 300;
                    const gap = 24; // 1.5rem gap
                    scrollRef.current.scrollTo({ left: scrollLeft + itemWidth + gap, behavior: 'smooth' });
                }
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isHovered, models.length]);

    if (models.length === 0) return null;

    return (
        <section
            className="featured-slider-section"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="featured-slider-heading">
                <span className="featured-slider-agency">{siteName || 'Agency'}</span>
                <h2 className="featured-slider-title">Most Featured</h2>
            </div>

            <div className="featured-slider-container">
                <div className="featured-slider-track" ref={scrollRef}>
                    {models.map((model) => (
                        <div key={model.id} className="featured-slider-item">
                            <ModelCard model={model} />
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .featured-slider-section {
                    padding: 4rem 2rem;
                    background: var(--dark-2);
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }
                .featured-slider-heading {
                    margin-bottom: 2.5rem;
                    text-align: center;
                }
                .featured-slider-agency {
                    font-size: 0.8rem;
                    letter-spacing: 0.25em;
                    color: var(--accent);
                    text-transform: uppercase;
                    display: block;
                    margin-bottom: 0.5rem;
                }
                .featured-slider-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 2.5rem;
                    color: white;
                    margin: 0;
                }

                .featured-slider-container {
                    width: 100%;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .featured-slider-track {
                    display: flex;
                    gap: 1.5rem;
                    overflow-x: auto;
                    scroll-snap-type: x mandatory;
                    padding-bottom: 1rem;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none; /* Firefox */
                    -ms-overflow-style: none; /* IE/Edge */
                }
                
                .featured-slider-track::-webkit-scrollbar {
                    display: none; /* Chrome/Safari */
                }

                .featured-slider-item {
                    flex: 0 0 calc(33.333% - 1rem); /* 3 items desktop */
                    scroll-snap-align: start;
                    min-width: 280px;
                }

                @media (max-width: 1024px) {
                    .featured-slider-item {
                        flex: 0 0 calc(50% - 0.75rem); /* 2 items tablet */
                    }
                }
                @media (max-width: 640px) {
                    .featured-slider-item {
                        flex: 0 0 100%; /* 1 item mobile */
                    }
                    .featured-slider-section {
                        padding: 3rem 1.5rem;
                    }
                }
            `}</style>
        </section>
    );
}
