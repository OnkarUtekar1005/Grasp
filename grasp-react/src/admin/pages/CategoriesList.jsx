import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts';
import { BACKEND_URL } from '../../services';

const CategoriesList = () => {
  const { categories, products, deleteCategory } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get product count for each category
  const getProductCount = (categoryId) => {
    return products.filter(p => p.categoryId === categoryId).length;
  };

  const [deleteModal, setDeleteModal] = useState({ show: false, category: null });

  const handleDeleteClick = (category) => {
    setDeleteModal({ show: true, category });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.category) return;
    try {
      await deleteCategory(deleteModal.category.id);
      setDeleteModal({ show: false, category: null });
    } catch (error) {
      alert('Failed to delete product range. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, category: null });
  };

  return (
    <div className="admin-categories-list">
      {/* Header */}
      <div className="list-header">
        <div className="list-filters">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search product ranges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Link to="/admin/categories/new" className="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4v16m8-8H4" />
          </svg>
          Add Product Range
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="categories-grid-admin">
        {filteredCategories.map(category => (
          <div key={category.id} className="category-card-admin">
            <div className="category-card-image">
              {category.imageUrl && (
                <img
                  src={category.imageUrl.startsWith('http') ? category.imageUrl : `${BACKEND_URL}${category.imageUrl}`}
                  alt={category.name}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="category-placeholder" style={{ display: category.imageUrl ? 'none' : 'flex' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              {category.isFeatured && (
                <span className="featured-badge">Featured</span>
              )}
            </div>
            <div className="category-card-content">
              <div className="category-card-header">
                <h3>{category.name}</h3>
                <span className="category-code">{category.code}</span>
              </div>
              <p className="category-description">{category.description}</p>
              <div className="category-meta">
                <span className="product-count">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  {getProductCount(category.id)} Products
                </span>
                <div className="category-specs">
                  {category.specs?.slice(0, 2).map((spec, index) => (
                    <span key={spec.id || index} className="spec-tag">{spec.specValue || spec}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="category-card-actions">
              <Link to={`/products?category=${category.slug}`} className="action-btn view" title="View Public Page">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </Link>
              <Link to={`/admin/categories/edit/${category.slug}`} className="action-btn edit" title="Edit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </Link>
              <button onClick={() => handleDeleteClick(category)} className="action-btn delete" title="Delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="no-results">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <p>No product ranges found matching your search.</p>
          <Link to="/admin/categories/new" className="btn-secondary">Create Your First Product Range</Link>
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
            <h3>Delete Product Range</h3>
            <p className="delete-modal-category">"{deleteModal.category?.name}"</p>
            {getProductCount(deleteModal.category?.id) > 0 && (
              <div className="delete-modal-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4m0 4h.01" />
                </svg>
                <span>
                  This product range has <strong>{getProductCount(deleteModal.category?.id)} product(s)</strong> linked to it.
                  These products will be unlinked and you'll need to reassign them manually.
                </span>
              </div>
            )}
            <p className="delete-modal-text">
              This action cannot be undone. The product range and its image will be permanently deleted.
            </p>
            <div className="delete-modal-actions">
              <button className="btn-secondary" onClick={handleDeleteCancel}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeleteConfirm}>
                Delete Product Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesList;
