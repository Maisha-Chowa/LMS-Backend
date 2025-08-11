import { PrismaClient, User, UserRole } from '@prisma/client';
import { IPaginationOptions, IQueryResult } from '../../shared/searchAndFilter';

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

// User query result interface
export interface IUserQueryResult extends IQueryResult<User> {
  data: User[];
  users: User[];
}

export const UserModel = {
  prisma,
};

export default UserModel;
