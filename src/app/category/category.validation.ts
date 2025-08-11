import { z } from 'zod';

// Create category validation schema
export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Category name is required' })
      .min(2, 'Category name must be at least 2 characters')
      .max(100, 'Category name cannot exceed 100 characters'),
    description: z
      .string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
  }),
});

// Update category validation schema
export const updateCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Category name must be at least 2 characters')
      .max(100, 'Category name cannot exceed 100 characters')
      .optional(),
    description: z
      .string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'Category ID is required' }),
  }),
});

// Get single category validation schema
export const getCategorySchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Category ID is required' }),
  }),
});

// Delete category validation schema
export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Category ID is required' }),
  }),
});

// Get all categories validation schema with filters and pagination
export const getAllCategoriesSchema = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    page: z.coerce.number().positive().optional(),
    limit: z.coerce.number().positive().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});
