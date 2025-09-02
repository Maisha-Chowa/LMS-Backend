import { Prisma } from '@prisma/client';

/**
 * Generic pagination options interface
 */
export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Generic query result interface
 */
export interface IQueryResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Build pagination options for Prisma queries
 * @param options Pagination options
 * @returns Object with skip, take, and orderBy properties
 */
export const buildPaginationOptions = <T>(
  options: IPaginationOptions
): {
  skip: number;
  take: number;
  orderBy: any;
} => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy || 'createdAt';
  const sortOrder = options.sortOrder || 'desc';

  return {
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  };
};

/**
 * Build search conditions for string fields
 * @param searchTerm Search term to look for
 * @param fields Array of field names to search in
 * @returns Prisma OR condition for searching
 */
export const buildSearchCondition = (
  searchTerm: string | undefined,
  fields: string[]
): any[] => {
  if (!searchTerm) return [];

  return fields.map((field) => ({
    [field]: {
      contains: searchTerm,
      mode: 'insensitive',
    },
  }));
};

/**
 * Build filter conditions for exact match fields
 * @param filters Object with field-value pairs for filtering
 * @returns Object with filter conditions
 */
export const buildExactMatchConditions = (
  filters: Record<string, any>
): Record<string, any> => {
  const conditions: Record<string, any> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && key !== 'searchTerm') {
      conditions[key] = value;
    }
  });

  return conditions;
};

/**
 * Build range filter conditions (min/max)
 * @param field Field name to filter
 * @param min Minimum value
 * @param max Maximum value
 * @returns Object with range condition
 */
export const buildRangeCondition = (
  field: string,
  min: number | undefined,
  max: number | undefined
): Record<string, any> | null => {
  if (min === undefined && max === undefined) return null;

  const condition: Record<string, any> = {};

  if (min !== undefined) {
    condition[field] = {
      ...condition[field],
      gte: min,
    };
  }

  if (max !== undefined) {
    condition[field] = {
      ...condition[field],
      lte: max,
    };
  }

  return condition;
};

/**
 * Build complete where conditions for Prisma queries
 * @param searchConfig Search configuration
 * @returns Complete where conditions object for Prisma
 */
export const buildWhereConditions = <T extends Record<string, any>>({
  searchTerm,
  searchFields,
  exactMatchFields,
  rangeFields,
  filters,
}: {
  searchTerm?: string;
  searchFields: string[];
  exactMatchFields?: Record<string, string>;
  rangeFields?: Record<string, { min?: number; max?: number }>;
  filters: T;
}): any => {
  const conditions: Record<string, any> = {};

  // Add search conditions
  if (searchTerm) {
    conditions.OR = buildSearchCondition(searchTerm, searchFields);
  }

  // Add exact match conditions
  const exactMatches: Record<string, any> = {};

  if (exactMatchFields) {
    Object.entries(exactMatchFields).forEach(([filterKey, dbField]) => {
      if (filters[filterKey] !== undefined && filters[filterKey] !== null) {
        exactMatches[dbField] = filters[filterKey];
      }
    });
  }

  // Add range conditions
  const rangeConditions: Record<string, any> = {};

  if (rangeFields) {
    Object.entries(rangeFields).forEach(([field, { min, max }]) => {
      if (min !== undefined || max !== undefined) {
        const rangeCondition = buildRangeCondition(field, min, max);
        if (rangeCondition) {
          Object.assign(rangeConditions, rangeCondition);
        }
      }
    });
  }

  // Combine all conditions
  return {
    ...conditions,
    ...exactMatches,
    ...rangeConditions,
  };
};

/**
 * Execute a paginated query with search and filters
 * @param queryFn Function to execute the query
 * @param countFn Function to count total results
 * @param whereConditions Where conditions for the query
 * @param paginationOptions Pagination options
 * @returns Query result with pagination metadata
 */
export const executeQuery = async <T>(
  queryFn: (args: any) => Promise<T[]>,
  countFn: (args: any) => Promise<number>,
  whereConditions: any,
  paginationOptions: IPaginationOptions
): Promise<IQueryResult<T>> => {
  const { skip, take, orderBy } = buildPaginationOptions(paginationOptions);
  const { page = 1, limit = 10 } = paginationOptions;

  const [data, total] = await Promise.all([
    queryFn({
      where: whereConditions,
      skip,
      take,
      orderBy,
    }),
    countFn({ where: whereConditions }),
  ]);

  return {
    data,
    total,
    page,
    limit,
  };
};

