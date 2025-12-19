import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts';

const ProductsList = () => {
  const { products, categories, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoryId === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  return (
    <div className="admin-products-list">
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
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <Link to="/admin/products/new" className="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Products Table */}
      <div className="products-table-container">
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
            {filteredProducts.map(product => (
              <tr key={product.id}>
                <td>
                  <div className="product-info">
                    <div className="product-thumb"></div>
                    <div>
                      <span className="product-name">{product.name}</span>
                      <span className="product-desc">{product.description.substring(0, 50)}...</span>
                    </div>
                  </div>
                </td>
                <td><code>{product.code}</code></td>
                <td>{categories.find(c => c.id === product.categoryId)?.name || '-'}</td>
                <td>{product.price ? `₹${product.price.toLocaleString()}` : 'Quote'}</td>
                <td>
                  <span className={`status-badge ${product.inStock ? 'in-stock' : 'out-stock'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
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
                    <Link to={`/admin/products/edit/${product.id}`} className="action-btn edit" title="Edit">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Link>
                    <button onClick={() => handleDelete(product.id)} className="action-btn delete" title="Delete">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="no-results">
            <p>No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsList;
