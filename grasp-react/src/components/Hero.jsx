import { Link } from 'react-router-dom';
import ProductShowcase from './ProductShowcase';

const Hero = ({ heroBrandVisible, showcaseVisible }) => {
  return (
    <section className="hero" id="heroSection">
      <div className="hero-sticky">
        {/* Grid Background System */}
        <div className={`grid-system ${showcaseVisible ? 'visible' : ''}`}>
          <div className="grid-lines"></div>
        </div>

        {/* Network SVG Background */}
        <svg
          className={`network-svg ${showcaseVisible ? 'visible' : ''}`}
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Horizontal Lines */}
          <path className={`network-line ${showcaseVisible ? 'animated' : ''}`} d="M0,400 H600 L700,350 H1200 L1300,400 H1920"/>
          <path className={`network-line ${showcaseVisible ? 'animated' : ''}`} d="M0,600 H400 L500,680 H900 L1000,600 H1920"/>

          {/* Accent Lines */}
          <path className={`network-line accent ${showcaseVisible ? 'animated' : ''}`} d="M960,0 V300 L860,400 V540 L960,600 V1080"/>

          {/* Vertical Lines */}
          <path className={`network-line ${showcaseVisible ? 'animated' : ''}`} d="M300,0 V400"/>
          <path className={`network-line ${showcaseVisible ? 'animated' : ''}`} d="M600,400 V1080"/>
          <path className={`network-line ${showcaseVisible ? 'animated' : ''}`} d="M1300,0 V400"/>
          <path className={`network-line ${showcaseVisible ? 'animated' : ''}`} d="M1500,600 V1080"/>

          {/* Diagonal Lines */}
          <path className={`network-line ${showcaseVisible ? 'animated' : ''}`} d="M400,200 L600,400"/>
          <path className={`network-line ${showcaseVisible ? 'animated' : ''}`} d="M1400,250 L1300,400"/>
          <path className={`network-line accent ${showcaseVisible ? 'animated' : ''}`} d="M700,350 L860,400"/>
          <path className={`network-line accent ${showcaseVisible ? 'animated' : ''}`} d="M1200,350 L1060,400"/>
          <path className={`network-line ${showcaseVisible ? 'animated' : ''}`} d="M200,400 L200,500 L400,600"/>
          <path className={`network-line ${showcaseVisible ? 'animated' : ''}`} d="M1600,400 L1600,500 L1500,600"/>

          {/* Nodes */}
          <circle className={`network-node ${showcaseVisible ? 'visible' : ''}`} cx="300" cy="400" r="6"/>
          <circle className={`network-node ${showcaseVisible ? 'visible' : ''}`} cx="600" cy="400" r="6"/>
          <circle className={`network-node accent ${showcaseVisible ? 'visible' : ''}`} cx="960" cy="400" r="10"/>
          <circle className={`network-node-ring ${showcaseVisible ? 'visible' : ''}`} cx="960" cy="400" r="20"/>
          <circle className={`network-node ${showcaseVisible ? 'visible' : ''}`} cx="1300" cy="400" r="6"/>
          <circle className={`network-node ${showcaseVisible ? 'visible' : ''}`} cx="400" cy="600" r="6"/>
          <circle className={`network-node accent ${showcaseVisible ? 'visible' : ''}`} cx="960" cy="600" r="8"/>
          <circle className={`network-node-ring ${showcaseVisible ? 'visible' : ''}`} cx="960" cy="600" r="16"/>
          <circle className={`network-node ${showcaseVisible ? 'visible' : ''}`} cx="1500" cy="600" r="6"/>
          <circle className={`network-node ${showcaseVisible ? 'visible' : ''}`} cx="700" cy="350" r="4"/>
          <circle className={`network-node ${showcaseVisible ? 'visible' : ''}`} cx="1200" cy="350" r="4"/>
        </svg>

        <div className={`hero-brand ${heroBrandVisible ? 'visible' : ''}`}>
          GRASP ELECTRIC
        </div>

        <div className="hero-main">
          {/* Products in Action Title */}
          <div className={`hero-showcase-title ${showcaseVisible ? 'visible' : ''}`}>
            <span className="showcase-label">See Our</span>
            <h2 className="showcase-heading">Products in Action</h2>
          </div>

          {/* Product Showcase Carousel - Full size */}
          <ProductShowcase isVisible={showcaseVisible} />

          {/* CTA Buttons */}
          <div className={`hero-ctas ${showcaseVisible ? 'visible' : ''}`}>
            <Link to="/products" className="btn-primary">
              Explore Products
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/about" className="btn-secondary">
              About Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
