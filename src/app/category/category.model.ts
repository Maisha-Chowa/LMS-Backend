import { PrismaClient, Category } from '@prisma/client';
import { IQueryResult } from '../../shared/searchAndFilter';

const prisma = new PrismaClient();

// Category interface for creating a new category
export interface ICreateCategory {
  name: string;
  description?: string;
}

// Category interface for updating a category
export interface IUpdateCategory {
  name?: string;
  description?: string;
}

// Category filters for searching and filtering
export interface ICategoryFilters {
  searchTerm?: string;
}

// Category query result interface
export interface ICategoryQueryResult extends IQueryResult<Category> {
  data: Category[];
  categories: Category[];
}

export const CategoryModel = {
  prisma,
};

export default CategoryModel;
