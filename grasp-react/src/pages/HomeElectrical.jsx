import { useState, useEffect, useCallback } from 'react';
import {
  Navbar,
  Hero,
  ProductCategories,
  TrustedClients,
  Industries,
  Footer
} from '../components';

// Electrical Brand Reveal with animations
const BrandRevealElectrical = ({ isHidden, brandScale, brandOpacity }) => {
  return (
    <section className={`brand-reveal-electrical ${isHidden ? 'hidden' : ''}`}>
      {/* Dark Background */}
      <div className="elec-bg" />

      {/* Circuit Grid Pattern */}
      <div className="elec-grid" />

      {/* Animated Circuit Lines */}
      <svg className="elec-svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal circuit lines */}
        <path className="elec-line" d="M0,200 H400 L450,150 H800 L850,200 H1200" filter="url(#glow)" />
        <path className="elec-line d1" d="M1920,300 H1500 L1450,350 H1100 L1050,300 H700" filter="url(#glow)" />
        <path className="elec-line d2" d="M0,500 H300 L350,550 H600 L650,500 H950" filter="url(#glow)" />
        <path className="elec-line d3" d="M1920,600 H1600 L1550,550 H1300 L1250,600 H1000" filter="url(#glow)" />
        <path className="elec-line d1" d="M0,800 H350 L400,750 H700 L750,800 H1100" filter="url(#glow)" />
        <path className="elec-line d2" d="M1920,900 H1550 L1500,850 H1200 L1150,900 H850" filter="url(#glow)" />

        {/* Vertical lines */}
        <path className="elec-line d2" d="M400,0 V250 L350,300 V450" filter="url(#glow)" />
        <path className="elec-line" d="M960,0 V200 L900,260 V400 L960,460 V650" filter="url(#glow)" />
        <path className="elec-line d3" d="M1500,1080 V800 L1550,750 V600" filter="url(#glow)" />
      </svg>

      {/* Glowing Orb */}
      <div className="elec-orb" />

      {/* Brand Content */}
      <div className="brand-content">
        <h1
          className="brand-name-elec"
          style={{
            transform: `scale(${brandScale})`,
            opacity: brandOpacity
          }}
        >
          <span className="word-grasp">GRASP</span>
          <span className="word-electric">ELECTRIC</span>
        </h1>
        <p className="brand-tagline-elec">Industrial Enclosure Systems</p>
      </div>

      {/* Scroll Hint */}
      <div className="scroll-hint">
        <span className="scroll-hint-text">Scroll to explore</span>
        <div className="scroll-hint-line" />
      </div>
    </section>
  );
};

const HomeElectrical = () => {
  const [scrollState, setScrollState] = useState({
    brandHidden: false,
    brandScale: 1,
    brandOpacity: 1,
    heroBrandVisible: false,
    showcaseVisible: false,
    navVisible: false
  });

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const fadeStart = windowHeight * 0.3;
    const fadeEnd = windowHeight * 0.7;

    let brandHidden = false;
    let brandScale = 1;
    let brandOpacity = 1;

    if (scrollY < fadeStart) {
      const progress = scrollY / fadeStart;
      brandScale = 1 - (0.3 * progress);
      brandOpacity = 1 - progress;
    } else {
      brandHidden = true;
    }

    let heroBrandVisible = false;
    let showcaseVisible = false;
    let navVisible = false;

    if (scrollY >= fadeStart) {
      const progress = Math.min((scrollY - fadeStart) / (fadeEnd - fadeStart), 1);
      heroBrandVisible = progress > 0.2;
      showcaseVisible = progress > 0.3;
      navVisible = progress > 0.5;
    }

    setScrollState({
      brandHidden,
      brandScale,
      brandOpacity,
      heroBrandVisible,
      showcaseVisible,
      navVisible
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <>
      <Navbar isVisible={scrollState.navVisible} />

      <BrandRevealElectrical
        isHidden={scrollState.brandHidden}
        brandScale={scrollState.brandScale}
        brandOpacity={scrollState.brandOpacity}
      />

      <Hero
        heroBrandVisible={scrollState.heroBrandVisible}
        showcaseVisible={scrollState.showcaseVisible}
      />

      <ProductCategories />

      <TrustedClients />

      <Industries />

      <Footer />
    </>
  );
};

export default HomeElectrical;
