import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Check if credentials are provided
const isConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary service connected.');
} else {
  console.log('Cloudinary environment variables missing. Operating in MOCK mode (local uploads & Unsplash placeholders).');
}

/**
 * Uploads an image to Cloudinary or returns a mock placeholder URL if not configured.
 * @param {string} filePath - Path of the local file to upload
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
export const uploadImage = async (filePath, folder = 'kingsmart') => {
  if (isConfigured) {
    try {
      const result = await cloudinary.uploader.upload(filePath, { folder });
      return {
        secure_url: result.secure_url,
        public_id: result.public_id
      };
    } catch (error) {
      console.error('Cloudinary upload failed, falling back to mock:', error.message);
    }
  }

  // Fallback Mock Behavior
  // In a real application without Cloudinary config, we can simulate an upload
  // by returning a placeholder image. If the product name or keywords are known, we can return targeted URLs.
  // For file paths, we'll generate a dummy URL or use high-quality Unsplash apparel images.
  const mockImages = [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=800&q=80'
  ];
  
  const randomMock = mockImages[Math.floor(Math.random() * mockImages.length)];

  return {
    secure_url: randomMock,
    public_id: `mock_${Date.now()}`
  };
};

export default cloudinary;
