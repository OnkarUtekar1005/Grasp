import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Navbar, Footer } from '../components';
import { productAPI, categoryAPI } from '../services';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    categories: [],
    ipRatings: [],
    materials: [],
    mountingTypes: [],
    priceRange: { min: '', max: '' },
    inStockOnly: false,
    featuredOnly: false
  });


  // Extract unique filter options from products
  const filterOptions = useMemo(() => {
    const ipRatings = new Set();
    const materials = new Set();
    const mountingTypes = new Set();
    let minPrice = Infinity;
    let maxPrice = 0;

    products.forEach(product => {
      if (product.specs) {
        if (product.specs.protection) {
          ipRatings.add(product.specs.protection);
        }
        if (product.specs.material) {
          materials.add(product.specs.material);
        }
        if (product.specs.mounting) {
          mountingTypes.add(product.specs.mounting);
        }
      }
      if (product.price) {
        minPrice = Math.min(minPrice, product.price);
        maxPrice = Math.max(maxPrice, product.price);
      }
    });

    return {
      ipRatings: Array.from(ipRatings).sort(),
      materials: Array.from(materials).sort(),
      mountingTypes: Array.from(mountingTypes).sort(),
      priceRange: { min: minPrice === Infinity ? 0 : minPrice, max: maxPrice }
    };
  }, [products]);

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

        // Check URL for initial category filter
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
          setFilters(prev => ({ ...prev, categories: [categoryParam] }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.code?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      const categoryIds = categories
        .filter(cat => filters.categories.includes(cat.slug))
        .map(cat => cat.id);
      result = result.filter(product => categoryIds.includes(product.categoryId));
    }

    // IP Rating filter
    if (filters.ipRatings.length > 0) {
      result = result.filter(product =>
        product.specs?.protection && filters.ipRatings.includes(product.specs.protection)
      );
    }

    // Material filter
    if (filters.materials.length > 0) {
      result = result.filter(product =>
        product.specs?.material && filters.materials.includes(product.specs.material)
      );
    }

    // Mounting type filter
    if (filters.mountingTypes.length > 0) {
      result = result.filter(product =>
        product.specs?.mounting && filters.mountingTypes.includes(product.specs.mounting)
      );
    }

    // Price range filter
    if (filters.priceRange.min !== '' || filters.priceRange.max !== '') {
      result = result.filter(product => {
        if (!product.price) return filters.priceRange.min === '' && filters.priceRange.max === '';
        const min = filters.priceRange.min !== '' ? parseFloat(filters.priceRange.min) : 0;
        const max = filters.priceRange.max !== '' ? parseFloat(filters.priceRange.max) : Infinity;
        return product.price >= min && product.price <= max;
      });
    }

    // In stock filter
    if (filters.inStockOnly) {
      result = result.filter(product => product.inStock);
    }

    // Featured filter
    if (filters.featuredOnly) {
      result = result.filter(product => product.featured);
    }

    // Sort by name by default
    result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [products, categories, searchQuery, filters]);

  // Toggle filter value
  const toggleFilter = (filterType, value) => {
    setFilters(prev => {
      const current = prev[filterType];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [filterType]: updated };
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      categories: [],
      ipRatings: [],
      materials: [],
      mountingTypes: [],
      priceRange: { min: '', max: '' },
      inStockOnly: false,
      featuredOnly: false
    });
    setSearchQuery('');
    setSearchParams({});
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += filters.categories.length;
    count += filters.ipRatings.length;
    count += filters.materials.length;
    count += filters.mountingTypes.length;
    if (filters.priceRange.min !== '' || filters.priceRange.max !== '') count++;
    if (filters.inStockOnly) count++;
    if (filters.featuredOnly) count++;
    return count;
  }, [filters]);

  // Helper to safely get array from specs/features
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

  // Filter Section Component
  const FilterSection = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
      <div className="filter-section">
        <button className="filter-section-header" onClick={() => setIsOpen(!isOpen)}>
          <span>{title}</span>
          <svg className={`filter-chevron ${isOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {isOpen && <div className="filter-section-content">{children}</div>}
      </div>
    );
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

      {/* Search and Controls Bar */}
      <section className="products-controls-section">
        <div className="products-controls-inner">
          <div className="search-container-main">
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery('')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="controls-right">
            {/* Mobile Filter Toggle */}
            <button
              className="mobile-filter-toggle"
              onClick={() => setShowMobileFilters(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filters
              {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
            </button>

            {/* View Toggle */}
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="products-main-section">
        <div className="products-main-inner">
          {/* Filter Sidebar */}
          <aside className={`filter-sidebar ${showMobileFilters ? 'mobile-open' : ''}`}>
            <div className="filter-sidebar-header">
              <h3>Filters</h3>
              <div className="filter-header-actions">
                {activeFilterCount > 0 && (
                  <button className="clear-filters-btn" onClick={clearAllFilters}>
                    Clear All ({activeFilterCount})
                  </button>
                )}
                <button className="close-filters-btn" onClick={() => setShowMobileFilters(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="filter-sidebar-content">
              {/* Categories */}
              <FilterSection title="Categories">
                <div className="filter-options">
                  {categories.map(category => (
                    <label key={category.slug} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category.slug)}
                        onChange={() => toggleFilter('categories', category.slug)}
                      />
                      <span className="checkmark"></span>
                      <span className="filter-label">{category.name}</span>
                      <span className="filter-count-badge">
                        {products.filter(p => p.categoryId === category.id).length}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* IP Rating */}
              {filterOptions.ipRatings.length > 0 && (
                <FilterSection title="IP Rating">
                  <div className="filter-options">
                    {filterOptions.ipRatings.map(rating => (
                      <label key={rating} className="filter-checkbox">
                        <input
                          type="checkbox"
                          checked={filters.ipRatings.includes(rating)}
                          onChange={() => toggleFilter('ipRatings', rating)}
                        />
                        <span className="checkmark"></span>
                        <span className="filter-label">{rating}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>
              )}

              {/* Material */}
              {filterOptions.materials.length > 0 && (
                <FilterSection title="Material">
                  <div className="filter-options">
                    {filterOptions.materials.map(material => (
                      <label key={material} className="filter-checkbox">
                        <input
                          type="checkbox"
                          checked={filters.materials.includes(material)}
                          onChange={() => toggleFilter('materials', material)}
                        />
                        <span className="checkmark"></span>
                        <span className="filter-label">{material}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>
              )}

              {/* Mounting Type */}
              {filterOptions.mountingTypes.length > 0 && (
                <FilterSection title="Mounting Type">
                  <div className="filter-options">
                    {filterOptions.mountingTypes.map(type => (
                      <label key={type} className="filter-checkbox">
                        <input
                          type="checkbox"
                          checked={filters.mountingTypes.includes(type)}
                          onChange={() => toggleFilter('mountingTypes', type)}
                        />
                        <span className="checkmark"></span>
                        <span className="filter-label">{type}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>
              )}

              {/* Price Range */}
              <FilterSection title="Price Range">
                <div className="price-range-inputs">
                  <div className="price-input-group">
                    <span className="price-currency">₹</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange.min}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, min: e.target.value }
                      }))}
                    />
                  </div>
                  <span className="price-separator">to</span>
                  <div className="price-input-group">
                    <span className="price-currency">₹</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange.max}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, max: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                {filterOptions.priceRange.max > 0 && (
                  <div className="price-range-hint">
                    Range: ₹{filterOptions.priceRange.min.toLocaleString()} - ₹{filterOptions.priceRange.max.toLocaleString()}
                  </div>
                )}
              </FilterSection>

              {/* Availability */}
              <FilterSection title="Availability">
                <div className="filter-options">
                  <label className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.inStockOnly}
                      onChange={() => setFilters(prev => ({ ...prev, inStockOnly: !prev.inStockOnly }))}
                    />
                    <span className="checkmark"></span>
                    <span className="filter-label">In Stock Only</span>
                  </label>
                  <label className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.featuredOnly}
                      onChange={() => setFilters(prev => ({ ...prev, featuredOnly: !prev.featuredOnly }))}
                    />
                    <span className="checkmark"></span>
                    <span className="filter-label">Featured Products</span>
                  </label>
                </div>
              </FilterSection>
            </div>

            {/* Mobile Apply Button */}
            <div className="filter-sidebar-footer">
              <button className="apply-filters-btn" onClick={() => setShowMobileFilters(false)}>
                Show {filteredProducts.length} Results
              </button>
            </div>
          </aside>

          {/* Mobile Overlay */}
          {showMobileFilters && (
            <div className="filter-overlay" onClick={() => setShowMobileFilters(false)} />
          )}

          {/* Products Grid */}
          <div className="products-content">
            {/* Active Filters Tags */}
            {activeFilterCount > 0 && (
              <div className="active-filters-bar">
                <span className="active-filters-label">Active Filters:</span>
                <div className="active-filters-tags">
                  {filters.categories.map(slug => {
                    const cat = categories.find(c => c.slug === slug);
                    return cat && (
                      <span key={slug} className="filter-tag">
                        {cat.name}
                        <button onClick={() => toggleFilter('categories', slug)}>×</button>
                      </span>
                    );
                  })}
                  {filters.ipRatings.map(rating => (
                    <span key={rating} className="filter-tag">
                      {rating}
                      <button onClick={() => toggleFilter('ipRatings', rating)}>×</button>
                    </span>
                  ))}
                  {filters.materials.map(material => (
                    <span key={material} className="filter-tag">
                      {material}
                      <button onClick={() => toggleFilter('materials', material)}>×</button>
                    </span>
                  ))}
                  {filters.mountingTypes.map(type => (
                    <span key={type} className="filter-tag">
                      {type}
                      <button onClick={() => toggleFilter('mountingTypes', type)}>×</button>
                    </span>
                  ))}
                  {(filters.priceRange.min !== '' || filters.priceRange.max !== '') && (
                    <span className="filter-tag">
                      Price: ₹{filters.priceRange.min || '0'} - ₹{filters.priceRange.max || '∞'}
                      <button onClick={() => setFilters(prev => ({
                        ...prev,
                        priceRange: { min: '', max: '' }
                      }))}>×</button>
                    </span>
                  )}
                  {filters.inStockOnly && (
                    <span className="filter-tag">
                      In Stock
                      <button onClick={() => setFilters(prev => ({ ...prev, inStockOnly: false }))}>×</button>
                    </span>
                  )}
                  {filters.featuredOnly && (
                    <span className="filter-tag">
                      Featured
                      <button onClick={() => setFilters(prev => ({ ...prev, featuredOnly: false }))}>×</button>
                    </span>
                  )}
                </div>
                <button className="clear-all-btn" onClick={clearAllFilters}>Clear All</button>
              </div>
            )}

            {/* Results Count */}
            <div className="results-header">
              <span className="results-count">
                Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
              </span>
            </div>

            {/* Products Display */}
            {loading ? (
              <div className="products-loading">
                <div className="loading-spinner" />
                <p>Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="products-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                  <path d="M8 8l6 6M14 8l-6 6" />
                </svg>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search to find what you're looking for.</p>
                <button className="btn-secondary" onClick={clearAllFilters}>Clear All Filters</button>
              </div>
            ) : (
              <div className={`products-grid-container ${viewMode}`}>
                {viewMode === 'grid' ? (
                  filteredProducts.map((product) => (
                    <Link
                      to={`/products/${product.slug || product.id}`}
                      key={product.id}
                      className="product-grid-card"
                    >
                      <div className="product-grid-image">
                        {product.image ? (
                          <img src={product.image} alt={product.name} />
                        ) : (
                          renderProductSVG(product.id % 6 + 1)
                        )}
                        {product.featured && <span className="product-featured-badge">Featured</span>}
                        {!product.inStock && <span className="product-stock-badge">Out of Stock</span>}
                      </div>
                      <div className="product-grid-content">
                        <div className="product-grid-code">{product.code || product.category}</div>
                        <h3 className="product-grid-name">{product.name}</h3>
                        <p className="product-grid-desc">{product.description || product.desc}</p>
                        {product.price && (
                          <div className="product-grid-price">₹{product.price.toLocaleString()}</div>
                        )}
                        <span className="product-grid-link">
                          View Details
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  filteredProducts.map((product) => (
                    <Link
                      to={`/products/${product.slug || product.id}`}
                      key={product.id}
                      className="product-detail-card"
                    >
                      <div className="product-detail-image">
                        {product.image ? (
                          <img src={product.image} alt={product.name} />
                        ) : (
                          renderProductSVG(product.id % 6 + 1)
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
                        <div className="product-card-footer">
                          {product.price && (
                            <span className="product-price">₹{product.price.toLocaleString()}</span>
                          )}
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
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Products;
