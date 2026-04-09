import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { productAPI, categoryAPI, BACKEND_URL } from '../../services';

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
import { useProducts } from '../../contexts';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DOCUMENT_TYPES = [
  { value: 'DATASHEET', label: 'Datasheet' },
  { value: 'MANUAL', label: 'User Manual' },
  { value: 'CERTIFICATE', label: 'Certificate' },
  { value: 'CAD', label: 'CAD Drawing' },
  { value: 'OTHER', label: 'Other Document' },
];

// Sortable Spec Item Component for drag-and-drop
const SortableSpecItem = ({ spec, index, onUpdate, onRemove, canRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: spec.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="spec-field-item">
      <button
        type="button"
        className="drag-handle"
        {...attributes}
        {...listeners}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="6" x2="16" y2="6" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="18" x2="16" y2="18" />
        </svg>
      </button>

      <input
        type="text"
        value={spec.key}
        onChange={(e) => onUpdate(index, 'key', e.target.value)}
        placeholder="e.g., Material"
        className="spec-key-input"
      />

      <input
        type="text"
        value={spec.value}
        onChange={(e) => onUpdate(index, 'value', e.target.value)}
        placeholder="e.g., ABS Plastic"
        className="spec-value-input"
      />

      {canRemove && (
        <button
          type="button"
          className="btn-icon danger"
          onClick={() => onRemove(index)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
};

// Sortable Feature Item Component for drag-and-drop
const SortableFeatureItem = ({ feature, index, onUpdate, onRemove, canRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: feature.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="array-field-item">
      <button type="button" className="drag-handle" {...attributes} {...listeners}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="6" x2="16" y2="6" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="18" x2="16" y2="18" />
        </svg>
      </button>
      <input
        type="text"
        value={feature.value}
        onChange={(e) => onUpdate(index, e.target.value)}
        placeholder="e.g., High impact resistance"
      />
      {canRemove && (
        <button type="button" className="btn-icon danger" onClick={() => onRemove(index)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
};

const ProductForm = () => {
  const navigate = useNavigate();
  const { id: slugOrId } = useParams();
  const [searchParams] = useSearchParams();
  const duplicateSlug = searchParams.get('duplicate');
  const isEditing = Boolean(slugOrId);
  const isDuplicating = Boolean(duplicateSlug) && !isEditing;
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const { refreshData } = useProducts();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [productId, setProductId] = useState(null); // Store the actual UUID for updates

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categories: [], // Changed from single category to array
    code: '',
    dimensionLength: '',
    dimensionWidth: '',
    dimensionHeight: '',
    tags: [], // Tags for filtering
    price: '',
    priceType: 'fixed', // 'fixed' or 'quote'
    inStock: true,
    featured: false,
    specs: [{ id: generateId(), key: '', value: '' }],
    features: [{ id: generateId(), value: '' }],
  });

  // Tag input state
  const [tagInput, setTagInput] = useState('');

  // Image state
  const [images, setImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // Document state
  const [documents, setDocuments] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [dragDocActive, setDragDocActive] = useState(false);

  // Fetch categories and product data (if editing or duplicating)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoriesData = await categoryAPI.getAll();
        setCategories(categoriesData.data || []);

        // Fetch product data if editing OR duplicating
        const slugToFetch = isEditing ? slugOrId : duplicateSlug;

        if (slugToFetch) {
          const response = await productAPI.getBySlug(slugToFetch);
          const product = response.data || response;

          // Only store product ID if editing (not when duplicating)
          if (isEditing) {
            setProductId(product.id);
          }

          // Extract specs as key-value objects
          const specs = product.dynamicSpecs?.length
            ? product.dynamicSpecs.map(s => ({
                id: s.id || generateId(),
                // If key looks auto-generated (spec_0, spec_1), show empty for user to fill in
                key: s.specKey?.startsWith('spec_') ? '' : (s.specKey || ''),
                value: s.specValue || '',
              }))
            : [{ id: generateId(), key: '', value: '' }];
          const features = product.features?.length
            ? product.features.map(f => ({ id: generateId(), value: f.featureText || f.featureValue || f.value || f }))
            : [{ id: generateId(), value: '' }];
          // Extract categories from junction table or fall back to single category
          let productCategories = [];
          if (product.categories && Array.isArray(product.categories) && product.categories.length > 0) {
            // New format: array from junction table
            productCategories = product.categories.map(pc => pc.category?.slug || pc.categoryId).filter(Boolean);
          } else if (product.category?.slug) {
            // Old format: single category
            productCategories = [product.category.slug];
          }

          setFormData({
            // Add "(Copy)" suffix when duplicating
            name: isDuplicating ? `${product.name} (Copy)` : (product.name || ''),
            description: product.description || '',
            categories: productCategories,
            // Clear code when duplicating (user should enter new unique code)
            code: isDuplicating ? '' : (product.code || ''),
            dimensionLength: product.dimensionLength || '',
            dimensionWidth: product.dimensionWidth || '',
            dimensionHeight: product.dimensionHeight || '',
            tags: product.tags || [],
            price: product.price || '',
            priceType: product.price ? 'fixed' : 'quote',
            inStock: product.isActive !== false,
            featured: product.isFeatured || false,
            specs,
            features,
          });

          // Only load existing images/documents when editing (not duplicating)
          if (isEditing) {
            if (product.images?.length) {
              // Store full image objects for existing images
              setExistingImages(product.images.map(img => ({
                id: img.id,
                url: `${BACKEND_URL}${img.imageUrl}`,
                imageUrl: img.imageUrl,
              })));
            }
            if (product.documents?.length) {
              setExistingDocuments(product.documents.map(doc => ({
                id: doc.id,
                name: doc.name,
                documentUrl: doc.documentUrl,
                documentType: doc.documentType,
                fileSizeBytes: doc.fileSizeBytes,
              })));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (isEditing) {
          alert('Product not found');
          navigate('/admin/products');
        } else if (isDuplicating) {
          alert('Source product not found for duplication');
          navigate('/admin/products');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slugOrId, duplicateSlug, isEditing, isDuplicating, navigate]);

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

  // DnD Kit sensors for specs reordering
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for features reordering
  const handleFeaturesDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setFormData(prev => {
        const oldIndex = prev.features.findIndex(f => f.id === active.id);
        const newIndex = prev.features.findIndex(f => f.id === over.id);
        return { ...prev, features: arrayMove(prev.features, oldIndex, newIndex) };
      });
    }
  };

  const handleFeatureUpdate = (index, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? { ...f, value } : f),
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, { id: generateId(), value: '' }] }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  // Handle drag end for specs reordering
  const handleSpecsDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setFormData(prev => {
        const oldIndex = prev.specs.findIndex(s => s.id === active.id);
        const newIndex = prev.specs.findIndex(s => s.id === over.id);
        return {
          ...prev,
          specs: arrayMove(prev.specs, oldIndex, newIndex),
        };
      });
    }
  };

  // Update spec field (key or value)
  const handleSpecUpdate = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      specs: prev.specs.map((spec, i) =>
        i === index ? { ...spec, [field]: value } : spec
      ),
    }));
  };

  // Add new spec
  const addSpec = () => {
    setFormData(prev => ({
      ...prev,
      specs: [...prev.specs, { id: generateId(), key: '', value: '' }],
    }));
  };

  // Remove spec
  const removeSpec = (index) => {
    setFormData(prev => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index),
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

  // Handle document file selection
  const handleDocFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processDocFiles(files);
  };

  // Handle document drag events
  const handleDocDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragDocActive(true);
    } else if (e.type === 'dragleave') {
      setDragDocActive(false);
    }
  };

  // Handle document drop
  const handleDocDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragDocActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      processDocFiles(files);
    }
  };

  // Process document files
  const processDocFiles = (files) => {
    const validExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.dwg', '.dxf', '.png', '.jpg', '.jpeg'];
    const validFiles = files.filter(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      const isValidType = validExtensions.includes(ext);
      const isValidSize = file.size <= 20 * 1024 * 1024; // 20MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Only PDF, DOC, XLS, DWG, or images under 20MB are allowed.');
    }

    // Create document entries with default type
    const newDocs = validFiles.map(file => ({
      file,
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for display name
      documentType: 'OTHER',
      fileSize: file.size,
    }));

    setDocuments(prev => [...prev, ...newDocs]);
  };

  // Update document metadata
  const updateDocument = (index, field, value) => {
    setDocuments(prev => prev.map((doc, i) =>
      i === index ? { ...doc, [field]: value } : doc
    ));
  };

  // Remove new document
  const removeNewDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing document - immediately delete from backend
  const removeExistingDocument = async (index) => {
    const doc = existingDocuments[index];
    if (!doc?.id || !productId) return;

    try {
      await productAPI.deleteDocument(productId, doc.id);
      setExistingDocuments(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const updateExistingDocument = async (index, field, value) => {
    const doc = existingDocuments[index];
    if (!doc?.id || !productId) return;

    // Update locally immediately
    setExistingDocuments(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d));

    try {
      await productAPI.updateDocument(productId, doc.id, { [field]: value });
    } catch (error) {
      console.error('Failed to update document:', error);
    }
  };

  // Category dropdown state
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const categoryDropdownRef = useRef(null);

  // Handle category toggle (multi-select)
  const handleCategoryToggle = (slug) => {
    setFormData(prev => {
      const newCategories = prev.categories.includes(slug)
        ? prev.categories.filter(c => c !== slug)
        : [...prev.categories, slug];
      return { ...prev, categories: newCategories };
    });
    if (errors.categories) {
      setErrors(prev => ({ ...prev, categories: '' }));
    }
  };

  // Remove category tag
  const removeCategory = (slug, e) => {
    e.stopPropagation();
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== slug)
    }));
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
        setCategorySearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.categories || formData.categories.length === 0) {
      newErrors.categories = 'Please select at least one product range';
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
      submitData.append('categories', JSON.stringify(formData.categories)); // Send as JSON array
      submitData.append('code', formData.code);
      submitData.append('dimensionLength', formData.dimensionLength);
      submitData.append('dimensionWidth', formData.dimensionWidth);
      submitData.append('dimensionHeight', formData.dimensionHeight);
      submitData.append('tags', JSON.stringify(formData.tags)); // Send tags as JSON array
      submitData.append('price', formData.priceType === 'quote' ? '' : formData.price);
      submitData.append('priceType', formData.priceType);
      submitData.append('inStock', formData.inStock);
      submitData.append('featured', formData.featured);

      // Add specs and features as JSON (require BOTH key and value to avoid duplicate key errors)
      const filteredSpecs = formData.specs
        .filter(s => s.key.trim() && s.value.trim())
        .map(s => ({ key: s.key.trim(), value: s.value.trim() }));
      const filteredFeatures = formData.features.map(f => f.value).filter(v => v.trim());
      submitData.append('specs', JSON.stringify(filteredSpecs));
      submitData.append('features', JSON.stringify(filteredFeatures));

      // Add existing images to keep (extract imageUrl for backend)
      const existingImageUrls = existingImages.map(img => img.imageUrl || img);
      submitData.append('existingImages', JSON.stringify(existingImageUrls));

      // Add new images
      images.forEach((image) => {
        submitData.append('images', image);
      });

      // Add new documents with metadata
      documents.forEach((doc, index) => {
        submitData.append('documents', doc.file);
        submitData.append(`documentMeta[${index}]`, JSON.stringify({
          name: doc.name,
          documentType: doc.documentType,
        }));
      });

      if (isEditing) {
        if (!productId) {
          throw new Error('Product ID not found. Please refresh and try again.');
        }
        await productAPI.update(productId, submitData);
      } else {
        await productAPI.create(submitData);
      }

      // Refresh the product context so the list updates instantly
      await refreshData();

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
          <h1>{isEditing ? 'Edit Product' : isDuplicating ? 'Duplicate Product' : 'Add New Product'}</h1>
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
                  {existingImages.map((img, index) => (
                    <div key={`existing-${img.id || index}`} className={`image-preview-item ${index === 0 ? 'primary' : ''}`}>
                      <img src={img.url || img} alt={`Product ${index + 1}`} />
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

            {/* Specifications - Key-Value with Drag & Drop */}
            <div className="form-section">
              <h3>Specifications</h3>
              <p className="form-section-desc">
                Add technical specifications as key-value pairs (e.g., Material: ABS Plastic)
              </p>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSpecsDragEnd}
              >
                <SortableContext
                  items={formData.specs.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="specs-field-list">
                    {formData.specs.map((spec, index) => (
                      <SortableSpecItem
                        key={spec.id}
                        spec={spec}
                        index={index}
                        onUpdate={handleSpecUpdate}
                        onRemove={removeSpec}
                        canRemove={formData.specs.length > 1}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <button
                type="button"
                className="btn-add-item"
                onClick={addSpec}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Specification
              </button>
            </div>

            {/* Features */}
            <div className="form-section">
              <h3>Key Features</h3>
              <p className="form-section-desc">List the main features and benefits</p>

              <div className="array-field">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFeaturesDragEnd}>
                  <SortableContext items={formData.features.map(f => f.id)} strategy={verticalListSortingStrategy}>
                    {formData.features.map((feature, index) => (
                      <SortableFeatureItem
                        key={feature.id}
                        feature={feature}
                        index={index}
                        onUpdate={handleFeatureUpdate}
                        onRemove={removeFeature}
                        canRemove={formData.features.length > 1}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                <button
                  type="button"
                  className="btn-add-item"
                  onClick={addFeature}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Feature
                </button>
              </div>
            </div>

            {/* Documents Section */}
            <div className="form-section">
              <h3>Documents & Resources</h3>
              <p className="form-section-desc">Upload datasheets, manuals, certificates, and CAD drawings for this product.</p>

              {/* Document Upload Area */}
              <div
                className={`image-upload-area ${dragDocActive ? 'drag-active' : ''}`}
                onDragEnter={handleDocDrag}
                onDragLeave={handleDocDrag}
                onDragOver={handleDocDrag}
                onDrop={handleDocDrop}
                onClick={() => docInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={docInputRef}
                  onChange={handleDocFileSelect}
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.dxf,.png,.jpg,.jpeg"
                  hidden
                />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6M12 18v-6M9 15l3-3 3 3" />
                </svg>
                <p>Drag & drop documents here or click to browse</p>
                <span>PDF, DOC, XLS, DWG, or images up to 20MB each</span>
              </div>

              {/* Existing Documents */}
              {existingDocuments.length > 0 && (
                <div className="documents-list">
                  <h4>Existing Documents</h4>
                  {existingDocuments.map((doc, index) => (
                    <div key={`existing-doc-${doc.id || index}`} className="document-item">
                      <div className="document-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <path d="M14 2v6h6" />
                        </svg>
                      </div>
                      <div className="document-details">
                        <span className="document-name">{doc.name}</span>
                        <select
                          value={doc.documentType}
                          onChange={(e) => updateExistingDocument(index, 'documentType', e.target.value)}
                          className="document-type-select"
                        >
                          {DOCUMENT_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                        {doc.fileSizeBytes && (
                          <span className="document-size">{(doc.fileSizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="btn-icon danger"
                        onClick={() => removeExistingDocument(index)}
                        title="Remove"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New Documents */}
              {documents.length > 0 && (
                <div className="documents-list new-documents">
                  <h4>New Documents to Upload</h4>
                  {documents.map((doc, index) => (
                    <div key={`new-doc-${index}`} className="document-item editable">
                      <div className="document-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <path d="M14 2v6h6" />
                        </svg>
                      </div>
                      <div className="document-fields">
                        <input
                          type="text"
                          value={doc.name}
                          onChange={(e) => updateDocument(index, 'name', e.target.value)}
                          placeholder="Document name"
                          className="document-name-input"
                        />
                        <select
                          value={doc.documentType}
                          onChange={(e) => updateDocument(index, 'documentType', e.target.value)}
                          className="document-type-select"
                        >
                          {DOCUMENT_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                        <span className="document-size">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <button
                        type="button"
                        className="btn-icon danger"
                        onClick={() => removeNewDocument(index)}
                        title="Remove"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="form-sidebar">
            {/* Category & Pricing */}
            <div className="form-section">
              <h3>Organization</h3>

              <div className="form-group">
                <label>Product Ranges *</label>
                <div className="category-multiselect" ref={categoryDropdownRef}>
                  <div
                    className={`category-multiselect-input ${categoryDropdownOpen ? 'active' : ''} ${errors.categories ? 'error' : ''}`}
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  >
                    {formData.categories.length > 0 ? (
                      <div className="category-multiselect-tags">
                        {formData.categories.map(slug => {
                          const cat = categories.find(c => c.slug === slug);
                          return cat ? (
                            <span key={slug} className="category-tag">
                              {cat.name}
                              <button type="button" onClick={(e) => removeCategory(slug, e)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <span className="category-multiselect-placeholder">Select product ranges...</span>
                    )}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                  {categoryDropdownOpen && (
                    <div className="category-multiselect-dropdown">
                      <div className="category-multiselect-search">
                        <input
                          type="text"
                          placeholder="Search product ranges..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="category-multiselect-options">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((cat) => (
                            <div
                              key={cat.slug}
                              className={`category-multiselect-option ${formData.categories.includes(cat.slug) ? 'selected' : ''}`}
                              onClick={() => handleCategoryToggle(cat.slug)}
                            >
                              <span className="option-checkmark"></span>
                              <span>{cat.name}</span>
                            </div>
                          ))
                        ) : (
                          <div className="category-multiselect-empty">No product ranges found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {errors.categories && <span className="error-message">{errors.categories}</span>}
              </div>

              <div className="form-group">
                <label>Size (mm)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <input
                      type="number"
                      id="dimensionLength"
                      name="dimensionLength"
                      value={formData.dimensionLength}
                      onChange={(e) => { if (e.target.value === '' || Number(e.target.value) >= 0) handleChange(e); }}
                      placeholder="Length"
                      min="0"
                      step="0.1"
                    />
                    <small>Length</small>
                  </div>
                  <div>
                    <input
                      type="number"
                      id="dimensionWidth"
                      name="dimensionWidth"
                      value={formData.dimensionWidth}
                      onChange={(e) => { if (e.target.value === '' || Number(e.target.value) >= 0) handleChange(e); }}
                      placeholder="Width"
                      min="0"
                      step="0.1"
                    />
                    <small>Width</small>
                  </div>
                  <div>
                    <input
                      type="number"
                      id="dimensionHeight"
                      name="dimensionHeight"
                      value={formData.dimensionHeight}
                      onChange={(e) => { if (e.target.value === '' || Number(e.target.value) >= 0) handleChange(e); }}
                      placeholder="Height"
                      min="0"
                      step="0.1"
                    />
                    <small>Height</small>
                  </div>
                </div>
                <small>Used for filtering products by size</small>
              </div>

              <div className="form-group">
                <label>Product Tags</label>
                <div className="tags-input-container">
                  {formData.tags.length > 0 && (
                    <div className="tags-list">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="tag-item">
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                tags: prev.tags.filter((_, i) => i !== index)
                              }));
                            }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="tag-input-row">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && tagInput.trim()) {
                          e.preventDefault();
                          if (!formData.tags.includes(tagInput.trim())) {
                            setFormData(prev => ({
                              ...prev,
                              tags: [...prev.tags, tagInput.trim()]
                            }));
                          }
                          setTagInput('');
                        }
                      }}
                      placeholder="Type a tag and press Enter"
                    />
                    <button
                      type="button"
                      className="btn-add-tag"
                      onClick={() => {
                        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
                          setFormData(prev => ({
                            ...prev,
                            tags: [...prev.tags, tagInput.trim()]
                          }));
                          setTagInput('');
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
                <small>Add tags for filtering (e.g., IP67, Waterproof, Industrial)</small>
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
                    <span className="radio-mark"></span>
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
                    <span className="radio-mark"></span>
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
                  <span className="checkmark"></span>
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
                  <span className="checkmark"></span>
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
