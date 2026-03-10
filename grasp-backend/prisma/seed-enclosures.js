const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient({ log: ['error'] });

// ==================== PATHS ====================
const BACKEND_DIR = path.resolve(__dirname, '..');
const SOURCE_DIR = path.resolve(BACKEND_DIR, '../../Enclosures-Organized');
const UPLOAD_IMAGES = path.join(BACKEND_DIR, 'uploads/products/images');
const UPLOAD_DOCS = path.join(BACKEND_DIR, 'uploads/products/documents');

// ==================== CATEGORIES ====================
const CATEGORIES = [
  { slug: 'series-1-inbuilt-hinged-enclosure', name: 'Inbuilt Hinged Enclosure', sort: 1, shortName: 'Inbuilt Hinged Enclosure', seriesNum: 1 },
  { slug: 'series-2-plain-wall-industrial-enclosure', name: 'Plain Wall Industrial Enclosure', sort: 2, shortName: 'Plain Wall Industrial Enclosure', seriesNum: 2 },
  { slug: 'series-3-modular-panel-enclosure', name: 'Modular Panel Enclosure', sort: 3, shortName: 'Modular Panel Enclosure', seriesNum: 3 },
  { slug: 'series-4-junction-box', name: 'Junction Box', sort: 4, shortName: 'Junction Box', seriesNum: 4 },
  { slug: 'series-5-power-distribution-box', name: 'Power Distribution Box', sort: 5, shortName: 'Power Distribution Box', seriesNum: 5 },
  { slug: 'series-6-enclosure-external-mounting', name: 'Enclosure with External Mounting', sort: 6, shortName: 'Enclosure with External Mounting', seriesNum: 6 },
  { slug: 'series-7-electronic-automation-enclosure', name: 'Electronic & Automation Enclosure', sort: 7, shortName: 'Electronic & Automation Enclosure', seriesNum: 7 },
  { slug: 'series-8-ip65-distribution-box', name: 'IP-65 Distribution Box', sort: 8, shortName: 'IP-65 Distribution Box', seriesNum: 8 },
  { slug: 'accessories', name: 'Accessories', sort: 9, shortName: 'Accessories', seriesNum: null },
];

