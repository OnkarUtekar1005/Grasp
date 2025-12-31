const authValidator = require('./auth.validator');
const adminValidator = require('./admin.validator');
const categoryValidator = require('./category.validator');
const productValidator = require('./product.validator');
const quoteValidator = require('./quote.validator');
const inquiryValidator = require('./inquiry.validator');

module.exports = {
  ...authValidator,
  ...adminValidator,
  ...categoryValidator,
  ...productValidator,
  ...quoteValidator,
  ...inquiryValidator,
};
