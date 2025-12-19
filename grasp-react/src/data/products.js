// Product Categories Data
export const categoriesData = [
  {
    id: 1,
    name: 'Polycarbonate Enclosures',
    slug: 'polycarbonate-enclosures',
    code: 'GE-PC Series',
    description: 'UV-stabilized transparent and opaque enclosures designed for HMI panels and outdoor applications.',
    image: '/images/categories/polycarbonate.jpg',
    specs: ['IP67', 'UL94 V-0'],
    featured: true
  },
  {
    id: 2,
    name: 'Metal Enclosures',
    slug: 'metal-enclosures',
    code: 'GE-MT Series',
    description: 'Powder-coated steel and aluminum enclosures engineered for harsh industrial environments.',
    image: '/images/categories/metal.jpg',
    specs: ['IP65', 'IK10'],
    featured: true
  },
  {
    id: 3,
    name: 'Junction Boxes',
    slug: 'junction-boxes',
    code: 'GE-JB Series',
    description: 'Multi-entry junction boxes with DIN rail compatibility for flexible wiring configurations.',
    image: '/images/categories/junction.jpg',
    specs: ['IP66', 'Modular'],
    featured: true
  },
  {
    id: 4,
    name: 'Terminal Enclosures',
    slug: 'terminal-enclosures',
    code: 'GE-TB Series',
    description: 'Specialized enclosures for terminal blocks and distribution systems with rail mounting.',
    image: '/images/categories/terminal.jpg',
    specs: ['IP65', 'Rail Mount'],
    featured: false
  },
  {
    id: 5,
    name: 'Hazardous Area Enclosures',
    slug: 'hazardous-area',
    code: 'GE-HZ Series',
    description: 'ATEX and IECEx certified enclosures designed for explosive and hazardous atmospheres.',
    image: '/images/categories/hazardous.jpg',
    specs: ['Zone 1/2', 'ATEX'],
    featured: true
  },
  {
    id: 6,
    name: 'Custom Solutions',
    slug: 'custom-solutions',
    code: 'GE-CS Series',
    description: 'Tailored enclosure designs with CNC precision cutting and custom modifications.',
    image: '/images/categories/custom.jpg',
    specs: ['CAD Support', 'Prototyping'],
    featured: false
  }
];

