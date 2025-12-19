import { useState, useEffect, useRef } from 'react';

const showcaseItems = [
  {
    id: 0,
    title: 'Power Distribution',
    // Unsplash - electrical panel
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop'
  },
  {
    id: 1,
    title: 'Control Panel',
    // Unsplash - control systems
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop'
  },
  {
    id: 2,
    title: 'Junction Box',
    // Unsplash - electronic circuits
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop'
  },
  {
    id: 3,
    title: 'Industrial Enclosure',
    // Unsplash - industrial equipment
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop'
  },
  {
    id: 4,
    title: 'Terminal Cabinet',
    // Unsplash - server/electronics
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop'
  }
];

const ProductShowcase = ({ isVisible }) => {
  const [currentIndex, setCurrentIndex] = useState(2);
  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);

  const getCardClass = (index) => {
    const diff = index - currentIndex;
    if (diff === 0) return 'center';
    if (diff === -1 || (currentIndex === 0 && index === 4)) return 'left';
    if (diff === 1 || (currentIndex === 4 && index === 0)) return 'right';
    if (diff < -1) return 'far-left';
    return 'far-right';
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % 5);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + 5) % 5);
  };

  const startAutoPlay = () => {
    autoPlayRef.current = setInterval(nextSlide, 3500);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  return (
    <div className={`showcase-section-hero ${isVisible ? 'visible' : ''}`}>
      <div className="showcase-hero-inner">
        <div
          className="showcase-hero-carousel"
          ref={carouselRef}
          onMouseEnter={stopAutoPlay}
          onMouseLeave={startAutoPlay}
        >
          {showcaseItems.map((item) => (
            <div
              key={item.id}
              className={`showcase-hero-card ${getCardClass(item.id)}`}
              data-index={item.id}
            >
              <div className="showcase-card-image">
                <img src={item.image} alt={item.title} />
                <div className="showcase-card-overlay">
                  <span className="showcase-card-title">{item.title}</span>
                </div>
              </div>
            </div>
          ))}
          <button className="showcase-hero-nav prev" onClick={prevSlide}>
            <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button className="showcase-hero-nav next" onClick={nextSlide}>
            <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
        <div className="showcase-hero-dots">
          {showcaseItems.map((item) => (
            <div
              key={item.id}
              className={`showcase-hero-dot ${currentIndex === item.id ? 'active' : ''}`}
              onClick={() => setCurrentIndex(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductShowcase;
