import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryAPI } from '../../services';

const CategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    featured: false,
    specs: [''],
  });

  // Image state
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [existingImage, setExistingImage] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Fetch category data if editing
  useEffect(() => {
    const fetchCategory = async () => {
      if (!isEditing) return;

      setLoading(true);
      try {
        const category = await categoryAPI.getBySlug(id);
        setFormData({
          name: category.name || '',
          code: category.code || '',
          description: category.description || '',
          featured: category.featured || false,
          specs: category.specs?.length ? category.specs : [''],
        });
        if (category.image) {
          setExistingImage(category.image);
        }
      } catch (error) {
        console.error('Error fetching category:', error);
        alert('Category not found');
        navigate('/admin/categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id, isEditing, navigate]);

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

  // Handle array field change (specs)
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
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Process selected file
  const processFile = (file) => {
    const isImage = file.type.startsWith('image/');
    const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit

    if (!isImage) {
      alert('Please select an image file.');
      return;
    }

    if (!isValidSize) {
      alert('Image must be under 5MB.');
      return;
    }

    // Revoke previous preview URL
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setExistingImage(''); // Clear existing image when new one is selected
  };

  // Remove image
  const removeImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImage(null);
    setImagePreviewUrl('');
    setExistingImage('');
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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
      submitData.append('code', formData.code);
      submitData.append('description', formData.description);
      submitData.append('featured', formData.featured);

      // Add specs as JSON
      const filteredSpecs = formData.specs.filter(s => s.trim());
      submitData.append('specs', JSON.stringify(filteredSpecs));

      // Add existing image to keep (if no new image)
      if (existingImage && !image) {
        submitData.append('existingImage', existingImage);
      }

      // Add new image
      if (image) {
        submitData.append('image', image);
      }

      if (isEditing) {
        await categoryAPI.update(id, submitData);
      } else {
        await categoryAPI.create(submitData);
      }

      // Navigate back to categories list
      navigate('/admin/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category. Please try again.');
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
    <div className="category-form-page">
      <div className="product-form-header">
        <div>
          <h1>{isEditing ? 'Edit Category' : 'Add New Category'}</h1>
          <p>Fill in the details below to {isEditing ? 'update the' : 'create a new'} category.</p>
        </div>
        <div className="product-form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/admin/categories')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            form="category-form"
            disabled={saving}
          >
            {saving ? 'Saving...' : (isEditing ? 'Update Category' : 'Create Category')}
          </button>
        </div>
      </div>

      <form id="category-form" onSubmit={handleSubmit} className="product-form">
        <div className="form-layout">
          {/* Main Content */}
          <div className="form-main">
            {/* Basic Info */}
            <div className="form-section">
              <h3>Basic Information</h3>

              <div className="form-group">
                <label htmlFor="name">Category Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Polycarbonate Enclosures"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="code">Category Code</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., GE-PC Series"
                />
                <small>A short code to identify the category (e.g., GE-PC Series)</small>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of this category..."
                  rows="4"
                  className={errors.description ? 'error' : ''}
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>
            </div>

            {/* Category Image */}
            <div className="form-section">
              <h3>Category Image</h3>
              <p className="form-section-desc">Upload an image to represent this category.</p>

              {/* Show existing or new image preview */}
              {(existingImage || imagePreviewUrl) ? (
                <div className="single-image-preview">
                  <img src={imagePreviewUrl || existingImage} alt="Category" />
                  <div className="image-preview-overlay">
                    <button
                      type="button"
                      className="btn-icon change-image"
                      onClick={() => fileInputRef.current?.click()}
                      title="Change Image"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="btn-icon danger"
                      onClick={removeImage}
                      title="Remove Image"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                  {imagePreviewUrl && <span className="new-badge">New</span>}
                </div>
              ) : (
                <div
                  className={`image-upload-area ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <p>Drag & drop an image here or click to browse</p>
                  <span>PNG, JPG, WEBP up to 5MB</span>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                hidden
              />
            </div>

            {/* Specifications */}
            <div className="form-section">
              <h3>Specifications</h3>
              <p className="form-section-desc">Add key specifications for this category (e.g., IP67, UL94 V-0)</p>

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
          </div>

          {/* Sidebar */}
          <div className="form-sidebar">
            {/* Status */}
            <div className="form-section">
              <h3>Settings</h3>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                  />
                  <span className="checkbox-custom" />
                  <span>Featured Category</span>
                </label>
                <small>Featured categories are highlighted on the homepage</small>
              </div>
            </div>

            {/* Preview Card */}
            <div className="form-section">
              <h3>Preview</h3>
              <div className="category-preview-card">
                <div className="preview-image">
                  {(imagePreviewUrl || existingImage) ? (
                    <img src={imagePreviewUrl || existingImage} alt="Preview" />
                  ) : (
                    <div className="preview-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="preview-content">
                  <h4>{formData.name || 'Category Name'}</h4>
                  <p>{formData.code || 'Category Code'}</p>
                  <div className="preview-specs">
                    {formData.specs.filter(s => s.trim()).slice(0, 2).map((spec, i) => (
                      <span key={i}>{spec}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
