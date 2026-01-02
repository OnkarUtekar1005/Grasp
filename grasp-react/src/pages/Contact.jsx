import { useState } from 'react';
import { Navbar, Footer } from '../components';
import { inquiryAPI } from '../services';
import { useProducts } from '../contexts';

const contactInfo = [
  {
    title: 'Address',
    content: 'F-56-57, RIICO Industrial Area\nChopanki, Bhiwadi\nDist. Alwar, Rajasthan - 301019',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    link: 'https://goo.gl/maps/HvwnsCeBfqYUq49j9',
    linkText: 'View on Google Maps'
  },
  {
    title: 'Phone',
    content: '+91 98711 91712',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    link: 'tel:+919871191712'
  },
  {
    title: 'Email',
    content: 'info@graspelectric.com',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    link: 'mailto:info@graspelectric.com'
  },
  {
    title: 'Website',
    content: 'www.graspelectric.com',
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    link: 'https://www.graspelectric.com'
  },
  {
    title: 'GSTIN',
    content: '08AAGCG5190C1ZP',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    )
  }
];

const Contact = () => {
  const { categories } = useProducts();
  const [formData, setFormData] = useState({
    contactName: '',
    email: '',
    companyName: '',
    phone: '',
    product: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear status when user starts typing again
    if (submitStatus.message) {
      setSubmitStatus({ type: '', message: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      await inquiryAPI.submit({
        contactName: formData.contactName,
        email: formData.email,
        companyName: formData.companyName || undefined,
        phone: formData.phone || undefined,
        subject: formData.product ? `Product Inquiry: ${formData.product}` : 'General Inquiry',
        message: formData.message,
        inquiryType: 'GENERAL',
      });

      setSubmitStatus({
        type: 'success',
        message: 'Thank you for your inquiry. We will get back to you soon!'
      });
      // Reset form
      setFormData({
        contactName: '',
        email: '',
        companyName: '',
        phone: '',
        product: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Failed to submit inquiry. Please try again or contact us directly.'
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
          <div className="page-label">Contact Us</div>
          <h1 className="page-title">Get In Touch</h1>
          <p className="page-desc">
            Have questions or need a custom enclosure solution? Our team is ready to help.
          </p>
        </div>
      </section>

      <section className="contact-page">
        <div className="contact-page-inner">
          <div className="contact-info-section">
            <h2>Contact Information</h2>
            <p className="contact-intro">
              Grasp Electric Private Limited - India's leading manufacturer of Thermoplastic & Polycarbonate enclosures. Serving industries for over two decades.
            </p>
            <div className="contact-info-grid">
              {contactInfo.map((info, index) => (
                <div key={index} className="contact-info-item">
                  <div className="contact-info-icon">{info.icon}</div>
                  <div className="contact-info-content">
                    <h3>{info.title}</h3>
                    <p>{info.content}</p>
                    {info.link && (
                      <a href={info.link} target={info.link.startsWith('http') ? '_blank' : undefined} rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined} className="contact-info-link">
                        {info.linkText || info.content}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="contact-form-section">
            <h2>Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contactName">Full Name *</label>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="companyName">Company Name</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Your company"
                  />
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
              <div className="form-group">
                <label htmlFor="product">Product Interest</label>
                <select
                  id="product"
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                >
                  <option value="">Select a product range</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                  <option value="Custom Solutions">Custom Solutions</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your requirements..."
                  rows="5"
                  required
                ></textarea>
              </div>
              {submitStatus.message && (
                <div className={`form-status ${submitStatus.type}`}>
                  {submitStatus.message}
                </div>
              )}
              <button type="submit" className="form-submit" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Message'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Contact;
