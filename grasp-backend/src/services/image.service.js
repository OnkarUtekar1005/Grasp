const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { constants } = require('../config');
const { logger } = require('../utils');

/**
 * Process an uploaded image - resize and optimize
 * @param {string} filePath - Path to the uploaded file
 * @param {object} options - Processing options
 * @returns {Promise<object>} - Paths to processed images
 */
async function processImage(filePath, options = {}) {
  const { generateThumbnail = true, generateMedium = true } = options;

  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const basename = path.basename(filePath, ext);

  const results = {
    original: filePath,
  };

  try {
    // Read the original image
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Strip EXIF data and optimize original
    await sharp(filePath)
      .rotate() // Auto-rotate based on EXIF
      .jpeg({ quality: 85 })
      .toFile(path.join(dir, `${basename}_optimized${ext}`));

    // Replace original with optimized version
    await fs.rename(path.join(dir, `${basename}_optimized${ext}`), filePath);

    // Generate thumbnail
    if (generateThumbnail) {
      const thumbPath = path.join(dir, `${basename}_thumb${ext}`);
      await sharp(filePath)
        .resize(constants.IMAGE_SIZES.thumbnail.width, constants.IMAGE_SIZES.thumbnail.height, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toFile(thumbPath);
      results.thumbnail = thumbPath;
    }

    // Generate medium size
    if (generateMedium && metadata.width > constants.IMAGE_SIZES.medium.width) {
      const mediumPath = path.join(dir, `${basename}_medium${ext}`);
      await sharp(filePath)
        .resize(constants.IMAGE_SIZES.medium.width, constants.IMAGE_SIZES.medium.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toFile(mediumPath);
      results.medium = mediumPath;
    }

    logger.info({ filePath, results }, 'Image processed successfully');
    return results;
  } catch (error) {
    logger.error({ error: error.message, filePath }, 'Failed to process image');
    throw error;
  }
}

/**
 * Delete an image and its variants
 * @param {string} filePath - Path to the original image
 */
async function deleteImage(filePath) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const basename = path.basename(filePath, ext);

  const variants = [
    filePath,
    path.join(dir, `${basename}_thumb${ext}`),
    path.join(dir, `${basename}_medium${ext}`),
  ];

  for (const variant of variants) {
    try {
      await fs.unlink(variant);
      logger.debug({ path: variant }, 'Deleted image file');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        logger.error({ error: error.message, path: variant }, 'Failed to delete image');
      }
    }
  }
}

/**
 * Delete a file
 * @param {string} filePath - Path to the file
 */
async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
    logger.debug({ path: filePath }, 'Deleted file');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logger.error({ error: error.message, path: filePath }, 'Failed to delete file');
      throw error;
    }
  }
}

module.exports = {
  processImage,
  deleteImage,
  deleteFile,
};
