const prisma = require('./database');
const transporter = require('./email');
const constants = require('./constants');

module.exports = {
  prisma,
  transporter,
  constants,
};
