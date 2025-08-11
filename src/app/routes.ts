import express from 'express';
import { userRoutes } from './user/user.route';
import { categoryRoutes } from './category/category.route';
import { courseRoutes } from './course/course.route';

const router = express.Router();

// User routes
router.use('/users', userRoutes);

// Category routes
router.use('/categories', categoryRoutes);

// Course routes
router.use('/courses', courseRoutes);

export default router;
