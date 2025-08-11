import { Category, Prisma } from '@prisma/client';
import { ICategoryFilters } from './category.model';
import { buildWhereConditions } from '../../shared/searchAndFilter';

/**
 * Build Prisma query conditions for category filtering
 */
export const buildCategoryQueryConditions = (
  filters: ICategoryFilters
): Prisma.CategoryWhereInput => {
  // Define search fields
  const searchFields = ['name', 'description'];
  
  // Use the shared utility to build conditions
  return buildWhereConditions({
    searchTerm: filters.searchTerm,
    searchFields,
    filters,
  });
};