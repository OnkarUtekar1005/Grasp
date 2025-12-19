import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productAPI, categoryAPI } from '../../services';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    code: '',
    price: '',
    priceType: 'fixed', // 'fixed' or 'quote'
    inStock: true,
    featured: false,
    specs: [''],
    features: [''],
  });

  // Image state
  const [images, setImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // Fetch categories and product data (if editing)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoriesData = await categoryAPI.getAll();
        setCategories(categoriesData);

        if (isEditing) {
          const product = await productAPI.getBySlug(id);
          setFormData({
            name: product.name || '',
            description: product.description || '',
            category: product.categorySlug || '',
            code: product.code || '',
            price: product.price || '',
            priceType: product.price ? 'fixed' : 'quote',
            inStock: product.inStock !== false,
            featured: product.featured || false,
            specs: product.specs?.length ? product.specs : [''],
            features: product.features?.length ? product.features : [''],
          });
          if (product.images) {
            setExistingImages(product.images);
          } else if (product.image) {
            setExistingImages([product.image]);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle array field change (specs, features)
  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  // Add new item to array field
  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  // Remove item from array field
  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    }
  };

  // Process selected files
  const processFiles = (files) => {
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isImage && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Only images under 5MB are allowed.');
    }

    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));

    setImages(prev => [...prev, ...validFiles]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  // Remove new image
  const removeNewImage = (index) => {
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Set primary image
  const setPrimaryImage = (index, isExisting = false) => {
    if (isExisting) {
      const [primary] = existingImages.splice(index, 1);
      setExistingImages([primary, ...existingImages]);
    } else {
      const [primary] = images.splice(index, 1);
      const [primaryUrl] = imagePreviewUrls.splice(index, 1);
      setImages([primary, ...images]);
      setImagePreviewUrls([primaryUrl, ...imagePreviewUrls]);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (formData.priceType === 'fixed' && !formData.price) {
      newErrors.price = 'Price is required for fixed price products';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();

      // Add form fields
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('code', formData.code);
      submitData.append('price', formData.priceType === 'quote' ? '' : formData.price);
      submitData.append('priceType', formData.priceType);
      submitData.append('inStock', formData.inStock);
      submitData.append('featured', formData.featured);

      // Add specs and features as JSON
      const filteredSpecs = formData.specs.filter(s => s.trim());
      const filteredFeatures = formData.features.filter(f => f.trim());
      submitData.append('specs', JSON.stringify(filteredSpecs));
      submitData.append('features', JSON.stringify(filteredFeatures));

      // Add existing images to keep
      submitData.append('existingImages', JSON.stringify(existingImages));

      // Add new images
      images.forEach((image) => {
        submitData.append('images', image);
      });

      if (isEditing) {
        await productAPI.update(id, submitData);
      } else {
        await productAPI.create(submitData);
      }

      // Navigate back to products list
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="product-form-page">
      <div className="product-form-header">
        <div>
          <h1>{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
          <p>Fill in the details below to {isEditing ? 'update the' : 'create a new'} product.</p>
        </div>
        <div className="product-form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            form="product-form"
            disabled={saving}
          >
            {saving ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="product-form">
        <div className="form-layout">
          {/* Main Content */}
          <div className="form-main">
            {/* Basic Info */}
            <div className="form-section">
              <h3>Basic Information</h3>

              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Polycarbonate Enclosure IP67"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="code">Product Code</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., GE-PC-001"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed description of the product..."
                  rows="5"
                  className={errors.description ? 'error' : ''}
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>
            </div>

            {/* Images */}
            <div className="form-section">
              <h3>Product Images</h3>
              <p className="form-section-desc">Upload high-quality images. The first image will be the primary display image.</p>

              {/* Image Upload Area */}
              <div
                className={`image-upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept="image/*"
                  hidden
                />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p>Drag & drop images here or click to browse</p>
                <span>PNG, JPG, WEBP up to 5MB each</span>
              </div>

              {/* Image Preview Grid */}
              {(existingImages.length > 0 || imagePreviewUrls.length > 0) && (
                <div className="image-preview-grid">
                  {/* Existing Images */}
                  {existingImages.map((url, index) => (
                    <div key={`existing-${index}`} className={`image-preview-item ${index === 0 ? 'primary' : ''}`}>
                      <img src={url} alt={`Product ${index + 1}`} />
                      <div className="image-preview-actions">
                        {index !== 0 && (
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => setPrimaryImage(index, true)}
                            title="Set as primary"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-icon danger"
                          onClick={() => removeExistingImage(index)}
                          title="Remove"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                      {index === 0 && <span className="primary-badge">Primary</span>}
                    </div>
                  ))}

                  {/* New Images */}
                  {imagePreviewUrls.map((url, index) => (
                    <div
                      key={`new-${index}`}
                      className={`image-preview-item ${existingImages.length === 0 && index === 0 ? 'primary' : ''}`}
                    >
                      <img src={url} alt={`New ${index + 1}`} />
                      <div className="image-preview-actions">
                        {(existingImages.length > 0 || index !== 0) && (
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => setPrimaryImage(index, false)}
                            title="Set as primary"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-icon danger"
                          onClick={() => removeNewImage(index)}
                          title="Remove"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                      {existingImages.length === 0 && index === 0 && <span className="primary-badge">Primary</span>}
                      <span className="new-badge">New</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="form-section">
              <h3>Specifications</h3>
              <p className="form-section-desc">Add technical specifications (e.g., IP67, UL94 V-0, UV Resistant)</p>

              <div className="array-field">
                {formData.specs.map((spec, index) => (
                  <div key={index} className="array-field-item">
                    <input
                      type="text"
                      value={spec}
                      onChange={(e) => handleArrayChange('specs', index, e.target.value)}
                      placeholder="e.g., IP67"
                    />
                    {formData.specs.length > 1 && (
                      <button
                        type="button"
                        className="btn-icon danger"
                        onClick={() => removeArrayItem('specs', index)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-add-item"
                  onClick={() => addArrayItem('specs')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Specification
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="form-section">
              <h3>Key Features</h3>
              <p className="form-section-desc">List the main features and benefits</p>

              <div className="array-field">
                {formData.features.map((feature, index) => (
                  <div key={index} className="array-field-item">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleArrayChange('features', index, e.target.value)}
                      placeholder="e.g., High impact resistance"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        className="btn-icon danger"
                        onClick={() => removeArrayItem('features', index)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-add-item"
                  onClick={() => addArrayItem('features')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Feature
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="form-sidebar">
            {/* Category & Pricing */}
            <div className="form-section">
              <h3>Organization</h3>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={errors.category ? 'error' : ''}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && <span className="error-message">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label>Pricing Type</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="priceType"
                      value="fixed"
                      checked={formData.priceType === 'fixed'}
                      onChange={handleChange}
                    />
                    <span>Fixed Price</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="priceType"
                      value="quote"
                      checked={formData.priceType === 'quote'}
                      onChange={handleChange}
                    />
                    <span>Request Quote</span>
                  </label>
                </div>
              </div>

              {formData.priceType === 'fixed' && (
                <div className="form-group">
                  <label htmlFor="price">Price (INR) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={errors.price ? 'error' : ''}
                  />
                  {errors.price && <span className="error-message">{errors.price}</span>}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="form-section">
              <h3>Status</h3>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleChange}
                  />
                  <span className="checkbox-custom" />
                  <span>In Stock</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                  />
                  <span className="checkbox-custom" />
                  <span>Featured Product</span>
                </label>
                <small>Featured products appear on the homepage</small>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
