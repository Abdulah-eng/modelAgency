'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ModelGalleryProps {
    coverPhoto: string;
    photos: { id: string; url: string }[];
    name: string;
}

export default function ModelGallery({ coverPhoto, photos, name }: ModelGalleryProps) {
    const allImages = [coverPhoto, ...photos.map(p => p.url)];
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (allImages.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % allImages.length);
        }, 4000); // Scroll every 4 seconds

        return () => clearInterval(interval);
    }, [allImages.length]);

    if (allImages.length === 0) return null;

    return (
        <div className="model-gallery-container">
            {allImages.map((url, idx) => (
                <div
                    key={idx}
                    className={`gallery-slide ${idx === currentIndex ? 'active' : ''}`}
                >
                    <Image
                        src={url}
                        alt={`${name} portfolio ${idx + 1}`}
                        fill
                        style={{ objectFit: 'cover', objectPosition: 'top' }}
                        priority={idx === 0}
                        sizes="50vw"
                    />
                </div>
            ))}

            <div className="gallery-dots">
                {allImages.length > 1 && allImages.map((_, idx) => (
                    <div
                        key={idx}
                        className={`gallery-dot ${idx === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(idx)}
                    />
                ))}
            </div>

            <style jsx>{`
                .model-gallery-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }
                .gallery-slide {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    transition: opacity 1.5s ease-in-out;
                    z-index: 1;
                }
                .gallery-slide.active {
                    opacity: 1;
                    z-index: 2;
                }
                .gallery-dots {
                    position: absolute;
                    bottom: 2rem;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 0.5rem;
                    z-index: 10;
                }
                .gallery-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.3);
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .gallery-dot.active {
                    background: var(--accent);
                    transform: scale(1.2);
                    box-shadow: 0 0 10px var(--accent);
                }
            `}</style>
        </div>
    );
}
