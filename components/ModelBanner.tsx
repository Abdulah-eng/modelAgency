export default function ModelBanner({
    name,
    category,
    bannerImage,
    rating,
}: {
    name: string;
    category: string | string[];
    bannerImage?: string;
    rating?: string | number | null;
}) {
    const categoryText = Array.isArray(category) ? category.join(', ') : category;
    return (
        <div className="model-banner">
            {bannerImage ? (
                <div className="model-banner-bg" style={{ backgroundImage: `url(${bannerImage})` }} />
            ) : (
                <div className="model-banner-fallback" />
            )}
            <div className="model-banner-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h1 className="model-banner-name" style={{ marginBottom: 0 }}>{name}</h1>
                    {rating && (
                        <div className="banner-rating" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(201,169,110,0.15)', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid rgba(201,169,110,0.3)', color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600 }}>
                            <span style={{ color: 'var(--accent)' }}>★</span>
                            {rating}
                        </div>
                    )}
                </div>
                <nav className="model-banner-breadcrumb" aria-label="Breadcrumb">
                    <a href="/">Home</a>
                    <span className="sep">/</span>
                    <a href="/#models">Our Models</a>
                    <span className="sep">/</span>
                    <a href={`/#models`}>{categoryText}</a>
                    <span className="sep">/</span>
                    <span className="current">{name}</span>
                </nav>
            </div>
        </div>
    );
}
