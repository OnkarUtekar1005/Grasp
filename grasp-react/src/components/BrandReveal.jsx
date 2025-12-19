const BrandReveal = ({ isHidden, brandScale, brandOpacity }) => {
  return (
    <section className={`brand-reveal ${isHidden ? 'hidden' : ''}`}>
      <div className="brand-grid"></div>
      <div className="brand-orb"></div>
      <div className="brand-content">
        <h1
          className="brand-name"
          style={{
            transform: `scale(${brandScale})`,
            opacity: brandOpacity
          }}
        >
          <span className="word-grasp">GRASP</span>
          <span className="word-electric">ELECTRIC</span>
        </h1>
        <p className="brand-tagline">Industrial Enclosure Systems</p>
      </div>
      <div className="scroll-hint">
        <span className="scroll-hint-text">Scroll to explore</span>
        <div className="scroll-hint-line"></div>
      </div>
    </section>
  );
};

export default BrandReveal;
