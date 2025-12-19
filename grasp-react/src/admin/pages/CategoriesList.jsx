import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts';

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

  const handleDelete = (id) => {
    const productCount = getProductCount(id);
    if (productCount > 0) {
      alert(`Cannot delete category. It has ${productCount} product(s) associated with it.`);
      return;
    }
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id);
    }
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
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Link to="/admin/categories/new" className="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="categories-grid-admin">
        {filteredCategories.map(category => (
          <div key={category.id} className="category-card-admin">
            <div className="category-card-image">
              {category.image ? (
                <img src={category.image} alt={category.name} />
              ) : (
                <div className="category-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              )}
              {category.featured && (
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
                    <span key={index} className="spec-tag">{spec}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="category-card-actions">
              <Link to={`/products/category/${category.slug}`} className="action-btn view" title="View Public Page">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </Link>
              <Link to={`/admin/categories/edit/${category.id}`} className="action-btn edit" title="Edit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </Link>
              <button onClick={() => handleDelete(category.id)} className="action-btn delete" title="Delete">
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
          <p>No categories found matching your search.</p>
          <Link to="/admin/categories/new" className="btn-secondary">Create Your First Category</Link>
        </div>
      )}
    </div>
  );
};

export default CategoriesList;
