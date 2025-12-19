const categories = [
  {
    id: 1,
    code: 'GE-PC Series',
    name: 'Polycarbonate Enclosures',
    desc: 'UV-stabilized transparent and opaque enclosures designed for HMI panels and outdoor applications.',
    specs: ['IP67', 'UL94 V-0']
  },
  {
    id: 2,
    code: 'GE-MT Series',
    name: 'Metal Enclosures',
    desc: 'Powder-coated steel and aluminum enclosures engineered for harsh industrial environments.',
    specs: ['IP65', 'IK10']
  },
  {
    id: 3,
    code: 'GE-JB Series',
    name: 'Junction Boxes',
    desc: 'Multi-entry junction boxes with DIN rail compatibility for flexible wiring configurations.',
    specs: ['IP66', 'Modular']
  },
  {
    id: 4,
    code: 'GE-TB Series',
    name: 'Terminal Enclosures',
    desc: 'Specialized enclosures for terminal blocks and distribution systems with rail mounting.',
    specs: ['IP65', 'Rail Mount']
  },
  {
    id: 5,
    code: 'GE-HZ Series',
    name: 'Hazardous Area',
    desc: 'ATEX and IECEx certified enclosures designed for explosive and hazardous atmospheres.',
    specs: ['Zone 1/2', 'ATEX']
  },
  {
    id: 6,
    code: 'GE-CS Series',
    name: 'Custom Solutions',
    desc: 'Tailored enclosure designs with CNC precision cutting and custom modifications.',
    specs: ['CAD Support', 'Prototyping']
  }
];

const ProductCategories = () => {
  const renderCategorySVG = (id) => {
    switch (id) {
      case 1:
        return (
          <svg viewBox="0 0 120 120">
            <g transform="translate(20, 15)">
              <rect x="10" y="15" width="60" height="80" stroke="currentColor" fill="none" />
              <path d="M70 15 L80 5 L80 85 L70 95" stroke="currentColor" fill="none" />
              <path d="M10 15 L20 5 L80 5 L70 15" stroke="currentColor" fill="none" />
              <circle cx="12" cy="35" r="3" fill="currentColor" />
              <circle cx="12" cy="55" r="3" fill="currentColor" />
              <circle cx="12" cy="75" r="3" fill="currentColor" />
            </g>
          </svg>
        );
      case 2:
        return (
          <svg viewBox="0 0 120 120">
            <g transform="translate(20, 20)">
              <rect x="10" y="10" width="60" height="70" stroke="currentColor" fill="none" />
              <path d="M70 10 L80 0 L80 60 L70 80" stroke="currentColor" fill="none" />
              <rect x="18" y="20" width="14" height="22" fill="currentColor" opacity="0.3" />
              <rect x="36" y="20" width="14" height="22" fill="currentColor" opacity="0.3" />
              <rect x="54" y="20" width="10" height="22" fill="currentColor" opacity="0.3" />
            </g>
          </svg>
        );
      case 3:
        return (
          <svg viewBox="0 0 120 120">
            <g transform="translate(25, 25)">
              <rect x="10" y="15" width="50" height="50" stroke="currentColor" fill="none" />
              <path d="M60 15 L70 5 L70 55 L60 65" stroke="currentColor" fill="none" />
              <circle cx="20" cy="70" r="5" stroke="currentColor" fill="none" />
              <circle cx="35" cy="70" r="5" stroke="currentColor" fill="none" />
              <circle cx="50" cy="70" r="5" stroke="currentColor" fill="none" />
            </g>
          </svg>
        );
      case 4:
        return (
          <svg viewBox="0 0 120 120">
            <g transform="translate(30, 10)">
              <rect x="10" y="10" width="40" height="90" stroke="currentColor" fill="none" />
              <path d="M50 10 L60 0 L60 80 L50 100" stroke="currentColor" fill="none" />
              <rect x="15" y="22" width="30" height="6" fill="currentColor" opacity="0.5" />
              <rect x="15" y="36" width="30" height="6" fill="currentColor" opacity="0.3" />
              <rect x="15" y="50" width="30" height="6" fill="currentColor" opacity="0.3" />
              <rect x="15" y="64" width="30" height="6" fill="currentColor" opacity="0.3" />
            </g>
          </svg>
        );
      case 5:
        return (
          <svg viewBox="0 0 120 120">
            <g transform="translate(25, 20)">
              <rect x="10" y="15" width="50" height="55" stroke="currentColor" fill="none" />
              <path d="M60 15 L70 5 L70 60 L60 70" stroke="currentColor" fill="none" />
              <circle cx="35" cy="42" r="14" stroke="currentColor" fill="none" />
              <line x1="35" y1="24" x2="35" y2="30" stroke="currentColor" />
              <line x1="35" y1="54" x2="35" y2="60" stroke="currentColor" />
              <line x1="17" y1="42" x2="23" y2="42" stroke="currentColor" />
              <line x1="47" y1="42" x2="53" y2="42" stroke="currentColor" />
            </g>
          </svg>
        );
      case 6:
        return (
          <svg viewBox="0 0 120 120">
            <g transform="translate(15, 15)">
              <rect x="10" y="10" width="70" height="80" stroke="currentColor" fill="none" />
              <path d="M80 10 L90 0 L90 70 L80 90" stroke="currentColor" fill="none" />
              <line x1="20" y1="30" x2="70" y2="30" stroke="currentColor" />
              <line x1="20" y1="50" x2="70" y2="50" stroke="currentColor" />
              <line x1="20" y1="70" x2="70" y2="70" stroke="currentColor" />
              <rect x="72" y="40" width="5" height="20" fill="currentColor" opacity="0.5" />
            </g>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section className="categories-section" id="categories">
      <div className="categories-inner">
        <div className="categories-header">
          <div className="categories-label">Our Products</div>
          <h2 className="categories-title">Product <span>Categories</span></h2>
          <p className="categories-subtitle">
            Explore our comprehensive range of industrial enclosure solutions designed
            for demanding environments and critical applications.
          </p>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-image">
                {renderCategorySVG(category.id)}
              </div>
              <div className="category-code">{category.code}</div>
              <h3 className="category-name">{category.name}</h3>
              <p className="category-desc">{category.desc}</p>
              <div className="category-specs">
                {category.specs.map((spec, index) => (
                  <span key={index} className="category-spec">{spec}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
