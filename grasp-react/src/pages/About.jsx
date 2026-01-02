import { useState, useEffect, useRef } from 'react';
import { Navbar, Footer } from '../components';

const stats = [
  { number: 20, suffix: '+', label: 'Years Experience' },
  { number: 500, suffix: '+', label: 'Products' },
  { number: 1000, suffix: '+', label: 'Clients Served' },
  { number: 100, suffix: '%', label: 'Made in India' }
];

// Custom hook for count-up animation
const useCountUp = (end, duration = 2000, startCounting) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startCounting) return;

    let startTime = null;
    const startValue = 0;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * (end - startValue) + startValue);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, startCounting]);

  return count;
};

// Stat Item Component with count-up
const StatItem = ({ stat, isVisible }) => {
  const count = useCountUp(stat.number, 2000, isVisible);

  return (
    <div className={`stat-item ${isVisible ? 'animate' : ''}`}>
      <div className="stat-number">
        {count}
        <span className="stat-suffix">{stat.suffix}</span>
      </div>
      <div className="stat-label">{stat.label}</div>
    </div>
  );
};

const values = [
  {
    title: 'Quality First',
    desc: 'Products tested at UL, CPRI, and NABL laboratories for IP65/67, flame retardance, impact resistance, and weather proofing.',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  },
  {
    title: 'Innovation',
    desc: 'In-house R&D team continuously developing diverse solutions tailored to evolving customer needs.',
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    )
  },
  {
    title: 'Customer Focus',
    desc: 'Hundreds of customized products created based on client specifications with dedicated support.',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  },
  {
    title: 'World-Class Materials',
    desc: 'Using electrical grade polymers adhering to International Electrotechnical Commission standards.',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )
  }
];

const certifications = [
  { name: 'IP65/IP67', desc: 'Ingress Protection' },
  { name: 'IEC Standards', desc: 'International Electrotechnical' },
  { name: 'UL Tested', desc: 'Safety Certified' },
  { name: 'CPRI Tested', desc: 'Power Research' },
  { name: 'NABL Accredited', desc: 'Lab Testing' },
  { name: 'Halogen Free', desc: 'Environmental Safety' }
];

const industries = [
  'Solar',
  'Electrical',
  'Electronics',
  'Automation',
  'Chemical',
  'Power Generation'
];

const About = () => {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  // Intersection Observer for stats section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect(); // Only animate once
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar isVisible={true} />

      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="page-label">About Us</div>
          <h1 className="page-title">India's Leading Enclosure Manufacturer</h1>
          <p className="page-desc">
            Housing the country's largest range of Thermoplastic & Polycarbonate enclosures for over two decades.
          </p>
        </div>
      </section>

      <section className="about-stats" ref={statsRef}>
        <div className="about-stats-inner">
          {stats.map((stat, index) => (
            <StatItem key={index} stat={stat} isVisible={statsVisible} />
          ))}
        </div>
      </section>

      <section className="about-story">
        <div className="about-story-inner">
          <div className="about-story-content">
            <div className="section-label">Our Story</div>
            <h2 className="section-title">Two Decades of Excellence</h2>
            <p>
              Grasp Electric Private Limited has established itself as India's leading manufacturer of Thermoplastic & Polycarbonate enclosures over more than two decades of dedicated service.
            </p>
            <p>
              We specialize in manufacturing world-class enclosure solutions for multiple industries including Solar, Electrical, Electronics, Automation, and Chemical sectors. Our comprehensive product range includes standard enclosures, hinged enclosures, modular panel enclosures, junction boxes, power distribution boxes, and custom-manufactured electrical panels.
            </p>
            <p>
              Our commitment to quality is reflected in our rigorous testing processes. All products undergo testing at UL, CPRI, and NABL laboratories for ingress protection (IP65/67), flame retardance, impact resistance, glow wire tests, halogen-free compliance, and weather proofing capabilities.
            </p>
            <p>
              With an in-house research and design team, we have created hundreds of customized products based on client specifications, collaborating with industry professionals to deliver innovative solutions that meet the evolving needs of our customers.
            </p>
          </div>
          <div className="about-story-image">
            <div className="story-image-placeholder">
              <svg viewBox="0 0 200 200">
                <rect x="20" y="40" width="160" height="120" stroke="currentColor" fill="none" strokeWidth="2" />
                <rect x="40" y="60" width="40" height="30" stroke="currentColor" fill="none" />
                <rect x="100" y="60" width="60" height="80" stroke="currentColor" fill="none" />
                <line x1="40" y1="100" x2="80" y2="100" stroke="currentColor" />
                <line x1="40" y1="110" x2="80" y2="110" stroke="currentColor" />
                <line x1="40" y1="120" x2="80" y2="120" stroke="currentColor" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="about-industries">
        <div className="about-industries-inner">
          <div className="section-label">Industries We Serve</div>
          <h2 className="section-title">Delivering Solutions Across Sectors</h2>
          <div className="industries-tags">
            {industries.map((industry, index) => (
              <span key={index} className="industry-tag">{industry}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="about-values-inner">
          <div className="section-label">Our Values</div>
          <h2 className="section-title">What Drives Us</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-desc">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-certifications">
        <div className="about-certifications-inner">
          <div className="section-label">Quality Assurance</div>
          <h2 className="section-title">Testing & Certifications</h2>
          <p className="section-desc">Products manufactured and tested to international quality and safety standards using world-class Electrical Grade Polymers.</p>
          <div className="certifications-list">
            {certifications.map((cert, index) => (
              <div key={index} className="certification-item">
                <div className="cert-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className="cert-name">{cert.name}</div>
                <div className="cert-desc">{cert.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-clients">
        <div className="about-clients-inner">
          <div className="section-label">Trusted By</div>
          <h2 className="section-title">Our Valued Clients</h2>
          <p className="section-desc">Serving major corporations and numerous recognized companies across various industrial sectors, including Nestle and many more.</p>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default About;
