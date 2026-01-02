const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Load logo as base64 for embedding in PDF
const logoPath = path.join(__dirname, '../assets/logo.png');
let logoBase64 = '';
try {
  const logoBuffer = fs.readFileSync(logoPath);
  logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
} catch (err) {
  console.warn('Could not load logo for PDF:', err.message);
}

/**
 * Generate HTML template for product PDF
 */
const generateProductHTML = (product, baseUrl) => {
  // Get primary image URL
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const imageUrl = primaryImage
    ? (primaryImage.imageUrl.startsWith('http')
        ? primaryImage.imageUrl
        : `${baseUrl}${primaryImage.imageUrl}`)
    : null;

  // Get category names
  const categoryNames = product.categories?.map(pc => pc.category?.name).filter(Boolean).join(', ')
    || product.category?.name
    || '';

  // Get specifications
  const specs = product.dynamicSpecs || [];

  // Get features
  const features = product.features || [];

  // Format price
  const priceDisplay = product.price
    ? `₹${Number(product.price).toLocaleString('en-IN')}`
    : 'Request Quote';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${product.name} - Product Datasheet</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #333;
      background: #fff;
    }

    .page {
      padding: 0;
      max-width: 100%;
    }

    /* Header */
    .header {
      background: linear-gradient(135deg, #C21F26 0%, #8B1419 100%);
      color: white;
      padding: 20px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .logo-box {
      width: 60px;
      height: 60px;
      background: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 5px;
    }

    .logo-box img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .company-info h1 {
      font-size: 16pt;
      font-weight: 700;
      margin-bottom: 2px;
    }

    .company-info p {
      font-size: 9pt;
      opacity: 0.9;
    }

    .header-right {
      text-align: right;
      font-size: 9pt;
    }

    .header-right p {
      margin-bottom: 2px;
    }

    /* Product Section */
    .product-section {
      padding: 25px 30px;
      display: flex;
      gap: 25px;
      border-bottom: 2px solid #f0f0f0;
    }

    .product-image {
      width: 200px;
      height: 200px;
      flex-shrink: 0;
      background: #f8f8f8;
      border-radius: 10px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e0e0e0;
    }

    .product-image img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .product-image-placeholder {
      color: #ccc;
      font-size: 10pt;
    }

    .product-details {
      flex: 1;
    }

    .product-badge {
      display: inline-block;
      background: #C21F26;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 9pt;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .product-name {
      font-size: 20pt;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 5px;
    }

    .product-code {
      font-size: 11pt;
      color: #666;
      margin-bottom: 10px;
    }

    .product-category {
      font-size: 10pt;
      color: #888;
      margin-bottom: 12px;
    }

    .product-description {
      font-size: 10pt;
      color: #555;
      line-height: 1.6;
      margin-bottom: 15px;
    }

    .product-meta {
      display: flex;
      gap: 20px;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
    }

    .meta-label {
      font-size: 8pt;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .meta-value {
      font-size: 12pt;
      font-weight: 600;
      color: #1a1a1a;
    }

    .meta-value.price {
      color: #C21F26;
    }

    .meta-value.in-stock {
      color: #059669;
    }

    .meta-value.out-of-stock {
      color: #dc2626;
    }

    /* Sections */
    .section {
      padding: 20px 30px;
      border-bottom: 1px solid #f0f0f0;
    }

    .section:last-child {
      border-bottom: none;
    }

    .section-title {
      font-size: 12pt;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #C21F26;
      display: inline-block;
    }

    /* Specs Table */
    .specs-table {
      width: 100%;
      border-collapse: collapse;
    }

    .specs-table tr:nth-child(even) {
      background: #f9f9f9;
    }

    .specs-table td {
      padding: 10px 15px;
      border: 1px solid #e5e5e5;
      font-size: 10pt;
    }

    .specs-table td:first-child {
      width: 40%;
      font-weight: 600;
      color: #444;
      background: #f5f5f5;
    }

    .specs-table td:last-child {
      color: #333;
    }

    /* Features Grid */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 8px 12px;
      background: #f8f8f8;
      border-radius: 6px;
    }

    .feature-check {
      color: #059669;
      font-weight: bold;
      font-size: 12pt;
      line-height: 1;
    }

    .feature-text {
      font-size: 10pt;
      color: #444;
      line-height: 1.4;
    }

    /* Footer */
    .footer {
      background: #1a1a1a;
      color: white;
      padding: 20px 30px;
      margin-top: auto;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-left h3 {
      font-size: 11pt;
      margin-bottom: 5px;
    }

    .footer-left p {
      font-size: 9pt;
      color: #aaa;
      margin-bottom: 2px;
    }

    .footer-right {
      text-align: right;
    }

    .footer-right p {
      font-size: 9pt;
      color: #aaa;
      margin-bottom: 2px;
    }

    /* Document Info */
    .doc-info {
      text-align: center;
      padding: 10px;
      background: #f5f5f5;
      font-size: 8pt;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <div class="logo-box">
          ${logoBase64 ? `<img src="${logoBase64}" alt="Grasp Electric Logo" />` : 'GE'}
        </div>
        <div class="company-info">
          <h1>GRASP ELECTRIC PRIVATE LIMITED</h1>
          <p>India's Leading Enclosure Manufacturer</p>
        </div>
      </div>
      <div class="header-right">
        <p><strong>Product Datasheet</strong></p>
        <p>Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
      </div>
    </div>

    <!-- Product Section -->
    <div class="product-section">
      <div class="product-image">
        ${imageUrl
          ? `<img src="${imageUrl}" alt="${product.name}" />`
          : '<div class="product-image-placeholder">No Image</div>'
        }
      </div>
      <div class="product-details">
        ${product.isFeatured ? '<span class="product-badge">Featured Product</span>' : ''}
        <h2 class="product-name">${product.name}</h2>
        <p class="product-code">Product Code: <strong>${product.code || 'N/A'}</strong></p>
        ${categoryNames ? `<p class="product-category">Product Range: ${categoryNames}</p>` : ''}
        <p class="product-description">${product.fullDescription || product.description || ''}</p>
        <div class="product-meta">
          <div class="meta-item">
            <span class="meta-label">Price</span>
            <span class="meta-value price">${priceDisplay}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Availability</span>
            <span class="meta-value ${product.isActive ? 'in-stock' : 'out-of-stock'}">
              ${product.isActive ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Technical Specifications -->
    ${specs.length > 0 ? `
    <div class="section">
      <h3 class="section-title">Technical Specifications</h3>
      <table class="specs-table">
        ${specs.map(spec => `
          <tr>
            <td>${spec.specKey}</td>
            <td>${spec.specValue}</td>
          </tr>
        `).join('')}
      </table>
    </div>
    ` : ''}

    <!-- Key Features -->
    ${features.length > 0 ? `
    <div class="section">
      <h3 class="section-title">Key Features</h3>
      <div class="features-grid">
        ${features.map(f => `
          <div class="feature-item">
            <span class="feature-check">✓</span>
            <span class="feature-text">${f.featureText}</span>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <div class="footer-content">
        <div class="footer-left">
          <h3>Grasp Electric Private Limited</h3>
          <p>F-56-57, RIICO Industrial Area, Chopanki, Bhiwadi</p>
          <p>Dist. Alwar, Rajasthan - 301019</p>
        </div>
        <div class="footer-right">
          <p>Phone: +91 98711 91712</p>
          <p>Email: info@graspelectric.com</p>
          <p>Web: www.graspelectric.com</p>
        </div>
      </div>
    </div>

    <!-- Document Info -->
    <div class="doc-info">
      This document is auto-generated. Specifications are subject to change without notice.
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generate PDF for a product
 * @param {Object} product - Product object with all relations
 * @param {string} baseUrl - Base URL for images
 * @returns {Buffer} PDF buffer
 */
const generateProductPDF = async (product, baseUrl) => {
  let browser = null;

  try {
    // Launch headless browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    // Generate HTML from template with product data
    const html = generateProductHTML(product, baseUrl);

    // Set content and wait for images to load
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      },
      preferCSSPageSize: true
    });

    return pdf;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = {
  generateProductPDF,
  generateProductHTML
};
