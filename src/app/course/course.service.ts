import { Course, PrismaClient, UserRole } from '@prisma/client';
import { ApiError } from '../../globalErrorHandler/globalErrorHandler';
import {
  ICreateCourse,
  IUpdateCourse,
  ICourseFilters,
  ICourseQueryResult,
} from './course.model';
import { buildCourseQueryConditions, deleteThumbnail } from './course.utils';
import {
  buildPaginationOptions,
  executeQuery,
  IPaginationOptions,
} from '../../shared/searchAndFilter';

const prisma = new PrismaClient();

/**
 * Create a new course
 */
const createCourse = async (courseData: ICreateCourse): Promise<Course> => {
  // Check if the instructor exists and has the right role
  const instructor = await prisma.user.findUnique({
    where: { id: courseData.instructorId },
  });

  if (!instructor) {
    throw new ApiError('Instructor not found', 404);
  }

  if (
    instructor.role !== UserRole.INSTRUCTOR &&
    instructor.role !== UserRole.ADMIN &&
    instructor.role !== UserRole.SUPER_ADMIN
  ) {
    throw new ApiError(
      'User must be an instructor, admin, or super admin to create courses',
      403
    );
  }

  // Check if category exists if provided
  if (courseData.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: courseData.categoryId },
    });

    if (!category) {
      throw new ApiError('Category not found', 404);
    }
  }

  // Create course
  const course = await prisma.course.create({
    data: courseData,
    include: {
      instructor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
        },
      },
      category: true,
    },
  });

  return course;
};

/**
 * Get all courses with filtering and pagination
 */
const getAllCourses = async (
  filters: ICourseFilters,
  paginationOptions: IPaginationOptions
): Promise<ICourseQueryResult> => {
  // Build query conditions
  const whereConditions = buildCourseQueryConditions(filters);

  // Define include for related data
  const includeOptions = {
    instructor: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
      },
    },
    category: true,
  };

  // Use the shared utility to execute the query
  const result = await executeQuery<Course>(
    (args) =>
      prisma.course.findMany({
        ...args,
        include: includeOptions,
      }),
    (args) => prisma.course.count(args),
    whereConditions,
    paginationOptions
  );

  return {
    courses: result.data,
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
};

/**
 * Get a single course by ID
 */
const getCourseById = async (id: string): Promise<Course> => {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
        },
      },
      category: true,
    },
  });

  if (!course) {
    throw new ApiError('Course not found', 404);
  }

  return course;
};

/**
 * Update a course
 */
const updateCourse = async (
  id: string,
  courseData: IUpdateCourse,
  userId: string
): Promise<Course> => {
  // Check if course exists
  const existingCourse = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: true,
    },
  });

  if (!existingCourse) {
    throw new ApiError('Course not found', 404);
  }

  // Check if user is the instructor of the course or an admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  const isInstructor = existingCourse.instructorId === userId;
  const isAdmin =
    user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;

  if (!isInstructor && !isAdmin) {
    throw new ApiError('You are not authorized to update this course', 403);
  }

  // Check if category exists if provided
  if (courseData.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: courseData.categoryId },
    });

    if (!category) {
      throw new ApiError('Category not found', 404);
    }
  }

  // If thumbnail is being updated and course already has a thumbnail, delete the old one
  if (
    courseData.thumbnail &&
    existingCourse.thumbnail &&
    courseData.thumbnail !== existingCourse.thumbnail
  ) {
    try {
      await deleteThumbnail(existingCourse.thumbnail);
    } catch (error) {
      console.error('Error deleting old thumbnail:', error);
      // Continue with update even if deletion fails
    }
  }

  // Update course
  const updatedCourse = await prisma.course.update({
    where: { id },
    data: courseData,
    include: {
      instructor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
        },
      },
      category: true,
    },
  });

  return updatedCourse;
};

/**
 * Delete a course
 */
const deleteCourse = async (id: string, userId: string): Promise<Course> => {
  // Check if course exists
  const existingCourse = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: true,
    },
  });

  if (!existingCourse) {
    throw new ApiError('Course not found', 404);
  }

  // Check if user is the instructor of the course or an admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  const isInstructor = existingCourse.instructorId === userId;
  const isAdmin =
    user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;

  if (!isInstructor && !isAdmin) {
    throw new ApiError('You are not authorized to delete this course', 403);
  }

  // Delete thumbnail if exists
  if (existingCourse.thumbnail) {
    try {
      await deleteThumbnail(existingCourse.thumbnail);
    } catch (error) {
      console.error('Error deleting thumbnail:', error);
      // Continue with deletion even if thumbnail removal fails
    }
  }

  // Delete course
  const deletedCourse = await prisma.course.delete({
    where: { id },
    include: {
      instructor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
        },
      },
      category: true,
    },
  });

  return deletedCourse;
};

export const CourseService = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
