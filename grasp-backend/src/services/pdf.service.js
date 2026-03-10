const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Load logo as base64 for embedding in PDF
const logoPath = path.join(__dirname, '../assets/logo.png');
let logoBase64 = '';
try {
  const logoBuffer = fs.readFileSync(logoPath);
  logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
} catch (err) {
  console.warn('Could not load logo for PDF:', err.message);
}

// ============================================================
// Puppeteer Resource Bounding: Singleton + Semaphore + Cache
// ============================================================

const MAX_CONCURRENT = 2;          // Max simultaneous PDF generations
const BROWSER_IDLE_TIMEOUT = 60000; // Close browser after 60s idle
const CACHE_DIR = path.join(__dirname, '../../.pdf-cache');
const CACHE_TTL = 30 * 60 * 1000;  // 30 minutes

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// --- Singleton Browser ---
let browserInstance = null;
let browserIdleTimer = null;
let activePagesCount = 0;

async function getBrowser() {
  if (browserInstance && browserInstance.connected) {
    clearTimeout(browserIdleTimer);
    return browserInstance;
  }

  browserInstance = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-translate',
      '--single-process',
      '--js-flags=--max-old-space-size=256',
    ]
  });

  browserInstance.on('disconnected', () => {
    browserInstance = null;
    activePagesCount = 0;
  });

  return browserInstance;
}

function scheduleBrowserClose() {
  clearTimeout(browserIdleTimer);
  if (activePagesCount <= 0 && browserInstance) {
    browserIdleTimer = setTimeout(async () => {
      if (activePagesCount <= 0 && browserInstance && browserInstance.connected) {
        await browserInstance.close().catch(() => {});
        browserInstance = null;
      }
    }, BROWSER_IDLE_TIMEOUT);
  }
}

// --- Concurrency Semaphore ---
let running = 0;
const queue = [];

function acquireSemaphore() {
  return new Promise((resolve) => {
    if (running < MAX_CONCURRENT) {
      running++;
      resolve();
    } else {
      queue.push(resolve);
    }
  });
}

function releaseSemaphore() {
  if (queue.length > 0) {
    const next = queue.shift();
    next();
  } else {
    running--;
  }
}

// --- PDF Cache ---
function getCacheKey(identifier) {
  return crypto.createHash('md5').update(identifier).digest('hex');
}

function getCachedPDF(cacheKey) {
  const filePath = path.join(CACHE_DIR, `${cacheKey}.pdf`);
  const metaPath = path.join(CACHE_DIR, `${cacheKey}.json`);

  if (!fs.existsSync(filePath) || !fs.existsSync(metaPath)) return null;

  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    if (Date.now() - meta.createdAt > CACHE_TTL) {
      // Expired — clean up
      fs.unlinkSync(filePath);
      fs.unlinkSync(metaPath);
      return null;
    }
    return fs.readFileSync(filePath);
  } catch {
    return null;
  }
}

function cachePDF(cacheKey, pdfBuffer) {
  const filePath = path.join(CACHE_DIR, `${cacheKey}.pdf`);
  const metaPath = path.join(CACHE_DIR, `${cacheKey}.json`);
  fs.writeFileSync(filePath, pdfBuffer);
  fs.writeFileSync(metaPath, JSON.stringify({ createdAt: Date.now() }));
}

