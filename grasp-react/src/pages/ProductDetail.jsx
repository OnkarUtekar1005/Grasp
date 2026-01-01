import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../contexts';
import { Navbar, Footer } from '../components';
import { BACKEND_URL } from '../services';

// Function to download page as PDF
const downloadPageAsPDF = (productName) => {
  // Hide elements that shouldn't be in PDF
  const navbar = document.querySelector('.navbar');
  const footer = document.querySelector('.footer');
  const downloadBtn = document.querySelector('.download-pdf-btn');
  const ctaSection = document.querySelector('.product-cta-section');

  if (navbar) navbar.style.display = 'none';
  if (footer) footer.style.display = 'none';
  if (downloadBtn) downloadBtn.style.display = 'none';
  if (ctaSection) ctaSection.style.display = 'none';

  // Trigger print dialog (user can save as PDF)
  window.print();

  // Restore elements after print
  setTimeout(() => {
    if (navbar) navbar.style.display = '';
    if (footer) footer.style.display = '';
    if (downloadBtn) downloadBtn.style.display = '';
    if (ctaSection) ctaSection.style.display = '';
  }, 100);
};

const ProductDetail = () => {
  const { slug } = useParams();
  const { getProductById, getCategoryById, products } = useProducts();
  const [activeTab, setActiveTab] = useState('specs');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [specCarouselIndex, setSpecCarouselIndex] = useState(0);
  const specsRef = useRef(null);

  const product = getProductById(slug);
  const category = product ? getCategoryById(product.categoryId) : null;

  // Get related products from the same category
  const relatedProducts = product
    ? products
        .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
        .slice(0, 3)
    : [];

  // Auto-advance specs carousel
  useEffect(() => {
    if (!product?.dynamicSpecs?.length || product.dynamicSpecs.length <= 5) return;

    const interval = setInterval(() => {
      setSpecCarouselIndex(prev =>
        (prev + 1) % Math.ceil(product.dynamicSpecs.length / 5)
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [product?.dynamicSpecs?.length]);

  if (!product) {
    return (
      <>
        <Navbar isVisible={true} />
        <div className="product-not-found">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 20L4 4M20 4L4 20" />
          </svg>
          <h1>Product Not Found</h1>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/products" className="btn-primary">
            Browse All Products
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  // Generate placeholder images if none exist
  const productImages = product.images?.length > 0
    ? product.images.map(img => {
        const url = img.imageUrl || img;
        return url?.startsWith('http') ? url : `${BACKEND_URL}${url}`;
      })
    : [null, null, null];

  const renderProductSVG = (variant = 0) => {
    const svgVariants = [
      // Main view
      <svg viewBox="0 0 120 120" key="main">
        <g transform="translate(20, 15)">
          <rect x="10" y="15" width="60" height="80" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <path d="M70 15 L80 5 L80 85 L70 95" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <path d="M10 15 L20 5 L80 5 L70 15" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <circle cx="20" cy="35" r="4" fill="currentColor" opacity="0.4" />
          <circle cx="20" cy="55" r="4" fill="currentColor" opacity="0.4" />
          <circle cx="20" cy="75" r="4" fill="currentColor" opacity="0.4" />
        </g>
      </svg>,
      // Side view
      <svg viewBox="0 0 120 120" key="side">
        <g transform="translate(35, 15)">
          <rect x="10" y="15" width="30" height="80" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <path d="M40 15 L50 5 L50 85 L40 95" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <line x1="15" y1="30" x2="35" y2="30" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <line x1="15" y1="50" x2="35" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <line x1="15" y1="70" x2="35" y2="70" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        </g>
      </svg>,
      // Detail view
      <svg viewBox="0 0 120 120" key="detail">
        <g transform="translate(25, 25)">
          <rect x="10" y="10" width="50" height="50" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <circle cx="35" cy="35" r="15" stroke="currentColor" fill="none" strokeWidth="1" />
          <circle cx="35" cy="35" r="5" fill="currentColor" opacity="0.3" />
          <path d="M60 10 L70 0 L70 50 L60 60" stroke="currentColor" fill="none" strokeWidth="1.5" />
        </g>
      </svg>
    ];
    return svgVariants[variant % svgVariants.length];
  };

  // Calculate specs pages for carousel
  const specsPerPage = 5;
  const totalSpecPages = Math.ceil((product.dynamicSpecs?.length || 0) / specsPerPage);
  const currentSpecs = product.dynamicSpecs?.slice(
    specCarouselIndex * specsPerPage,
    (specCarouselIndex + 1) * specsPerPage
  ) || [];

  const nextSpecPage = () => {
    setSpecCarouselIndex(prev => (prev + 1) % totalSpecPages);
  };

  const prevSpecPage = () => {
    setSpecCarouselIndex(prev => (prev - 1 + totalSpecPages) % totalSpecPages);
  };

  return (
    <>
      <Navbar isVisible={true} />

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-inner">
          <Link to="/">Home</Link>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
          <Link to="/products">Products</Link>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
          {category && (
            <>
              <Link to={`/products?category=${category.slug}`}>{category.name}</Link>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </>
          )}
          <span className="current">{product.name}</span>
        </div>
      </div>

      {/* Product Hero Section */}
      <section className="product-hero-section">
        <div className="product-hero-wrapper">
          {/* Product Gallery */}
          <div className="product-gallery-enhanced">
            <div className="product-main-image-enhanced">
              {productImages[activeImageIndex] ? (
                <img src={productImages[activeImageIndex]} alt={product.name} />
              ) : (
                <div className="product-image-svg">
                  {renderProductSVG(activeImageIndex)}
                </div>
              )}
              <div className="product-badges">
                <span className="product-code-badge">{product.code}</span>
                {product.featured && <span className="featured-badge">Featured</span>}
              </div>
            </div>
            <div className="product-thumbnails">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  className={`product-thumbnail ${activeImageIndex === index ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  {img ? (
                    <img src={img} alt={`${product.name} view ${index + 1}`} />
                  ) : (
                    <div className="thumbnail-svg">
                      {renderProductSVG(index)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info-enhanced">
            <div className="product-meta">
              <span className="product-category-tag">{category?.name}</span>
              <div className={`stock-badge ${product.isActive !== false ? 'in-stock' : 'out-stock'}`}>
                <span className="status-dot"></span>
                {product.isActive !== false ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>

            <h1 className="product-title-enhanced">{product.name}</h1>

            <p className="product-description-enhanced">
              {product.fullDescription || product.description}
            </p>

            {/* Quick Specs Preview */}
            {product.dynamicSpecs?.length > 0 && (
              <div className="product-quick-specs">
                {product.dynamicSpecs.slice(0, 4).map((spec, index) => (
                  <div key={spec.id || index} className="quick-spec-item">
                    <span className="quick-spec-value">{spec.specValue}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Price */}
            <div className="product-price-enhanced">
              {product.price ? (
                <>
                  <span className="price-label">Starting from</span>
                  <span className="price-value">₹{product.price.toLocaleString()}</span>
                </>
              ) : (
                <>
                  <span className="price-label">Price</span>
                  <span className="price-value quote">Request Quote</span>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="product-actions-enhanced">
              <Link to="/quote" className="btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Request Quote
              </Link>
              <button
                onClick={() => downloadPageAsPDF(product.name)}
                className="btn-secondary download-pdf-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M12 18v-6M9 15l3 3 3-3" />
                </svg>
                Download PDF
              </button>
            </div>

            {/* Trust Badges */}
            <div className="product-trust-badges">
              <div className="trust-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Quality Assured</span>
              </div>
              <div className="trust-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" rx="2" />
                  <path d="M16 8h4l3 3v5a2 2 0 01-2 2h-1M6 21a2 2 0 100-4 2 2 0 000 4zM18 21a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                <span>Fast Delivery</span>
              </div>
              <div className="trust-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
                <span>Certified Products</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications Section - Carousel Style */}
      {product.dynamicSpecs?.length > 0 && (
        <section className="product-specifications-section" ref={specsRef}>
          <div className="product-specifications-wrapper">
            <div className="specs-content">
              <div className="specs-header">
                <h2>{product.name} Specifications</h2>
                <p>Technical specifications and dimensions</p>
              </div>

              <div className="specs-carousel">
                <div className="specs-grid" key={specCarouselIndex}>
                  {currentSpecs.map((spec, index) => (
                    <div key={spec.id || index} className="spec-card">
                      <div className="spec-card-label">
                        {spec.specKey || `Spec ${specCarouselIndex * specsPerPage + index + 1}`}
                      </div>
                      <div className="spec-card-value">{spec.specValue}</div>
                    </div>
                  ))}
                </div>

                {totalSpecPages > 1 && (
                  <div className="specs-carousel-controls">
                    <button
                      className="carousel-btn prev"
                      onClick={prevSpecPage}
                      aria-label="Previous specifications"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <div className="carousel-dots">
                      {Array.from({ length: totalSpecPages }).map((_, i) => (
                        <button
                          key={i}
                          className={`carousel-dot ${i === specCarouselIndex ? 'active' : ''}`}
                          onClick={() => setSpecCarouselIndex(i)}
                          aria-label={`Go to page ${i + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      className="carousel-btn next"
                      onClick={nextSpecPage}
                      aria-label="Next specifications"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Key Features Section */}
      {product.features?.length > 0 && (
        <section className="product-features-section">
          <div className="product-features-wrapper">
            <div className="features-header">
              <h2>Key Features</h2>
              <p>What makes this product stand out</p>
            </div>
            <div className="features-grid">
              {product.features.map((feature, index) => (
                <div key={feature.id || index} className="feature-card">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </svg>
                  </div>
                  <div className="feature-text">{feature.featureText}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Downloads & Resources Section */}
      {product.documents?.length > 0 && (
        <section className="product-downloads-section">
          <div className="product-downloads-wrapper">
            <div className="downloads-header">
              <h2>Downloads & Resources</h2>
              <p>Technical documents, datasheets, and certificates</p>
            </div>
            <div className="downloads-grid">
              {product.documents.map((doc, index) => {
                const getDocIcon = (type) => {
                  switch(type) {
                    case 'DATASHEET':
                      return (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                        </svg>
                      );
                    case 'MANUAL':
                      return (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                        </svg>
                      );
                    case 'CERTIFICATE':
                      return (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="12" cy="8" r="6" />
                          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                        </svg>
                      );
                    case 'CAD':
                      return (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polygon points="12 2 2 7 12 12 22 7 12 2" />
                          <polyline points="2 17 12 22 22 17" />
                          <polyline points="2 12 12 17 22 12" />
                        </svg>
                      );
                    default:
                      return (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                          <path d="M13 2v7h7" />
                        </svg>
                      );
                  }
                };

                const getDocTypeName = (type) => {
                  const names = {
                    'DATASHEET': 'Datasheet',
                    'MANUAL': 'User Manual',
                    'CERTIFICATE': 'Certificate',
                    'CAD': 'CAD Drawing',
                    'OTHER': 'Document'
                  };
                  return names[type] || 'Document';
                };

                return (
                  <a
                    key={doc.id || index}
                    href={`${BACKEND_URL}${doc.documentUrl}`}
                    className="download-card"
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className={`download-icon ${doc.documentType?.toLowerCase() || 'other'}`}>
                      {getDocIcon(doc.documentType)}
                    </div>
                    <div className="download-info">
                      <h4>{doc.name}</h4>
                      <span className="download-type">{getDocTypeName(doc.documentType)}</span>
                      {doc.fileSizeBytes && (
                        <span className="download-size">
                          {(doc.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
                        </span>
                      )}
                    </div>
                    <div className="download-action">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                      </svg>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="related-products-section">
          <div className="related-products-wrapper">
            <div className="section-header">
              <h2>Related Products</h2>
              <Link to={`/products?category=${category?.slug}`} className="view-all-link">
                View All in {category?.name}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="related-products-grid">
              {relatedProducts.map((relProduct) => {
                const relImage = relProduct.images?.[0];
                const relImageUrl = relImage?.imageUrl
                  ? (relImage.imageUrl.startsWith('http') ? relImage.imageUrl : `${BACKEND_URL}${relImage.imageUrl}`)
                  : null;

                return (
                  <Link
                    key={relProduct.id}
                    to={`/products/${relProduct.slug}`}
                    className="related-product-card"
                  >
                    <div className="related-product-image">
                      {relImageUrl ? (
                        <img src={relImageUrl} alt={relProduct.name} />
                      ) : (
                        renderProductSVG(relProduct.id % 3)
                      )}
                    </div>
                    <div className="related-product-content">
                      <span className="related-product-code">{relProduct.code}</span>
                      <h4 className="related-product-name">{relProduct.name}</h4>
                      <p className="related-product-desc">{relProduct.description}</p>
                      {relProduct.price && (
                        <span className="related-product-price">
                          ₹{relProduct.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="product-cta-section">
        <div className="product-cta-wrapper">
          <div className="product-cta-content">
            <h2>Need a Custom Solution?</h2>
            <p>Our engineering team can help design enclosures tailored to your specific requirements.</p>
          </div>
          <div className="product-cta-actions">
            <Link to="/contact" className="btn-primary">
              Contact Our Experts
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/products" className="btn-secondary">
              Browse All Products
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ProductDetail;
