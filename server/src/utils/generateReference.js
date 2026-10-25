const crypto = require('crypto');

/**
 * Generate a distinct human-readable booking reference.
 * Example: IMV-8F2A-94B1
 */
const generateReference = () => {
  const segment1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const segment2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `IMV-${segment1}-${segment2}`;
};

module.exports = generateReference;
