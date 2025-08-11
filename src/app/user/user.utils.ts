import { User, Prisma, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { IUserFilters } from './user.model';
import { buildWhereConditions } from '../../shared/searchAndFilter';

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
  // Define search fields
  const searchFields = ['email', 'firstName', 'lastName'];

  // Define exact match fields mapping
  const exactMatchFields = {
    role: 'role',
    isVerified: 'isVerified',
    isActive: 'isActive',
  };

  // Use the shared utility to build conditions
  return buildWhereConditions({
    searchTerm: filters.searchTerm,
    searchFields,
    exactMatchFields,
    filters,
  });
};