// Products Data
export const productsData = [
  // Polycarbonate Enclosures
  {
    id: 101,
    categoryId: 1,
    name: 'GE-PC-100 Clear Door Enclosure',
    slug: 'ge-pc-100-clear-door',
    code: 'GE-PC-100',
    description: 'Compact polycarbonate enclosure with clear door for visual monitoring of internal components.',
    fullDescription: `The GE-PC-100 is a premium polycarbonate enclosure featuring a crystal-clear door that allows for easy visual inspection of internal components without opening the unit.

    Designed for indoor and outdoor applications, this enclosure offers excellent UV resistance and maintains clarity even after prolonged sun exposure. The high-impact polycarbonate construction ensures durability while remaining lightweight for easy installation.

    Perfect for HMI panels, PLCs, and other electronic equipment that requires visual monitoring.`,
    price: 2500,
    specs: {
      material: 'Polycarbonate (PC)',
      protection: 'IP67',
      flammability: 'UL94 V-0',
      dimensions: '200 x 150 x 100 mm',
      color: 'Grey RAL 7035',
      doorType: 'Clear Polycarbonate',
      mounting: 'Wall Mount',
      temperature: '-40°C to +80°C'
    },
    features: [
      'UV stabilized material',
      'Clear door for visual inspection',
      'Stainless steel hinges',
      'Pre-formed mounting holes',
      'Gasket seal included',
      'Lockable latches'
    ],
    images: [
      '/images/products/ge-pc-100-1.jpg',
      '/images/products/ge-pc-100-2.jpg',
      '/images/products/ge-pc-100-3.jpg'
    ],
    documents: [
      { name: 'Datasheet', url: '/docs/ge-pc-100-datasheet.pdf' },
      { name: 'Installation Guide', url: '/docs/ge-pc-100-install.pdf' }
    ],
    featured: true,
    inStock: true,
    createdAt: '2024-01-15'
  },
  {
    id: 102,
    categoryId: 1,
    name: 'GE-PC-200 Large Format Enclosure',
    slug: 'ge-pc-200-large-format',
    code: 'GE-PC-200',
    description: 'Large polycarbonate enclosure for bigger installations requiring maximum protection.',
    fullDescription: `The GE-PC-200 offers generous internal space for larger installations while maintaining the superior protection standards of our polycarbonate series.`,
    price: 4500,
    specs: {
      material: 'Polycarbonate (PC)',
      protection: 'IP67',
      flammability: 'UL94 V-0',
      dimensions: '400 x 300 x 200 mm',
      color: 'Grey RAL 7035',
      doorType: 'Opaque/Clear Options',
      mounting: 'Wall/Floor Mount',
      temperature: '-40°C to +80°C'
    },
    features: [
      'Extra large internal space',
      'Multiple cable entry options',
      'DIN rail compatible',
      'Modular design',
      'UV stabilized',
      'Impact resistant'
    ],
    images: ['/images/products/ge-pc-200-1.jpg'],
    documents: [],
    featured: false,
    inStock: true,
    createdAt: '2024-01-20'
  },

  // Metal Enclosures
  {
    id: 201,
    categoryId: 2,
    name: 'GE-MT-100 Steel Wall Mount',
    slug: 'ge-mt-100-steel-wall',
    code: 'GE-MT-100',
    description: 'Heavy-duty steel enclosure with powder coating for industrial environments.',
    fullDescription: `The GE-MT-100 is built for demanding industrial applications where durability is paramount. Constructed from cold-rolled steel with a high-quality powder coat finish, this enclosure provides excellent protection against corrosion and physical impact.`,
    price: 3500,
    specs: {
      material: 'Cold Rolled Steel (CRS)',
      protection: 'IP65',
      impact: 'IK10',
      dimensions: '300 x 250 x 150 mm',
      color: 'Grey RAL 7032',
      thickness: '1.5mm',
      mounting: 'Wall Mount',
      temperature: '-25°C to +60°C'
    },
    features: [
      'Powder coated finish',
      'Removable mounting plate',
      'Foam gasket seal',
      'Stainless steel hardware',
      'Knockouts provided',
      'Earthing stud included'
    ],
    images: ['/images/products/ge-mt-100-1.jpg'],
    documents: [],
    featured: true,
    inStock: true,
    createdAt: '2024-02-01'
  },

  // Junction Boxes
  {
    id: 301,
    categoryId: 3,
    name: 'GE-JB-100 Multi-Entry Junction Box',
    slug: 'ge-jb-100-multi-entry',
    code: 'GE-JB-100',
    description: 'Versatile junction box with multiple cable entries for complex wiring requirements.',
    fullDescription: `The GE-JB-100 is designed for applications requiring multiple cable entries and flexible internal configurations. Features pre-formed knockouts on all sides for maximum installation flexibility.`,
    price: 1800,
    specs: {
      material: 'ABS/Polycarbonate',
      protection: 'IP66',
      dimensions: '150 x 150 x 90 mm',
      entries: '8 x M20, 4 x M25',
      mounting: 'Surface Mount',
      temperature: '-25°C to +60°C'
    },
    features: [
      'Multiple entry points',
      'DIN rail compatible',
      'Terminal block ready',
      'Easy cable management',
      'Hinged cover option',
      'Transparent lid available'
    ],
    images: ['/images/products/ge-jb-100-1.jpg'],
    documents: [],
    featured: false,
    inStock: true,
    createdAt: '2024-02-15'
  },

  // Terminal Enclosures
  {
    id: 401,
    categoryId: 4,
    name: 'GE-TB-100 Terminal Block Enclosure',
    slug: 'ge-tb-100-terminal-block',
    code: 'GE-TB-100',
    description: 'Compact enclosure optimized for terminal block installations.',
    fullDescription: `Purpose-built for terminal block applications, the GE-TB-100 features integrated DIN rail mounting and optimized internal dimensions for efficient cable termination.`,
    price: 2200,
    specs: {
      material: 'Polycarbonate',
      protection: 'IP65',
      dimensions: '200 x 120 x 75 mm',
      railSize: '35mm DIN Rail',
      mounting: 'Rail/Wall Mount',
      temperature: '-25°C to +70°C'
    },
    features: [
      'Integrated DIN rail',
      'Terminal block optimized',
      'Clear marking areas',
      'Quick release cover',
      'Cable strain relief',
      'Modular expansion'
    ],
    images: ['/images/products/ge-tb-100-1.jpg'],
    documents: [],
    featured: false,
    inStock: true,
    createdAt: '2024-03-01'
  },

  // Hazardous Area
  {
    id: 501,
    categoryId: 5,
    name: 'GE-HZ-100 ATEX Zone 1 Enclosure',
    slug: 'ge-hz-100-atex-zone1',
    code: 'GE-HZ-100',
    description: 'ATEX certified enclosure for use in hazardous Zone 1 and Zone 2 areas.',
    fullDescription: `The GE-HZ-100 is fully certified for use in explosive atmospheres. ATEX and IECEx certified for Zone 1 and Zone 2 applications, this enclosure meets the stringent requirements for hazardous area installations.`,
    price: 12500,
    specs: {
      material: 'GRP/Stainless Steel',
      protection: 'IP66',
      certification: 'ATEX II 2 GD, IECEx',
      zone: 'Zone 1, Zone 2, Zone 21, Zone 22',
      dimensions: '300 x 250 x 150 mm',
      temperature: '-50°C to +65°C'
    },
    features: [
      'ATEX certified',
      'IECEx certified',
      'Flameproof design',
      'Increased safety',
      'Corrosion resistant',
      'Ex-rated cable glands'
    ],
    images: ['/images/products/ge-hz-100-1.jpg'],
    documents: [],
    featured: true,
    inStock: true,
    createdAt: '2024-03-15'
  },

  // Custom Solutions
  {
    id: 601,
    categoryId: 6,
    name: 'Custom Enclosure Design Service',
    slug: 'custom-enclosure-design',
    code: 'GE-CS-CUSTOM',
    description: 'Bespoke enclosure solutions tailored to your exact specifications.',
    fullDescription: `Our custom design service offers complete flexibility in enclosure design. From modified standard products to completely bespoke solutions, our engineering team works with you to create the perfect enclosure for your application.`,
    price: null, // Quote based
    specs: {
      material: 'Various Options',
      protection: 'Up to IP68',
      customization: 'Full Custom',
      leadTime: '2-4 weeks',
      minimumOrder: '10 units'
    },
    features: [
      'CAD design support',
      'Rapid prototyping',
      'CNC machining',
      'Custom colors',
      'Logo branding',
      'Special certifications'
    ],
    images: ['/images/products/custom-service.jpg'],
    documents: [],
    featured: false,
    inStock: true,
    createdAt: '2024-01-01'
  }
];

export default { productsData, categoriesData };
