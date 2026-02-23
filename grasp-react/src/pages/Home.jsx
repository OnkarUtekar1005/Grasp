import { useState, useEffect, useCallback } from 'react';
import {
  Navbar,
  BrandReveal,
  Hero,
  ProductCategories,
  TrustedClients,
  Industries,
  FAQ,
  Footer,
  useLenis
} from '../components';

const Home = () => {
  const lenis = useLenis();
  const [scrollState, setScrollState] = useState({
    brandScale: 1,
    brandOpacity: 1,
    heroBrandVisible: false,
    showcaseVisible: false,
    navVisible: false
  });

  const calculateScrollState = useCallback((scroll) => {
    const windowHeight = window.innerHeight;
    const fadeEnd = windowHeight * 0.5;
    const revealStart = windowHeight * 0.3;
    const revealEnd = windowHeight * 0.7;

    // Brand fade: scroll 0 → fadeEnd
    const fadeProgress = Math.min(scroll / fadeEnd, 1);
    const brandScale = 1 - (0.2 * fadeProgress);
    const brandOpacity = 1 - fadeProgress;

    // Content reveal: revealStart → revealEnd
    let heroBrandVisible = false;
    let showcaseVisible = false;
    let navVisible = false;

    if (scroll >= revealStart) {
      const revealProgress = Math.min((scroll - revealStart) / (revealEnd - revealStart), 1);
      heroBrandVisible = revealProgress > 0.2;
      showcaseVisible = revealProgress > 0.3;
      navVisible = revealProgress > 0.5;
    }

    setScrollState({
      brandScale,
      brandOpacity,
      heroBrandVisible,
      showcaseVisible,
      navVisible
    });
  }, []);

  useEffect(() => {
    if (!lenis) return;

    const handleScroll = (e) => {
      calculateScrollState(e.animatedScroll ?? e.scroll ?? 0);
    };

    lenis.on('scroll', handleScroll);

    // Calculate initial state
    calculateScrollState(lenis.animatedScroll ?? lenis.scroll ?? 0);

    return () => lenis.off('scroll', handleScroll);
  }, [lenis, calculateScrollState]);

  return (
    <>
      <Navbar isVisible={scrollState.navVisible} />

      <BrandReveal
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
