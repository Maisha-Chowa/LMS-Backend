import { PrismaClient, Course, CourseStatus } from '@prisma/client';
import { IPaginationOptions, IQueryResult } from '../../shared/searchAndFilter';

const prisma = new PrismaClient();

// Course interface for creating a new course
export interface ICreateCourse {
  title: string;
  description?: string;
  thumbnail?: string;
  price?: number;
  status?: CourseStatus;
  instructorId: string;
  categoryId?: string;
}

// Course interface for updating a course
export interface IUpdateCourse {
  title?: string;
  description?: string;
  thumbnail?: string;
  price?: number;
  status?: CourseStatus;
  categoryId?: string;
}

// Course filters for searching and filtering
export interface ICourseFilters {
  searchTerm?: string;
  instructorId?: string;
  categoryId?: string;
  status?: CourseStatus;
  minPrice?: number;
  maxPrice?: number;
}

// Course query result interface
export interface ICourseQueryResult extends IQueryResult<Course> {
  data: Course[];
  courses: Course[];
}

export const CourseModel = {
  prisma,
};

export default CourseModel;
