import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../contexts';
import { Navbar, Footer } from '../components';

const ProductDetail = () => {
  const { slug } = useParams();
  const { getProductById, getCategoryById, products } = useProducts();
  const [activeTab, setActiveTab] = useState('specs');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const product = getProductById(slug);
  const category = product ? getCategoryById(product.categoryId) : null;

  // Get related products from the same category
  const relatedProducts = product
    ? products
        .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
        .slice(0, 3)
    : [];

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
    ? product.images
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
              <div className={`stock-badge ${product.inStock ? 'in-stock' : 'out-stock'}`}>
                <span className="status-dot"></span>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>

            <h1 className="product-title-enhanced">{product.name}</h1>

            <p className="product-description-enhanced">
              {product.fullDescription || product.description}
            </p>

            {/* Quick Specs */}
            <div className="product-quick-specs">
              {product.specs && Object.entries(product.specs).slice(0, 4).map(([key, value]) => (
                <div key={key} className="quick-spec-item">
                  <span className="quick-spec-label">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  <span className="quick-spec-value">{value}</span>
                </div>
              ))}
            </div>

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
              <Link to="/contact" className="btn-primary btn-large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Request Quote
              </Link>
              {product.documents?.length > 0 && (
                <a href={product.documents[0]?.url} className="btn-secondary btn-large" download>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Download Datasheet
                </a>
              )}
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

      {/* Tabbed Content Section */}
      <section className="product-tabs-section">
        <div className="product-tabs-wrapper">
          {/* Tab Navigation */}
          <div className="product-tabs-nav">
            <button
              className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
              Specifications
            </button>
            <button
              className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
              Features
            </button>
            {product.documents?.length > 0 && (
              <button
                className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                Documents
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="product-tabs-content">
            {/* Specifications Tab */}
            {activeTab === 'specs' && (
              <div className="tab-panel specs-panel">
                <h3>Technical Specifications</h3>
                <div className="specs-table">
                  {product.specs && Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="spec-row">
                      <span className="spec-key">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className="spec-val">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="tab-panel features-panel">
                <h3>Key Features</h3>
                <div className="features-grid">
                  {product.features?.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <div className="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                          <path d="M22 4L12 14.01l-3-3" />
                        </svg>
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && product.documents?.length > 0 && (
              <div className="tab-panel documents-panel">
                <h3>Downloads & Documents</h3>
                <div className="documents-list">
                  {product.documents.map((doc, index) => (
                    <a key={index} href={doc.url} className="document-item" download>
                      <div className="document-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <path d="M14 2v6h6" />
                        </svg>
                      </div>
                      <div className="document-info">
                        <span className="document-name">{doc.name}</span>
                        <span className="document-type">PDF Document</span>
                      </div>
                      <svg className="download-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

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
              {relatedProducts.map((relProduct) => (
                <Link
                  key={relProduct.id}
                  to={`/products/${relProduct.slug}`}
                  className="related-product-card"
                >
                  <div className="related-product-image">
                    {renderProductSVG(relProduct.id % 3)}
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
              ))}
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
