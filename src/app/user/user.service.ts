import { ApiError } from './../../globalErrorHandler/globalErrorHandler';
import { User, PrismaClient } from '@prisma/client';
import {
  ICreateUser,
  IUpdateUser,
  IUserFilters,
  IPaginationOptions,
  IUserQueryResult,
} from './user.model';
import {
  hashPassword,
  buildUserQueryConditions,
  buildPaginationOptions,
  excludeUserFields,
} from './user.utils';
import { deleteFromCloudinary, getPublicIdFromUrl } from './user.upload';

const prisma = new PrismaClient();

/**
 * Create a new user
 */
const createUser = async (userData: ICreateUser): Promise<User> => {
  // Check if user with the same email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    throw new ApiError('User with this email already exists', 400);
  }

  // Hash password
  if (userData.password) {
    userData.password = await hashPassword(userData.password);
  }

  // Create user
  const user = await prisma.user.create({
    data: userData,
  });

  return excludeUserFields(user, ['password']) as User;
};

/**
 * Get all users with filtering and pagination
 */
const getAllUsers = async (
  filters: IUserFilters,
  paginationOptions: IPaginationOptions
): Promise<IUserQueryResult> => {
  const { searchTerm, role, isVerified, isActive } = filters;
  const { page = 1, limit = 10 } = paginationOptions;

  // Build query conditions
  const whereConditions = buildUserQueryConditions(filters);

  // Build pagination options
  const { skip, take, orderBy } = buildPaginationOptions(paginationOptions);

  // Get users with count
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereConditions,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        avatar: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password
        password: false,
      },
    }),
    prisma.user.count({ where: whereConditions }),
  ]);

  return {
    users: users as User[],
    total,
    page,
    limit,
  };
};

/**
 * Get a single user by ID
 */
const getUserById = async (id: string): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  return excludeUserFields(user, ['password']) as User;
};

/**
 * Update a user
 */
const updateUser = async (id: string, userData: IUpdateUser): Promise<User> => {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new ApiError('User not found', 404);
  }

  // If email is being updated, check if it's already in use by another user
  if (userData.email && userData.email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (emailExists) {
      throw new ApiError('Email is already in use', 400);
    }
  }

  // Hash password if it's being updated
  if (userData.password) {
    userData.password = await hashPassword(userData.password);
  }

  // If avatar is being updated and user already has an avatar, delete the old one
  if (
    userData.avatar &&
    existingUser.avatar &&
    userData.avatar !== existingUser.avatar
  ) {
    try {
      const publicId = getPublicIdFromUrl(existingUser.avatar);
      await deleteFromCloudinary(publicId);
    } catch (error) {
      console.error('Error deleting old avatar:', error);
      // Continue with update even if deletion fails
    }
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id },
    data: userData,
  });

  return excludeUserFields(updatedUser, ['password']) as User;
};

/**
 * Delete a user
 */
const deleteUser = async (id: string): Promise<User> => {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new ApiError('User not found', 404);
  }

  // If user has an avatar, delete it from Cloudinary
  if (existingUser.avatar) {
    try {
      const publicId = getPublicIdFromUrl(existingUser.avatar);
      await deleteFromCloudinary(publicId);
    } catch (error) {
      console.error('Error deleting avatar:', error);
      // Continue with deletion even if avatar removal fails
    }
  }

  // Delete user
  const deletedUser = await prisma.user.delete({
    where: { id },
  });

  return excludeUserFields(deletedUser, ['password']) as User;
};

/**
 * Create multiple users in bulk
 */
const createBulkUsers = async (
  usersData: ICreateUser[]
): Promise<{
  successful: User[];
  failed: { user: ICreateUser; error: string }[];
  totalSuccess: number;
  totalFailed: number;
}> => {
  const results = {
    successful: [] as User[],
    failed: [] as { user: ICreateUser; error: string }[],
    totalSuccess: 0,
    totalFailed: 0,
  };

  // Get all emails from the input data
  const emails = usersData.map((user) => user.email);

  // Check for duplicate emails within the input data
  const duplicateEmails = emails.filter(
    (email, index) => emails.indexOf(email) !== index
  );

  if (duplicateEmails.length > 0) {
    throw new ApiError(
      `Duplicate emails found in input data: ${duplicateEmails.join(', ')}`,
      400
    );
  }

  // Check which emails already exist in the database
  const existingUsers = await prisma.user.findMany({
    where: {
      email: {
        in: emails,
      },
    },
    select: {
      email: true,
    },
  });

  const existingEmails = existingUsers.map((user) => user.email);

  // Process each user
  for (const userData of usersData) {
    try {
      // Skip users with emails that already exist
      if (existingEmails.includes(userData.email)) {
        results.failed.push({
          user: userData,
          error: `User with email ${userData.email} already exists`,
        });
        results.totalFailed++;
        continue;
      }

      // Hash password
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }

      // Create user
      const user = await prisma.user.create({
        data: userData,
      });

      results.successful.push(excludeUserFields(user, ['password']) as User);
      results.totalSuccess++;
    } catch (error) {
      results.failed.push({
        user: userData,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      results.totalFailed++;
    }
  }

  return results;
};

export const UserService = {
  createUser,
  createBulkUsers,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
