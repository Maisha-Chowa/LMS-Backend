import { Request, Response } from 'express';
import { CourseService } from './course.service';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendResponse';
import { ICourseFilters } from './course.model';
import { CourseStatus } from '@prisma/client';
import { IPaginationOptions } from '@/shared/searchAndFilter';

// Define a custom interface for the request with user
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * Create a new course
 * @route POST /api/v1/courses
 */
const createCourse = catchAsync(async (req: AuthRequest, res: Response) => {
  // Get user ID from authenticated request
  const userId = req.user?.id;

  if (!userId) {
    throw new Error('User ID not found in request');
  }

  // Set the instructor ID to the current user's ID
  const courseData = {
    ...req.body,
    instructorId: userId,
  };

  const result = await CourseService.createCourse(courseData);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Course created successfully',
    data: result,
  });
});

/**
 * Get all courses with filtering and pagination
 * @route GET /api/v1/courses
 */
const getAllCourses = catchAsync(async (req: Request, res: Response) => {
  // Extract query parameters
  const {
    searchTerm,
    instructorId,
    categoryId,
    status,
    minPrice,
    maxPrice,
    page,
    limit,
    sortBy,
    sortOrder,
  } = req.query;

  // Build filters
  const filters: ICourseFilters = {
    searchTerm: searchTerm as string,
    instructorId: instructorId as string,
    categoryId: categoryId as string,
    status: status as CourseStatus,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  };

  // Build pagination options
  const paginationOptions: IPaginationOptions = {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
  };

  const result = await CourseService.getAllCourses(filters, paginationOptions);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Courses retrieved successfully',
    data: result.courses,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
    },
  });
});

/**
 * Get a single course by ID
 * @route GET /api/v1/courses/:id
 */
const getCourseById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CourseService.getCourseById(id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Course retrieved successfully',
    data: result,
  });
});

/**
 * Update a course
 * @route PATCH /api/v1/courses/:id
 */
const updateCourse = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const courseData = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw new Error('User ID not found in request');
  }

  const result = await CourseService.updateCourse(id, courseData, userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Course updated successfully',
    data: result,
  });
});

/**
 * Delete a course
 * @route DELETE /api/v1/courses/:id
 */
const deleteCourse = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw new Error('User ID not found in request');
  }

  const result = await CourseService.deleteCourse(id, userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Course deleted successfully',
    data: result,
  });
});

export const CourseController = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
