import { Router } from 'express';
import { verifyFirebaseToken } from '../../middleware/firebaseAuth';
import * as authController from './auth.controller';

const router = Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Sync user after Firebase signup
 * @access  Private (requires Firebase token)
 */
router.post('/signup', verifyFirebaseToken, authController.syncUserAfterSignup);

/**
 * @route   POST /api/auth/signin/email
 * @desc    Sign in with email and password
 * @access  Private (requires Firebase token)
 */
router.post('/signin/email', verifyFirebaseToken, authController.signInWithEmail);

/**
 * @route   POST /api/auth/signin/google
 * @desc    Sign in with Google
 * @access  Private (requires Firebase token)
 */
router.post('/signin/google', verifyFirebaseToken, authController.signInWithGoogle);

/**
 * @route   POST /api/auth/signin/phone
 * @desc    Sign in with phone number
 * @access  Private (requires Firebase token)
 */
router.post('/signin/phone', verifyFirebaseToken, authController.signInWithPhone);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email status and update database
 * @access  Private (requires Firebase token)
 */
router.post('/verify-email', verifyFirebaseToken, authController.verifyEmailStatus);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (requires Firebase token)
 */
router.get('/me', verifyFirebaseToken, authController.getCurrentUser);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private (requires Firebase token)
 */
router.put('/profile', verifyFirebaseToken, authController.updateUserProfile);

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account
 * @access  Private (requires Firebase token)
 */
router.delete('/account', verifyFirebaseToken, authController.deleteUserAccount);

export default router;
