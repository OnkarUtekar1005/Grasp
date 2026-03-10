const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { constants } = require('../config');

const uploadDir = process.env.UPLOAD_DIR || './uploads';

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subDir = 'misc';

    // Determine subdirectory based on route
    if (req.baseUrl.includes('products')) {
      subDir = file.mimetype.startsWith('image/') ? 'products/images' : 'products/documents';
    } else if (req.baseUrl.includes('categories')) {
      subDir = 'categories';
    } else if (req.baseUrl.includes('gallery')) {
      subDir = 'gallery';
    } else if (req.baseUrl.includes('downloads')) {
      subDir = 'downloads';
    }

    cb(null, path.join(uploadDir, subDir));
  },
  filename: (req, file, cb) => {
    // Generate unique filename with UUID
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// File filter for images
const imageFilter = (req, file, cb) => {
  if (constants.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

// File filter for documents (PDF)
const documentFilter = (req, file, cb) => {
  if (constants.ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF documents are allowed'), false);
  }
};

// File filter for both images and documents
const mixedFilter = (req, file, cb) => {
  const allowed = [...constants.ALLOWED_IMAGE_TYPES, ...constants.ALLOWED_DOCUMENT_TYPES];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

// Upload configurations
const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: constants.MAX_FILE_SIZE },
});

const uploadDocument = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: constants.MAX_FILE_SIZE },
});

const uploadMixed = multer({
  storage,
  fileFilter: mixedFilter,
  limits: { fileSize: constants.MAX_FILE_SIZE },
});

module.exports = {
  uploadImage,
  uploadDocument,
  uploadMixed,
};