// --- Bounded PDF generation wrapper ---
async function generatePDFBounded(htmlContent, options = {}) {
  await acquireSemaphore();
  let page = null;

  try {
    const browser = await getBrowser();
    activePagesCount++;

    page = await browser.newPage();

    // Limit page memory
    await page.setCacheEnabled(false);

    await page.setContent(htmlContent, {
      waitUntil: options.waitUntil || 'networkidle0',
      timeout: options.timeout || 30000,
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      preferCSSPageSize: true,
    });

    return pdf;
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
    activePagesCount--;
    scheduleBrowserClose();
    releaseSemaphore();
  }
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
 * Generate PDF for a product (bounded: singleton browser + semaphore + cache)
 * @param {Object} product - Product object with all relations
 * @param {string} baseUrl - Base URL for images
 * @returns {Buffer} PDF buffer
 */
const generateProductPDF = async (product, baseUrl) => {
  // Check cache first
  const cacheKey = getCacheKey(`product:${product.slug}:${product.updatedAt}`);
  const cached = getCachedPDF(cacheKey);
  if (cached) return cached;

  const html = generateProductHTML(product, baseUrl);
  const pdf = await generatePDFBounded(html, { timeout: 30000 });

  cachePDF(cacheKey, pdf);
  return pdf;
};

/**
 * Generate HTML template for catalog PDF
 */
const generateCatalogHTML = (products, baseUrl) => {
  // Group products by category
  const grouped = {};
  products.forEach(product => {
    const categoryName = product.categories?.map(pc => pc.category?.name).filter(Boolean).join(', ')
      || product.category?.name
      || 'Uncategorized';
    if (!grouped[categoryName]) grouped[categoryName] = [];
    grouped[categoryName].push(product);
  });

  const categorySections = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([categoryName, categoryProducts]) => {
    const productRows = categoryProducts.map(product => {
      const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
      const imageUrl = primaryImage
        ? (primaryImage.imageUrl.startsWith('http') ? primaryImage.imageUrl : `${baseUrl}${primaryImage.imageUrl}`)
        : null;
      const priceDisplay = product.price ? `₹${Number(product.price).toLocaleString('en-IN')}` : 'On Request';

      return `
        <div class="product-row">
          <div class="product-thumb">
            ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" />` : '<div class="no-img">No Image</div>'}
          </div>
          <div class="product-info">
            <h4 class="prod-name">${product.name}</h4>
            ${product.code ? `<span class="prod-code">${product.code}</span>` : ''}
            <p class="prod-desc">${product.description || ''}</p>
          </div>
          <div class="product-specs">
            ${product.size ? `<span class="spec-tag">Size: ${product.size}</span>` : ''}
            <span class="spec-tag">${priceDisplay}</span>
            <span class="spec-tag status-${product.isActive ? 'active' : 'inactive'}">${product.isActive ? 'In Stock' : 'Out of Stock'}</span>
          </div>
        </div>`;
    }).join('');

    return `
      <div class="category-section">
        <h3 class="category-title">${categoryName}</h3>
        ${productRows}
      </div>`;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Grasp Electric - Product Catalog</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 10pt; line-height: 1.4; color: #333; background: #fff; }
    .header { background: linear-gradient(135deg, #C21F26 0%, #8B1419 100%); color: white; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; }
    .header-left { display: flex; align-items: center; gap: 15px; }
    .logo-box { width: 60px; height: 60px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 5px; }
    .logo-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .company-info h1 { font-size: 16pt; font-weight: 700; margin-bottom: 2px; }
    .company-info p { font-size: 9pt; opacity: 0.9; }
    .header-right { text-align: right; font-size: 9pt; }
    .header-right p { margin-bottom: 2px; }
    .catalog-intro { padding: 20px 30px; border-bottom: 2px solid #C21F26; }
    .catalog-intro h2 { font-size: 18pt; color: #1a1a1a; margin-bottom: 5px; }
    .catalog-intro p { font-size: 10pt; color: #666; }
    .category-section { padding: 15px 30px; border-bottom: 1px solid #e0e0e0; page-break-inside: avoid; }
    .category-title { font-size: 13pt; font-weight: 700; color: #C21F26; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #C21F26; display: inline-block; }
    .product-row { display: flex; gap: 15px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; align-items: center; }
    .product-row:last-child { border-bottom: none; }
    .product-thumb { width: 60px; height: 60px; flex-shrink: 0; background: #f8f8f8; border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid #e0e0e0; }
    .product-thumb img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .no-img { font-size: 7pt; color: #ccc; }
    .product-info { flex: 1; }
    .prod-name { font-size: 11pt; font-weight: 600; color: #1a1a1a; margin-bottom: 2px; }
    .prod-code { font-size: 8pt; color: #888; font-weight: 500; }
    .prod-desc { font-size: 9pt; color: #666; margin-top: 3px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .product-specs { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; min-width: 100px; }
    .spec-tag { font-size: 8pt; padding: 2px 8px; background: #f5f5f5; border-radius: 4px; color: #555; white-space: nowrap; }
    .status-active { background: #ecfdf5; color: #059669; }
    .status-inactive { background: #fef2f2; color: #dc2626; }
    .footer { background: #1a1a1a; color: white; padding: 20px 30px; }
    .footer-content { display: flex; justify-content: space-between; align-items: center; }
    .footer-left h3 { font-size: 11pt; margin-bottom: 5px; }
    .footer-left p { font-size: 9pt; color: #aaa; margin-bottom: 2px; }
    .footer-right { text-align: right; }
    .footer-right p { font-size: 9pt; color: #aaa; margin-bottom: 2px; }
  </style>
</head>
<body>
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
      <p><strong>Product Catalog</strong></p>
      <p>Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
      <p>${products.length} Products</p>
    </div>
  </div>

  <div class="catalog-intro">
    <h2>Product Catalog</h2>
    <p>Complete listing of all available products from Grasp Electric Private Limited</p>
  </div>

  ${categorySections}

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
</body>
</html>
  `;
};

/**
 * Generate catalog PDF with all products (bounded: singleton browser + semaphore + cache)
 */
const generateCatalogPDF = async (products, baseUrl) => {
  // Cache key based on product count + latest updatedAt
  const latestUpdate = products.reduce((max, p) => {
    const t = new Date(p.updatedAt).getTime();
    return t > max ? t : max;
  }, 0);
  const cacheKey = getCacheKey(`catalog:${products.length}:${latestUpdate}`);
  const cached = getCachedPDF(cacheKey);
  if (cached) return cached;

  const html = generateCatalogHTML(products, baseUrl);
  const pdf = await generatePDFBounded(html, { timeout: 60000 });

  cachePDF(cacheKey, pdf);
  return pdf;
};

/**
 * Clear all cached PDFs (call after product updates)
 */
const clearPDFCache = () => {
  try {
    const files = fs.readdirSync(CACHE_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(CACHE_DIR, file));
    }
  } catch {
    // Ignore errors during cache clearing
  }
};

/**
 * Get current Puppeteer resource stats (for monitoring)
 */
const getPDFStats = () => ({
  browserAlive: !!(browserInstance && browserInstance.connected),
  activePages: activePagesCount,
  queuedRequests: queue.length,
  concurrentRunning: running,
  maxConcurrent: MAX_CONCURRENT,
});

module.exports = {
  generateProductPDF,
  generateProductHTML,
  generateCatalogPDF,
  generateCatalogHTML,
  clearPDFCache,
  getPDFStats,
};
