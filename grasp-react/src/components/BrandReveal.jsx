import logo from '../assets/images/logo.jpg';

const BrandReveal = ({ isHidden, brandScale, brandOpacity }) => {
  return (
    <section className={`brand-reveal ${isHidden ? 'hidden' : ''}`}>
      <div className="brand-grid"></div>
      <div className="brand-orb"></div>
      <div className="brand-content">
        <div
          className="brand-logo"
          style={{
            transform: `scale(${brandScale})`,
            opacity: brandOpacity
          }}
        >
          <img src={logo} alt="Grasp Electric" />
        </div>
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