// ==================== ALL 103 PRODUCTS ====================
const PRODUCTS = [
  // Series 1 (8)
  { code: '1.01', dims: [257, 210, 90], series: 1 },
  { code: '1.02', dims: [275, 225, 105], series: 1 },
  { code: '1.03', dims: [280, 200, 140], series: 1 },
  { code: '1.04', dims: [280, 280, 130], series: 1 },
  { code: '1.05A', dims: [350, 300, 146], series: 1 },
  { code: '1.05B', dims: [350, 300, 205], series: 1 },
  { code: '1.05C', dims: [380, 200, 125], series: 1 },
  { code: '1.06', dims: [674, 644, 277], series: 1 },
  // Series 2 (14)
  { code: '2.00AS', dims: [180, 130, 75], series: 2 },
  { code: '2.00A', dims: [190, 140, 105], series: 2 },
  { code: '2.00B', dims: [180, 130, 105], series: 2 },
  { code: '2.01', dims: [180, 180, 138], series: 2 },
  { code: '2.01A', dims: [190, 190, 105], series: 2 },
  { code: '2.02', dims: [240, 180, 138], series: 2 },
  { code: '2.02A', dims: [290, 120, 100], series: 2 },
  { code: '2.02B', dims: [320, 150, 120], series: 2 },
  { code: '2.03', dims: [320, 240, 138], series: 2 },
  { code: '2.04', dims: [420, 320, 138], series: 2 },
  { code: '2.04B', dims: [420, 320, 210], series: 2 },
  { code: '2.05A', dims: [640, 420, 140], series: 2 },
  { code: '2.05B', dims: [640, 420, 210], series: 2 },
  { code: '2.06', dims: [640, 380, 230], series: 2 },
  // Series 3 (6)
  { code: '3.01A', dims: [300, 150, 135], series: 3 },
  { code: '3.01B', dims: [300, 150, 210], series: 3 },
  { code: '3.02', dims: [300, 300, 210], series: 3 },
  { code: '3.02A', dims: [300, 300, 135], series: 3 },
  { code: '3.03', dims: [450, 300, 210], series: 3 },
  { code: '3.04', dims: [600, 300, 210], series: 3 },
  // Series 4 (12)
  { code: '4.01', dims: [90, 90, 54], series: 4 },
  { code: '4.01B', dims: [100, 100, 60], series: 4 },
  { code: '4.02', dims: [100, 100, 60], series: 4 },
  { code: '4.02B', dims: [120, 120, 70], series: 4 },
  { code: '4.03', dims: [140, 110, 70], series: 4 },
  { code: '4.03B', dims: [150, 120, 80], series: 4 },
  { code: '4.04', dims: [130, 130, 100], series: 4 },
  { code: '4.04B', dims: [140, 140, 100], series: 4 },
  { code: '4.05', dims: [170, 130, 80], series: 4 },
  { code: '4.05B', dims: [180, 140, 100], series: 4 },
  { code: '4.06', dims: [210, 160, 100], series: 4 },
  { code: '4.07', dims: [260, 210, 120], series: 4 },
  // Series 5 (12)
  { code: '5.01Eco', dims: [138, 98, 75], series: 5 },
  { code: '5.01B', dims: [170, 76, 95], series: 5 },
  { code: '5.01', dims: [225, 100, 100], series: 5 },
  { code: '5.02Eco', dims: [160, 115, 75], series: 5 },
  { code: '5.02B', dims: [170, 118, 95], series: 5 },
  { code: '5.02', dims: [225, 150, 100], series: 5 },
  { code: '5.03A', dims: [170, 170, 80], series: 5 },
  { code: '5.03', dims: [225, 225, 100], series: 5 },
  { code: '5.04', dims: [300, 225, 100], series: 5 },
  { code: '5.05A', dims: [400, 300, 100], series: 5 },
  { code: '5.05', dims: [400, 300, 100], series: 5 },
  { code: '5.06', dims: [600, 300, 100], series: 5 },
  // Series 6 (12)
  { code: '6.01', dims: [138, 98, 68], series: 6 },
  { code: '6.02A', dims: [200, 98, 60], series: 6 },
  { code: '6.02B', dims: [200, 98, 82], series: 6 },
  { code: '6.03', dims: [138, 138, 82], series: 6 },
  { code: '6.04', dims: [225, 138, 68], series: 6 },
  { code: '6.04A', dims: [170, 170, 90], series: 6 },
  { code: '6.05', dims: [225, 160, 100], series: 6 },
  { code: '6.06A', dims: [225, 225, 115], series: 6 },
  { code: '6.06B', dims: [225, 225, 180], series: 6 },
  { code: '6.07', dims: [300, 225, 115], series: 6 },
  { code: '6.08', dims: [400, 300, 100], series: 6 },
  { code: '6.09', dims: [600, 300, 100], series: 6 },
  // Series 7 (31)
  { code: '7.01', dims: [80, 56, 40], series: 7 },
  { code: '7.01L', dims: [84, 58, 33], series: 7 },
  { code: '7.02', dims: [100, 100, 62], series: 7 },
  { code: '7.02L', dims: [100, 70, 50], series: 7 },
  { code: '7.03', dims: [115, 65, 40], series: 7 },
  { code: '7.03L', dims: [160, 80, 55], series: 7 },
  { code: '7.04', dims: [125, 80, 56], series: 7 },
  { code: '7.04L', dims: [200, 136, 70], series: 7 },
  { code: '7.05', dims: [125, 125, 62], series: 7 },
  { code: '7.06A', dims: [134, 90, 36], series: 7 },
  { code: '7.06B', dims: [134, 90, 56], series: 7 },
  { code: '7.07', dims: [140, 120, 76], series: 7 },
  { code: '7.07B', dims: [140, 120, 100], series: 7 },
  { code: '7.08', dims: [150, 150, 75], series: 7 },
  { code: '7.08A', dims: [150, 132, 40], series: 7 },
  { code: '7.08C', dims: [150, 150, 100], series: 7 },
  { code: '7.09A', dims: [160, 115, 55], series: 7 },
  { code: '7.09B', dims: [160, 115, 75], series: 7 },
  { code: '7.10A', dims: [170, 125, 66], series: 7 },
  { code: '7.10B', dims: [170, 125, 115], series: 7 },
  { code: '7.11', dims: [175, 124, 36], series: 7 },
  { code: '7.12', dims: [180, 160, 75], series: 7 },
  { code: '7.13', dims: [205, 125, 75], series: 7 },
  { code: '7.13A', dims: [210, 80, 55], series: 7 },
  { code: '7.14', dims: [230, 125, 90], series: 7 },
  { code: '7.15', dims: [240, 70, 92], series: 7 },
  { code: '7.16', dims: [250, 200, 90], series: 7 },
  { code: '7.17', dims: [260, 160, 90], series: 7 },
  { code: '7.18', dims: [260, 176, 92], series: 7 },
  { code: '7.19', dims: [315, 225, 90], series: 7 },
  { code: '7.20', dims: [350, 260, 90], series: 7 },
  // Series 8 (8 placeholders)
  { code: '8.02H1', dims: null, series: 8 },
  { code: '8.02H2', dims: null, series: 8 },
  { code: '8.04H1', dims: null, series: 8 },
  { code: '8.04H2', dims: null, series: 8 },
  { code: '8.04V1', dims: null, series: 8 },
  { code: '8.06V1', dims: null, series: 8 },
  { code: '8.08V1', dims: null, series: 8 },
  { code: '8.12V1', dims: null, series: 8 },
  // Accessories (29)
  { code: 'ACC-4+2', dims: null, series: 'accessories', displayName: '4+2 Terminal Block', imgFile: '4+2.jpg' },
  { code: 'ACC-8+2', dims: null, series: 'accessories', displayName: '8+2 Terminal Block', imgFile: '8+2.jpg' },
  { code: 'ACC-AVT-10A', dims: null, series: 'accessories', displayName: 'AV Terminal 10A', imgFile: 'AVTerminal-10A.jpg' },
  { code: 'ACC-AVT-25A', dims: null, series: 'accessories', displayName: 'AV Terminal 25A', imgFile: 'AVTerminal-25A.jpg' },
  { code: 'ACC-AVT-35A', dims: null, series: 'accessories', displayName: 'AV Terminal 35A', imgFile: 'AVTerminal-35A.jpg' },
  { code: 'ACC-S2-SCREW', dims: null, series: 'accessories', displayName: 'Series 2 Screw', imgFile: 'CODE-2-Screw.jpg' },
  { code: 'ACC-S3-GASKET', dims: null, series: 'accessories', displayName: 'Series 3 Gasket', imgFile: 'CODE-3-Gasket.jpg' },
  { code: 'ACC-S3-JCLAMP', dims: null, series: 'accessories', displayName: 'Series 3 Jointing Clamp', imgFile: 'CODE-3-Jointing-Clamp.jpg' },
  { code: 'ACC-S3-SCREW', dims: null, series: 'accessories', displayName: 'Series 3 Screw', imgFile: 'CODE-3-Screw.jpg' },
  { code: 'ACC-S7-MCLAMP', dims: null, series: 'accessories', displayName: 'Series 7 Mounting Clamp', imgFile: 'CODE-7-Mounting-Clamp.jpg' },
  { code: 'ACC-HANDLE-FLUSH', dims: null, series: 'accessories', displayName: 'Carry Handle Flush', imgFile: 'Carry-Handle-Flush.jpg' },
  { code: 'ACC-HANDLE-STRAIGHT', dims: null, series: 'accessories', displayName: 'Carry Handle Straight', imgFile: 'Carry-Handle-Straight.jpg' },
  { code: 'ACC-COUPLER-25', dims: null, series: 'accessories', displayName: 'Coupler 25mm', imgFile: 'Coupler-25mm.jpg' },
  { code: 'ACC-COUPLER-38', dims: null, series: 'accessories', displayName: 'Coupler 38mm', imgFile: 'Coupler-38mm.jpg' },
  { code: 'ACC-COUPLER-50', dims: null, series: 'accessories', displayName: 'Coupler 50mm', imgFile: 'Coupler-50mm.jpg' },
  { code: 'ACC-COUPLER-63', dims: null, series: 'accessories', displayName: 'Coupler 63mm', imgFile: 'Coupler-63mm.jpg' },
  { code: 'ACC-COUPLER-NEW', dims: null, series: 'accessories', displayName: 'Coupler (New)', imgFile: 'Coupler-New.jpg' },
  { code: 'ACC-DIN-RAIL', dims: null, series: 'accessories', displayName: 'Din Rail', imgFile: 'Din-Rail.jpg' },
  { code: 'ACC-WINDOW-75', dims: null, series: 'accessories', displayName: 'Fixed Window 75x75mm', imgFile: 'Fixed-Windows-75x75.jpg' },
  { code: 'ACC-WINDOW-90', dims: null, series: 'accessories', displayName: 'Fixed Window 90x90mm', imgFile: 'Fixed-Windows-90x90.jpg' },
  { code: 'ACC-HINGE-BIG', dims: null, series: 'accessories', displayName: 'Hinge Big', imgFile: 'Hinge-Big.jpg' },
  { code: 'ACC-HINGE-BIGGEST', dims: null, series: 'accessories', displayName: 'Hinge Biggest', imgFile: 'Hinge-Biggest.jpg' },
  { code: 'ACC-HINGE-SMALL', dims: null, series: 'accessories', displayName: 'Hinge Small', imgFile: 'Hinge-Small.jpg' },
  { code: 'ACC-LOCK-KEY', dims: null, series: 'accessories', displayName: 'Lock & Key', imgFile: 'Lock-&-Key.jpg' },
  { code: 'ACC-MCB', dims: null, series: 'accessories', displayName: 'MCB Arrangement', imgFile: 'MCB-Arrangement.jpg' },
  { code: 'ACC-MCLAMP-MS', dims: null, series: 'accessories', displayName: 'MS Mounting Clamp', imgFile: 'MS-Mounting-Clamp.jpg' },
  { code: 'ACC-MCLAMP-POLY', dims: null, series: 'accessories', displayName: 'Mounting Clamp Polyamide', imgFile: 'Mounting-Clamp-Polyamide.jpg' },
  { code: 'ACC-POLE-MOUNT', dims: null, series: 'accessories', displayName: 'Pole Mounting', imgFile: 'Pole-Mounting.jpg' },
  { code: 'ACC-MCLAMP-SS', dims: null, series: 'accessories', displayName: 'SS Mounting Clamp', imgFile: 'SS-Mounting-Clamp.jpg' },
  { code: 'ACC-VENTILATOR-40', dims: null, series: 'accessories', displayName: 'Ventilator 40mm', imgFile: 'Ventilator-40mm.jpg' },
];

