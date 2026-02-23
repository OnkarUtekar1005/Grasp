import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Navbar, Footer } from '../components';
import { productAPI, categoryAPI, BACKEND_URL } from '../services';

// Fuzzy search utility functions
const fuzzyMatch = (text, query) => {
  if (!text || !query) return { match: false, score: 0 };

  const textLower = String(text).toLowerCase();
  const queryLower = query.toLowerCase();

  // Exact match - highest score
  if (textLower === queryLower) return { match: true, score: 100 };

  // Starts with query - very high score
  if (textLower.startsWith(queryLower)) return { match: true, score: 90 };

  // Contains exact query - high score
  if (textLower.includes(queryLower)) return { match: true, score: 80 };

  // Word starts with query
  const words = textLower.split(/[\s\-_]+/);
  for (const word of words) {
    if (word.startsWith(queryLower)) return { match: true, score: 75 };
  }

  // Fuzzy character sequence match (characters appear in order)
  let queryIndex = 0;
  let consecutiveMatches = 0;
  let maxConsecutive = 0;

  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++;
      consecutiveMatches++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveMatches);
    } else {
      consecutiveMatches = 0;
    }
  }

  if (queryIndex === queryLower.length) {
    // All query characters found in order
    const score = 50 + (maxConsecutive / queryLower.length) * 20;
    return { match: true, score };
  }

  // Levenshtein distance for typo tolerance (only for short queries)
  if (queryLower.length >= 3 && queryLower.length <= 10) {
    const distance = levenshteinDistance(textLower, queryLower);
    const maxLen = Math.max(textLower.length, queryLower.length);
    const similarity = 1 - (distance / maxLen);

    // Allow up to 2 character differences for queries >= 4 chars
    if (distance <= Math.min(2, Math.floor(queryLower.length / 2))) {
      return { match: true, score: similarity * 40 };
    }

    // Check if any word in text is similar
    for (const word of words) {
      if (word.length >= 3) {
        const wordDistance = levenshteinDistance(word, queryLower);
        if (wordDistance <= Math.min(2, Math.floor(queryLower.length / 2))) {
          return { match: true, score: (1 - wordDistance / Math.max(word.length, queryLower.length)) * 35 };
        }
      }
    }
  }

  return { match: false, score: 0 };
};

// Levenshtein distance calculation
const levenshteinDistance = (str1, str2) => {
  const m = str1.length;
  const n = str2.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
};

// Search a product across multiple fields
const fuzzySearchProduct = (product, query, categories) => {
  if (!query) return { match: true, score: 0 };

  // Get category names and codes for this product
  let categoryNames = [];
  let categoryCodes = [];

  if (product.categories && Array.isArray(product.categories)) {
    product.categories.forEach(pc => {
      if (pc.category?.name) categoryNames.push(pc.category.name);
      if (pc.category?.code) categoryCodes.push(pc.category.code);
    });
  } else if (product.categoryId) {
    const cat = categories.find(c => c.id === product.categoryId);
    if (cat) {
      categoryNames.push(cat.name);
      if (cat.code) categoryCodes.push(cat.code);
    }
  }

  // Search across all fields with different weights
  const searches = [
    { text: product.code, weight: 1.2 },        // Product code - highest priority
    { text: product.name, weight: 1.1 },        // Product name - high priority
    ...categoryCodes.map(code => ({ text: code, weight: 1.0 })),  // Category code
    ...categoryNames.map(name => ({ text: name, weight: 0.9 })),  // Category name
    { text: product.dimensionLength ? `${product.dimensionLength}` : null, weight: 0.85 },  // Length
    { text: product.dimensionWidth ? `${product.dimensionWidth}` : null, weight: 0.85 },    // Width
    { text: product.dimensionHeight ? `${product.dimensionHeight}` : null, weight: 0.85 },  // Height
    { text: product.dimensionLength && product.dimensionWidth && product.dimensionHeight
        ? `${product.dimensionLength}x${product.dimensionWidth}x${product.dimensionHeight}`
        : null, weight: 0.9 },  // Full dimension string e.g. "200x150x100"
    ...(product.tags || []).map(tag => ({ text: String(tag), weight: 0.85 })),  // Tags
    { text: product.specMaterial, weight: 0.8 },     // Material spec
    { text: product.specIpRating, weight: 0.8 },     // IP Rating spec
    { text: product.description, weight: 0.5 },      // Description - lowest priority
  ];

  let bestScore = 0;
  let hasMatch = false;

  for (const { text, weight } of searches) {
    if (text) {
      const result = fuzzyMatch(text, query);
      if (result.match) {
        hasMatch = true;
        bestScore = Math.max(bestScore, result.score * weight);
      }
    }
  }

  return { match: hasMatch, score: bestScore };
};

