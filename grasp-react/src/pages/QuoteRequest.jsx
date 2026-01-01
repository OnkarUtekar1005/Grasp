import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar, Footer } from '../components';
import { useProducts } from '../contexts';
import { quoteAPI } from '../services';

const QuoteRequest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { products } = useProducts();

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    message: '',
  });

  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});

  // Pre-populate with product from URL params
  useEffect(() => {
    const productId = searchParams.get('product');
    const quantity = parseInt(searchParams.get('quantity')) || 1;

    if (productId) {
      const product = products.find(p => p.id === productId || p.slug === productId);
      if (product) {
        setItems([{
          id: Date.now(),
          productId: product.id,
          productName: product.name,
          productCode: product.code,
          quantity: quantity,
          notes: '',
        }]);
      }
    }
  }, [searchParams, products]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleItemChange = (itemId, field, value) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    setItems(prev => [...prev, {
      id: Date.now(),
      productId: '',
      productName: '',
      productCode: '',
      quantity: 1,
      notes: '',
    }]);
  };

  const removeItem = (itemId) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const selectProduct = (itemId, productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setItems(prev => prev.map(item =>
        item.id === itemId ? {
          ...item,
          productId: product.id,
          productName: product.name,
          productCode: product.code,
        } : item
      ));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (items.length === 0) {
      newErrors.items = 'Please add at least one product';
    } else {
      const invalidItems = items.filter(item => !item.productId);
      if (invalidItems.length > 0) {
        newErrors.items = 'Please select a product for all items';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const response = await quoteAPI.submit({
        companyName: formData.companyName,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone || null,
        message: formData.message || null,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes || null,
        })),
      });

      setSubmitStatus({
        type: 'success',
        message: `Quote request submitted successfully! Your reference number is ${response.data?.requestNumber || 'N/A'}. We will contact you soon.`,
      });

      // Reset form
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        message: '',
      });
      setItems([]);
    } catch (error) {
      console.error('Error submitting quote:', error);
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Failed to submit quote request. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar isVisible={true} />

      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="page-label">Request a Quote</div>
          <h1 className="page-title">Get Custom Pricing</h1>
          <p className="page-desc">
            Fill out the form below and our team will provide you with a detailed quote for your requirements.
          </p>
        </div>
      </section>

      <section className="quote-request-page">
        <div className="quote-request-inner">
          <form onSubmit={handleSubmit} className="quote-form">
            {/* Contact Information */}
            <div className="quote-section">
              <h2>Contact Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="companyName">Company Name *</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Your company name"
                    className={errors.companyName ? 'error' : ''}
                  />
                  {errors.companyName && <span className="error-message">{errors.companyName}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="contactName">Contact Person *</label>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    placeholder="Your name"
                    className={errors.contactName ? 'error' : ''}
                  />
                  {errors.contactName && <span className="error-message">{errors.contactName}</span>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="quote-section">
              <div className="section-header">
                <h2>Products</h2>
                <button type="button" className="btn-add-product" onClick={addItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Product
                </button>
              </div>

              {errors.items && <div className="error-message mb-3">{errors.items}</div>}

              {items.length === 0 ? (
                <div className="no-items">
                  <p>No products added yet. Click "Add Product" to start.</p>
                </div>
              ) : (
                <div className="quote-items">
                  {items.map((item, index) => (
                    <div key={item.id} className="quote-item">
                      <div className="quote-item-header">
                        <span className="item-number">Item {index + 1}</span>
                        <button
                          type="button"
                          className="btn-remove-item"
                          onClick={() => removeItem(item.id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                      <div className="quote-item-body">
                        <div className="form-group product-select">
                          <label>Select Product *</label>
                          <select
                            value={item.productId}
                            onChange={(e) => selectProduct(item.id, e.target.value)}
                          >
                            <option value="">Choose a product...</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.code ? `[${product.code}] ` : ''}{product.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group quantity-input">
                          <label>Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="form-group notes-input">
                          <label>Notes (optional)</label>
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                            placeholder="Any specific requirements..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Message */}
            <div className="quote-section">
              <h2>Additional Information</h2>
              <div className="form-group">
                <label htmlFor="message">Message (optional)</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Any additional requirements, specifications, or questions..."
                  rows="4"
                />
              </div>
            </div>

            {/* Submit */}
            {submitStatus.message && (
              <div className={`form-status ${submitStatus.type}`}>
                {submitStatus.message}
              </div>
            )}

            <div className="quote-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Quote Request'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default QuoteRequest;
