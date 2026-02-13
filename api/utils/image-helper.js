import sharp from 'sharp';

/**
 * @typedef {Object} AvatarConfig
 * @property {number} maxWidth - Maximum width for the avatar in pixels
 * @property {number} maxHeight - Maximum height for the avatar in pixels
 * @property {number} quality - Image quality (1-100) for compression
 * @property {string} format - Output image format
 */

/**
 * Configuration settings for avatar image processing.
 * @type {AvatarConfig}
 * @constant
 */
const AVATAR_CONFIG = {
  maxWidth: 200,
  maxHeight: 200,
  quality: 80,
  format: 'webp'
};

/**
 * Compresses and resizes a base64 image for avatar use.
 * @param {string} base64Image - The base64 encoded image string (with or without data URI prefix)
 * @returns {Promise<string>} - Compressed base64 image with data URI prefix
 */
export async function compressAvatar(base64Image) {
  if (!base64Image) {
    return null;
  }

  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const imageBuffer = Buffer.from(base64Data, 'base64');

  const compressedBuffer = await sharp(imageBuffer)
    .resize(AVATAR_CONFIG.maxWidth, AVATAR_CONFIG.maxHeight, {
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: AVATAR_CONFIG.quality })
    .toBuffer();

  return `data:image/${AVATAR_CONFIG.format};base64,${compressedBuffer.toString('base64')}`;
}
