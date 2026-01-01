import { useState } from 'react';
import { Navbar, Footer } from '../components';

const Downloads = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Downloads' },
    { id: 'catalogs', name: 'Product Catalogs' },
    { id: 'datasheets', name: 'Data Sheets' },
    { id: 'certificates', name: 'Certificates' },
    { id: 'manuals', name: 'Installation Manuals' }
  ];

  const downloads = [
    {
      id: 1,
      title: 'Complete Product Catalog 2024',
      description: 'Comprehensive catalog featuring our entire range of industrial enclosures, junction boxes, and accessories.',
      category: 'catalogs',
      fileType: 'PDF',
      fileSize: '12.5 MB',
      icon: 'catalog'
    },
    {
      id: 2,
      title: 'Polycarbonate Enclosures Catalog',
      description: 'Detailed specifications and dimensions for all polycarbonate enclosure models.',
      category: 'catalogs',
      fileType: 'PDF',
      fileSize: '8.2 MB',
      icon: 'catalog'
    },
    {
      id: 3,
      title: 'ABS Enclosures Catalog',
      description: 'Complete range of ABS enclosures with technical specifications and ordering information.',
      category: 'catalogs',
      fileType: 'PDF',
      fileSize: '6.8 MB',
      icon: 'catalog'
    },
    {
      id: 4,
      title: 'Junction Box Technical Datasheet',
      description: 'Technical specifications, IP ratings, and dimensional drawings for junction boxes.',
      category: 'datasheets',
      fileType: 'PDF',
      fileSize: '2.1 MB',
      icon: 'datasheet'
    },
    {
      id: 5,
      title: 'Terminal Enclosure Specifications',
      description: 'Detailed technical data for terminal enclosures including material properties.',
      category: 'datasheets',
      fileType: 'PDF',
      fileSize: '1.8 MB',
      icon: 'datasheet'
    },
    {
      id: 6,
      title: 'IP Rating Test Certificates',
      description: 'IP65, IP66, and IP67 ingress protection test certificates from accredited laboratories.',
      category: 'certificates',
      fileType: 'PDF',
      fileSize: '3.5 MB',
      icon: 'certificate'
    },
    {
      id: 7,
      title: 'UL Certification Documents',
      description: 'UL94 flammability test certificates and compliance documentation.',
      category: 'certificates',
      fileType: 'PDF',
      fileSize: '2.2 MB',
      icon: 'certificate'
    },
    {
      id: 8,
      title: 'NABL Test Reports',
      description: 'Laboratory test reports from NABL accredited testing facilities.',
      category: 'certificates',
      fileType: 'PDF',
      fileSize: '4.1 MB',
      icon: 'certificate'
    },
    {
      id: 9,
      title: 'Enclosure Installation Guide',
      description: 'Step-by-step installation instructions for wall-mount and pole-mount enclosures.',
      category: 'manuals',
      fileType: 'PDF',
      fileSize: '1.5 MB',
      icon: 'manual'
    },
    {
      id: 10,
      title: 'Mounting Accessories Guide',
      description: 'Installation guide for mounting plates, brackets, and DIN rails.',
      category: 'manuals',
      fileType: 'PDF',
      fileSize: '980 KB',
      icon: 'manual'
    }
  ];

  const filteredDownloads = activeCategory === 'all'
    ? downloads
    : downloads.filter(d => d.category === activeCategory);

  const getIcon = (type) => {
    switch (type) {
      case 'catalog':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <line x1="8" y1="7" x2="16" y2="7" />
            <line x1="8" y1="11" x2="16" y2="11" />
            <line x1="8" y1="15" x2="12" y2="15" />
          </svg>
        );
      case 'datasheet':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        );
      case 'certificate':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
          </svg>
        );
      case 'manual':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        );
    }
  };

  return (
    <>
      <Navbar isVisible={true} />

      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="page-label">Resources</div>
          <h1 className="page-title">Downloads</h1>
          <p className="page-desc">
            Access our product catalogs, technical datasheets, certificates, and installation guides.
          </p>
        </div>
      </section>

      <section className="downloads-section">
        <div className="downloads-inner">
          {/* Category Filter */}
          <div className="downloads-filter">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
                <span className="filter-count">
                  {cat.id === 'all' ? downloads.length : downloads.filter(d => d.category === cat.id).length}
                </span>
              </button>
            ))}
          </div>

          {/* Downloads Grid */}
          <div className="downloads-grid">
            {filteredDownloads.map(item => (
              <div key={item.id} className="download-card">
                <div className="download-icon">
                  {getIcon(item.icon)}
                </div>
                <div className="download-content">
                  <h3 className="download-title">{item.title}</h3>
                  <p className="download-desc">{item.description}</p>
                  <div className="download-meta">
                    <span className="file-type">{item.fileType}</span>
                    <span className="file-size">{item.fileSize}</span>
                  </div>
                </div>
                <button className="download-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download
                </button>
              </div>
            ))}
          </div>

          {/* Request Custom Documents */}
          <div className="downloads-cta">
            <div className="downloads-cta-content">
              <h3>Need Custom Documentation?</h3>
              <p>Contact us for specific product datasheets, custom drawings, or certification documents.</p>
            </div>
            <a href="/contact" className="btn-primary">
              Request Documents
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Downloads;
