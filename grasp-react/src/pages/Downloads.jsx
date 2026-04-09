import { useState, useEffect } from 'react';
import { Navbar, Footer } from '../components';
import { downloadAPI, BACKEND_URL } from '../services';

const Downloads = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [allDownloads, setAllDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      setLoading(true);
      const response = await downloadAPI.getAll();
      const data = response.data || [];
      setCategories(data);
      // Flatten all downloads with category info
      const flat = data.flatMap(cat =>
        cat.downloads.map(d => ({ ...d, categorySlug: cat.slug, categoryIcon: cat.icon }))
      );
      setAllDownloads(flat);
    } catch (error) {
      console.error('Failed to fetch downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDownloads = activeCategory === 'all'
    ? allDownloads
    : allDownloads.filter(d => d.categorySlug === activeCategory);

  const getFileType = (url) => {
    if (!url) return 'FILE';
    const ext = url.split('.').pop().split('?')[0].toUpperCase();
    return ext || 'FILE';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
          {loading ? (
            <div className="downloads-loading">
              <div className="loading-spinner"></div>
              <p>Loading downloads...</p>
            </div>
          ) : allDownloads.length === 0 ? (
            <div className="downloads-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p>No downloads available at this time.</p>
            </div>
          ) : (
            <>
              {/* Category Filter */}
              <div className="downloads-filter">
                <button
                  className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('all')}
                >
                  All Downloads
                  <span className="filter-count">{allDownloads.length}</span>
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`filter-btn ${activeCategory === cat.slug ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.slug)}
                  >
                    {cat.name}
                    <span className="filter-count">{cat.downloads.length}</span>
                  </button>
                ))}
              </div>

              {/* Downloads Grid */}
              <div className="downloads-grid">
                {filteredDownloads.map(item => (
                  <div key={item.id} className="download-card">
                    <div className="download-icon">
                      {getIcon(item.categoryIcon)}
                    </div>
                    <div className="download-content">
                      <h3 className="download-title">{item.name}</h3>
                      {item.description && (
                        <p className="download-desc">{item.description}</p>
                      )}
                      <div className="download-meta">
                        <span className="file-type">{getFileType(item.documentUrl)}</span>
                        {item.fileSizeBytes && (
                          <span className="file-size">{formatFileSize(item.fileSizeBytes)}</span>
                        )}
                      </div>
                    </div>
                    <a
                      href={item.documentUrl.startsWith('http') ? item.documentUrl : `${BACKEND_URL}${item.documentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-btn"
                      download
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}

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
