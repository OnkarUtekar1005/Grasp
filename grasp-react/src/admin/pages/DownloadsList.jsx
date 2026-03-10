import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { downloadAPI, BACKEND_URL } from '../../services';

const DownloadsList = () => {
  const [downloads, setDownloads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, item: null, type: null });

  // Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: 'catalog', sortOrder: 0, isActive: true });
  const [categorySaving, setCategorySaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [downloadsRes, categoriesRes] = await Promise.all([
        downloadAPI.adminGetAll(),
        downloadAPI.adminGetCategories(),
      ]);
      setDownloads(downloadsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDownloads = downloads.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===== Category Handlers =====

  const openCategoryForm = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        icon: category.icon || 'catalog',
        sortOrder: category.sortOrder || 0,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', icon: 'catalog', sortOrder: 0, isActive: true });
    }
    setShowCategoryForm(true);
  };

  const handleCategorySave = async () => {
    if (!categoryForm.name.trim()) return;
    try {
      setCategorySaving(true);
      if (editingCategory) {
        await downloadAPI.updateCategory(editingCategory.id, categoryForm);
      } else {
        await downloadAPI.createCategory(categoryForm);
      }
      setShowCategoryForm(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category. Please try again.');
    } finally {
      setCategorySaving(false);
    }
  };

  // ===== Delete Handlers =====

  const handleDeleteClick = (item, type) => {
    setDeleteModal({ show: true, item, type });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.item) return;
    try {
      if (deleteModal.type === 'category') {
        await downloadAPI.deleteCategory(deleteModal.item.id);
      } else {
        await downloadAPI.delete(deleteModal.item.id);
      }
      setDeleteModal({ show: false, item: null, type: null });
      fetchData();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, item: null, type: null });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading downloads...</p>
      </div>
    );
  }

  return (
    <div className="admin-downloads-list">
      {/* Categories Section */}
      <div className="downloads-section-admin">
        <div className="section-header">
          <h2>Download Categories</h2>
          <button className="btn-primary btn-sm" onClick={() => openCategoryForm()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </button>
        </div>

        <div className="categories-grid-admin">
          {categories.map(cat => (
            <div key={cat.id} className={`category-card-admin ${!cat.isActive ? 'inactive' : ''}`}>
              <div className="category-card-info">
                <h4>{cat.name}</h4>
                {cat.description && <p>{cat.description}</p>}
                <div className="category-card-meta">
                  <span className="meta-badge">{cat.icon}</span>
                  <span className="meta-count">{cat._count?.downloads || 0} files</span>
                  {!cat.isActive && <span className="inactive-badge">Inactive</span>}
                </div>
              </div>
              <div className="category-card-actions">
                <button onClick={() => openCategoryForm(cat)} className="action-btn edit" title="Edit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button onClick={() => handleDeleteClick(cat, 'category')} className="action-btn delete" title="Delete">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="no-items-text">No categories yet. Create one to get started.</p>
          )}
        </div>
      </div>

      {/* Downloads Section */}
      <div className="downloads-section-admin">
        <div className="list-header">
          <div className="list-filters">
            <div className="search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search downloads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Link to="/admin/downloads/new" className="btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4v16m8-8H4" />
            </svg>
            Add Download
          </Link>
        </div>

        {/* Downloads Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>File Size</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDownloads.map(download => (
                <tr key={download.id} className={!download.isActive ? 'inactive-row' : ''}>
                  <td>
                    <div className="download-name-cell">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="pdf-icon">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <div>
                        <strong>{download.name}</strong>
                        {download.description && <p className="cell-desc">{download.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td><span className="meta-badge">{download.category?.name || '—'}</span></td>
                  <td>{formatFileSize(download.fileSizeBytes)}</td>
                  <td>{download.sortOrder}</td>
                  <td>
                    <span className={`status-badge ${download.isActive ? 'active' : 'inactive'}`}>
                      {download.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <a
                        href={download.documentUrl.startsWith('http') ? download.documentUrl : `${BACKEND_URL}${download.documentUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn view"
                        title="View PDF"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </a>
                      <Link to={`/admin/downloads/edit/${download.id}`} className="action-btn edit" title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Link>
                      <button onClick={() => handleDeleteClick(download, 'download')} className="action-btn delete" title="Delete">
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
        </div>

        {filteredDownloads.length === 0 && (
          <div className="no-results">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p>No downloads found.</p>
            <Link to="/admin/downloads/new" className="btn-secondary">Add Your First Download</Link>
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="delete-modal-overlay" onClick={() => setShowCategoryForm(false)}>
          <div className="delete-modal category-form-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingCategory ? 'Edit Category' : 'New Category'}</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Product Catalogs"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Icon</label>
                  <select
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                  >
                    <option value="catalog">Catalog</option>
                    <option value="datasheet">Datasheet</option>
                    <option value="certificate">Certificate</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Sort Order</label>
                  <input
                    type="number"
                    value={categoryForm.sortOrder}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
              </div>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={categoryForm.isActive}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <span className="checkmark"></span>
                <span>Active</span>
              </label>
            </div>
            <div className="delete-modal-actions">
              <button className="btn-secondary" onClick={() => setShowCategoryForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCategorySave} disabled={categorySaving || !categoryForm.name.trim()}>
                {categorySaving ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
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
            <h3>Delete {deleteModal.type === 'category' ? 'Category' : 'Download'}</h3>
            <p className="delete-modal-category">"{deleteModal.item?.name}"</p>
            {deleteModal.type === 'category' && deleteModal.item?._count?.downloads > 0 && (
              <div className="delete-modal-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4m0 4h.01" />
                </svg>
                <span>
                  This category has <strong>{deleteModal.item._count.downloads} download(s)</strong> that will also be deleted.
                </span>
              </div>
            )}
            <p className="delete-modal-text">
              This action cannot be undone.
            </p>
            <div className="delete-modal-actions">
              <button className="btn-secondary" onClick={handleDeleteCancel}>Cancel</button>
              <button className="btn-danger" onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadsList;
