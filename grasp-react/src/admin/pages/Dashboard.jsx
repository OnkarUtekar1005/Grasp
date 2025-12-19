import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts';

const Dashboard = () => {
  const { products, categories } = useProducts();

  const stats = [
    { label: 'Total Products', value: products.length, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: '#7D1128' },
    { label: 'Categories', value: categories.length, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: '#2563EB' },
    { label: 'Featured', value: products.filter(p => p.featured).length, icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', color: '#F59E0B' },
    { label: 'In Stock', value: products.filter(p => p.inStock).length, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: '#10B981' },
  ];

  const recentProducts = products.slice(0, 5);

  return (
    <div className="admin-dashboard">
      {/* Stats Grid */}
      <div className="dashboard-stats">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={stat.icon} />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <Link to="/admin/products/new" className="quick-action-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4v16m8-8H4" />
            </svg>
            Add New Product
          </Link>
          <Link to="/admin/categories/new" className="quick-action-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </Link>
          <Link to="/admin/inquiries" className="quick-action-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            View Inquiries
          </Link>
        </div>
      </div>

      {/* Recent Products */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Products</h2>
          <Link to="/admin/products" className="view-all">View All →</Link>
        </div>
        <div className="recent-products-table">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Code</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map(product => (
                <tr key={product.id}>
                  <td className="product-cell">
                    <span className="product-name">{product.name}</span>
                  </td>
                  <td><code>{product.code}</code></td>
                  <td>{categories.find(c => c.id === product.categoryId)?.name || '-'}</td>
                  <td>
                    <span className={`status-badge ${product.inStock ? 'in-stock' : 'out-stock'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td>
                    <Link to={`/admin/products/edit/${product.id}`} className="action-btn">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
