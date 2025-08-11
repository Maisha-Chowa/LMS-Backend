import { Request, Response, NextFunction } from 'express';
import { uploadAvatar } from './user.upload';
import { ApiError } from '../../globalErrorHandler/globalErrorHandler';

export const handleAvatarUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  uploadAvatar(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError('File size cannot exceed 2MB', 400));
      }
      return next(err);
    }

    // If file was uploaded successfully, add the URL to the request body
    if (req.file) {
      req.body.avatar = req.file.path;
    }
    
    next();
  });
};
