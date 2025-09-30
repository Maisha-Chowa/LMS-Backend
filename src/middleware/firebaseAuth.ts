import { Request, Response, NextFunction } from 'express';
import { getFirebaseAuth } from '../config/firebase';

// Extend Express Request type to include Firebase user
export interface FirebaseAuthRequest extends Request {
  firebaseUser?: {
    uid: string;
    email: string | undefined;
    name: string | undefined;
    emailVerified: boolean;
  };
}

/**
 * Middleware to verify Firebase ID tokens
 * Extracts the token from Authorization header and verifies it
 */
export const verifyFirebaseToken = async (
  req: FirebaseAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided. Authorization header must be in format: Bearer <token>',
      });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Invalid token format',
      });
      return;
    }

    // Verify the token using Firebase Admin SDK
    const auth = getFirebaseAuth();
    const decodedToken = await auth.verifyIdToken(token);

    // Attach user information to request object
    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      emailVerified: decodedToken.email_verified || false,
    };

    next();
  } catch (error: any) {
    console.error('Firebase token verification error:', error);

    if (error.code === 'auth/id-token-expired') {
      res.status(401).json({
        success: false,
        message: 'Token has expired. Please sign in again.',
      });
      return;
    }

    if (error.code === 'auth/argument-error') {
      res.status(401).json({
        success: false,
        message: 'Invalid token format',
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message,
    });
  }
};

/**
 * Optional middleware - verifies token if provided, but doesn't fail if not
 * Useful for routes that can work with or without authentication
 */
export const optionalFirebaseAuth = async (
  req: FirebaseAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    if (token) {
      const auth = getFirebaseAuth();
      const decodedToken = await auth.verifyIdToken(token);

      req.firebaseUser = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        emailVerified: decodedToken.email_verified || false,
      };
    }

    next();
  } catch (error) {
    // If token verification fails, just continue without user
    next();
  }
};
