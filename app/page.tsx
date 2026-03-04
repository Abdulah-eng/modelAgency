import { createServerSupabaseClient } from '@/lib/supabase-server';
import Navbar from '@/components/Navbar';
import CategoryFilter from '@/components/CategoryFilter';
import NewFacesSection from '@/components/NewFacesSection';
import TestimonialsSection, { type Testimonial } from '@/components/TestimonialsSection';
import BecomeModelSection from '@/components/BecomeModelSection';
import CastingSection from '@/components/CastingSection';
import ContactFormSection from '@/components/ContactFormSection';
import ContactButton from '@/components/ContactButton';
import Footer from '@/components/Footer';
import type { Model, SiteSettings } from '@/types';

export const dynamic = 'force-dynamic';

async function getPageData() {
    const supabase = createServerSupabaseClient();
    const [{ data: settings }, { data: models }, { data: testimonials }] = await Promise.all([
        supabase.from('site_settings').select('*').single(),
        supabase.from('models').select('*').order('created_at', { ascending: false }),
        supabase.from('testimonials').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    ]);
    return {
        settings: settings as SiteSettings | null,
        models: (models as Model[]) || [],
        testimonials: (testimonials as Testimonial[]) || [],
    };
}

export default async function HomePage() {
    const { settings, models, testimonials } = await getPageData();

    return (
        <>
            <Navbar siteName={settings?.site_name} phoneNumber={settings?.phone_number} logoUrl={settings?.site_logo} />

            {/* ── VIDEO / IMAGE HERO ── */}
            <section className="video-hero">
                {settings?.hero_video_url ? (
                    <video autoPlay muted loop playsInline poster={settings?.hero_image || undefined}>
                        <source src={settings.hero_video_url} />
                    </video>
                ) : settings?.hero_image ? (
                    <div className="video-hero-fallback" style={{ backgroundImage: `url(${settings.hero_image})` }} />
                ) : (
                    <div className="video-hero-fallback" style={{ background: 'linear-gradient(135deg, #1a0a10 0%, #0a0a0a 100%)' }} />
                )}
                <div className="video-hero-content">
                    <span className="video-hero-eyebrow">Welcome to</span>
                    <h1 className="video-hero-title">{settings?.site_name || 'Elara Models'}</h1>
                    <p className="video-hero-subtitle">
                        {settings?.hero_video_subtitle || settings?.about_text || 'A curated selection of professional models for fashion, editorial, and commercial projects.'}
                    </p>
                    <div className="video-hero-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                        <a href="#models" className="video-hero-cta">Browse Models</a>

                        {settings?.telegram_link && (
                            <a
                                href={settings.telegram_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hero-telegram-btn"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.8rem 2rem',
                                    background: 'rgba(0, 136, 204, 0.15)',
                                    border: '1px solid #0088cc',
                                    color: '#0088cc',
                                    borderRadius: '30px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    transition: 'all 0.3s'
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                                Subscribe to our telegram channel for updates
                            </a>
                        )}
                    </div>
                </div>
            </section>

            {/* ── CATEGORIES + MODEL CAROUSEL ── */}
            <main id="models">
                {models.length > 0 ? (
                    <CategoryFilter models={models} />
                ) : (
                    <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--text-muted)' }}>
                        <p>No models listed yet. Add them via the admin panel.</p>
                    </div>
                )}
            </main>

            {/* ── NEW FACES ── */}
            {models.length > 0 && (
                <NewFacesSection models={models.slice(0, 6)} siteName={settings?.site_name} />
            )}

            {/* ── TESTIMONIALS ── */}
            {testimonials.length > 0 && (
                <TestimonialsSection testimonials={testimonials} />
            )}

            {/* ── CONTACT FORM ── */}
            <ContactFormSection
                siteName={settings?.site_name}
                phone={settings?.phone_number}
                email={settings?.contact_email as string | undefined}
                address={settings?.contact_address as string | undefined}
                telegramLink={settings?.telegram_link}
                whatsappLink={settings?.whatsapp_link}
                viberLink={settings?.viber_link}
            />

            {/* ── FOOTER ── */}
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
