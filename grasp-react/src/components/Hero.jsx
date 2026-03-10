import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import ProductShowcase from './ProductShowcase';

const Hero = forwardRef(({ visible }, ref) => {
  const heroBrandRef = useRef(null);
  const titleRef = useRef(null);
  const ctaRef = useRef(null);
  const showcaseRef = useRef(null);

  useImperativeHandle(ref, () => ({
    setHeroBrandVisible(v) {
      if (heroBrandRef.current) {
        heroBrandRef.current.classList.toggle('visible', v);
      }
    },
    setShowcaseVisible(v) {
      if (titleRef.current) titleRef.current.classList.toggle('visible', v);
      if (ctaRef.current) ctaRef.current.classList.toggle('visible', v);
      if (showcaseRef.current) showcaseRef.current.classList.toggle('visible', v);
    }
  }));

  // When visible prop is true, show everything immediately
  useEffect(() => {
    if (visible) {
      if (heroBrandRef.current) heroBrandRef.current.classList.add('visible');
      if (titleRef.current) titleRef.current.classList.add('visible');
      if (ctaRef.current) ctaRef.current.classList.add('visible');
      if (showcaseRef.current && showcaseRef.current.classList) {
        showcaseRef.current.classList.toggle('visible', true);
      }
    }
  }, [visible]);

  return (
    <section className={`hero${visible ? ' hero-no-animation' : ''}`} id="heroSection">
      <div className="hero-sticky">
        <div className="hero-brand" ref={heroBrandRef}>
          GRASP ELECTRIC
        </div>

        <div className="hero-main">
          <div className="hero-showcase-title" ref={titleRef}>
            <h2 className="showcase-heading">Products in Action</h2>
          </div>

          <ProductShowcase ref={showcaseRef} />

          <div className="hero-ctas" ref={ctaRef}>
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
});

Hero.displayName = 'Hero';

export default Hero;
