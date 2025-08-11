import { Request, Response, NextFunction } from 'express';
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
const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lms/thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 450, crop: 'fill' }],
    public_id: (req: Request, file: Express.Multer.File) => {
      const filename = file.originalname.split('.')[0];
      return `thumbnail-${filename}-${Date.now()}`;
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
export const uploadThumbnail = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter,
}).single('thumbnail');

// Middleware to handle thumbnail upload
export const handleThumbnailUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  uploadThumbnail(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError('File size cannot exceed 5MB', 400));
      }
      return next(err);
    }

    // If file was uploaded successfully, add the URL to the request body
    if (req.file) {
      req.body.thumbnail = req.file.path;
    }

    next();
  });
};
