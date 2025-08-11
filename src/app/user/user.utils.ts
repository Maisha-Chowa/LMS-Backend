import { User, Prisma, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { IUserFilters, IPaginationOptions } from './user.model';

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a password with a hash
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Exclude sensitive fields from user object
 */
export const excludeUserFields = <User, Key extends keyof User>(
  user: User,
  keys: Key[]
): Omit<User, Key> => {
  if (!user) return {} as User;

  const result = { ...user };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
};

/**
 * Build Prisma query conditions for user filtering
 */
export const buildUserQueryConditions = (
  filters: IUserFilters
): Prisma.UserWhereInput => {
  const { searchTerm, role, isVerified, isActive } = filters;
  const conditions: Prisma.UserWhereInput = {};

  // Add search term condition
  if (searchTerm) {
    conditions.OR = [
      { email: { contains: searchTerm, mode: 'insensitive' } },
      { firstName: { contains: searchTerm, mode: 'insensitive' } },
      { lastName: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  // Add role condition
  if (role) {
    conditions.role = role;
  }

  // Add isVerified condition
  if (isVerified !== undefined) {
    conditions.isVerified = isVerified;
  }

  // Add isActive condition
  if (isActive !== undefined) {
    conditions.isActive = isActive;
  }

  return conditions;
};

/**
 * Build Prisma query options for pagination and sorting
 */
export const buildPaginationOptions = (
  options: IPaginationOptions
): {
  skip: number;
  take: number;
  orderBy: Prisma.UserOrderByWithRelationInput;
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
