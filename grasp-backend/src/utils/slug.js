/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - The text to convert to slug
 * @returns {string} - URL-friendly slug
 */
function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove non-word chars (except -)
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

/**
 * Generate a unique slug by appending a number if needed
 * @param {string} baseSlug - The base slug
 * @param {Function} checkExists - Async function to check if slug exists
 * @returns {Promise<string>} - Unique slug
 */
async function generateUniqueSlug(baseSlug, checkExists) {
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

module.exports = {
  generateSlug,
  generateUniqueSlug,
};
