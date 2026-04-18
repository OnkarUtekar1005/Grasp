import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../components';
import { galleryAPI, BACKEND_URL } from '../services';

const ITEMS_PER_PAGE = 12;

const Gallery = () => {
  const [galleryPosts, setGalleryPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchGalleryPosts();
  }, []);

  const fetchGalleryPosts = async () => {
    try {
      setLoading(true);
      const response = await galleryAPI.getAll();
      setGalleryPosts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch gallery posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Build unique categories list from linked products
  const categoriesMap = new Map();
  galleryPosts.forEach(post => {
    post.products?.forEach(p => {
      p.product?.categories?.forEach(c => {
        if (c.category) categoriesMap.set(c.category.id, c.category);
      });
    });
  });
  const allCategories = Array.from(categoriesMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  const getCategoryCount = (categoryId) => {
    return galleryPosts.filter(post =>
      post.products?.some(p =>
        p.product?.categories?.some(c => c.category?.id === categoryId)
      )
    ).length;
  };

  let filteredPosts = galleryPosts;
  if (filterFeatured) filteredPosts = filteredPosts.filter(p => p.isFeatured);
  if (activeCategory !== 'all') {
    filteredPosts = filteredPosts.filter(post =>
      post.products?.some(p =>
        p.product?.categories?.some(c => c.category?.id === activeCategory)
      )
    );
  }

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    return imageUrl.startsWith('http') ? imageUrl : `${BACKEND_URL}${imageUrl}`;
  };

  const getCoverFile = (post) => post.files?.[0] || null;
  const getImageCount = (post) => post.files?.length || 0;

  const getProductImageUrl = (product) => {
    const image = product.images?.[0];
    if (!image) return null;
    return image.imageUrl?.startsWith('http') ? image.imageUrl : `${BACKEND_URL}${image.imageUrl}`;
  };

  const openLightbox = (post) => {
    setSelectedPost(post);
    setLightboxImageIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedPost(null);
    setLightboxImageIndex(0);
    document.body.style.overflow = '';
  };

  // Navigate within the current post's images
  const navigateImageInPost = (direction) => {
    if (!selectedPost?.files?.length) return;
    const count = selectedPost.files.length;
    setLightboxImageIndex(prev => {
      if (direction === 'next') return (prev + 1) % count;
      return (prev - 1 + count) % count;
    });
  };

  // Navigate between posts
  const navigatePost = (direction) => {
    const currentIndex = filteredPosts.findIndex(p => p.id === selectedPost.id);
    let newIndex;
    if (direction === 'next') {
      newIndex = currentIndex === filteredPosts.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? filteredPosts.length - 1 : currentIndex - 1;
    }
    setSelectedPost(filteredPosts[newIndex]);
    setLightboxImageIndex(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPost) return;
      if (e.key === 'Escape') closeLightbox();
      const postFileCount = selectedPost.files?.length || 0;
      if (e.key === 'ArrowRight') {
        if (postFileCount > 1) navigateImageInPost('next');
        else navigatePost('next');
      }
      if (e.key === 'ArrowLeft') {
        if (postFileCount > 1) navigateImageInPost('prev');
        else navigatePost('prev');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPost, filteredPosts]);

  const currentFile = selectedPost?.files?.[lightboxImageIndex];
  const postImageCount = selectedPost?.files?.length || 0;

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

      <section className="gallery-controls">
        <div className="gallery-controls-inner">
          <div className="gallery-filter" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            {allCategories.length > 0 && (
              <select
                className="gallery-category-select"
                value={activeCategory}
                onChange={(e) => { setActiveCategory(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">All Product Ranges ({galleryPosts.length})</option>
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
            Showing <strong>{filteredPosts.length}</strong> posts
          </div>
        </div>
      </section>

      <section className="gallery-section">
        {loading ? (
          <div className="gallery-loading">
            <div className="loading-spinner"></div>
            <p>Loading gallery...</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {paginatedPosts.map((post) => {
              const cover = getCoverFile(post);
              const imageCount = getImageCount(post);
              return (
                <div key={post.id} className="gallery-item" onClick={() => openLightbox(post)}>
                  <div className="gallery-item-image">
                    {cover ? (
                      <img src={getImageUrl(cover.imageUrl)} alt={cover.altText || post.title} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#999' }}>No image</div>
                    )}
                    <div className="gallery-item-overlay">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                        <path d="M11 8v6M8 11h6" />
                      </svg>
                    </div>
                    {imageCount > 1 && (
                      <span style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="7" y="7" width="14" height="14" rx="2" />
                          <path d="M3 17V5a2 2 0 012-2h12" />
                        </svg>
                        {imageCount}
                      </span>
                    )}
                    {post.isFeatured && (
                      <span className="gallery-featured-badge">Featured</span>
                    )}
                  </div>
                  <div className="gallery-item-info">
                    <h4 className="gallery-item-name">{post.title}</h4>
                    {post.products?.length > 0 && (
                      <span className="gallery-item-products">
                        {post.products.length} product{post.products.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
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

        {!loading && filteredPosts.length === 0 && (
          <div className="gallery-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <h3>No posts found</h3>
            <p>Check back later for updates to our gallery.</p>
          </div>
        )}
      </section>

      {selectedPost && (
        <div className="lightbox gallery-lightbox" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Navigation: within post if multi-image, else between posts */}
            <button
              className="lightbox-nav prev"
              onClick={() => postImageCount > 1 ? navigateImageInPost('prev') : navigatePost('prev')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              className="lightbox-nav next"
              onClick={() => postImageCount > 1 ? navigateImageInPost('next') : navigatePost('next')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            <div className="lightbox-image-container" style={{ position: 'relative' }}>
              {currentFile ? (
                <img
                  src={getImageUrl(currentFile.imageUrl)}
                  alt={currentFile.altText || selectedPost.title}
                />
              ) : (
                <div>No image</div>
              )}

              {/* Carousel dots for multi-image posts */}
              {postImageCount > 1 && (
                <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8 }}>
                  {selectedPost.files.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setLightboxImageIndex(idx); }}
                      style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: idx === lightboxImageIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                        border: 'none', cursor: 'pointer', padding: 0,
                        transition: 'all 0.2s',
                      }}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="lightbox-info">
              <div className="lightbox-product-header">
                {selectedPost.isFeatured && (
                  <span className="lightbox-featured">Featured</span>
                )}
                {postImageCount > 1 && (
                  <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>
                    Image {lightboxImageIndex + 1} of {postImageCount}
                  </span>
                )}
              </div>
              <h2 className="lightbox-product-name">{selectedPost.title}</h2>
              {selectedPost.description && (
                <p className="lightbox-product-desc">{selectedPost.description}</p>
              )}

              {selectedPost.products?.length > 0 && (
                <div className="lightbox-linked-products">
                  <h3 className="linked-products-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Products in this post
                  </h3>
                  <div className="linked-products-list">
                    {selectedPost.products.map((item) => (
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
                Post {filteredPosts.findIndex(p => p.id === selectedPost.id) + 1} / {filteredPosts.length}
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
