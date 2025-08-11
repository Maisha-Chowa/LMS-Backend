import express from 'express';
import { UserController } from './user.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { handleAvatarUpload } from './user.middleware';
import {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  deleteUserSchema,
  getAllUsersSchema,
} from './user.validation';

const router = express.Router();

// Create a new user
router.post(
  '/',
  handleAvatarUpload,
  validateRequest(createUserSchema),
  UserController.createUser
);

// Get all users with filtering and pagination
router.get('/', validateRequest(getAllUsersSchema), UserController.getAllUsers);

// Get a single user by ID
router.get('/:id', validateRequest(getUserSchema), UserController.getUserById);

// Update a user
router.patch(
  '/:id',
  handleAvatarUpload,
  validateRequest(updateUserSchema),
  UserController.updateUser
);

// Delete a user
router.delete(
  '/:id',
  validateRequest(deleteUserSchema),
  UserController.deleteUser
);

export const userRoutes = router;
