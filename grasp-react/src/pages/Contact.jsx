import { useState } from 'react';
import { Navbar, Footer } from '../components';
import { inquiryAPI } from '../services';
import { useProducts } from '../contexts';

const contactInfo = [
  {
    title: 'Our Offices',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    addresses: [
      {
        label: 'Factory & Registered Office',
        content: 'F-56-57, RIICO Industrial Area\nChopanki, Bhiwadi\nDist. Alwar, Rajasthan - 301019',
        phone: '+91 98711 91712',
        link: 'https://goo.gl/maps/HvwnsCeBfqYUq49j9',
        linkText: 'View on Google Maps',
      },
      {
        label: 'Sales & Marketing Office',
        content: '62 Rama Road, Najafgarh Road Industrial Area\nNew Delhi, 110015, INDIA',
        phones: ['+91 9643409645', '+91 9643409646'],
      },
    ],
  },
  {
    title: 'Email',
    emails: [
      { address: 'info@graspelectric.com', label: 'Domestic Enquiries' },
      { address: 'export@graspelectric.com', label: 'International Enquiries' },
      { address: 'help@graspelectric.com', label: 'Customer Care' },
    ],
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    title: 'Website',
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    link: 'https://www.graspelectric.com',
    linkText: 'www.graspelectric.com'
  },
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
                    {info.content && <p>{info.content}</p>}
                    {info.addresses && (
                      <div className="contact-addresses">
                        {info.addresses.map((addr, i) => (
                          <div key={i} className="contact-address-block">
                            <h4>{addr.label}</h4>
                            <p>{addr.content}</p>
                            <div className="contact-info-phone">
                              {addr.phone && <a href={`tel:${addr.phone.replace(/\s/g, '')}`}>{addr.phone}</a>}
                              {addr.phones?.map((num, j) => (
                                <a key={j} href={`tel:${num.replace(/\s/g, '')}`}>{num}</a>
                              ))}
                            </div>
                            {addr.link && (
                              <a href={addr.link} target="_blank" rel="noopener noreferrer" className="contact-info-link">
                                {addr.linkText || 'View on Map'}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {info.emails && (
                      <div className="contact-info-emails">
                        {info.emails.map((email, i) => (
                          <div key={i} className="contact-email-row">
                            <a href={`mailto:${email.address}`}>{email.address}</a>
                            <span className="contact-email-label">{email.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
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

      <section className="contact-map-section">
        <div className="contact-map-inner">
          <h2>Find Us</h2>
          <div className="contact-maps-grid">
            <div className="contact-map-block">
              <h4>Factory & Registered Office</h4>
              <div className="contact-map-embed">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3521.7!2d76.82!3d27.88!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sF-56-57%2C%20RIICO%20Industrial%20Area%2C%20Chopanki%2C%20Bhiwadi%2C%20Rajasthan%20301019!5e0!3m2!1sen!2sin!4v1700000000000"
                  width="100%"
                  height="300"
                  style={{ border: 0, borderRadius: '12px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Grasp Electric Factory - Bhiwadi, Rajasthan"
                ></iframe>
              </div>
            </div>
            <div className="contact-map-block">
              <h4>Sales & Marketing Office</h4>
              <div className="contact-map-embed">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.5!2d77.15!3d28.65!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s62%20Rama%20Road%2C%20Najafgarh%20Road%20Industrial%20Area%2C%20New%20Delhi%20110015!5e0!3m2!1sen!2sin!4v1700000000000"
                  width="100%"
                  height="300"
                  style={{ border: 0, borderRadius: '12px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Grasp Electric Sales Office - New Delhi"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Contact;
