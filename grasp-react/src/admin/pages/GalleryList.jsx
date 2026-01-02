import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { galleryAPI, BACKEND_URL } from '../../services';

const GalleryList = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, image: null });

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      const response = await galleryAPI.adminGetAll();
      setImages(response.data || []);
    } catch (error) {
      console.error('Failed to fetch gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter(image =>
    image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (image) => {
    setDeleteModal({ show: true, image });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.image) return;
    try {
      await galleryAPI.delete(deleteModal.image.id);
      setImages(images.filter(img => img.id !== deleteModal.image.id));
      setDeleteModal({ show: false, image: null });
    } catch (error) {
      console.error('Failed to delete gallery image:', error);
      alert('Failed to delete gallery image. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, image: null });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading gallery images...</p>
      </div>
    );
  }

  return (
    <div className="admin-gallery-list">
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
              placeholder="Search gallery images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Link to="/admin/gallery/new" className="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4v16m8-8H4" />
          </svg>
          Add Image
        </Link>
      </div>

      {/* Gallery Grid */}
      <div className="gallery-grid-admin">
        {filteredImages.map(image => (
          <div key={image.id} className={`gallery-card-admin ${!image.isActive ? 'inactive' : ''}`}>
            <div className="gallery-card-image">
              <img
                src={image.imageUrl.startsWith('http') ? image.imageUrl : `${BACKEND_URL}${image.imageUrl}`}
                alt={image.altText || image.title}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="gallery-card-badges">
                {image.isFeatured && (
                  <span className="featured-badge">Featured</span>
                )}
                {!image.isActive && (
                  <span className="inactive-badge">Inactive</span>
                )}
              </div>
            </div>
            <div className="gallery-card-content">
              <h3>{image.title}</h3>
              {image.description && (
                <p className="gallery-description">{image.description}</p>
              )}
              <div className="gallery-meta">
                <span className="product-count">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  {image.products?.length || 0} Products
                </span>
                <span className="sort-order">
                  Order: {image.sortOrder}
                </span>
              </div>
            </div>
            <div className="gallery-card-actions">
              <Link to={`/admin/gallery/edit/${image.id}`} className="action-btn edit" title="Edit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </Link>
              <button onClick={() => handleDeleteClick(image)} className="action-btn delete" title="Delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="no-results">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <p>No gallery images found.</p>
          <Link to="/admin/gallery/new" className="btn-secondary">Add Your First Image</Link>
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
            <h3>Delete Gallery Image</h3>
            <p className="delete-modal-category">"{deleteModal.image?.title}"</p>
            {deleteModal.image?.products?.length > 0 && (
              <div className="delete-modal-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4m0 4h.01" />
                </svg>
                <span>
                  This image has <strong>{deleteModal.image?.products?.length} product(s)</strong> linked to it.
                  These links will be removed.
                </span>
              </div>
            )}
            <p className="delete-modal-text">
              This action cannot be undone. The image will be permanently deleted.
            </p>
            <div className="delete-modal-actions">
              <button className="btn-secondary" onClick={handleDeleteCancel}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeleteConfirm}>
                Delete Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryList;
