import { Request } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import { ApiError } from '../../globalErrorHandler/globalErrorHandler';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define file size limits
const MAX_FILE_SIZE = 1024 * 1024 * 2; // 2MB

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lms/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
    public_id: (req: Request, file: Express.Multer.File) => {
      const filename = file.originalname.split('.')[0];
      return `avatar-${filename}-${Date.now()}`;
    },
  } as any, // Type casting due to typings issue
});

// File filter function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check file type
  const allowedFileTypes = /jpeg|jpg|png|webp/;
  const extname = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(
      new ApiError(
        'Invalid file type. Only JPG, JPEG, PNG, and WEBP files are allowed.',
        400
      )
    );
  }
};

// Configure multer
export const uploadAvatar = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter,
}).single('avatar');

// Utility function to delete image from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

// Extract public ID from Cloudinary URL
export const getPublicIdFromUrl = (url: string): string => {
  const splitUrl = url.split('/');
  const filename = splitUrl[splitUrl.length - 1];
  const publicId = `lms/avatars/${filename.split('.')[0]}`;
  return publicId;
};
