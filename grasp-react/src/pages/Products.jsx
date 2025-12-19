import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../components';
import { productAPI, categoryAPI } from '../services';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productAPI.getAll(),
          categoryAPI.getAll()
        ]);
        setProducts(productsData.products || productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Debounced search
  const handleSearch = useCallback(async (query, category = selectedCategory) => {
    if (!query.trim() && !category) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await productAPI.search(query, { category });
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [selectedCategory]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery || selectedCategory) {
        handleSearch(searchQuery, selectedCategory);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, handleSearch]);

  // Handle category filter change
  const handleCategoryChange = (categorySlug) => {
    setSelectedCategory(categorySlug);
    if (!searchQuery && !categorySlug) {
      setSearchResults([]);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSearchResults([]);
  };

  // Determine which products to display
  const displayProducts = searchQuery || selectedCategory ? searchResults : products;

  // Helper to safely get array from specs/features (handles JSON strings)
  const getArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const renderProductSVG = (id) => {
    const svgMap = {
      1: (
        <svg viewBox="0 0 120 120">
          <g transform="translate(20, 15)">
            <rect x="10" y="15" width="60" height="80" stroke="currentColor" fill="none" />
            <path d="M70 15 L80 5 L80 85 L70 95" stroke="currentColor" fill="none" />
            <path d="M10 15 L20 5 L80 5 L70 15" stroke="currentColor" fill="none" />
            <circle cx="12" cy="35" r="3" fill="currentColor" />
            <circle cx="12" cy="55" r="3" fill="currentColor" />
            <circle cx="12" cy="75" r="3" fill="currentColor" />
          </g>
        </svg>
      ),
      2: (
        <svg viewBox="0 0 120 120">
          <g transform="translate(20, 20)">
            <rect x="10" y="10" width="60" height="70" stroke="currentColor" fill="none" />
            <path d="M70 10 L80 0 L80 60 L70 80" stroke="currentColor" fill="none" />
            <rect x="18" y="20" width="14" height="22" fill="currentColor" opacity="0.3" />
            <rect x="36" y="20" width="14" height="22" fill="currentColor" opacity="0.3" />
            <rect x="54" y="20" width="10" height="22" fill="currentColor" opacity="0.3" />
          </g>
        </svg>
      ),
      3: (
        <svg viewBox="0 0 120 120">
          <g transform="translate(25, 25)">
            <rect x="10" y="15" width="50" height="50" stroke="currentColor" fill="none" />
            <path d="M60 15 L70 5 L70 55 L60 65" stroke="currentColor" fill="none" />
            <circle cx="20" cy="70" r="5" stroke="currentColor" fill="none" />
            <circle cx="35" cy="70" r="5" stroke="currentColor" fill="none" />
            <circle cx="50" cy="70" r="5" stroke="currentColor" fill="none" />
          </g>
        </svg>
      ),
      4: (
        <svg viewBox="0 0 120 120">
          <g transform="translate(30, 10)">
            <rect x="10" y="10" width="40" height="90" stroke="currentColor" fill="none" />
            <path d="M50 10 L60 0 L60 80 L50 100" stroke="currentColor" fill="none" />
            <rect x="15" y="22" width="30" height="6" fill="currentColor" opacity="0.5" />
            <rect x="15" y="36" width="30" height="6" fill="currentColor" opacity="0.3" />
            <rect x="15" y="50" width="30" height="6" fill="currentColor" opacity="0.3" />
            <rect x="15" y="64" width="30" height="6" fill="currentColor" opacity="0.3" />
          </g>
        </svg>
      ),
      5: (
        <svg viewBox="0 0 120 120">
          <g transform="translate(25, 20)">
            <rect x="10" y="15" width="50" height="55" stroke="currentColor" fill="none" />
            <path d="M60 15 L70 5 L70 60 L60 70" stroke="currentColor" fill="none" />
            <circle cx="35" cy="42" r="14" stroke="currentColor" fill="none" />
            <line x1="35" y1="24" x2="35" y2="30" stroke="currentColor" />
            <line x1="35" y1="54" x2="35" y2="60" stroke="currentColor" />
            <line x1="17" y1="42" x2="23" y2="42" stroke="currentColor" />
            <line x1="47" y1="42" x2="53" y2="42" stroke="currentColor" />
          </g>
        </svg>
      ),
      6: (
        <svg viewBox="0 0 120 120">
          <g transform="translate(15, 15)">
            <rect x="10" y="10" width="70" height="80" stroke="currentColor" fill="none" />
            <path d="M80 10 L90 0 L90 70 L80 90" stroke="currentColor" fill="none" />
            <line x1="20" y1="30" x2="70" y2="30" stroke="currentColor" />
            <line x1="20" y1="50" x2="70" y2="50" stroke="currentColor" />
            <line x1="20" y1="70" x2="70" y2="70" stroke="currentColor" />
            <rect x="72" y="40" width="5" height="20" fill="currentColor" opacity="0.5" />
          </g>
        </svg>
      )
    };

    // Default SVG for products without specific design
    const defaultSVG = (
      <svg viewBox="0 0 120 120">
        <g transform="translate(20, 15)">
          <rect x="10" y="15" width="60" height="80" stroke="currentColor" fill="none" />
          <path d="M70 15 L80 5 L80 85 L70 95" stroke="currentColor" fill="none" />
          <path d="M10 15 L20 5 L80 5 L70 15" stroke="currentColor" fill="none" />
        </g>
      </svg>
    );

    return svgMap[id] || defaultSVG;
  };

  return (
    <>
      <Navbar isVisible={true} />

      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="page-label">Our Products</div>
          <h1 className="page-title">Industrial Enclosure Solutions</h1>
          <p className="page-desc">
            Comprehensive range of high-quality enclosures designed for demanding industrial environments.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="products-search-section">
        <div className="products-search-inner">
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search products by name, category, or specifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {(searchQuery || selectedCategory) && (
                <button className="search-clear" onClick={clearSearch}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
              {isSearching && <div className="search-spinner" />}
            </div>

            <button
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filters
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Search Results Info */}
          {(searchQuery || selectedCategory) && (
            <div className="search-results-info">
              {isSearching ? (
                <span>Searching...</span>
              ) : (
                <span>
                  Found <strong>{searchResults.length}</strong> product{searchResults.length !== 1 ? 's' : ''}
                  {searchQuery && <> for "{searchQuery}"</>}
                  {selectedCategory && <> in {categories.find(c => c.slug === selectedCategory)?.name}</>}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="products-page">
        <div className="products-page-inner">
          {loading ? (
            <div className="products-loading">
              <div className="loading-spinner" />
              <p>Loading products...</p>
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="products-empty">
              {searchQuery || selectedCategory ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                    <path d="M8 8l6 6M14 8l-6 6" />
                  </svg>
                  <h3>No products found</h3>
                  <p>Try adjusting your search or filter to find what you're looking for.</p>
                  <button className="btn-secondary" onClick={clearSearch}>Clear Search</button>
                </>
              ) : (
                <>
                  <h3>No products available</h3>
                  <p>Check back soon for our product catalog.</p>
                </>
              )}
            </div>
          ) : (
            displayProducts.map((product) => (
              <Link
                to={`/products/${product.slug || product.id}`}
                key={product.id}
                className="product-detail-card"
              >
                <div className="product-detail-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    renderProductSVG(product.id)
                  )}
                </div>
                <div className="product-detail-content">
                  <div className="product-detail-code">{product.code || product.category}</div>
                  <h2 className="product-detail-name">{product.name}</h2>
                  <p className="product-detail-desc">{product.description || product.desc}</p>
                  <div className="product-detail-specs">
                    {getArray(product.specs).slice(0, 4).map((spec, index) => (
                      <span key={index} className="product-spec-tag">{spec}</span>
                    ))}
                  </div>
                  {getArray(product.features).length > 0 && (
                    <div className="product-detail-features">
                      <h4>Key Features</h4>
                      <ul>
                        {getArray(product.features).slice(0, 4).map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="product-card-action">
                    <span className="view-details">
                      View Details
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Products;
