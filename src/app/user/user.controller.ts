import { Request, Response } from 'express';
import { UserService } from './user.service';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendResponse';
import { IUserFilters, IPaginationOptions } from './user.model';
import { UserRole } from '@prisma/client';

/**
 * Create a new user
 * @route POST /api/v1/users
 */
const createUser = catchAsync(async (req: Request, res: Response) => {
  const userData = req.body;
  const result = await UserService.createUser(userData);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'User created successfully',
    data: result,
  });
});

/**
 * Get all users with filtering and pagination
 * @route GET /api/v1/users
 */
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  // Extract query parameters
  const {
    searchTerm,
    role,
    isVerified,
    isActive,
    page,
    limit,
    sortBy,
    sortOrder,
  } = req.query;

  // Build filters
  const filters: IUserFilters = {
    searchTerm: searchTerm as string,
    role: role as UserRole,
    isVerified:
      isVerified === 'true' ? true : isVerified === 'false' ? false : undefined,
    isActive:
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
  };

  // Build pagination options
  const paginationOptions: IPaginationOptions = {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
  };

  const result = await UserService.getAllUsers(filters, paginationOptions);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Users retrieved successfully',
    data: result.users,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
    },
  });
});

/**
 * Get a single user by ID
 * @route GET /api/v1/users/:id
 */
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.getUserById(id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User retrieved successfully',
    data: result,
  });
});

/**
 * Update a user
 * @route PATCH /api/v1/users/:id
 */
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userData = req.body;
  const result = await UserService.updateUser(id, userData);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User updated successfully',
    data: result,
  });
});

/**
 * Delete a user
 * @route DELETE /api/v1/users/:id
 */
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.deleteUser(id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User deleted successfully',
    data: result,
  });
});

export const UserController = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
