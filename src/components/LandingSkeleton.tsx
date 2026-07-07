export function LandingSkeleton() {
  return (
    <div className="property-card landing-skeleton" aria-hidden="true">
      <div className="hero-grid">
        <div className="skeleton hero-image" />
        <div className="gallery-column">
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      </div>
      <div className="property-content">
        <div className="property-main">
          <div className="skeleton skeleton-line wide" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-block" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line narrow" />
        </div>
        <div className="skeleton skeleton-aside" />
      </div>
    </div>
  );
}
