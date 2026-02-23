import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import { BACKEND_URL } from '../services';

const Navbar = ({ isVisible }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [downloadingCatalog, setDownloadingCatalog] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const downloadCatalog = async () => {
    if (downloadingCatalog) return;
    setDownloadingCatalog(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/pdf/catalog`);
      if (!response.ok) throw new Error('Failed to generate catalog');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Grasp-Electric-Catalog.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Catalog download failed:', error);
      alert('Failed to download catalog. Please try again.');
    } finally {
      setDownloadingCatalog(false);
    }
  };

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
          <button onClick={downloadCatalog} className="nav-cta" disabled={downloadingCatalog}>
            {downloadingCatalog ? 'Downloading...' : 'Download Catalog'}
          </button>
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
