'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { UploadBox, VideoUploadBox } from '@/app/admin/AdminUpload';

export default function AdminSettingsPage() {
    // General
    const [siteName, setSiteName] = useState('');
    const [aboutText, setAboutText] = useState('');
    const [telegramLink, setTelegramLink] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [siteLogo, setSiteLogo] = useState('');
    const [siteFavicon, setSiteFavicon] = useState('');
    // Social
    const [facebookLink, setFacebookLink] = useState('');
    const [twitterLink, setTwitterLink] = useState('');
    const [instagramLink, setInstagramLink] = useState('');
    // Contact
    const [contactEmail, setContactEmail] = useState('');
    const [contactAddress, setContactAddress] = useState('');
    // Hero video
    const [heroVideoUrl, setHeroVideoUrl] = useState('');
    const [heroVideoSubtitle, setHeroVideoSubtitle] = useState('');
    const [heroImageUrl, setHeroImageUrl] = useState('');
    // Model banner
    const [modelBannerUrl, setModelBannerUrl] = useState('');
    // Become Our Model section
    const [becomeBgUrl, setBecomeBgUrl] = useState('');
    const [becomeText, setBecomeText] = useState('');
    // Casting section
    const [castingImageUrl, setCastingImageUrl] = useState('');
    const [castingText, setCastingText] = useState('');
    const [castingManager, setCastingManager] = useState('');
    const [castingManagerRole, setCastingManagerRole] = useState('');

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Load existing settings via service-role API
    useEffect(() => {
        fetch('/api/admin/settings')
            .then(r => r.json())
            .then(({ data }) => {
                if (!data) return;
                setSiteName(data.site_name || '');
                setAboutText(data.about_text || '');
                setTelegramLink(data.telegram_link || '');
                setPhoneNumber(data.phone_number || '');
                setFacebookLink(data.facebook_link || '');
                setTwitterLink(data.twitter_link || '');
                setInstagramLink(data.instagram_link || '');
                setContactEmail(data.contact_email || '');
                setContactAddress(data.contact_address || '');
                setHeroVideoUrl(data.hero_video_url || '');
                setHeroVideoSubtitle(data.hero_video_subtitle || '');
                setHeroImageUrl(data.hero_image || '');
                setModelBannerUrl(data.model_banner_image || '');
                setBecomeBgUrl(data.become_model_bg_url || '');
                setBecomeText(data.become_model_text || '');
                setCastingImageUrl(data.casting_image_url || '');
                setCastingText(data.casting_text || '');
                setCastingManager(data.casting_manager_name || '');
                setCastingManagerRole(data.casting_manager_role || '');
                setSiteLogo(data.site_logo || '');
                setSiteFavicon(data.site_favicon || '');
            })
            .catch(() => toast.error('Failed to load settings'))
            .finally(() => setFetching(false));
    }, []);

    const [warning, setWarning] = useState('');
    const [error, setError] = useState('');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setWarning('');
        setError('');
        try {
            const payload = {
                site_name: siteName,
                about_text: aboutText,
                telegram_link: telegramLink,
                phone_number: phoneNumber,
                facebook_link: facebookLink,
                twitter_link: twitterLink,
                instagram_link: instagramLink,
                contact_email: contactEmail,
                contact_address: contactAddress,
                hero_video_url: heroVideoUrl,
                hero_video_subtitle: heroVideoSubtitle,
                hero_image: heroImageUrl,
                model_banner_image: modelBannerUrl,
                become_model_bg_url: becomeBgUrl,
                become_model_text: becomeText,
                casting_image_url: castingImageUrl,
                casting_text: castingText,
                casting_manager_name: castingManager,
                casting_manager_role: castingManagerRole,
                site_logo: siteLogo,
                site_favicon: siteFavicon,
            };

            let res: Response;
            let json: { success?: boolean; error?: string; warning?: string };
            try {
                res = await fetch('/api/admin/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                json = await res.json();
            } catch (fetchErr) {
                throw new Error(`Network error: ${(fetchErr as Error).message}`);
            }

            if (!res.ok || json.error) {
                throw new Error(json.error || `HTTP ${res.status}`);
            }

            if (json.warning) {
                setWarning(json.warning);
                toast.success('Partial save — see warning below');
            } else {
                toast.success('Settings saved!');
            }
        } catch (err: unknown) {
            const msg = (err as Error).message;
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };


    if (fetching) return <div style={{ padding: '3rem', color: 'var(--text-muted)', textAlign: 'center' }}>Loading settings…</div>;

    return (
        <>
            <div className="admin-header">
                <h1 className="admin-page-title">Site Settings</h1>
                <p className="admin-page-subtitle">Manage your public website content and appearance</p>
            </div>

            {/* Error / Warning banners */}
            {error && (
                <div style={{ background: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.4)', borderRadius: 8, padding: '1rem 1.5rem', marginBottom: '1.5rem', color: '#e74c3c', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    <strong>⚠ Save failed:</strong> {error}
                </div>
            )}
            {warning && (
                <div style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 8, padding: '1rem 1.5rem', marginBottom: '1.5rem', color: '#c9a96e', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    <strong>⚠ Migration required:</strong> {warning}
                    <br />
                    <span style={{ fontSize: '0.78rem', marginTop: '0.4rem', display: 'block', color: 'rgba(201,169,110,0.8)' }}>
                        Go to your <strong>Supabase Dashboard → SQL Editor</strong> and run the full <code>schema.sql</code> migration to enable all settings fields.
                    </span>
                </div>
            )}

            <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>


                    {/* ── General ── */}
                    <div className="admin-card">
                        <h3 className="admin-card-title">General</h3>
                        <div className="form-group">
                            <label className="form-label">Agency / Site Name</label>
                            <input className="form-input" value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="Elara Models" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Site Logo</label>
                                <UploadBox
                                    label="Upload Logo"
                                    hint="PNG/SVG recommended"
                                    folder="site"
                                    previewUrl={siteLogo}
                                    onUrl={setSiteLogo}
                                    aspect="auto"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Favicon</label>
                                <UploadBox
                                    label="Upload Favicon"
                                    hint="Square .ico or .png"
                                    folder="site"
                                    previewUrl={siteFavicon}
                                    onUrl={setSiteFavicon}
                                    aspect="1/1"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tagline / About Short</label>
                            <textarea className="form-textarea" value={aboutText} onChange={e => setAboutText(e.target.value)} rows={4} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number (navbar)</label>
                            <input className="form-input" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="800 123 4567" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Telegram Link</label>
                            <input className="form-input" value={telegramLink} onChange={e => setTelegramLink(e.target.value)} placeholder="https://t.me/yourhandle" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Contact Email</label>
                            <input type="email" className="form-input" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="agency@example.com" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Contact Address</label>
                            <textarea className="form-textarea" value={contactAddress} onChange={e => setContactAddress(e.target.value)} rows={2} placeholder="316 Tipple Road&#10;Philadelphia, PA 19143" />
                        </div>
                    </div>

                    {/* ── Social Links ── */}
                    <div className="admin-card">
                        <h3 className="admin-card-title">Social Links</h3>
                        <div className="form-group">
                            <label className="form-label">Facebook URL</label>
                            <input className="form-input" value={facebookLink} onChange={e => setFacebookLink(e.target.value)} placeholder="https://facebook.com/yourpage" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Twitter / X URL</label>
                            <input className="form-input" value={twitterLink} onChange={e => setTwitterLink(e.target.value)} placeholder="https://x.com/yourhandle" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Instagram URL</label>
                            <input className="form-input" value={instagramLink} onChange={e => setInstagramLink(e.target.value)} placeholder="https://instagram.com/yourhandle" />
                        </div>
                    </div>

                    {/* ── Hero Video ── */}
                    <div className="admin-card">
                        <h3 className="admin-card-title">Homepage Hero</h3>
                        <div className="form-group">
                            <label className="form-label">Upload Video (mp4 / webm)</label>
                            <VideoUploadBox
                                label="Click to upload hero video"
                                hint="Recommended: 1920×1080 mp4, under 50MB"
                                folder="hero-videos"
                                currentUrl={heroVideoUrl}
                                onUrl={setHeroVideoUrl}
                            />
                        </div>
                        <div className="form-group" style={{ marginTop: '0.75rem' }}>
                            <label className="form-label">— or paste video URL —</label>
                            <input className="form-input" value={heroVideoUrl} onChange={e => setHeroVideoUrl(e.target.value)} placeholder="https://…/video.mp4" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Hero Subtitle Text</label>
                            <textarea className="form-textarea" value={heroVideoSubtitle} onChange={e => setHeroVideoSubtitle(e.target.value)} rows={2} placeholder="Short subtitle…" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fallback Image (shown when no video)</label>
                            <UploadBox
                                label="Click to upload fallback image"
                                hint="1920×1080 recommended"
                                folder="hero"
                                previewUrl={heroImageUrl}
                                onUrl={setHeroImageUrl}
                                aspect="16/9"
                            />
                        </div>
                    </div>

                    {/* ── Model Pages Banner ── */}
                    <div className="admin-card">
                        <h3 className="admin-card-title">Model Pages Banner</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Dark background image shown on all model profile pages.
                        </p>
                        <UploadBox
                            label="Click to upload banner image"
                            hint="1920×400px recommended — dark/moody"
                            folder="banners"
                            previewUrl={modelBannerUrl}
                            onUrl={setModelBannerUrl}
                            aspect="16/5"
                        />
                    </div>

                    {/* ── Become Our Model ── */}
                    <div className="admin-card">
                        <h3 className="admin-card-title">Become Our Model Section</h3>
                        <div className="form-group">
                            <label className="form-label">Background Image</label>
                            <UploadBox
                                label="Click to upload background image"
                                hint="Full-width, dark/pink toned"
                                folder="become-bg"
                                previewUrl={becomeBgUrl}
                                onUrl={setBecomeBgUrl}
                                aspect="16/6"
                            />
                        </div>
                        <div className="form-group" style={{ marginTop: '0.75rem' }}>
                            <label className="form-label">Description Text</label>
                            <textarea className="form-textarea" value={becomeText} onChange={e => setBecomeText(e.target.value)} rows={3}
                                placeholder="If you are 5ft 8in and above…" />
                        </div>
                    </div>

                    {/* ── Casting Section ── */}
                    <div className="admin-card">
                        <h3 className="admin-card-title">Casting Section</h3>
                        <div className="form-group">
                            <label className="form-label">Casting Photo</label>
                            <UploadBox
                                label="Click to upload casting photo"
                                hint="Portrait, dark toned"
                                folder="casting"
                                previewUrl={castingImageUrl}
                                onUrl={setCastingImageUrl}
                                aspect="3/4"
                            />
                        </div>
                        <div className="form-group" style={{ marginTop: '0.75rem' }}>
                            <label className="form-label">Casting Body Text</label>
                            <textarea className="form-textarea" value={castingText} onChange={e => setCastingText(e.target.value)} rows={3} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Manager Name</label>
                                <input className="form-input" value={castingManager} onChange={e => setCastingManager(e.target.value)} placeholder="Rebecca Smith" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Manager Role</label>
                                <input className="form-input" value={castingManagerRole} onChange={e => setCastingManagerRole(e.target.value)} placeholder="Casting Manager" />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving…' : 'Save All Settings'}
                    </button>
                </div>
            </form>
        </>
    );
}
