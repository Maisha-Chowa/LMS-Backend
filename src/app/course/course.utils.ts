import { Course, Prisma, CourseStatus } from '@prisma/client';
import { ICourseFilters } from './course.model';
import { v2 as cloudinary } from 'cloudinary';
import {
  buildWhereConditions,
  buildRangeCondition,
} from '../../shared/searchAndFilter';

/**
 * Build Prisma query conditions for course filtering
 */
export const buildCourseQueryConditions = (
  filters: ICourseFilters
): Prisma.CourseWhereInput => {
  const { minPrice, maxPrice } = filters;

  // Define search fields
  const searchFields = ['title', 'description'];

  // Define exact match fields mapping
  const exactMatchFields = {
    instructorId: 'instructorId',
    categoryId: 'categoryId',
    status: 'status',
  };

  // Create base conditions using shared utility
  const baseConditions = buildWhereConditions({
    searchTerm: filters.searchTerm,
    searchFields,
    exactMatchFields,
    filters,
  });

  // Add price range condition if needed
  const priceCondition = buildRangeCondition('price', minPrice, maxPrice);

  // Combine all conditions
  return {
    ...baseConditions,
    ...(priceCondition ? { price: priceCondition.price } : {}),
  };
};

/**
 * Upload thumbnail to Cloudinary
 */
export const uploadThumbnail = async (
  file: Express.Multer.File
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'lms/thumbnails',
      transformation: [{ width: 800, height: 450, crop: 'fill' }],
    });
    return result.secure_url;
  } catch (error) {
    throw new Error('Failed to upload thumbnail');
  }
};

/**
 * Delete thumbnail from Cloudinary
 */
export const deleteThumbnail = async (url: string): Promise<void> => {
  try {
    const publicId = getPublicIdFromUrl(url);
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting thumbnail:', error);
  }
};

/**
 * Extract public ID from Cloudinary URL
 */
export const getPublicIdFromUrl = (url: string): string => {
  const splitUrl = url.split('/');
  const filename = splitUrl[splitUrl.length - 1];
  const publicId = `lms/thumbnails/${filename.split('.')[0]}`;
  return publicId;
};
