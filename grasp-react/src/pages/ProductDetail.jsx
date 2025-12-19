import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../contexts';
import { Navbar, Footer } from '../components';

const ProductDetail = () => {
  const { slug } = useParams();
  const { getProductById, getCategoryById } = useProducts();

  const product = getProductById(slug);
  const category = product ? getCategoryById(product.categoryId) : null;

  if (!product) {
    return (
      <>
        <Navbar isVisible={true} />
        <div className="product-not-found">
          <h1>Product Not Found</h1>
          <p>The product you're looking for doesn't exist.</p>
          <Link to="/products" className="btn-primary">Back to Products</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar isVisible={true} />

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-inner">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          {category && (
            <>
              <Link to={`/products/category/${category.slug}`}>{category.name}</Link>
              <span>/</span>
            </>
          )}
          <span className="current">{product.name}</span>
        </div>
      </div>

      {/* Product Detail Section */}
      <section className="product-detail">
        <div className="product-detail-wrapper">
          {/* Product Images */}
          <div className="product-gallery">
            <div className="product-main-image">
              <div className="product-image-placeholder">
                <svg viewBox="0 0 120 120">
                  <rect x="20" y="20" width="80" height="80" stroke="currentColor" fill="none" strokeWidth="2" />
                  <path d="M100 20 L110 10 L110 90 L100 100" stroke="currentColor" fill="none" strokeWidth="2" />
                  <circle cx="40" cy="50" r="5" fill="currentColor" opacity="0.5" />
                  <circle cx="40" cy="70" r="5" fill="currentColor" opacity="0.5" />
                </svg>
              </div>
            </div>
            <div className="product-code-badge">{product.code}</div>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-category-tag">{category?.name}</div>
            <h1 className="product-title">{product.name}</h1>
            <p className="product-description">{product.fullDescription || product.description}</p>

            {product.price ? (
              <div className="product-price">
                <span className="price-label">Starting from</span>
                <span className="price-value">₹{product.price.toLocaleString()}</span>
              </div>
            ) : (
              <div className="product-price quote">
                <span className="price-label">Price</span>
                <span className="price-value">Request Quote</span>
              </div>
            )}

            <div className="product-actions">
              <Link to="/contact" className="btn-primary">
                Request Quote
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <button className="btn-secondary">
                Download Datasheet
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              </button>
            </div>

            {/* Stock Status */}
            <div className={`stock-status ${product.inStock ? 'in-stock' : 'out-stock'}`}>
              <span className="status-dot"></span>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </div>
          </div>
        </div>
      </section>

      {/* Specifications & Features */}
      <section className="product-specs-section">
        <div className="product-specs-wrapper">
          {/* Specifications */}
          <div className="specs-card">
            <h2>Technical Specifications</h2>
            <div className="specs-grid">
              {product.specs && Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="spec-item">
                  <span className="spec-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                  <span className="spec-value">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="features-card">
            <h2>Key Features</h2>
            <ul className="features-list">
              {product.features?.map((feature, index) => (
                <li key={index}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <path d="M22 4L12 14.01l-3-3" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ProductDetail;
