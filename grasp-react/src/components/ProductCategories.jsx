import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI, BACKEND_URL } from '../services';

const ProductCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAll();
        // Only show first 6 categories on homepage
        const allCategories = response.data || [];
        setCategories(allCategories.slice(0, 6));
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const renderCategorySVG = (index) => {
    const svgs = [
      <svg viewBox="0 0 120 120" key="svg1">
        <g transform="translate(20, 15)">
          <rect x="10" y="15" width="60" height="80" stroke="currentColor" fill="none" />
          <path d="M70 15 L80 5 L80 85 L70 95" stroke="currentColor" fill="none" />
          <path d="M10 15 L20 5 L80 5 L70 15" stroke="currentColor" fill="none" />
          <circle cx="12" cy="35" r="3" fill="currentColor" />
          <circle cx="12" cy="55" r="3" fill="currentColor" />
          <circle cx="12" cy="75" r="3" fill="currentColor" />
        </g>
      </svg>,
      <svg viewBox="0 0 120 120" key="svg2">
        <g transform="translate(20, 20)">
          <rect x="10" y="10" width="60" height="70" stroke="currentColor" fill="none" />
          <path d="M70 10 L80 0 L80 60 L70 80" stroke="currentColor" fill="none" />
          <rect x="18" y="20" width="14" height="22" fill="currentColor" opacity="0.3" />
          <rect x="36" y="20" width="14" height="22" fill="currentColor" opacity="0.3" />
          <rect x="54" y="20" width="10" height="22" fill="currentColor" opacity="0.3" />
        </g>
      </svg>,
      <svg viewBox="0 0 120 120" key="svg3">
        <g transform="translate(25, 25)">
          <rect x="10" y="15" width="50" height="50" stroke="currentColor" fill="none" />
          <path d="M60 15 L70 5 L70 55 L60 65" stroke="currentColor" fill="none" />
          <circle cx="20" cy="70" r="5" stroke="currentColor" fill="none" />
          <circle cx="35" cy="70" r="5" stroke="currentColor" fill="none" />
          <circle cx="50" cy="70" r="5" stroke="currentColor" fill="none" />
        </g>
      </svg>,
      <svg viewBox="0 0 120 120" key="svg4">
        <g transform="translate(30, 10)">
          <rect x="10" y="10" width="40" height="90" stroke="currentColor" fill="none" />
          <path d="M50 10 L60 0 L60 80 L50 100" stroke="currentColor" fill="none" />
          <rect x="15" y="22" width="30" height="6" fill="currentColor" opacity="0.5" />
          <rect x="15" y="36" width="30" height="6" fill="currentColor" opacity="0.3" />
          <rect x="15" y="50" width="30" height="6" fill="currentColor" opacity="0.3" />
          <rect x="15" y="64" width="30" height="6" fill="currentColor" opacity="0.3" />
        </g>
      </svg>,
      <svg viewBox="0 0 120 120" key="svg5">
        <g transform="translate(25, 20)">
          <rect x="10" y="15" width="50" height="55" stroke="currentColor" fill="none" />
          <path d="M60 15 L70 5 L70 60 L60 70" stroke="currentColor" fill="none" />
          <circle cx="35" cy="42" r="14" stroke="currentColor" fill="none" />
          <line x1="35" y1="24" x2="35" y2="30" stroke="currentColor" />
          <line x1="35" y1="54" x2="35" y2="60" stroke="currentColor" />
          <line x1="17" y1="42" x2="23" y2="42" stroke="currentColor" />
          <line x1="47" y1="42" x2="53" y2="42" stroke="currentColor" />
        </g>
      </svg>,
      <svg viewBox="0 0 120 120" key="svg6">
        <g transform="translate(15, 15)">
          <rect x="10" y="10" width="70" height="80" stroke="currentColor" fill="none" />
          <path d="M80 10 L90 0 L90 70 L80 90" stroke="currentColor" fill="none" />
          <line x1="20" y1="30" x2="70" y2="30" stroke="currentColor" />
          <line x1="20" y1="50" x2="70" y2="50" stroke="currentColor" />
          <line x1="20" y1="70" x2="70" y2="70" stroke="currentColor" />
          <rect x="72" y="40" width="5" height="20" fill="currentColor" opacity="0.5" />
        </g>
      </svg>
    ];
    return svgs[index % svgs.length];
  };

  if (loading) {
    return (
      <section className="categories-section" id="categories">
        <div className="categories-inner">
          <div className="categories-header">
            <div className="categories-label">Our Products</div>
            <h2 className="categories-title">Product <span>Ranges</span></h2>
          </div>
          <div className="categories-loading">Loading product ranges...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="categories-section" id="categories">
      <div className="categories-inner">
        <div className="categories-header">
          <div className="categories-label">Our Products</div>
          <h2 className="categories-title">Product <span>Ranges</span></h2>
          <p className="categories-subtitle">
            Explore our comprehensive range of industrial enclosure solutions designed
            for demanding environments and critical applications.
          </p>
        </div>

        <div className="categories-grid">
          {categories.map((category, index) => (
            <Link
              to={`/products?category=${category.slug}`}
              key={category.id}
              className="category-card"
            >
              <div className="category-image">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl.startsWith('http') ? category.imageUrl : `${BACKEND_URL}${category.imageUrl}`}
                    alt={category.name}
                  />
                ) : (
                  renderCategorySVG(index)
                )}
              </div>
              <div className="category-code">{category.code}</div>
              <h3 className="category-name">{category.name}</h3>
              <p className="category-desc">{category.description}</p>
              <div className="category-specs">
                {category.specs?.map((spec, idx) => (
                  <span key={spec.id || idx} className="category-spec">
                    {spec.specValue || spec}
                  </span>
                ))}
              </div>
              <span className="category-link">
                View Products
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
