import { useState, useEffect, useCallback } from 'react';
import {
  Navbar,
  BrandReveal,
  Hero,
  ProductCategories,
  TrustedClients,
  Industries,
  FAQ,
  Footer
} from '../components';

const Home = () => {
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

      <BrandReveal
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

      <FAQ />

      <Footer />
    </>
  );
};

export default Home;
