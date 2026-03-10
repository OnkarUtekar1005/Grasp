import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/images/logo.png';

const Navbar = forwardRef(({ isVisible }, ref) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Support prop-based visibility (other pages pass isVisible={true})
  useEffect(() => {
    if (isVisible !== undefined && navRef.current) {
      navRef.current.classList.toggle('visible', isVisible);
    }
  }, [isVisible]);

  // Support ref-based visibility (Home page uses imperative handle)
  useImperativeHandle(ref, () => ({
    setVisible(visible) {
      if (navRef.current) {
        navRef.current.classList.toggle('visible', visible);
      }
    }
  }));

  return (
    <nav className="nav" ref={navRef}>
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <img src={logo} alt="Grasp Electric" />
        </Link>
        <div className={`nav-center ${isMenuOpen ? 'open' : ''}`}>
          <div className="nav-links">
            <Link to="/products" className={isActive('/products') ? 'active' : ''}>Products</Link>
            <Link to="/gallery" className={isActive('/gallery') ? 'active' : ''}>Gallery</Link>
            <Link to="/downloads" className={isActive('/downloads') ? 'active' : ''}>Downloads</Link>
            <Link to="/about" className={isActive('/about') ? 'active' : ''}>About Us</Link>
            <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>Contact</Link>
          </div>
        </div>
        <div className="nav-right">
          <a href="/Grasp-Catalogue-2026.pdf" download="Grasp-Catalogue-2026.pdf" className="nav-cta">
            Download Catalog
          </a>
        </div>
        <button
          className="nav-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
