import express from 'express';
import { CategoryController } from './category.controller';
import { validateRequest } from '../../middleware/validateRequest';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategorySchema,
  deleteCategorySchema,
  getAllCategoriesSchema,
} from './category.validation';

const router = express.Router();

// Create a new category
router.post(
  '/',
  validateRequest(createCategorySchema),
  CategoryController.createCategory
);

// Get all categories with filtering and pagination
router.get(
  '/',
  validateRequest(getAllCategoriesSchema),
  CategoryController.getAllCategories
);

// Get a single category by ID
router.get(
  '/:id',
  validateRequest(getCategorySchema),
  CategoryController.getCategoryById
);

// Update a category
router.patch(
  '/:id',
  validateRequest(updateCategorySchema),
  CategoryController.updateCategory
);

// Delete a category
router.delete(
  '/:id',
  validateRequest(deleteCategorySchema),
  CategoryController.deleteCategory
);

export const categoryRoutes = router;
