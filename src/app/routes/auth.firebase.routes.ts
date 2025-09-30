import { Router, Response } from 'express';
import { verifyFirebaseToken, FirebaseAuthRequest } from '../../middleware/firebaseAuth';
import { getFirebaseAuth } from '../../config/firebase';

const router = Router();

/**
 * @route   POST /api/auth/firebase/verify
 * @desc    Verify Firebase token and sync user with database
 * @access  Public (with Firebase token)
 */
router.post('/verify', verifyFirebaseToken, async (req: FirebaseAuthRequest, res: Response) => {
  try {
    const firebaseUser = req.firebaseUser;

    if (!firebaseUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
      });
    }

    // Here you can sync the Firebase user with your PostgreSQL database
    // For example:
    // const user = await prisma.user.upsert({
    //   where: { email: firebaseUser.email },
    //   update: { firebaseUid: firebaseUser.uid },
    //   create: {
    //     email: firebaseUser.email,
    //     name: firebaseUser.name,
    //     firebaseUid: firebaseUser.uid,
    //     emailVerified: firebaseUser.emailVerified,
    //   },
    // });

    res.status(200).json({
      success: true,
      message: 'Token verified successfully',
      data: {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.name,
        emailVerified: firebaseUser.emailVerified,
      },
    });
  } catch (error: any) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/auth/firebase/me
 * @desc    Get current user information
 * @access  Private (requires Firebase token)
 */
router.get('/me', verifyFirebaseToken, async (req: FirebaseAuthRequest, res: Response) => {
  try {
    const firebaseUser = req.firebaseUser;

    if (!firebaseUser) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    // Get full user details from Firebase
    const auth = getFirebaseAuth();
    const userRecord = await auth.getUser(firebaseUser.uid);

    res.status(200).json({
      success: true,
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        emailVerified: userRecord.emailVerified,
        phoneNumber: userRecord.phoneNumber,
        disabled: userRecord.disabled,
        metadata: {
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime,
        },
      },
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/auth/firebase/custom-claims
 * @desc    Set custom claims for a user (admin only)
 * @access  Private (requires admin role)
 */
router.post('/custom-claims', verifyFirebaseToken, async (req: FirebaseAuthRequest, res: Response) => {
  try {
    const { uid, claims } = req.body;

    // Add your admin role check here
    // if (req.firebaseUser?.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Unauthorized',
    //   });
    // }

    const auth = getFirebaseAuth();
    await auth.setCustomUserClaims(uid, claims);

    res.status(200).json({
      success: true,
      message: 'Custom claims set successfully',
    });
  } catch (error: any) {
    console.error('Set custom claims error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/auth/firebase/user/:uid
 * @desc    Delete a Firebase user (admin only)
 * @access  Private (requires admin role)
 */
router.delete('/user/:uid', verifyFirebaseToken, async (req: FirebaseAuthRequest, res: Response) => {
  try {
    const { uid } = req.params;

    // Add your admin role check here
    // if (req.firebaseUser?.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Unauthorized',
    //   });
    // }

    const auth = getFirebaseAuth();
    await auth.deleteUser(uid);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

export default router;