// ==================== OVERRIDES ====================

// Datasheet file mapped to a different product code than filename suggests
const DATASHEET_OVERRIDES = {
  '5.02Eco': 'CODE-5.02-160x115x75mm-TDS.pdf',
};
const DATASHEET_CLAIMED = new Set(Object.values(DATASHEET_OVERRIDES));

// Image filename code differs from product code
const IMAGE_ALIASES = {
  '2.00A': '2.00',
};

// ==================== DEFAULTS ====================

const DEFAULT_DYNAMIC_SPECS = [
  { key: 'Material', value: 'ABS/PC, with Transparent and Opaque Lid options' },
  { key: 'Ingress Protection', value: 'IP 67 as per IEC-60529' },
  { key: 'Ultraviolet Protection', value: 'UV Stabilised as per EN ISO 4892' },
  { key: 'Impact Resistance', value: 'IK07 as per IEC 60068-2-72' },
  { key: 'Glow Wire Test', value: '960 Deg. C as per IS 11000-2-1, IEC 60695-2-10' },
  { key: 'Ambient Temperature', value: '-20 to +60\u00b0C' },
  { key: 'Fire Rating', value: 'HB' },
  { key: 'ROHS Compliance', value: 'IEC 62321' },
  { key: 'Environment Protection', value: 'ROHS and Halogen Free' },
];

