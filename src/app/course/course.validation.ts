import { z } from 'zod';
import { CourseStatus } from '@prisma/client';

// Create course validation schema
export const createCourseSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(3, 'Title must be at least 3 characters')
      .max(255, 'Title cannot exceed 255 characters'),
    description: z
      .string()
      .max(2000, 'Description cannot exceed 2000 characters')
      .optional(),
    thumbnail: z.string().url('Invalid thumbnail URL').optional(),
    price: z
      .number()
      .nonnegative('Price must be a non-negative number')
      .optional(),
    status: z.nativeEnum(CourseStatus).optional(),
    instructorId: z.string({ required_error: 'Instructor ID is required' }),
    categoryId: z.string().optional(),
  }),
});

// Update course validation schema
export const updateCourseSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(255, 'Title cannot exceed 255 characters')
      .optional(),
    description: z
      .string()
      .max(2000, 'Description cannot exceed 2000 characters')
      .optional(),
    thumbnail: z.string().url('Invalid thumbnail URL').optional(),
    price: z
      .number()
      .nonnegative('Price must be a non-negative number')
      .optional(),
    status: z.nativeEnum(CourseStatus).optional(),
    categoryId: z.string().optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'Course ID is required' }),
  }),
});

// Get single course validation schema
export const getCourseSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Course ID is required' }),
  }),
});

// Delete course validation schema
export const deleteCourseSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Course ID is required' }),
  }),
});

// Get all courses validation schema with filters and pagination
export const getAllCoursesSchema = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    instructorId: z.string().optional(),
    categoryId: z.string().optional(),
    status: z.nativeEnum(CourseStatus).optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    page: z.coerce.number().positive().optional(),
    limit: z.coerce.number().positive().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});
