import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { galleryAPI, productAPI, BACKEND_URL } from '../../services';

const GalleryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    altText: '',
    isFeatured: false,
    isActive: true,
    sortOrder: 0,
    productIds: [],
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Product search
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const productDropdownRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    if (isEditing) {
      fetchGalleryImage();
    }
  }, [id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(e.target)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll({ limit: 1000 });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchGalleryImage = async () => {
    try {
      setLoading(true);
      const response = await galleryAPI.getById(id);
      const image = response.data;
      setFormData({
        title: image.title || '',
        description: image.description || '',
        altText: image.altText || '',
        isFeatured: image.isFeatured || false,
        isActive: image.isActive !== false,
        sortOrder: image.sortOrder || 0,
        productIds: image.products?.map(p => p.productId) || [],
      });
      if (image.imageUrl) {
        setImagePreview(image.imageUrl.startsWith('http') ? image.imageUrl : `${BACKEND_URL}${image.imageUrl}`);
      }
    } catch (error) {
      console.error('Failed to fetch gallery image:', error);
      navigate('/admin/gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: null }));
      }
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  const removeProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      productIds: prev.productIds.filter(id => id !== productId),
    }));
  };

  const getSelectedProducts = () => {
    return products.filter(p => formData.productIds.includes(p.id));
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.code?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!isEditing && !imageFile && !imagePreview) {
      newErrors.image = 'Image is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description || '');
      submitData.append('altText', formData.altText || '');
      submitData.append('isFeatured', formData.isFeatured);
      submitData.append('isActive', formData.isActive);
      submitData.append('sortOrder', formData.sortOrder);
      submitData.append('productIds', JSON.stringify(formData.productIds));

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      if (isEditing) {
        await galleryAPI.update(id, submitData);
      } else {
        await galleryAPI.create(submitData);
      }

      navigate('/admin/gallery');
    } catch (error) {
      console.error('Failed to save gallery image:', error);
      setErrors({ submit: error.message || 'Failed to save gallery image' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-form-page gallery-form-page">
      <div className="form-header">
        <button onClick={() => navigate('/admin/gallery')} className="back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Gallery
        </button>
        <h1>{isEditing ? 'Edit Gallery Image' : 'Add Gallery Image'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="admin-form gallery-form">
        {errors.submit && (
          <div className="form-error-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
            {errors.submit}
          </div>
        )}

        <div className="gallery-form-layout">
          {/* Left Side - Image & Preview */}
          <div className="gallery-form-left">
            {/* Image Upload Card */}
            <div className="gallery-form-card">
              <div className="card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <h3>Gallery Image</h3>
              </div>
              <div className="card-body">
                <div className={`gallery-thumbnail-upload ${errors.image ? 'error' : ''}`}>
                  {imagePreview ? (
                    <div className="gallery-thumbnail-preview">
                      <img src={imagePreview} alt="Preview" />
                      <div className="thumbnail-overlay">
                        <button type="button" className="thumbnail-action change" onClick={() => fileInputRef.current?.click()}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button type="button" className="thumbnail-action remove" onClick={handleRemoveImage}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="gallery-thumbnail-empty" onClick={() => fileInputRef.current?.click()}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 4v16m8-8H4" />
                      </svg>
                      <p>Upload Image</p>
                      <span>JPEG, PNG, WebP</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>
                {errors.image && <span className="field-error">{errors.image}</span>}
                <p className="thumbnail-hint">This is how the image will appear in the gallery grid</p>
              </div>
            </div>

            {/* Status Card */}
            <div className="gallery-form-card">
              <div className="card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <h3>Status</h3>
              </div>
              <div className="card-body">
                <div className="status-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    <div className="checkbox-text">
                      <span className="checkbox-title">Active</span>
                      <span className="checkbox-desc">Visible on the public gallery</span>
                    </div>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    <div className="checkbox-text">
                      <span className="checkbox-title">Featured</span>
                      <span className="checkbox-desc">Show in featured section</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Details & Products */}
          <div className="gallery-form-right">
            {/* Details Card */}
            <div className="gallery-form-card">
              <div className="card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
                <h3>Details</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={errors.title ? 'error' : ''}
                    placeholder="Enter image title"
                  />
                  {errors.title && <span className="field-error">{errors.title}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter image description"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="altText">Alt Text</label>
                    <input
                      type="text"
                      id="altText"
                      name="altText"
                      value={formData.altText}
                      onChange={handleInputChange}
                      placeholder="For accessibility"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sortOrder">Sort Order</label>
                    <input
                      type="number"
                      id="sortOrder"
                      name="sortOrder"
                      value={formData.sortOrder}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Linked Products Card */}
            <div className="gallery-form-card">
              <div className="card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3>Linked Products</h3>
                <span className="card-badge">{formData.productIds.length}</span>
              </div>
              <div className="card-body">
                <p className="card-hint">Link products visible in this image. Users can click to view these products.</p>

                {/* Product Search */}
                <div className="product-link-search" ref={productDropdownRef}>
                  <div className="search-input-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      onFocus={() => setShowProductDropdown(true)}
                    />
                  </div>
                  {showProductDropdown && (
                    <div className="product-link-dropdown">
                      {filteredProducts.length === 0 ? (
                        <div className="dropdown-empty">No products found</div>
                      ) : (
                        filteredProducts.slice(0, 8).map(product => (
                          <div
                            key={product.id}
                            className={`product-link-item ${formData.productIds.includes(product.id) ? 'selected' : ''}`}
                            onClick={() => toggleProduct(product.id)}
                          >
                            <div className="product-link-checkbox">
                              <input
                                type="checkbox"
                                checked={formData.productIds.includes(product.id)}
                                onChange={() => {}}
                              />
                              <span className="checkmark"></span>
                            </div>
                            <div className="product-link-thumb">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0].imageUrl.startsWith('http')
                                    ? product.images[0].imageUrl
                                    : `${BACKEND_URL}${product.images[0].imageUrl}`}
                                  alt={product.name}
                                />
                              ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <rect x="3" y="3" width="18" height="18" rx="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <path d="M21 15l-5-5L5 21" />
                                </svg>
                              )}
                            </div>
                            <div className="product-link-details">
                              <span className="product-link-name">{product.name}</span>
                              {product.code && <span className="product-link-code">{product.code}</span>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Products List */}
                {formData.productIds.length > 0 && (
                  <div className="linked-products-grid">
                    {getSelectedProducts().map(product => (
                      <div key={product.id} className="linked-product-item">
                        <div className="linked-product-thumb">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0].imageUrl.startsWith('http')
                                ? product.images[0].imageUrl
                                : `${BACKEND_URL}${product.images[0].imageUrl}`}
                              alt={product.name}
                            />
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                            </svg>
                          )}
                        </div>
                        <span className="linked-product-name">{product.name}</span>
                        <button type="button" className="linked-product-remove" onClick={() => removeProduct(product.id)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/gallery')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? (
              <>
                <div className="btn-spinner"></div>
                Saving...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                {isEditing ? 'Update Image' : 'Add Image'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GalleryForm;
