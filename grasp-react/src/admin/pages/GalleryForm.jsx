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
    isFeatured: false,
    isActive: true,
    sortOrder: 0,
    productIds: [],
  });

  // images: array of { id?, imageUrl?, altText, file?, previewUrl, isNew }
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const productDropdownRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    if (isEditing) {
      fetchGalleryImage();
    }
  }, [id]);

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
      const post = response.data;
      setFormData({
        title: post.title || '',
        description: post.description || '',
        isFeatured: post.isFeatured || false,
        isActive: post.isActive !== false,
        sortOrder: post.sortOrder || 0,
        productIds: post.products?.map(p => p.productId) || [],
      });
      // Map existing files to our image state format
      const existingImages = (post.files || []).map(f => ({
        id: f.id,
        imageUrl: f.imageUrl,
        altText: f.altText || '',
        previewUrl: f.imageUrl.startsWith('http') ? f.imageUrl : `${BACKEND_URL}${f.imageUrl}`,
        isNew: false,
      }));
      setImages(existingImages);
    } catch (error) {
      console.error('Failed to fetch gallery post:', error);
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

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages = files.map(file => ({
      altText: '',
      file,
      previewUrl: URL.createObjectURL(file),
      isNew: true,
    }));
    setImages(prev => [...prev, ...newImages]);
    if (errors.images) setErrors(prev => ({ ...prev, images: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index) => {
    setImages(prev => {
      const img = prev[index];
      if (img.isNew && img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const moveImage = (index, direction) => {
    setImages(prev => {
      const newArr = [...prev];
      const target = index + direction;
      if (target < 0 || target >= newArr.length) return prev;
      [newArr[index], newArr[target]] = [newArr[target], newArr[index]];
      return newArr;
    });
  };

  const updateImageAltText = (index, altText) => {
    setImages(prev => prev.map((img, i) => i === index ? { ...img, altText } : img));
  };

  const toggleProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(pid => pid !== productId)
        : [...prev.productIds, productId],
    }));
  };

  const removeProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      productIds: prev.productIds.filter(pid => pid !== productId),
    }));
  };

  const getSelectedProducts = () => products.filter(p => formData.productIds.includes(p.id));

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.code?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (images.length === 0) newErrors.images = 'At least one image is required';
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
      submitData.append('isFeatured', formData.isFeatured);
      submitData.append('isActive', formData.isActive);
      submitData.append('sortOrder', formData.sortOrder);
      submitData.append('productIds', JSON.stringify(formData.productIds));

      if (isEditing) {
        // Build fileUpdates for existing images (with new sort order + alt text)
        // Images that were removed get excluded automatically
        const fileUpdates = images
          .filter(img => !img.isNew)
          .map((img, idx) => ({
            id: img.id,
            sortOrder: idx,
            altText: img.altText || '',
          }));
        submitData.append('fileUpdates', JSON.stringify(fileUpdates));

        // Append new files
        images.filter(img => img.isNew).forEach(img => {
          submitData.append('images', img.file);
        });

        await galleryAPI.update(id, submitData);
      } else {
        // Create: all images are new
        const altTexts = images.map(img => img.altText || '');
        submitData.append('altTexts', JSON.stringify(altTexts));
        images.forEach(img => submitData.append('images', img.file));
        await galleryAPI.create(submitData);
      }

      navigate('/admin/gallery');
    } catch (error) {
      console.error('Failed to save gallery post:', error);
      setErrors({ submit: error.message || 'Failed to save gallery post' });
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
        <h1>{isEditing ? 'Edit Gallery Post' : 'Add Gallery Post'}</h1>
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
          <div className="gallery-form-left">
            {/* Multi-Image Upload Card */}
            <div className="gallery-form-card">
              <div className="card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <h3>Images ({images.length})</h3>
              </div>
              <div className="card-body">
                <p className="card-hint">Upload one or more images. Multi-image posts show as carousel. Reorder with arrows.</p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleAddImages}
                  style={{ display: 'none' }}
                />

                <button type="button" className="btn-secondary" style={{ marginBottom: 16 }} onClick={() => fileInputRef.current?.click()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                  Add Images
                </button>

                {errors.images && <div className="field-error" style={{ marginBottom: 12 }}>{errors.images}</div>}

                {images.length === 0 ? (
                  <div className="gallery-thumbnail-empty" onClick={() => fileInputRef.current?.click()}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 4v16m8-8H4" />
                    </svg>
                    <p>Click to upload images</p>
                    <span>JPEG, PNG, WebP</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {images.map((img, idx) => (
                      <div key={img.id || idx} style={{ display: 'flex', gap: 12, padding: 12, border: '1px solid #e5e5e5', borderRadius: 8, background: '#fafafa', alignItems: 'flex-start' }}>
                        <div style={{ width: 80, height: 80, flexShrink: 0, background: '#fff', border: '1px solid #e5e5e5', borderRadius: 4, overflow: 'hidden' }}>
                          <img src={img.previewUrl} alt={img.altText || 'preview'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>
                            #{idx + 1} {idx === 0 && <span style={{ color: '#c21f26' }}>(Cover)</span>} {img.isNew && <span style={{ color: '#2a8a3a' }}>· New</span>}
                          </div>
                          <input
                            type="text"
                            placeholder="Alt text (optional, for accessibility)"
                            value={img.altText || ''}
                            onChange={(e) => updateImageAltText(idx, e.target.value)}
                            style={{ fontSize: 13, padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4 }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <button type="button" onClick={() => moveImage(idx, -1)} disabled={idx === 0} title="Move up" style={{ padding: 6, border: '1px solid #ddd', background: '#fff', borderRadius: 4, cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6" /></svg>
                          </button>
                          <button type="button" onClick={() => moveImage(idx, 1)} disabled={idx === images.length - 1} title="Move down" style={{ padding: 6, border: '1px solid #ddd', background: '#fff', borderRadius: 4, cursor: idx === images.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === images.length - 1 ? 0.3 : 1 }}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                          </button>
                          <button type="button" onClick={() => removeImage(idx)} title="Remove" style={{ padding: 6, border: '1px solid #e9c1c3', background: '#fff5f5', color: '#c21f26', borderRadius: 4, cursor: 'pointer' }}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                    <span className="checkmark"></span>
                    <div className="checkbox-text">
                      <span className="checkbox-title">Active</span>
                      <span className="checkbox-desc">Visible on the public gallery</span>
                    </div>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} />
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

          <div className="gallery-form-right">
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
                    placeholder="Post title"
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
                    placeholder="Post description"
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

            <div className="gallery-form-card">
              <div className="card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3>Linked Products</h3>
                <span className="card-badge">{formData.productIds.length}</span>
              </div>
              <div className="card-body">
                <p className="card-hint">Link products visible in this post. Users can click through to view them.</p>

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
                              <input type="checkbox" checked={formData.productIds.includes(product.id)} onChange={() => {}} />
                              <span className="checkmark"></span>
                            </div>
                            <div className="product-link-thumb">
                              {product.images?.[0] ? (
                                <img src={product.images[0].imageUrl.startsWith('http') ? product.images[0].imageUrl : `${BACKEND_URL}${product.images[0].imageUrl}`} alt={product.name} />
                              ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <rect x="3" y="3" width="18" height="18" rx="2" />
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

                {formData.productIds.length > 0 && (
                  <div className="linked-products-grid">
                    {getSelectedProducts().map(product => (
                      <div key={product.id} className="linked-product-item">
                        <div className="linked-product-thumb">
                          {product.images?.[0] ? (
                            <img src={product.images[0].imageUrl.startsWith('http') ? product.images[0].imageUrl : `${BACKEND_URL}${product.images[0].imageUrl}`} alt={product.name} />
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

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/gallery')}>Cancel</button>
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
                </svg>
                {isEditing ? 'Update Post' : 'Create Post'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GalleryForm;
