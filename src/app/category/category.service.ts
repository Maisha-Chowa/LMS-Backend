import { Category, PrismaClient } from '@prisma/client';
import { ApiError } from '../../globalErrorHandler/globalErrorHandler';
import {
  ICreateCategory,
  IUpdateCategory,
  ICategoryFilters,
  ICategoryQueryResult,
} from './category.model';
import { buildCategoryQueryConditions } from './category.utils';
import {
  buildPaginationOptions,
  executeQuery,
  IPaginationOptions,
} from '../../shared/searchAndFilter';

const prisma = new PrismaClient();

/**
 * Create a new category
 */
const createCategory = async (
  categoryData: ICreateCategory
): Promise<Category> => {
  // Check if category with the same name already exists
  const existingCategory = await prisma.category.findUnique({
    where: { name: categoryData.name },
  });

  if (existingCategory) {
    throw new ApiError('Category with this name already exists', 400);
  }

  // Create category
  const category = await prisma.category.create({
    data: categoryData,
  });

  return category;
};

/**
 * Get all categories with filtering and pagination
 */
const getAllCategories = async (
  filters: ICategoryFilters,
  paginationOptions: IPaginationOptions
): Promise<ICategoryQueryResult> => {
  // Build query conditions
  const whereConditions = buildCategoryQueryConditions(filters);

  // Define include for related data
  const includeOptions = {
    courses: {
      select: {
        id: true,
      },
    },
  };

  // Use the shared utility to execute the query
  const result = await executeQuery<Category>(
    (args) =>
      prisma.category.findMany({
        ...args,
        include: includeOptions,
      }),
    (args) => prisma.category.count(args),
    whereConditions,
    paginationOptions
  );

  return {
    data: result.data,
    categories: result.data,
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
};

/**
 * Get a single category by ID
 */
const getCategoryById = async (id: string): Promise<Category> => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      courses: {
        select: {
          id: true,
          title: true,
          thumbnail: true,
          price: true,
          status: true,
        },
      },
    },
  });

  if (!category) {
    throw new ApiError('Category not found', 404);
  }

  return category;
};

/**
 * Update a category
 */
const updateCategory = async (
  id: string,
  categoryData: IUpdateCategory
): Promise<Category> => {
  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new ApiError('Category not found', 404);
  }

  // If name is being updated, check if it's already in use
  if (categoryData.name && categoryData.name !== existingCategory.name) {
    const nameExists = await prisma.category.findUnique({
      where: { name: categoryData.name },
    });

    if (nameExists) {
      throw new ApiError('Category name is already in use', 400);
    }
  }

  // Update category
  const updatedCategory = await prisma.category.update({
    where: { id },
    data: categoryData,
  });

  return updatedCategory;
};

/**
 * Delete a category
 */
const deleteCategory = async (id: string): Promise<Category> => {
  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id },
    include: {
      courses: true,
    },
  });

  if (!existingCategory) {
    throw new ApiError('Category not found', 404);
  }

  // Check if category has courses
  if (existingCategory.courses.length > 0) {
    throw new ApiError('Cannot delete category that has courses', 400);
  }

  // Delete category
  const deletedCategory = await prisma.category.delete({
    where: { id },
  });

  return deletedCategory;
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
