import { createServerSupabaseClient, createPublicSupabaseClient } from '@/lib/supabase-server';
import Navbar from '@/components/Navbar';
import ModelBanner from '@/components/ModelBanner';
import PhotoAlbum from '@/components/PhotoAlbum';
import ContactButton from '@/components/ContactButton';
import ModelGallery from '@/components/ModelGallery';
import ModelSocialContact from '@/components/ModelSocialContact';
import AutoScrollRow from '@/components/AutoScrollRow';
import ModelReviews from '@/components/ModelReviews';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Model, ModelPhoto, SiteSettings } from '@/types';

export const dynamic = 'force-dynamic';

interface Props { params: { slug: string }; }

async function getModelData(slug: string) {
    const supabase = createServerSupabaseClient();
    const [{ data: model }, { data: settings }] = await Promise.all([
        supabase.from('models').select('*').eq('slug', slug).single(),
        supabase.from('site_settings').select('*').single(),
    ]);
    if (!model) return null;

    const [{ data: photos }, { data: otherModels }, { data: reviewStats }] = await Promise.all([
        supabase.from('model_photos').select('*').eq('model_id', model.id).order('sort_order', { ascending: true }),
        supabase.from('models').select('*').neq('id', model.id).limit(10),
        supabase.from('model_reviews').select('rating').eq('model_id', model.id),
    ]);

    const avgRating = reviewStats && reviewStats.length > 0
        ? (reviewStats.reduce((acc, r) => acc + r.rating, 0) / reviewStats.length).toFixed(1)
        : null;

    return {
        model: model as Model,
        photos: (photos as ModelPhoto[]) || [],
        settings: settings as SiteSettings | null,
        otherModels: (otherModels as Model[]) || [],
        avgRating,
    };
}

export async function generateStaticParams() {
    const supabase = createPublicSupabaseClient();
    const { data: models } = await supabase.from('models').select('slug');
    return (models || []).map((m: { slug: string }) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props) {
    const result = await getModelData(params.slug);
    if (!result) return { title: 'Model Not Found' };
    return {
        title: `${result.model.name} — ${result.settings?.site_name || 'Elara Models'}`,
        description: result.model.bio || `View ${result.model.name}'s full profile and portfolio.`,
    };
}

export default async function ModelPage({ params }: Props) {
    const result = await getModelData(params.slug);
    if (!result) notFound();

    const { model, photos, settings, otherModels, avgRating } = result;
    const skills: { label: string; percent: number }[] = Array.isArray(model.skills) ? model.skills : [];

    const statRows = [
        [
            { label: 'Age', value: model.age },
            { label: 'Height', value: model.height },
            { label: 'Weight', value: model.weight },
        ],
    ];

    return (
        <>
            <Navbar
                siteName={settings?.site_name}
                phoneNumber={settings?.phone_number}
                logoUrl={settings?.site_logo}
            />

            {/* BANNER */}
            <ModelBanner
                name={model.name}
                category={model.category}
                bannerImage={settings?.model_banner_image}
                rating={avgRating}
            />

            {/* ── HERO: photo left | bio + skill bars right ── */}
            <section className="mdp-hero">
                {/* Left: Auto-scrolling gallery */}
                <div className="mdp-photo">
                    <ModelGallery
                        coverPhoto={model.cover_photo}
                        photos={photos}
                        name={model.name}
                    />
                </div>

                {/* Right: bio + skills */}
                <div className="mdp-info">
                    <div style={{ padding: '1rem 0 0' }}>
                        <Link href="/" className="back-btn">← Back</Link>
                    </div>
                    <p className="mdp-category">{Array.isArray(model.category) ? model.category.filter(Boolean).join(' • ') : model.category}</p>
                    <h2 className="mdp-name">{model.name}</h2>
                    {model.bio && <p className="mdp-bio">{model.bio}</p>}

                    {/* Skill bars */}
                    {skills.length > 0 && (
                        <div className="mdp-skills">
                            {skills.map((s, i) => (
                                <div key={i} className="skill-bar-item">
                                    <div className="skill-bar-header">
                                        <span className="skill-bar-label">{s.label}</span>
                                        <span className="skill-bar-pct">{s.percent}%</span>
                                    </div>
                                    <div className="skill-bar-track">
                                        <div className="skill-bar-fill" style={{ width: `${s.percent}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── STATS + CONTACT MODEL ── */}
            <section className="mdp-stats-contact">
                {/* Stats white panel */}
                <div className="mdp-stats-panel">
                    {statRows.map((row, ri) => (
                        <div key={ri} className="mdp-stats-row">
                            {row.filter(s => s.value).map((s) => (
                                <div key={s.label} className="mdp-stat-cell">
                                    <span className="mdp-stat-label">{s.label}</span>
                                    <span className="mdp-stat-value">{String(s.value)}</span>
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* Photo strip (optional, showing first 4) */}
                    {photos.length > 4 && (
                        <div className="mdp-photo-strip">
                            {photos.slice(0, 4).map((photo) => (
                                <div key={photo.id} className="mdp-photo-strip-item">
                                    <Image src={photo.url} alt="" fill style={{ objectFit: 'cover', objectPosition: 'top' }} sizes="100px" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Contact section - Telegram only */}
                <ModelSocialContact
                    name={model.name}
                    telegram={model.telegram_link}
                    whatsapp={model.whatsapp_link}
                    viber={model.viber_link}
                />
            </section>

            {/* ── FULL PHOTO ALBUM ── */}
            {photos.length > 0 && <PhotoAlbum photos={photos} />}

            {/* ── REVIEWS ── */}
            <ModelReviews modelId={model.id} modelName={model.name} />

            {/* ── OTHER MODELS ── */}
            {otherModels.length > 0 && (
                <section className="other-models-section">
                    <div className="other-models-header">
                        <span className="section-eyebrow">Discover More</span>
                        <h2 className="section-title">Other Models</h2>
                    </div>
                    <AutoScrollRow models={otherModels} />
                </section>
            )}

            <Footer
                siteName={settings?.site_name}
                facebookLink={settings?.facebook_link}
                twitterLink={settings?.twitter_link}
                instagramLink={settings?.instagram_link}
                logoUrl={settings?.site_logo}
            />

            {settings?.whatsapp_link || settings?.phone_number ? (
                <ContactButton link={settings.whatsapp_link || settings.phone_number} />
            ) : settings?.telegram_link ? (
                <ContactButton link={settings.telegram_link} />
            ) : null}
        </>
    );
}
