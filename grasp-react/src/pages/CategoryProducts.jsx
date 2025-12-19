import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../contexts';
import { Navbar, Footer } from '../components';

const CategoryProducts = () => {
  const { slug } = useParams();
  const { getCategoryById, getProductsByCategory, getAllCategories } = useProducts();

  const category = getCategoryById(slug);
  const products = category ? getProductsByCategory(category.id) : [];
  const allCategories = getAllCategories();

  if (!category) {
    return (
      <>
        <Navbar isVisible={true} />
        <div className="product-not-found">
          <h1>Category Not Found</h1>
          <p>The category you're looking for doesn't exist.</p>
          <Link to="/products" className="btn-primary">Back to Products</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar isVisible={true} />

      {/* Category Hero */}
      <section className="category-hero">
        <div className="category-hero-inner">
          <div className="category-code">{category.code}</div>
          <h1 className="category-title">{category.name}</h1>
          <p className="category-description">{category.description}</p>
          <div className="category-specs-inline">
            {category.specs?.map((spec, index) => (
              <span key={index} className="spec-badge">{spec}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="category-products">
        <div className="category-products-inner">
          {/* Sidebar */}
          <aside className="category-sidebar">
            <h3>Categories</h3>
            <nav className="category-nav">
              {allCategories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/products/category/${cat.slug}`}
                  className={`category-nav-item ${cat.id === category.id ? 'active' : ''}`}
                >
                  {cat.name}
                  <span className="count">{getProductsByCategory(cat.id).length}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Products */}
          <div className="category-products-grid">
            <div className="products-header">
              <h2>{products.length} Products</h2>
            </div>

            {products.length > 0 ? (
              <div className="products-grid">
                {products.map(product => (
                  <Link key={product.id} to={`/products/${product.slug}`} className="product-card">
                    <div className="product-card-image">
                      <div className="product-image-placeholder">
                        <svg viewBox="0 0 80 80">
                          <rect x="10" y="10" width="60" height="60" stroke="currentColor" fill="none" />
                          <path d="M70 10 L78 2 L78 62 L70 70" stroke="currentColor" fill="none" />
                        </svg>
                      </div>
                    </div>
                    <div className="product-card-content">
                      <span className="product-card-code">{product.code}</span>
                      <h3 className="product-card-name">{product.name}</h3>
                      <p className="product-card-desc">{product.description}</p>
                      {product.price && (
                        <span className="product-card-price">₹{product.price.toLocaleString()}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="no-products">
                <p>No products found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default CategoryProducts;
