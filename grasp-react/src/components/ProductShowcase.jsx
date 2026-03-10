import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, BACKEND_URL } from '../services';

// Fallback images if no products in database
import image1 from '../assets/images/574a918b-a771-49ed-bd8a-a6ba1442d13a.jpg';
import image2 from '../assets/images/ace12808-eebe-41d2-a2d1-0400126c4753.jpg';
import image3 from '../assets/images/dc211ccc-9b53-486c-96bc-8af8e9bdea82.jpg';

const fallbackItems = [
  { id: 0, title: 'Power Distribution', image: image1, slug: null },
  { id: 1, title: 'Control Panel', image: image2, slug: null },
  { id: 2, title: 'Junction Box', image: image3, slug: null }
];

const ProductShowcase = forwardRef((props, ref) => {
  const [showcaseItems, setShowcaseItems] = useState(fallbackItems);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef(null);
  const sectionRef = useRef(null);
  const autoPlayRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const isVisibleRef = useRef(false);

  // Touch swipe support
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useImperativeHandle(ref, () => ({
    classList: {
      toggle(className, force) {
        if (sectionRef.current) {
          sectionRef.current.classList.toggle(className, force);
          if (className === 'visible') {
            isVisibleRef.current = force;
          }
        }
      }
    }
  }));

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productAPI.getFeatured(6);
        const products = response.data || [];

        if (products.length > 0) {
          const items = products.map((product, index) => {
            // Get primary image or first image
            const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
            const imageUrl = primaryImage?.imageUrl
              ? (primaryImage.imageUrl.startsWith('http') ? primaryImage.imageUrl : `${BACKEND_URL}${primaryImage.imageUrl}`)
              : fallbackItems[index % fallbackItems.length]?.image;

            return {
              id: index,
              productId: product.id,
              title: product.name,
              image: imageUrl,
              slug: product.slug
            };
          });
          setShowcaseItems(items);
          setCurrentIndex(Math.min(1, items.length - 1));
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      }
    };
    fetchFeaturedProducts();
  }, []);

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

  // Touch handlers for swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        nextSlide(); // Swipe left = next
      } else {
        prevSlide(); // Swipe right = prev
      }
    }
  };

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(nextSlide, 3500);
  }, []);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  // Pause carousel during scroll, resume after scroll stops
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      stopAutoPlay();

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Resume autoplay 500ms after scroll stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        if (isVisibleRef.current) {
          startAutoPlay();
        }
      }, 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [startAutoPlay, stopAutoPlay]);

  // Start autoplay when visible and not scrolling
  useEffect(() => {
    if (itemCount > 0 && isVisibleRef.current && !isScrolling) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
    return () => stopAutoPlay();
  }, [itemCount, isScrolling, startAutoPlay, stopAutoPlay]);

  if (itemCount === 0) {
    return null;
  }

  return (
    <div className="showcase-section-hero" ref={sectionRef}>
      <div className="showcase-hero-inner">
        <div
          className="showcase-hero-carousel"
          ref={carouselRef}
          onMouseEnter={stopAutoPlay}
          onMouseLeave={startAutoPlay}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {showcaseItems.map((item, index) => (
            <div
              key={item.id}
              className={`showcase-hero-card ${getCardClass(index)}`}
              data-index={index}
            >
              {item.slug ? (
                <Link
                  to={`/products/${item.slug}`}
                  className="showcase-card-image"
                  style={{ backgroundImage: `url(${item.image})` }}
                >
                  <div className="showcase-card-overlay">
                    <span className="showcase-card-title">{item.title}</span>
                  </div>
                </Link>
              ) : (
                <div
                  className="showcase-card-image"
                  style={{ backgroundImage: `url(${item.image})` }}
                >
                  <div className="showcase-card-overlay">
                    <span className="showcase-card-title">{item.title}</span>
                  </div>
                </div>
              )}
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
          {showcaseItems.map((item, index) => (
            <div
              key={item.id}
              className={`showcase-hero-dot ${currentIndex === index ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

ProductShowcase.displayName = 'ProductShowcase';

export default ProductShowcase;
