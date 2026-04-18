import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../components';
import { galleryAPI, BACKEND_URL } from '../services';

const ITEMS_PER_PAGE = 12;

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch gallery images from backend
  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      const response = await galleryAPI.getAll();
      setGalleryImages(response.data || []);
    } catch (error) {
      console.error('Failed to fetch gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  // Build unique categories list from linked products
  const categoriesMap = new Map();
  galleryImages.forEach(img => {
    img.products?.forEach(p => {
      p.product?.categories?.forEach(c => {
        if (c.category) {
          categoriesMap.set(c.category.id, c.category);
        }
      });
    });
  });
  const allCategories = Array.from(categoriesMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  // Get count of images per category
  const getCategoryCount = (categoryId) => {
    return galleryImages.filter(img =>
      img.products?.some(p =>
        p.product?.categories?.some(c => c.category?.id === categoryId)
      )
    ).length;
  };

  // Filter images
  let filteredImages = galleryImages;
  if (filterFeatured) {
    filteredImages = filteredImages.filter(img => img.isFeatured);
  }
  if (activeCategory !== 'all') {
    filteredImages = filteredImages.filter(img =>
      img.products?.some(p =>
        p.product?.categories?.some(c => c.category?.id === activeCategory)
      )
    );
  }

  const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE);
  const paginatedImages = filteredImages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Get image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    return imageUrl.startsWith('http') ? imageUrl : `${BACKEND_URL}${imageUrl}`;
  };

  // Get product image URL
  const getProductImageUrl = (product) => {
    const image = product.images?.[0];
    if (!image) return null;
    const imageUrl = image.imageUrl;
    return imageUrl?.startsWith('http') ? imageUrl : `${BACKEND_URL}${imageUrl}`;
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
          <div className="gallery-filter" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            {allCategories.length > 0 && (
              <select
                className="gallery-category-select"
                value={activeCategory}
                onChange={(e) => { setActiveCategory(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">All Product Ranges ({galleryImages.length})</option>
                {allCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({getCategoryCount(cat.id)})
                  </option>
                ))}
              </select>
            )}
            <label className="checkbox-label filter-checkbox">
              <input
                type="checkbox"
                checked={filterFeatured}
                onChange={(e) => { setFilterFeatured(e.target.checked); setCurrentPage(1); }}
              />
              <span className="checkmark"></span>
              <span>Show Featured Only</span>
            </label>
          </div>
          <div className="gallery-count">
            Showing <strong>{filteredImages.length}</strong> images
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="gallery-section">
        {loading ? (
          <div className="gallery-loading">
            <div className="loading-spinner"></div>
            <p>Loading gallery...</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {paginatedImages.map((image) => (
              <div
                key={image.id}
                className="gallery-item"
                onClick={() => openLightbox(image)}
              >
                <div className="gallery-item-image">
                  <img src={getImageUrl(image.imageUrl)} alt={image.altText || image.title} />
                  <div className="gallery-item-overlay">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                      <path d="M11 8v6M8 11h6" />
                    </svg>
                  </div>
                  {image.isFeatured && (
                    <span className="gallery-featured-badge">Featured</span>
                  )}
                </div>
                <div className="gallery-item-info">
                  <h4 className="gallery-item-name">{image.title}</h4>
                  {image.products?.length > 0 && (
                    <span className="gallery-item-products">
                      {image.products.length} product{image.products.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="pagination" style={{ padding: '0 24px' }}>
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              &laquo; Previous
            </button>
            <div className="pagination-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                  onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              Next &raquo;
            </button>
          </div>
        )}

        {!loading && filteredImages.length === 0 && (
          <div className="gallery-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <h3>No images found</h3>
            <p>Check back later for updates to our gallery.</p>
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox gallery-lightbox" onClick={closeLightbox}>
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
              <img src={getImageUrl(selectedImage.imageUrl)} alt={selectedImage.altText || selectedImage.title} />
            </div>

            {/* Gallery Info Panel */}
            <div className="lightbox-info">
              <div className="lightbox-product-header">
                {selectedImage.isFeatured && (
                  <span className="lightbox-featured">Featured</span>
                )}
              </div>
              <h2 className="lightbox-product-name">{selectedImage.title}</h2>
              {selectedImage.description && (
                <p className="lightbox-product-desc">{selectedImage.description}</p>
              )}

              {/* Linked Products */}
              {selectedImage.products?.length > 0 && (
                <div className="lightbox-linked-products">
                  <h3 className="linked-products-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Products in this image
                  </h3>
                  <div className="linked-products-list">
                    {selectedImage.products.map((item) => (
                      <Link
                        key={item.productId}
                        to={`/products/${item.product.slug}`}
                        className="linked-product-card"
                        onClick={closeLightbox}
                      >
                        <div className="linked-product-image">
                          {getProductImageUrl(item.product) ? (
                            <img src={getProductImageUrl(item.product)} alt={item.product.name} />
                          ) : (
                            <div className="linked-product-placeholder">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path d="M21 15l-5-5L5 21" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="linked-product-info">
                          <span className="linked-product-name">{item.product.name}</span>
                          {item.product.categories?.[0]?.category?.name && (
                            <span className="linked-product-category">{item.product.categories[0].category.name}</span>
                          )}
                        </div>
                        <svg className="linked-product-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="lightbox-actions">
                <Link to="/contact" className="btn-primary" onClick={closeLightbox}>
                  Request Quote
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
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
