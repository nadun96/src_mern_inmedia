import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extract the Cloudinary public_id from a Cloudinary URL.
 * Example URL: https://res.cloudinary.com/dkxb9gklg/image/upload/v1234567890/abc123.jpg
 * Returns: "abc123" (without extension)
 */
export function extractPublicId(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) return null;

  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    // After /upload/ there may be a version (v1234567890/) then the public_id.ext
    let afterUpload = parts[1];

    // Remove version prefix if present (e.g. "v1234567890/")
    afterUpload = afterUpload.replace(/^v\d+\//, '');

    // Remove file extension
    const publicId = afterUpload.replace(/\.[^/.]+$/, '');

    return publicId || null;
  } catch {
    return null;
  }
}

/**
 * Delete an image from Cloudinary by its URL.
 * Silently logs errors — image cleanup should not break the main operation.
 */
export async function deleteCloudinaryImage(imageUrl: string): Promise<void> {
  const publicId = extractPublicId(imageUrl);
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
}

export default cloudinary;
