import { Request, Response } from 'express';
import { getFirebaseAuth } from '../../config/firebase';
import { FirebaseAuthRequest } from '../../middleware/firebaseAuth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const auth = getFirebaseAuth();

/**
 * @desc Sign up with email and password (handled by Firebase on frontend)
 * After Firebase signup, sync user with database
 */
export const syncUserAfterSignup = async (req: FirebaseAuthRequest, res: Response) => {
  try {
    const firebaseUser = req.firebaseUser;
    const { name, phoneNumber } = req.body;

    if (!firebaseUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { firebaseUid: firebaseUser.uid },
    });

    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: 'User already synced',
        data: existingUser,
      });
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: firebaseUser.email!,
        firebaseUid: firebaseUser.uid,
        name: name || firebaseUser.name || 'User',
        emailVerified: firebaseUser.emailVerified,
        phoneNumber: phoneNumber || null,
        role: 'STUDENT', // Default role
      },
    });

    res.status(201).json({
      success: true,
      message: 'User synced successfully',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error: any) {
    console.error('Sync user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync user',
      error: error.message,
    });
  }
};

/**
 * @desc Sign in with email and password (handled by Firebase on frontend)
 * Verify token and return user data
 */
export const signInWithEmail = async (req: FirebaseAuthRequest, res: Response) => {
  try {
    const firebaseUser = req.firebaseUser;

    if (!firebaseUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: firebaseUser.uid },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        phoneNumber: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in database. Please complete signup.',
      });
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: user,
    });
  } catch (error: any) {
    console.error('Sign in error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

/**
 * @desc Sign in with Google (handled by Firebase on frontend)
 * Sync or update user in database
 */
export const signInWithGoogle = async (req: FirebaseAuthRequest, res: Response) => {
  try {
    const firebaseUser = req.firebaseUser;

    if (!firebaseUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
      });
    }

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { email: firebaseUser.email! },
      update: {
        firebaseUid: firebaseUser.uid,
        name: firebaseUser.name || 'Google User',
        emailVerified: firebaseUser.emailVerified,
        updatedAt: new Date(),
      },
      create: {
        email: firebaseUser.email!,
        firebaseUid: firebaseUser.uid,
        name: firebaseUser.name || 'Google User',
        emailVerified: firebaseUser.emailVerified,
        role: 'STUDENT',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      data: user,
    });
  } catch (error: any) {
    console.error('Google sign in error:', error);
    res.status(500).json({
      success: false,
      message: 'Google login failed',
      error: error.message,
    });
  }
};

/**
 * @desc Sign in with phone number (handled by Firebase on frontend)
 * Sync user with database
 */
export const signInWithPhone = async (req: FirebaseAuthRequest, res: Response) => {
  try {
    const firebaseUser = req.firebaseUser;
    const { name } = req.body;

    if (!firebaseUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
      });
    }

    // Get phone number from Firebase user
    const firebaseUserRecord = await auth.getUser(firebaseUser.uid);
    const phoneNumber = firebaseUserRecord.phoneNumber;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number not found',
      });
    }

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { firebaseUid: firebaseUser.uid },
      update: {
        phoneNumber,
        updatedAt: new Date(),
      },
      create: {
        email: firebaseUser.email || `${phoneNumber}@phone.user`,
        firebaseUid: firebaseUser.uid,
        name: name || 'Phone User',
        phoneNumber,
        emailVerified: false,
        role: 'STUDENT',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Phone login successful',
      data: user,
    });
  } catch (error: any) {
    console.error('Phone sign in error:', error);
    res.status(500).json({
      success: false,
      message: 'Phone login failed',
      error: error.message,
    });
  }
};

/**
 * @desc Verify email status
 * Update database when email is verified
 */
export const verifyEmailStatus = async (req: FirebaseAuthRequest, res: Response) => {
  try {
    const firebaseUser = req.firebaseUser;

    if (!firebaseUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Get latest user data from Firebase
    const firebaseUserRecord = await auth.getUser(firebaseUser.uid);

    // Update email verification status in database
    const user = await prisma.user.update({
      where: { firebaseUid: firebaseUser.uid },
      data: {
        emailVerified: firebaseUserRecord.emailVerified,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Email verification status updated',
      data: {
        emailVerified: user.emailVerified,
      },
    });
  } catch (error: any) {
    console.error('Verify email status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email status',
      error: error.message,
    });
  }
};

/**
 * @desc Get current user profile
 */
export const getCurrentUser = async (req: FirebaseAuthRequest, res: Response) => {
  try {
    const firebaseUser = req.firebaseUser;

    if (!firebaseUser) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid: firebaseUser.uid },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message,
    });
  }
};

/**
 * @desc Update user profile
 */
export const updateUserProfile = async (req: FirebaseAuthRequest, res: Response) => {
  try {
    const firebaseUser = req.firebaseUser;
    const { name, phoneNumber } = req.body;

    if (!firebaseUser) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const user = await prisma.user.update({
      where: { firebaseUid: firebaseUser.uid },
      data: {
        ...(name && { name }),
        ...(phoneNumber && { phoneNumber }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

/**
 * @desc Delete user account
 */
export const deleteUserAccount = async (req: FirebaseAuthRequest, res: Response) => {
  try {
    const firebaseUser = req.firebaseUser;

    if (!firebaseUser) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    // Delete from database
    await prisma.user.delete({
      where: { firebaseUid: firebaseUser.uid },
    });

    // Delete from Firebase
    await auth.deleteUser(firebaseUser.uid);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message,
    });
  }
};
