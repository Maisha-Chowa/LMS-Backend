import express from 'express';
import { CourseController } from './course.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { handleThumbnailUpload } from './course.middleware';
import {
  createCourseSchema,
  updateCourseSchema,
  getCourseSchema,
  deleteCourseSchema,
  getAllCoursesSchema,
} from './course.validation';

// Auth middleware will be imported from auth module once it's created
// import { auth } from '../auth/auth.middleware';

const router = express.Router();

// Create a new course (requires authentication)
router.post(
  '/',
  // auth('INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'), // Uncomment when auth middleware is available
  handleThumbnailUpload,
  validateRequest(createCourseSchema),
  CourseController.createCourse
);

// Get all courses with filtering and pagination (public route)
router.get(
  '/',
  validateRequest(getAllCoursesSchema),
  CourseController.getAllCourses
);

// Get a single course by ID (public route)
router.get(
  '/:id',
  validateRequest(getCourseSchema),
  CourseController.getCourseById
);

// Update a course (requires authentication)
router.patch(
  '/:id',
  // auth('INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'), // Uncomment when auth middleware is available
  handleThumbnailUpload,
  validateRequest(updateCourseSchema),
  CourseController.updateCourse
);

// Delete a course (requires authentication)
router.delete(
  '/:id',
  // auth('INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'), // Uncomment when auth middleware is available
  validateRequest(deleteCourseSchema),
  CourseController.deleteCourse
);

export const courseRoutes = router;
