import { PrismaClient, User, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// User interface for creating a new user
export interface ICreateUser {
  email: string;
  password: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isVerified?: boolean;
  isActive?: boolean;
}

// User interface for updating a user
export interface IUpdateUser {
  email?: string;
  password?: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isVerified?: boolean;
  isActive?: boolean;
}

// User filters for searching and filtering
export interface IUserFilters {
  searchTerm?: string;
  role?: UserRole;
  isVerified?: boolean;
  isActive?: boolean;
}

// Pagination options
export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IUserQueryResult {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export const UserModel = {
  prisma,
};

export default UserModel;
