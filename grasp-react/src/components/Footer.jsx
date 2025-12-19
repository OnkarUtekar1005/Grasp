import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-about">
            <div className="footer-brand">GRASP ELECTRIC</div>
            <p className="footer-desc">
              India's leading manufacturer housing the country's largest range of Thermoplastic & Polycarbonate enclosures. Serving industries for over two decades.
            </p>
            <div className="footer-contact-quick">
              <p><strong>Email:</strong> info@graspelectric.com</p>
              <p><strong>Phone:</strong> +91 9643409644</p>
            </div>
          </div>
          <div className="footer-col">
            <h4>Products</h4>
            <Link to="/products/category/hinged-enclosures">Hinged Enclosures</Link>
            <Link to="/products/category/modular-enclosures">Modular Panel Enclosures</Link>
            <Link to="/products/category/junction-boxes">Junction Boxes</Link>
            <Link to="/products/category/distribution-boxes">Distribution Boxes</Link>
            <Link to="/products">All Products</Link>
          </div>
          <div className="footer-col">
            <h4>Industries</h4>
            <span>Solar</span>
            <span>Electrical</span>
            <span>Electronics</span>
            <span>Automation</span>
            <span>Chemical</span>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/products">Products</Link>
          </div>
          <div className="footer-col">
            <h4>Locations</h4>
            <div className="footer-address">
              <span className="address-label">Corporate Office:</span>
              <span>Plot 180, Sector 8, IMT Manesar</span>
              <span>Gurgaon - 122051</span>
            </div>
            <div className="footer-address">
              <span className="address-label">Sales Office:</span>
              <span>62 Rama Road, Najafgarh Road</span>
              <span>New Delhi - 110015</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2025 Grasp Electric Pvt. Ltd. (Formerly Maharaja Plastic Industries)</span>
          <span>100% Made in India | UL, CPRI, NABL Tested</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