// Memoized Filter Section Component - defined outside to prevent recreation
const FilterSection = memo(({ title, children, defaultOpen = true }) => {
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
});

// Memoized Product Card for grid view
const ProductGridCard = memo(({ product, categoryName, renderProductSVG, BACKEND_URL }) => {
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const imageUrl = primaryImage?.imageUrl || product.image;

  return (
    <Link
      to={`/products/${product.slug || product.id}`}
      className="product-grid-card"
    >
      <div className="product-grid-image">
        {imageUrl ? (
          <img
            src={imageUrl.startsWith('http') ? imageUrl : `${BACKEND_URL}${imageUrl}`}
            alt={product.name}
            loading="lazy"
          />
        ) : (
          renderProductSVG(product.id % 6 + 1)
        )}
        {(product.isFeatured || product.featured) && <span className="product-featured-badge">Featured</span>}
        {product.isActive === false && <span className="product-stock-badge">Out of Stock</span>}
      </div>
      <div className="product-grid-content">
        <h3 className="product-grid-name">{product.name}</h3>
        {(product.dimensionLength || product.dimensionWidth || product.dimensionHeight) && (
          <div className="product-grid-size">
            <strong>Size:</strong> {[product.dimensionLength, product.dimensionWidth, product.dimensionHeight].filter(Boolean).join(' x ')} mm
          </div>
        )}
        <p className="product-grid-desc">{product.description || product.desc}</p>
        {categoryName && <div className="product-grid-category">{categoryName}</div>}
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
  );
});

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showMoreProducts, setShowMoreProducts] = useState({});
  const [visibleCount, setVisibleCount] = useState(10);
  const productsGridRef = useRef(null);

  // Disable pointer events during scroll to prevent hover lag
  useEffect(() => {
    let scrollTimeout;
    const handleScroll = () => {
      if (productsGridRef.current) {
        productsGridRef.current.style.pointerEvents = 'none';
      }
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (productsGridRef.current) {
          productsGridRef.current.style.pointerEvents = '';
        }
      }, 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Filter states
  const [filters, setFilters] = useState({
    categories: [],
    products: [], // Selected product IDs
    dimensions: { minL: '', maxL: '', minW: '', maxW: '', minH: '', maxH: '' }, // Dimension filters
    rangeCodes: [], // Range Code filter (from product.code)
    rangeNames: [], // Range Name filter (from category name)
    tags: [], // Tags filter (from products and categories)
    ipRatings: [],
    materials: [],
    mountingTypes: [],
    priceRange: { min: '', max: '' },
    inStockOnly: false,
    featuredOnly: false
  });

  // Tag search state
  const [tagSearch, setTagSearch] = useState('');

  // Memoize products per category to avoid recalculating on every render
  const productsByCategory = useMemo(() => {
    const map = {};
    categories.forEach(cat => {
      map[cat.id] = products.filter(p => {
        if (p.categories && Array.isArray(p.categories)) {
          return p.categories.some(pc => pc.categoryId === cat.id || pc.category?.id === cat.id);
        }
        return p.categoryId === cat.id;
      });
    });
    return map;
  }, [products, categories]);

  // Get products for a category from memoized map
  const getProductsForCategory = useCallback((categoryId) => {
    return productsByCategory[categoryId] || [];
  }, [productsByCategory]);

  // Toggle category expansion to show products
  const toggleCategoryExpand = (categorySlug) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categorySlug]: !prev[categorySlug]
    }));
  };

  // Toggle product selection
  const toggleProductFilter = (productId) => {
    setFilters(prev => {
      const current = prev.products;
      const updated = current.includes(productId)
        ? current.filter(id => id !== productId)
        : [...current, productId];
      return { ...prev, products: updated };
    });
  };

  // Show more products for a category
  const toggleShowMoreProducts = (categorySlug) => {
    setShowMoreProducts(prev => ({
      ...prev,
      [categorySlug]: !prev[categorySlug]
    }));
  };


  // Extract unique filter options from products
  const filterOptions = useMemo(() => {
    const rangeCodes = new Set();
    const rangeNames = new Set();
    const tags = new Set();
    const ipRatings = new Set();
    const materials = new Set();
    const mountingTypes = new Set();
    let minPrice = Infinity;
    let maxPrice = 0;

    // Extract tags from products
    products.forEach(product => {
      // Extract range code from product code
      if (product.code) {
        rangeCodes.add(product.code);
      }
      // Extract range name from category names
      if (product.categories && Array.isArray(product.categories)) {
        product.categories.forEach(pc => {
          if (pc.category?.name) rangeNames.add(pc.category.name);
        });
      } else if (product.categoryId) {
        const cat = categories.find(c => c.id === product.categoryId);
        if (cat?.name) rangeNames.add(cat.name);
      }
      // Extract product tags
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach(tag => tags.add(tag));
      }
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

    // Extract tags from categories (product ranges)
    categories.forEach(category => {
      if (category.tags && Array.isArray(category.tags)) {
        category.tags.forEach(tag => tags.add(tag));
      }
    });

    return {
      rangeCodes: Array.from(rangeCodes).sort(),
      rangeNames: Array.from(rangeNames).sort(),
      tags: Array.from(tags).sort(),
      ipRatings: Array.from(ipRatings).sort(),
      materials: Array.from(materials).sort(),
      mountingTypes: Array.from(mountingTypes).sort(),
      priceRange: { min: minPrice === Infinity ? 0 : minPrice, max: maxPrice }
    };
  }, [products, categories]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productAPI.getAll(),
          categoryAPI.getAll()
        ]);
        setProducts(productsData.data || []);
        setCategories(categoriesData.data || []);

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

    // Fuzzy search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim();

      // Apply fuzzy search and get scores
      const scoredResults = result.map(product => ({
        product,
        searchResult: fuzzySearchProduct(product, query, categories)
      }));

      // Filter matches and sort by score (highest first)
      result = scoredResults
        .filter(item => item.searchResult.match)
        .sort((a, b) => b.searchResult.score - a.searchResult.score)
        .map(item => item.product);
    }

    // Category filter (supports both old categoryId and new categories array)
    if (filters.categories.length > 0) {
      const categoryIds = categories
        .filter(cat => filters.categories.includes(cat.slug))
        .map(cat => cat.id);
      result = result.filter(product => {
        // Check new junction table format first
        if (product.categories && Array.isArray(product.categories)) {
          return product.categories.some(pc =>
            categoryIds.includes(pc.categoryId) || categoryIds.includes(pc.category?.id)
          );
        }
        // Fall back to old direct categoryId
        return categoryIds.includes(product.categoryId);
      });
    }

    // Specific product filter (when products are selected from category sub-list)
    if (filters.products.length > 0) {
      result = result.filter(product => filters.products.includes(product.id));
    }

    // Dimension filters (L x W x H)
    const dim = filters.dimensions;
    if (dim.minL) result = result.filter(p => p.dimensionLength && p.dimensionLength >= parseFloat(dim.minL));
    if (dim.maxL) result = result.filter(p => p.dimensionLength && p.dimensionLength <= parseFloat(dim.maxL));
    if (dim.minW) result = result.filter(p => p.dimensionWidth && p.dimensionWidth >= parseFloat(dim.minW));
    if (dim.maxW) result = result.filter(p => p.dimensionWidth && p.dimensionWidth <= parseFloat(dim.maxW));
    if (dim.minH) result = result.filter(p => p.dimensionHeight && p.dimensionHeight >= parseFloat(dim.minH));
    if (dim.maxH) result = result.filter(p => p.dimensionHeight && p.dimensionHeight <= parseFloat(dim.maxH));

    // Range Code filter
    if (filters.rangeCodes.length > 0) {
      result = result.filter(product =>
        product.code && filters.rangeCodes.includes(product.code)
      );
    }

    // Range Name filter
    if (filters.rangeNames.length > 0) {
      result = result.filter(product => {
        if (product.categories && Array.isArray(product.categories)) {
          return product.categories.some(pc =>
            pc.category?.name && filters.rangeNames.includes(pc.category.name)
          );
        }
        const cat = categories.find(c => c.id === product.categoryId);
        return cat?.name && filters.rangeNames.includes(cat.name);
      });
    }

    // Tags filter (matches if product has any of the selected tags OR belongs to a category with those tags)
    if (filters.tags.length > 0) {
      result = result.filter(product => {
        // Check product tags
        const hasProductTag = product.tags && Array.isArray(product.tags) &&
          product.tags.some(tag => filters.tags.includes(tag));
        if (hasProductTag) return true;

        // Check category tags
        if (product.categories && Array.isArray(product.categories)) {
          return product.categories.some(pc => {
            const cat = categories.find(c => c.id === pc.categoryId || c.id === pc.category?.id);
            return cat?.tags && Array.isArray(cat.tags) && cat.tags.some(tag => filters.tags.includes(tag));
          });
        }
        return false;
      });
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

    // In stock filter (check both isActive and inStock for compatibility)
    if (filters.inStockOnly) {
      result = result.filter(product => product.isActive !== false && product.inStock !== false);
    }

    // Featured filter (check both isFeatured and featured for compatibility)
    if (filters.featuredOnly) {
      result = result.filter(product => product.isFeatured || product.featured);
    }

    // Helper to get first category name for sorting
    const getFirstCategoryName = (product) => {
      // Check new junction table format first
      if (product.categories && Array.isArray(product.categories) && product.categories.length > 0) {
        return product.categories[0]?.category?.name || '';
      }
      // Fall back to old format
      return product.category?.name || categories.find(c => c.id === product.categoryId)?.name || 'ZZZ';
    };

    // Sort by category first (A-Z), then by product name within each category (A-Z)
    result.sort((a, b) => {
      const catA = getFirstCategoryName(a);
      const catB = getFirstCategoryName(b);

      // First sort by category name (A-Z)
      const categoryCompare = catA.toLowerCase().localeCompare(catB.toLowerCase());
      if (categoryCompare !== 0) return categoryCompare;

      // Then sort by product name within same category (A-Z)
      return (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase());
    });

    return result;
  }, [products, categories, searchQuery, filters]);

  // Reset visible count when filters or search change
  useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery, filters]);

  // Products to display (paginated)
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

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
      products: [],
      dimensions: { minL: '', maxL: '', minW: '', maxW: '', minH: '', maxH: '' },
      rangeCodes: [],
      rangeNames: [],
      tags: [],
      ipRatings: [],
      materials: [],
      mountingTypes: [],
      priceRange: { min: '', max: '' },
      inStockOnly: false,
      featuredOnly: false
    });
    setSearchQuery('');
    setTagSearch('');
    setSearchParams({});
    setExpandedCategories({});
    setShowMoreProducts({});
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += filters.categories.length;
    count += filters.products.length;
    if (Object.values(filters.dimensions).some(v => v !== '')) count++;
    count += filters.rangeCodes.length;
    count += filters.rangeNames.length;
    count += filters.tags.length;
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
    if (Array.isArray(value)) {
      // Extract specValue/featureValue if items are objects
      return value.map(item =>
        typeof item === 'object' ? (item.specValue || item.featureValue || item.value || item) : item
      );
    }
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

  const renderProductSVG = useCallback((id) => {
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
  }, []);

  
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
                placeholder="Search by name, code, or product range..."
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
              {/* Product Ranges with Product Sub-list */}
              <FilterSection title="Product Ranges">
                <div className="filter-options category-filter-list">
                  {(showAllCategories ? categories : categories.slice(0, 10)).map(category => {
                    const categoryProducts = getProductsForCategory(category.id);
                    const isExpanded = expandedCategories[category.slug];
                    const showAllProducts = showMoreProducts[category.slug];
                    const displayProducts = showAllProducts ? categoryProducts : categoryProducts.slice(0, 10);

                    return (
                      <div key={category.slug} className="category-filter-item">
                        <div className="category-filter-row">
                          <label className="filter-checkbox">
                            <input
                              type="checkbox"
                              checked={filters.categories.includes(category.slug)}
                              onChange={() => toggleFilter('categories', category.slug)}
                            />
                            <span className="checkmark"></span>
                            <span className="filter-label">{category.name}</span>
                            <span className="filter-count-badge">{categoryProducts.length}</span>
                          </label>
                          {categoryProducts.length > 0 && (
                            <button
                              className={`category-expand-btn ${isExpanded ? 'expanded' : ''}`}
                              onClick={() => toggleCategoryExpand(category.slug)}
                              title={isExpanded ? 'Hide products' : 'Show products'}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 9l6 6 6-6" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Product Sub-list */}
                        {isExpanded && categoryProducts.length > 0 && (
                          <div className="product-sub-list">
                            {displayProducts.map(product => (
                              <label key={product.id} className="filter-checkbox product-checkbox">
                                <input
                                  type="checkbox"
                                  checked={filters.products.includes(product.id)}
                                  onChange={() => toggleProductFilter(product.id)}
                                />
                                <span className="checkmark small"></span>
                                <span className="filter-label">{product.name}</span>
                              </label>
                            ))}
                            {categoryProducts.length > 10 && (
                              <button
                                className="show-more-btn small"
                                onClick={() => toggleShowMoreProducts(category.slug)}
                              >
                                {showAllProducts ? (
                                  <>Show Less</>
                                ) : (
                                  <>Show More ({categoryProducts.length - 10})</>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {categories.length > 10 && (
                  <button
                    className="show-more-btn"
                    onClick={() => setShowAllCategories(!showAllCategories)}
                  >
                    {showAllCategories ? (
                      <>
                        Show Less
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 15l-6-6-6 6" />
                        </svg>
                      </>
                    ) : (
                      <>
                        Show More ({categories.length - 10})
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </FilterSection>

              {/* Size (L x W x H) */}
              <FilterSection title="Size (mm)" defaultOpen={false}>
                <div className="dimension-filter-group">
                  <div className="dimension-row">
                    <span className="dimension-label">Length</span>
                    <div className="dimension-inputs">
                      <input
                        type="number"
                        placeholder="Min"
                        min="0"
                        value={filters.dimensions.minL}
                        onChange={(e) => { if (e.target.value === '' || Number(e.target.value) >= 0) setFilters(prev => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, minL: e.target.value }
                        })); }}
                      />
                      <span className="dimension-separator">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        min="0"
                        value={filters.dimensions.maxL}
                        onChange={(e) => { if (e.target.value === '' || Number(e.target.value) >= 0) setFilters(prev => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, maxL: e.target.value }
                        })); }}
                      />
                    </div>
                  </div>
                  <div className="dimension-row">
                    <span className="dimension-label">Width</span>
                    <div className="dimension-inputs">
                      <input
                        type="number"
                        placeholder="Min"
                        min="0"
                        value={filters.dimensions.minW}
                        onChange={(e) => { if (e.target.value === '' || Number(e.target.value) >= 0) setFilters(prev => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, minW: e.target.value }
                        })); }}
                      />
                      <span className="dimension-separator">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        min="0"
                        value={filters.dimensions.maxW}
                        onChange={(e) => { if (e.target.value === '' || Number(e.target.value) >= 0) setFilters(prev => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, maxW: e.target.value }
                        })); }}
                      />
                    </div>
                  </div>
                  <div className="dimension-row">
                    <span className="dimension-label">Height</span>
                    <div className="dimension-inputs">
                      <input
                        type="number"
                        placeholder="Min"
                        min="0"
                        value={filters.dimensions.minH}
                        onChange={(e) => { if (e.target.value === '' || Number(e.target.value) >= 0) setFilters(prev => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, minH: e.target.value }
                        })); }}
                      />
                      <span className="dimension-separator">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        min="0"
                        value={filters.dimensions.maxH}
                        onChange={(e) => { if (e.target.value === '' || Number(e.target.value) >= 0) setFilters(prev => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, maxH: e.target.value }
                        })); }}
                      />
                    </div>
                  </div>
                </div>
              </FilterSection>

              {/* Range Code */}
              {filterOptions.rangeCodes.length > 0 && (
                <FilterSection title="Range Code" defaultOpen={false}>
                  <div className="filter-options">
                    {filterOptions.rangeCodes.map(code => (
                      <label key={code} className="filter-checkbox">
                        <input
                          type="checkbox"
                          checked={filters.rangeCodes.includes(code)}
                          onChange={() => toggleFilter('rangeCodes', code)}
                        />
                        <span className="checkmark"></span>
                        <span className="filter-label">{code}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>
              )}

              {/* Range Name */}
              {filterOptions.rangeNames.length > 0 && (
                <FilterSection title="Range Name" defaultOpen={false}>
                  <div className="filter-options">
                    {filterOptions.rangeNames.map(name => (
                      <label key={name} className="filter-checkbox">
                        <input
                          type="checkbox"
                          checked={filters.rangeNames.includes(name)}
                          onChange={() => toggleFilter('rangeNames', name)}
                        />
                        <span className="checkmark"></span>
                        <span className="filter-label">{name}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>
              )}

              {/* Tags */}
              {filterOptions.tags.length > 0 && (
                <FilterSection title="Tags" defaultOpen={false}>
                  <div className="filter-search-box">
                    <input
                      type="text"
                      placeholder="Search tags..."
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      className="filter-search-input"
                    />
                    {tagSearch && (
                      <button
                        className="filter-search-clear"
                        onClick={() => setTagSearch('')}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="filter-options filter-options-scrollable">
                    {filterOptions.tags
                      .filter(tag => tag.toLowerCase().includes(tagSearch.toLowerCase()))
                      .map(tag => (
                        <label key={tag} className="filter-checkbox">
                          <input
                            type="checkbox"
                            checked={filters.tags.includes(tag)}
                            onChange={() => toggleFilter('tags', tag)}
                          />
                          <span className="checkmark"></span>
                          <span className="filter-label">{tag}</span>
                        </label>
                      ))}
                    {filterOptions.tags.filter(tag => tag.toLowerCase().includes(tagSearch.toLowerCase())).length === 0 && (
                      <p className="filter-no-results">No tags found</p>
                    )}
                  </div>
                </FilterSection>
              )}

              {/* IP Rating */}
              {filterOptions.ipRatings.length > 0 && (
                <FilterSection title="IP Rating" defaultOpen={false}>
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
                <FilterSection title="Material" defaultOpen={false}>
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
                <FilterSection title="Mounting Type" defaultOpen={false}>
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
              <FilterSection title="Price Range" defaultOpen={false}>
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
              <FilterSection title="Availability" defaultOpen={false}>
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
                  {Object.values(filters.dimensions).some(v => v !== '') && (
                    <span className="filter-tag">
                      Size
                      <button onClick={() => setFilters(prev => ({
                        ...prev,
                        dimensions: { minL: '', maxL: '', minW: '', maxW: '', minH: '', maxH: '' }
                      }))}>×</button>
                    </span>
                  )}
                  {filters.rangeCodes.map(code => (
                    <span key={code} className="filter-tag">
                      Code: {code}
                      <button onClick={() => toggleFilter('rangeCodes', code)}>×</button>
                    </span>
                  ))}
                  {filters.rangeNames.map(name => (
                    <span key={name} className="filter-tag">
                      Range: {name}
                      <button onClick={() => toggleFilter('rangeNames', name)}>×</button>
                    </span>
                  ))}
                  {filters.tags.map(tag => (
                    <span key={tag} className="filter-tag">
                      {tag}
                      <button onClick={() => toggleFilter('tags', tag)}>×</button>
                    </span>
                  ))}
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
              <div ref={productsGridRef} className={`products-grid-container ${viewMode}`}>
                {viewMode === 'grid' ? (
                  visibleProducts.map((product) => {
                    // Get category name(s) - support both old and new format
                    let categoryName = '';
                    if (product.categories && Array.isArray(product.categories) && product.categories.length > 0) {
                      categoryName = product.categories.map(pc => pc.category?.name).filter(Boolean).join(', ');
                    } else {
                      categoryName = product.category?.name || categories.find(c => c.id === product.categoryId)?.name || '';
                    }
                    return (
                      <ProductGridCard
                        key={product.id}
                        product={product}
                        categoryName={categoryName}
                        renderProductSVG={renderProductSVG}
                        BACKEND_URL={BACKEND_URL}
                      />
                    );
                  })
                ) : (
                  visibleProducts.map((product) => {
                    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                    const imageUrl = primaryImage?.imageUrl || product.image;
                    // Get category name(s) - support both old and new format
                    let categoryName = '';
                    if (product.categories && Array.isArray(product.categories) && product.categories.length > 0) {
                      categoryName = product.categories.map(pc => pc.category?.name).filter(Boolean).join(', ');
                    } else {
                      categoryName = product.category?.name || categories.find(c => c.id === product.categoryId)?.name || '';
                    }

                    // Extract feature text from feature objects
                    const features = (product.features || []).map(f =>
                      typeof f === 'object' ? (f.featureText || f.text || f.value || '') : f
                    ).filter(Boolean);

                    // Extract spec values from spec objects
                    const specs = (product.specs || []).map(s =>
                      typeof s === 'object' ? (s.specValue || s.value || `${s.specName}: ${s.specValue}` || '') : s
                    ).filter(Boolean);

                    return (
                      <Link
                        to={`/products/${product.slug || product.id}`}
                        key={product.id}
                        className="product-list-card"
                      >
                        <div className="product-list-image">
                          {imageUrl ? (
                            <img src={imageUrl.startsWith('http') ? imageUrl : `${BACKEND_URL}${imageUrl}`} alt={product.name} loading="lazy" />
                          ) : (
                            renderProductSVG(product.id % 6 + 1)
                          )}
                          {(product.isFeatured || product.featured) && <span className="product-featured-badge">Featured</span>}
                        </div>
                        <div className="product-list-content">
                          <div className="product-list-header">
                            <span className="product-list-category">{categoryName}</span>
                            {product.code && <code className="product-list-code">{product.code}</code>}
                          </div>
                          <h2 className="product-list-name">{product.name}</h2>
                          <p className="product-list-desc">{product.description || product.desc}</p>
                          {specs.length > 0 && (
                            <div className="product-list-specs">
                              {specs.slice(0, 4).map((spec, index) => (
                                <span key={index} className="product-spec-tag">{spec}</span>
                              ))}
                            </div>
                          )}
                          {features.length > 0 && (
                            <div className="product-list-features">
                              <ul>
                                {features.slice(0, 3).map((feature, index) => (
                                  <li key={index}>{feature}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="product-list-actions">
                          {product.price ? (
                            <span className="product-list-price">₹{product.price.toLocaleString()}</span>
                          ) : (
                            <span className="product-list-quote">Request Quote</span>
                          )}
                          <span className="view-details-btn">
                            View Details
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
              {filteredProducts.length > visibleCount && (
                <div className="load-more-bar">
                  <button className="load-more-btn" onClick={() => setVisibleCount(prev => prev + 10)}>
                    Show More ({filteredProducts.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Products;
