import { z } from 'zod';
import { UserRole } from '@prisma/client';

// Create user validation schema
export const createUserSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password cannot exceed 100 characters'),
    role: z.nativeEnum(UserRole).optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatar: z.string().url('Invalid URL format').optional(),
    isVerified: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

// Update user validation schema
export const updateUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').optional(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password cannot exceed 100 characters')
      .optional(),
    role: z.nativeEnum(UserRole).optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatar: z.string().url('Invalid URL format').optional(),
    isVerified: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'User ID is required' }),
  }),
});

// Get single user validation schema
export const getUserSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'User ID is required' }),
  }),
});

// Delete user validation schema
export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'User ID is required' }),
  }),
});

// Get all users validation schema with filters and pagination
export const getAllUsersSchema = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    role: z.nativeEnum(UserRole).optional(),
    isVerified: z.coerce.boolean().optional(),
    isActive: z.coerce.boolean().optional(),
    page: z.coerce.number().positive().optional(),
    limit: z.coerce.number().positive().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});
