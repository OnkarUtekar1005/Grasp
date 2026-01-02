import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/images/logo.png';

const Navbar = ({ isVisible }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`nav ${isVisible ? 'visible' : ''}`}>
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
          <Link to="/contact" className="nav-cta">Get Quote</Link>
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
};

export default Navbar;
