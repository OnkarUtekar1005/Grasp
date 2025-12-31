const { authenticate } = require('./auth.middleware');
const { errorHandler, notFoundHandler } = require('./error.middleware');
const { uploadImage, uploadDocument, uploadMixed } = require('./upload.middleware');
const { validate } = require('./validate.middleware');

module.exports = {
  authenticate,
  errorHandler,
  notFoundHandler,
  uploadImage,
  uploadDocument,
  uploadMixed,
  validate,
};
