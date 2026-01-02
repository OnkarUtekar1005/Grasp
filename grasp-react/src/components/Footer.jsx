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
              <p><strong>Phone:</strong> +91 98711 91712</p>
              <p><strong>Email:</strong> info@graspelectric.com</p>
              <p><strong>Website:</strong> www.graspelectric.com</p>
              <p><strong>GSTIN:</strong> 08AAGCG5190C1ZP</p>
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
            <Link to="/gallery">Gallery</Link>
            <Link to="/downloads">Downloads</Link>
          </div>
          <div className="footer-col">
            <h4>Address</h4>
            <div className="footer-address">
              <span className="address-label">Grasp Electric Private Limited</span>
              <span>F-56-57, RIICO Industrial Area</span>
              <span>Chopanki, Bhiwadi</span>
              <span>Dist. Alwar, Rajasthan - 301019</span>
              <a
                href="https://goo.gl/maps/HvwnsCeBfqYUq49j9"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-map-link"
              >
                View on Google Maps
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2025 Grasp Electric Private Limited</span>
          <span>GSTIN: 08AAGCG5190C1ZP | 100% Made in India</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
