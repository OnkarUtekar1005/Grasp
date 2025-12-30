import { useState, useEffect, useRef } from 'react';
import image1 from '../assets/images/574a918b-a771-49ed-bd8a-a6ba1442d13a.jpg';
import image2 from '../assets/images/ace12808-eebe-41d2-a2d1-0400126c4753.jpg';
import image3 from '../assets/images/dc211ccc-9b53-486c-96bc-8af8e9bdea82.jpg';

const showcaseItems = [
  {
    id: 0,
    title: 'Power Distribution',
    image: image1
  },
  {
    id: 1,
    title: 'Control Panel',
    image: image2
  },
  {
    id: 2,
    title: 'Junction Box',
    image: image3
  }
];

const ProductShowcase = ({ isVisible }) => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);
  const itemCount = showcaseItems.length;

  const getCardClass = (index) => {
    const diff = index - currentIndex;
    if (diff === 0) return 'center';
    if (diff === -1 || (currentIndex === 0 && index === itemCount - 1)) return 'left';
    if (diff === 1 || (currentIndex === itemCount - 1 && index === 0)) return 'right';
    if (diff < -1) return 'far-left';
    return 'far-right';
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % itemCount);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + itemCount) % itemCount);
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
