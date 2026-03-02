export default function ModelBanner({
    name,
    category,
    bannerImage,
}: {
    name: string;
    category: string;
    bannerImage?: string;
}) {
    return (
        <div className="model-banner">
            {bannerImage ? (
                <div className="model-banner-bg" style={{ backgroundImage: `url(${bannerImage})` }} />
            ) : (
                <div className="model-banner-fallback" />
            )}
            <div className="model-banner-content">
                <h1 className="model-banner-name">{name}</h1>
                <nav className="model-banner-breadcrumb" aria-label="Breadcrumb">
                    <a href="/">Home</a>
                    <span className="sep">/</span>
                    <a href="/#models">Our Models</a>
                    <span className="sep">/</span>
                    <a href={`/#models`}>{category}</a>
                    <span className="sep">/</span>
                    <span className="current">{name}</span>
                </nav>
            </div>
        </div>
    );
}
