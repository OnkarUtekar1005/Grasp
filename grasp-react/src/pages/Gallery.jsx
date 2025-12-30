import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../components';
import { useProducts } from '../contexts';

const Gallery = () => {
  const { products, categories } = useProducts();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [galleryImages, setGalleryImages] = useState([]);

  // Build gallery images from products
  useEffect(() => {
    const images = [];
    products.forEach(product => {
      // Add product images if they exist
      if (product.images && product.images.length > 0) {
        product.images.forEach((img, index) => {
          images.push({
            id: `${product.id}-${index}`,
            url: img,
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            productCode: product.code,
            productDescription: product.description,
            productPrice: product.price,
            categoryId: product.categoryId,
            isPlaceholder: false
          });
        });
      } else {
        // Add placeholder for products without images
        images.push({
          id: `${product.id}-placeholder`,
          url: null,
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          productCode: product.code,
          productDescription: product.description,
          productPrice: product.price,
          categoryId: product.categoryId,
          isPlaceholder: true
        });
      }
    });
    setGalleryImages(images);
  }, [products]);

  // Filter images by category
  const filteredImages = selectedCategory === 'all'
    ? galleryImages
    : galleryImages.filter(img => img.categoryId === parseInt(selectedCategory));

  // Get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Open lightbox
  const openLightbox = (image) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  // Close lightbox
  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = '';
  };

  // Navigate to next/prev image
  const navigateImage = (direction) => {
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    let newIndex;
    if (direction === 'next') {
      newIndex = currentIndex === filteredImages.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? filteredImages.length - 1 : currentIndex - 1;
    }
    setSelectedImage(filteredImages[newIndex]);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') navigateImage('next');
      if (e.key === 'ArrowLeft') navigateImage('prev');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, filteredImages]);

  // Render placeholder SVG
  const renderPlaceholderSVG = (productId) => {
    const variant = productId % 6;
    const svgs = [
      <svg viewBox="0 0 120 120" key={0}>
        <g transform="translate(20, 15)">
          <rect x="10" y="15" width="60" height="80" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <path d="M70 15 L80 5 L80 85 L70 95" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <path d="M10 15 L20 5 L80 5 L70 15" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <circle cx="20" cy="35" r="4" fill="currentColor" opacity="0.4" />
          <circle cx="20" cy="55" r="4" fill="currentColor" opacity="0.4" />
        </g>
      </svg>,
      <svg viewBox="0 0 120 120" key={1}>
        <g transform="translate(20, 20)">
          <rect x="10" y="10" width="60" height="70" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <path d="M70 10 L80 0 L80 60 L70 80" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <rect x="18" y="20" width="14" height="22" fill="currentColor" opacity="0.3" />
          <rect x="36" y="20" width="14" height="22" fill="currentColor" opacity="0.3" />
        </g>
      </svg>,
      <svg viewBox="0 0 120 120" key={2}>
        <g transform="translate(25, 25)">
          <rect x="10" y="15" width="50" height="50" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <path d="M60 15 L70 5 L70 55 L60 65" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <circle cx="35" cy="40" r="12" stroke="currentColor" fill="none" strokeWidth="1" />
        </g>
      </svg>,
      <svg viewBox="0 0 120 120" key={3}>
        <g transform="translate(30, 10)">
          <rect x="10" y="10" width="40" height="90" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <path d="M50 10 L60 0 L60 80 L50 100" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <rect x="15" y="22" width="30" height="6" fill="currentColor" opacity="0.4" />
          <rect x="15" y="36" width="30" height="6" fill="currentColor" opacity="0.3" />
        </g>
      </svg>,
      <svg viewBox="0 0 120 120" key={4}>
        <g transform="translate(25, 20)">
          <rect x="10" y="15" width="50" height="55" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <path d="M60 15 L70 5 L70 60 L60 70" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <circle cx="35" cy="42" r="14" stroke="currentColor" fill="none" strokeWidth="1" />
        </g>
      </svg>,
      <svg viewBox="0 0 120 120" key={5}>
        <g transform="translate(15, 15)">
          <rect x="10" y="10" width="70" height="80" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <path d="M80 10 L90 0 L90 70 L80 90" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <line x1="20" y1="30" x2="70" y2="30" stroke="currentColor" strokeWidth="1" />
          <line x1="20" y1="50" x2="70" y2="50" stroke="currentColor" strokeWidth="1" />
        </g>
      </svg>
    ];
    return svgs[variant];
  };

  return (
    <>
      <Navbar isVisible={true} />

      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="page-label">Product Gallery</div>
          <h1 className="page-title">Browse Our Products</h1>
          <p className="page-desc">
            Explore our comprehensive range of industrial enclosures through high-quality images.
          </p>
        </div>
      </section>

      {/* Gallery Controls */}
      <section className="gallery-controls">
        <div className="gallery-controls-inner">
          <div className="gallery-filter">
            <label>Filter by Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="gallery-count">
            Showing <strong>{filteredImages.length}</strong> images
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="gallery-section">
        <div className="gallery-grid">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="gallery-item"
              onClick={() => openLightbox(image)}
            >
              <div className="gallery-item-image">
                {image.isPlaceholder ? (
                  <div className="gallery-placeholder">
                    {renderPlaceholderSVG(image.productId)}
                  </div>
                ) : (
                  <img src={image.url} alt={image.productName} />
                )}
                <div className="gallery-item-overlay">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                    <path d="M11 8v6M8 11h6" />
                  </svg>
                </div>
              </div>
              <div className="gallery-item-info">
                <span className="gallery-item-code">{image.productCode}</span>
                <h4 className="gallery-item-name">{image.productName}</h4>
              </div>
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="gallery-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <h3>No images found</h3>
            <p>Try selecting a different category.</p>
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button className="lightbox-close" onClick={closeLightbox}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Navigation Arrows */}
            <button className="lightbox-nav prev" onClick={() => navigateImage('prev')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button className="lightbox-nav next" onClick={() => navigateImage('next')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            {/* Image Display */}
            <div className="lightbox-image-container">
              {selectedImage.isPlaceholder ? (
                <div className="lightbox-placeholder">
                  {renderPlaceholderSVG(selectedImage.productId)}
                </div>
              ) : (
                <img src={selectedImage.url} alt={selectedImage.productName} />
              )}
            </div>

            {/* Product Info Panel */}
            <div className="lightbox-info">
              <div className="lightbox-product-header">
                <span className="lightbox-category">
                  {getCategoryName(selectedImage.categoryId)}
                </span>
                <span className="lightbox-code">{selectedImage.productCode}</span>
              </div>
              <h2 className="lightbox-product-name">{selectedImage.productName}</h2>
              <p className="lightbox-product-desc">{selectedImage.productDescription}</p>
              {selectedImage.productPrice && (
                <div className="lightbox-price">
                  <span className="price-label">Starting from</span>
                  <span className="price-value">₹{selectedImage.productPrice.toLocaleString()}</span>
                </div>
              )}
              <div className="lightbox-actions">
                <Link
                  to={`/products/${selectedImage.productSlug}`}
                  className="btn-primary"
                  onClick={closeLightbox}
                >
                  View Product Details
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link to="/contact" className="btn-secondary" onClick={closeLightbox}>
                  Request Quote
                </Link>
              </div>
              <div className="lightbox-counter">
                {filteredImages.findIndex(img => img.id === selectedImage.id) + 1} / {filteredImages.length}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Gallery;
