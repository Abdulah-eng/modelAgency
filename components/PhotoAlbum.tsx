'use client';

import Image from 'next/image';
import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import type { ModelPhoto } from '@/types';

export default function PhotoAlbum({ photos }: { photos: ModelPhoto[] }) {
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);

    if (!photos || photos.length === 0) return null;

    return (
        <section className="photo-album-section">
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div className="section-header">
                    <span className="section-eyebrow">Portfolio</span>
                    <h2 className="section-title">Photo Album</h2>
                </div>
                <div className="photo-album-grid">
                    {photos.map((photo, i) => (
                        <div
                            key={photo.id}
                            className="photo-album-item"
                            onClick={() => { setIndex(i); setOpen(true); }}
                        >
                            <Image
                                src={photo.url}
                                alt={photo.caption || 'Model photo'}
                                fill
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <Lightbox
                open={open}
                close={() => setOpen(false)}
                index={index}
                slides={photos.map((p) => ({ src: p.url, alt: p.caption || '' }))}
                styles={{
                    container: { backgroundColor: 'rgba(10,10,10,0.97)' },
                }}
            />
        </section>
    );
}
