import { useRef, useImperativeHandle, forwardRef } from 'react';
import logo from '../assets/images/logo.png';

const BrandReveal = forwardRef((props, ref) => {
  const sectionRef = useRef(null);
  const logoRef = useRef(null);

  useImperativeHandle(ref, () => ({
    updateTransform(scale, opacity) {
      const section = sectionRef.current;
      const logoEl = logoRef.current;
      if (!section) return;
      section.style.opacity = opacity;
      section.style.pointerEvents = opacity <= 0 ? 'none' : 'auto';
      if (logoEl) {
        logoEl.style.transform = `scale(${scale})`;
      }
    }
  }));

  return (
    <section className="brand-reveal" ref={sectionRef}>
      <div className="brand-grid"></div>
      <div className="brand-orb"></div>
      <div className="brand-content">
        <div className="brand-logo" ref={logoRef}>
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
});

BrandReveal.displayName = 'BrandReveal';

export default BrandReveal;
