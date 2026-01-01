import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts';
import { BACKEND_URL } from '../../services/api';

const ProductsList = () => {
  const { products, categories, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, product: null });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' ||
                            product.categoryId === selectedCategory ||
                            product.category?.id === selectedCategory;
    const matchesStock = stockFilter === 'all' ||
                         (stockFilter === 'in-stock' && product.isActive) ||
                         (stockFilter === 'out-of-stock' && !product.isActive);
    const matchesPrice = priceFilter === 'all' ||
                         (priceFilter === 'fixed' && product.price) ||
                         (priceFilter === 'quote' && !product.price);
    const matchesFeatured = featuredFilter === 'all' ||
                            (featuredFilter === 'featured' && product.isFeatured) ||
                            (featuredFilter === 'not-featured' && !product.isFeatured);
    return matchesSearch && matchesCategory && matchesStock && matchesPrice && matchesFeatured;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setStockFilter('all');
    setPriceFilter('all');
    setFeaturedFilter('all');
  };

  const hasActiveFilters = selectedCategory !== 'all' || stockFilter !== 'all' ||
                           priceFilter !== 'all' || featuredFilter !== 'all' || searchTerm;

  const handleDeleteClick = (product) => {
    setDeleteModal({ show: true, product });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.product) return;
    try {
      await deleteProduct(deleteModal.product.id);
      setDeleteModal({ show: false, product: null });
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, product: null });
  };

  return (
    <div className="admin-products-list">
      {/* Header */}
      <div className="list-header">
        <div className="list-header-top">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="list-header-actions">
            <button
              className={`btn-filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
              Filters
              {hasActiveFilters && <span className="filter-badge" />}
            </button>
            <Link to="/admin/products/new" className="btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="list-filters-expanded">
            <div className="filter-group">
              <label>Category</label>
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
            <div className="filter-group">
              <label>Stock Status</label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Price Type</label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="fixed">Fixed Price</option>
                <option value="quote">Request Quote</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Featured</label>
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="featured">Featured</option>
                <option value="not-featured">Not Featured</option>
              </select>
            </div>
            {hasActiveFilters && (
              <button className="btn-clear-filters" onClick={clearFilters}>
                Clear All
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        <div className="list-results-info">
          Showing {filteredProducts.length} of {products.length} products
          {hasActiveFilters && <span className="filtered-indicator">(filtered)</span>}
        </div>
      </div>

      {/* Products Table (Desktop) */}
      <div className="products-table-container desktop-only">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Code</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => {
              const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
              const categoryName = product.category?.name || categories.find(c => c.id === product.categoryId)?.name || '-';
              return (
                <tr key={product.id}>
                  <td>
                    <div className="product-info">
                      <div className="product-thumb">
                        {primaryImage && (
                          <img src={`${BACKEND_URL}${primaryImage.imageUrl}`} alt={product.name} />
                        )}
                      </div>
                      <div>
                        <span className="product-name">
                          {product.name}
                          {product.isFeatured && <span className="featured-star" title="Featured">★</span>}
                        </span>
                        <span className="product-desc">{product.description?.substring(0, 50)}...</span>
                      </div>
                    </div>
                  </td>
                  <td><code>{product.code || '-'}</code></td>
                  <td>{categoryName}</td>
                  <td>{product.price ? `₹${product.price.toLocaleString()}` : 'Quote'}</td>
                  <td>
                    <span className={`status-badge ${product.isActive ? 'in-stock' : 'out-stock'}`}>
                      {product.isActive ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/products/${product.slug}`} className="action-btn view" title="View">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </Link>
                      <Link to={`/admin/products/edit/${product.slug}`} className="action-btn edit" title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Link>
                      <button onClick={() => handleDeleteClick(product)} className="action-btn delete" title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Products Cards (Mobile) */}
      <div className="products-cards-container mobile-only">
        {filteredProducts.map(product => {
          const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
          const categoryName = product.category?.name || categories.find(c => c.id === product.categoryId)?.name || '-';
          return (
            <div key={product.id} className="product-card-admin">
              <div className="product-card-image">
                {primaryImage ? (
                  <img src={`${BACKEND_URL}${primaryImage.imageUrl}`} alt={product.name} />
                ) : (
                  <div className="product-card-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
                {product.isFeatured && <span className="featured-badge">Featured</span>}
              </div>
              <div className="product-card-content">
                <div className="product-card-header">
                  <h3>{product.name}</h3>
                  {product.code && <code>{product.code}</code>}
                </div>
                <div className="product-card-meta">
                  <span className="category-tag">{categoryName}</span>
                  <span className={`status-badge ${product.isActive ? 'in-stock' : 'out-stock'}`}>
                    {product.isActive ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div className="product-card-price">
                  {product.price ? `₹${product.price.toLocaleString()}` : 'Request Quote'}
                </div>
                <div className="product-card-actions">
                  <Link to={`/products/${product.slug}`} className="action-btn view">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    View
                  </Link>
                  <Link to={`/admin/products/edit/${product.slug}`} className="action-btn edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </Link>
                  <button onClick={() => handleDeleteClick(product)} className="action-btn delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-results">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p>No products found matching your criteria.</p>
          {hasActiveFilters && (
            <button className="btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="delete-modal-overlay" onClick={handleDeleteCancel}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3>Delete Product</h3>
            <p className="delete-modal-category">"{deleteModal.product?.name}"</p>
            {deleteModal.product?.images?.length > 0 && (
              <div className="delete-modal-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4m0 4h.01" />
                </svg>
                <span>
                  This product has <strong>{deleteModal.product?.images?.length} image(s)</strong> that will also be deleted.
                </span>
              </div>
            )}
            <p className="delete-modal-text">
              This action cannot be undone. The product and all its associated data (images, variants, documents) will be permanently deleted.
            </p>
            <div className="delete-modal-actions">
              <button className="btn-secondary" onClick={handleDeleteCancel}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeleteConfirm}>
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsList;
