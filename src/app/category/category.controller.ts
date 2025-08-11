import { Request, Response } from 'express';
import { CategoryService } from './category.service';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendResponse';
import { ICategoryFilters, IPaginationOptions } from './category.model';

/**
 * Create a new category
 * @route POST /api/v1/categories
 */
const createCategory = catchAsync(async (req: Request, res: Response) => {
  const categoryData = req.body;
  const result = await CategoryService.createCategory(categoryData);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Category created successfully',
    data: result,
  });
});

/**
 * Get all categories with filtering and pagination
 * @route GET /api/v1/categories
 */
const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  // Extract query parameters
  const { searchTerm, page, limit, sortBy, sortOrder } = req.query;

  // Build filters
  const filters: ICategoryFilters = {
    searchTerm: searchTerm as string,
  };

  // Build pagination options
  const paginationOptions: IPaginationOptions = {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
  };

  const result = await CategoryService.getAllCategories(
    filters,
    paginationOptions
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Categories retrieved successfully',
    data: result.categories,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
    },
  });
});

/**
 * Get a single category by ID
 * @route GET /api/v1/categories/:id
 */
const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CategoryService.getCategoryById(id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Category retrieved successfully',
    data: result,
  });
});

/**
 * Update a category
 * @route PATCH /api/v1/categories/:id
 */
const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const categoryData = req.body;
  const result = await CategoryService.updateCategory(id, categoryData);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Category updated successfully',
    data: result,
  });
});

/**
 * Delete a category
 * @route DELETE /api/v1/categories/:id
 */
const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CategoryService.deleteCategory(id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Category deleted successfully',
    data: result,
  });
});

export const CategoryController = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