const DEFAULT_FIXED_SPECS = {
  material: 'ABS/Polycarbonate',
  ipRating: 'IP 67',
  flammability: 'HB',
  temperature: '-20 to +60\u00b0C',
};

const DEFAULT_FEATURES = [
  'Plain walled enclosures.',
  'Rust proof polymer screws.',
  'Gland holes/Customizations can be carried out as per specific drawings.',
  'Parallel inner bush ribs for mounting din channel with self-tapping screw.',
  'Embedded M8 Nut for easy outside mounting without tampering enclosure and IP Rating.',
  'Stainless Steel Mounting Clamps/Polycarbonate Mounting Clamps with hardware (SS304)',
  'Available with Transparent cover (Optional).',
];

// ==================== HELPERS ====================

function generateSlug(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function getUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

function getSeriesDir(seriesNum) {
  return path.join(SOURCE_DIR, `Series-${seriesNum}`);
}

function getCat(series) {
  if (series === 'accessories') return CATEGORIES.find(c => c.slug === 'accessories');
  return CATEGORIES.find(c => c.seriesNum === series);
}

function shortIP(val) {
  if (!val) return null;
  const m = val.match(/IP\s*\d+/);
  return m ? m[0] : val;
}

// ==================== FILE FINDERS ====================

function findImages(product) {
  const imgDir = path.join(getSeriesDir(product.series), 'images');
  if (!fs.existsSync(imgDir)) return [];
  const files = fs.readdirSync(imgDir);
  const codes = [product.code];
  if (IMAGE_ALIASES[product.code]) codes.push(IMAGE_ALIASES[product.code]);

  const matches = [];
  for (const code of codes) {
    const prefix = `CODE-${code}-`;
    for (const f of files) {
      if (f.startsWith(prefix) && f.endsWith('.jpg') && !f.includes('-REVIEW')) {
        matches.push(f);
      }
    }
  }
  return matches.sort();
}

function findDatasheet(product) {
  const dsDir = path.join(getSeriesDir(product.series), 'datasheets');
  if (!fs.existsSync(dsDir)) return null;

  // Check override first
  if (DATASHEET_OVERRIDES[product.code]) {
    const p = path.join(dsDir, DATASHEET_OVERRIDES[product.code]);
    if (fs.existsSync(p)) return p;
  }

  const files = fs.readdirSync(dsDir);
  const prefix = `CODE-${product.code}-`;
  const matches = files.filter(f =>
    f.startsWith(prefix) &&
    f.endsWith('-TDS.pdf') &&
    !f.includes('-REVIEW') &&
    !DATASHEET_CLAIMED.has(f)
  );

  if (matches.length === 0) return null;
  if (matches.length === 1) return path.join(dsDir, matches[0]);

  // Multiple matches — pick by dimensions
  if (product.dims) {
    const dimStr = `${product.dims[0]}x${product.dims[1]}x${product.dims[2]}mm`;
    const dimMatch = matches.find(f => f.includes(dimStr));
    if (dimMatch) return path.join(dsDir, dimMatch);
  }
  return path.join(dsDir, matches[0]);
}

function copyFile(src, destDir, ext) {
  const id = uuidv4();
  const filename = `${id}${ext}`;
  fs.copyFileSync(src, path.join(destDir, filename));
  return filename;
}

// ==================== PDF PARSING ====================

function extractPdfText(pdfPath) {
  try {
    return execSync(`pdftotext "${pdfPath}" -`, { encoding: 'utf-8', maxBuffer: 2 * 1024 * 1024 });
  } catch {
    return '';
  }
}

const SPEC_KEYS = [
  'Description', 'Dimension', 'Material', 'Ingress Protection',
  'Ultraviolet Protection', 'Impact Resistance', 'Glow Wire Test',
  'Ambient Temperature', 'Fire Rating', 'ROHS', 'Environment Protection',
];

function parseSpecs(text) {
  // Find the specs table (not the document title "Technical Data Sheet")
  const techIdx = text.indexOf('Technical Data\nDescription');
  if (techIdx === -1) return null;

  let section = text.substring(techIdx);
  const endIdx = section.search(/\n\s*(?:Drawings|www\.graspelectric|Application)/);
  if (endIdx > 0) section = section.substring(0, endIdx);

  const lines = section.split('\n').map(l => l.trim()).filter(Boolean);

  // Find where the key labels end by matching known keys
  let keyEnd = 0;
  for (let i = 1; i < Math.min(lines.length, 16); i++) {
    if (SPEC_KEYS.includes(lines[i])) keyEnd = i;
  }
  if (keyEnd < 8) return null; // Didn't find enough key labels

  const valueStart = keyEnd + 1;
  if (lines.length < valueStart + 11) return null;

  // Column 1 (ABS): 11 values starting at valueStart
  const col1 = lines.slice(valueStart, valueStart + 11);

  // Column 2 (PC) if enough lines exist
  const hasCol2 = lines.length >= valueStart + 22;
  const col2 = hasCol2 ? lines.slice(valueStart + 11, valueStart + 22) : null;

  // Prefer Column 2 (Polycarbonate = higher specs)
  const v = col2 || col1;

  return {
    // v[0] = Description, v[1] = Dimension (skip both, use product data)
    material: v[2] || null,
    ipRating: v[3] || null,         // e.g. "IP 67, IEC-60529"
    uvProtection: v[4] || null,     // e.g. "UV Stabilized, EN ISO 4892"
    ikRating: v[5] || null,         // e.g. "IK08/09/10, IEC 60068-2-72"
    glowWire: v[6] || null,         // e.g. "820/960 ⁰C, IS 11000-2-1..."
    temperature: v[7] || null,      // e.g. "-25 to +80 Deg. C"
    fireRating: v[8] || null,       // e.g. "UL94V-0"
    rohs: v[9] || null,             // e.g. "Compliant IEC 62321"
    environment: v[10] || null,     // e.g. "Halogen Free"
  };
}

function parseFeatures(text) {
  const startIdx = text.indexOf('Features & Advantages');
  if (startIdx === -1) return [];

  let endIdx = text.indexOf('Optional Accessories', startIdx);
  if (endIdx === -1) endIdx = text.indexOf('Technical Data\nDescription', startIdx);
  if (endIdx === -1) return [];

  const section = text.substring(startIdx + 'Features & Advantages'.length, endIdx);
  const lines = section.split('\n')
    .map(l => l.trim())
    .filter(l => l && l !== '\u2022' && l !== '\u00b7');

  const features = [];
  let current = '';
  for (const line of lines) {
    // New feature starts with uppercase letter or digit
    if (/^[A-Z0-9]/.test(line) && current) {
      features.push(current);
      current = line;
    } else if (current) {
      current += ' ' + line;
    } else {
      current = line;
    }
  }
  if (current) features.push(current);
  return features;
}

// ==================== MAIN ====================

async function main() {
  const isFresh = process.argv.includes('--fresh');
  console.log('=== Grasp Enclosures Seeder ===');
  console.log(`Source: ${SOURCE_DIR}`);
  console.log(`Products: ${PRODUCTS.length}\n`);

  // Verify source exists
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`ERROR: Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  // Ensure upload dirs exist
  fs.mkdirSync(UPLOAD_IMAGES, { recursive: true });
  fs.mkdirSync(UPLOAD_DOCS, { recursive: true });

  // Step 1: Fresh mode
  if (isFresh) {
    console.log('FRESH mode: clearing existing data...');
    await prisma.productDynamicSpec.deleteMany({});
    await prisma.productFeature.deleteMany({});
    await prisma.productDocument.deleteMany({});
    await prisma.productImage.deleteMany({});
    await prisma.quoteRequestItem.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.productCategory.deleteMany({});
    await prisma.galleryImageProduct.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.categorySpec.deleteMany({});
    await prisma.category.deleteMany({});
    console.log('Cleared all products and categories.\n');
  }

  // Step 2: Create 9 categories
  console.log('--- Creating categories ---');
  const categoryMap = {}; // seriesNum → category record
  for (const cat of CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      categoryMap[cat.seriesNum || cat.slug] = existing;
      console.log(`  SKIP  ${cat.name}`);
    } else {
      const created = await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          sortOrder: cat.sort,
          isFeatured: true,
        },
      });
      categoryMap[cat.seriesNum || cat.slug] = created;
      console.log(`  CREATE ${cat.name}`);
    }
  }
  console.log('');

  // Steps 3-6: Create products with specs, features, images, datasheets
  console.log('--- Creating products ---');
  const stats = { created: 0, skipped: 0, errors: 0, images: 0, datasheets: 0 };
  const categoryFirstImage = {}; // seriesNum → imageUrl (for category thumbnail)

  for (const p of PRODUCTS) {
    const isAccessory = p.series === 'accessories';
    const cat = getCat(p.series);
    const catRecord = categoryMap[isAccessory ? 'accessories' : p.series];

    // Idempotent: skip if code exists
    const existing = await prisma.product.findFirst({ where: { code: p.code } });
    if (existing) {
      console.log(`  SKIP  ${p.code}`);
      stats.skipped++;
      continue;
    }

    try {
      // Build name and description
      const name = isAccessory ? p.displayName : `${p.code} ${cat.shortName}`;
      const dimStr = p.dims ? `${p.dims[0]}x${p.dims[1]}x${p.dims[2]}mm` : '';
      const description = isAccessory ? `Accessory - ${p.displayName}` : (dimStr ? `${cat.shortName} - ${dimStr}` : cat.shortName);
      const slug = await getUniqueSlug(generateSlug(name));

      // Parse datasheet if available (skip for accessories)
      let parsedSpecs = null;
      let parsedFeatures = [];
      const datasheetPath = isAccessory ? null : findDatasheet(p);

      if (datasheetPath) {
        const pdfText = extractPdfText(datasheetPath);
        if (pdfText) {
          parsedSpecs = parseSpecs(pdfText);
          parsedFeatures = parseFeatures(pdfText);
        }
      }

      // Build fixed specs (Product model fields) — skip for accessories
      const fixedSpecs = isAccessory ? {} : {
        material: (parsedSpecs && parsedSpecs.material) || DEFAULT_FIXED_SPECS.material,
        ipRating: shortIP((parsedSpecs && parsedSpecs.ipRating) || DEFAULT_FIXED_SPECS.ipRating),
        flammability: (parsedSpecs && parsedSpecs.fireRating) || DEFAULT_FIXED_SPECS.flammability,
        temperature: (parsedSpecs && parsedSpecs.temperature) || DEFAULT_FIXED_SPECS.temperature,
      };

      // Build dynamic specs — skip for accessories
      const dynamicSpecs = isAccessory ? [] : (parsedSpecs ? [
        { key: 'Dimension', value: dimStr || 'TBD' },
        { key: 'Material', value: parsedSpecs.material || DEFAULT_DYNAMIC_SPECS[0].value },
        { key: 'Ingress Protection', value: parsedSpecs.ipRating || DEFAULT_DYNAMIC_SPECS[1].value },
        { key: 'Ultraviolet Protection', value: parsedSpecs.uvProtection || DEFAULT_DYNAMIC_SPECS[2].value },
        { key: 'Impact Resistance', value: parsedSpecs.ikRating || DEFAULT_DYNAMIC_SPECS[3].value },
        { key: 'Glow Wire Test', value: parsedSpecs.glowWire || DEFAULT_DYNAMIC_SPECS[4].value },
        { key: 'Ambient Temperature', value: parsedSpecs.temperature || DEFAULT_DYNAMIC_SPECS[5].value },
        { key: 'Fire Rating', value: parsedSpecs.fireRating || DEFAULT_DYNAMIC_SPECS[6].value },
        { key: 'ROHS Compliance', value: parsedSpecs.rohs || DEFAULT_DYNAMIC_SPECS[7].value },
        { key: 'Environment Protection', value: parsedSpecs.environment || DEFAULT_DYNAMIC_SPECS[8].value },
      ] : [
        { key: 'Dimension', value: dimStr || 'TBD' },
        ...DEFAULT_DYNAMIC_SPECS,
      ]);

      const features = isAccessory ? [] : (parsedFeatures.length > 0 ? parsedFeatures : DEFAULT_FEATURES);

      // Create product
      const product = await prisma.product.create({
        data: {
          name,
          slug,
          code: p.code,
          description,
          dimensionLength: p.dims ? p.dims[0] : null,
          dimensionWidth: p.dims ? p.dims[1] : null,
          dimensionHeight: p.dims ? p.dims[2] : null,
          categoryId: catRecord.id,
          specMaterial: fixedSpecs.material || null,
          specIpRating: fixedSpecs.ipRating || null,
          specFlammability: fixedSpecs.flammability || null,
          specTemperatureRange: fixedSpecs.temperature || null,
          isActive: true,
          isFeatured: false,
        },
      });

      // ProductCategory junction
      await prisma.productCategory.create({
        data: { productId: product.id, categoryId: catRecord.id },
      });

      // Dynamic specs
      if (dynamicSpecs.length > 0) {
        await prisma.productDynamicSpec.createMany({
          data: dynamicSpecs.map((s, i) => ({
            productId: product.id,
            specKey: s.key,
            specValue: s.value,
            sortOrder: i,
          })),
        });
      }

      // Features
      if (features.length > 0) {
        await prisma.productFeature.createMany({
          data: features.map((text, i) => ({
            productId: product.id,
            featureText: text,
            sortOrder: i,
          })),
        });
      }

      // Images
      if (isAccessory && p.imgFile) {
        const srcPath = path.join(SOURCE_DIR, 'Accessories', 'images', p.imgFile);
        if (fs.existsSync(srcPath)) {
          const filename = copyFile(srcPath, UPLOAD_IMAGES, '.jpg');
          const imageUrl = `/uploads/products/images/${filename}`;
          await prisma.productImage.create({
            data: {
              productId: product.id,
              imageUrl,
              altText: name,
              isPrimary: true,
              sortOrder: 0,
            },
          });
          stats.images++;
          if (!categoryFirstImage['accessories']) {
            categoryFirstImage['accessories'] = imageUrl;
          }
        }
      } else {
        const imageFiles = findImages(p);
        for (let i = 0; i < imageFiles.length; i++) {
          const srcPath = path.join(getSeriesDir(p.series), 'images', imageFiles[i]);
          const filename = copyFile(srcPath, UPLOAD_IMAGES, '.jpg');
          const imageUrl = `/uploads/products/images/${filename}`;

          await prisma.productImage.create({
            data: {
              productId: product.id,
              imageUrl,
              altText: `${name} - Image ${i + 1}`,
              isPrimary: i === 0,
              sortOrder: i,
            },
          });
          stats.images++;

          // Track first image per series for category thumbnail
          if (i === 0 && !categoryFirstImage[p.series]) {
            categoryFirstImage[p.series] = imageUrl;
          }
        }
      }

      // Datasheet document
      if (datasheetPath) {
        const filename = copyFile(datasheetPath, UPLOAD_DOCS, '.pdf');
        const docUrl = `/uploads/products/documents/${filename}`;
        const fileSize = fs.statSync(datasheetPath).size;

        await prisma.productDocument.create({
          data: {
            productId: product.id,
            name: `${name} - Technical Data Sheet`,
            documentUrl: docUrl,
            documentType: 'DATASHEET',
            fileSizeBytes: fileSize,
          },
        });
        stats.datasheets++;
      }

      const imgCount = isAccessory ? (p.imgFile ? 1 : 0) : (findImages(p).length);
      const imgTag = imgCount > 0 ? `${imgCount}img` : '';
      const dsTag = datasheetPath ? 'TDS' : '';
      const tags = [imgTag, dsTag].filter(Boolean).join(',');
      console.log(`  CREATE ${p.code.padEnd(16)} ${name}${tags ? ` [${tags}]` : ''}`);
      stats.created++;
    } catch (error) {
      console.error(`  ERROR  ${p.code}: ${error.message}`);
      stats.errors++;
    }
  }

  // Update category images
  console.log('\n--- Setting category images ---');
  for (const [seriesKey, imageUrl] of Object.entries(categoryFirstImage)) {
    const cat = seriesKey === 'accessories' ? getCat('accessories') : getCat(parseInt(seriesKey));
    if (cat) {
      await prisma.category.update({
        where: { slug: cat.slug },
        data: { imageUrl },
      });
      console.log(`  ${cat.name} -> ${path.basename(imageUrl)}`);
    }
  }

  // Step 7: Summary
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log(`  Products created:  ${stats.created}`);
  console.log(`  Products skipped:  ${stats.skipped}`);
  console.log(`  Errors:            ${stats.errors}`);
  console.log(`  Images copied:     ${stats.images}`);
  console.log(`  Datasheets copied: ${stats.datasheets}`);
  console.log('='.repeat(50));
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
