import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { downloadAPI, BACKEND_URL } from '../../services';

const DownloadForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    sortOrder: 0,
    isActive: true,
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [existingFile, setExistingFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchDownload();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await downloadAPI.adminGetCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchDownload = async () => {
    try {
      setLoading(true);
      const response = await downloadAPI.getById(id);
      const download = response.data;
      setFormData({
        name: download.name || '',
        description: download.description || '',
        categoryId: download.categoryId || '',
        sortOrder: download.sortOrder || 0,
        isActive: download.isActive !== false,
      });
      if (download.documentUrl) {
        setExistingFile({
          url: download.documentUrl.startsWith('http') ? download.documentUrl : `${BACKEND_URL}${download.documentUrl}`,
          size: download.fileSizeBytes,
        });
      }
    } catch (error) {
      console.error('Failed to fetch download:', error);
      navigate('/admin/downloads');
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, document: 'Only PDF files are allowed' }));
        return;
      }
      setDocumentFile(file);
      if (errors.document) {
        setErrors(prev => ({ ...prev, document: null }));
      }
    }
  };

  const handleRemoveFile = () => {
    setDocumentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!isEditing && !documentFile) newErrors.document = 'PDF document is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description || '');
      submitData.append('categoryId', formData.categoryId);
      submitData.append('sortOrder', formData.sortOrder);
      submitData.append('isActive', formData.isActive);

      if (documentFile) {
        submitData.append('document', documentFile);
      }

      if (isEditing) {
        await downloadAPI.update(id, submitData);
      } else {
        await downloadAPI.create(submitData);
      }

      navigate('/admin/downloads');
    } catch (error) {
      console.error('Failed to save download:', error);
      setErrors({ submit: error.message || 'Failed to save download' });
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
    <div className="admin-form-page">
      <div className="form-header">
        <button onClick={() => navigate('/admin/downloads')} className="back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Downloads
        </button>
        <h1>{isEditing ? 'Edit Download' : 'Add Download'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
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
          {/* Left Side - File Upload & Status */}
          <div className="gallery-form-left">
            {/* PDF Upload Card */}
            <div className="gallery-form-card">
              <div className="card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <h3>PDF Document</h3>
              </div>
              <div className="card-body">
                {documentFile ? (
                  <div className="file-preview">
                    <div className="file-preview-info">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="pdf-icon-lg">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <div>
                        <p className="file-name">{documentFile.name}</p>
                        <p className="file-size">{formatFileSize(documentFile.size)}</p>
                      </div>
                    </div>
                    <button type="button" className="btn-sm btn-danger" onClick={handleRemoveFile}>Remove</button>
                  </div>
                ) : existingFile ? (
                  <div className="file-preview">
                    <div className="file-preview-info">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="pdf-icon-lg">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <div>
                        <p className="file-name">Current document</p>
                        <p className="file-size">{formatFileSize(existingFile.size)}</p>
                      </div>
                    </div>
                    <a href={existingFile.url} target="_blank" rel="noopener noreferrer" className="btn-sm btn-secondary">View</a>
                    <button type="button" className="btn-sm btn-primary" onClick={() => fileInputRef.current?.click()}>Replace</button>
                  </div>
                ) : (
                  <div className={`gallery-thumbnail-empty ${errors.document ? 'error' : ''}`} onClick={() => fileInputRef.current?.click()}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p>Upload PDF</p>
                    <span>Click to select a PDF file</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                {errors.document && <span className="field-error">{errors.document}</span>}
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
                      <span className="checkbox-desc">Visible on the public downloads page</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Details */}
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
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'error' : ''}
                    placeholder="e.g. Complete Product Catalog 2024"
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Brief description of the download"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="categoryId">Category *</label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className={errors.categoryId ? 'error' : ''}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <span className="field-error">{errors.categoryId}</span>}
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
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/downloads')}>
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
                {isEditing ? 'Update Download' : 'Add Download'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DownloadForm;
