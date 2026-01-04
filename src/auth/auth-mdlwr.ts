import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { config } from '../config/index';
import { User } from '../models/index';
import { AuthenticatedRequest } from '../types/index';
import { logger } from '../logger/index';

let firebaseApp: admin.app.App | null = null;

// ---------- Firebase Init ----------
export function initializeFirebase() {
  if (firebaseApp) return firebaseApp;

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey?.replace(/\\n/g, '\n'),
      }),
    });

    logger.info('Firebase initialized successfully');
    return firebaseApp;
  } catch (error) {
    logger.error('Firebase initialization failed:', error);
    throw error;
  }
}

// ---------- Token Verification ----------
export async function verifyFirebaseToken(
  token: string
): Promise<admin.auth.DecodedIdToken> {
  try {
    const app = initializeFirebase();
    return await app.auth().verifyIdToken(token);
  } catch (error) {
    logger.error('Firebase token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
}

// ---------- Core Auth Middleware ----------
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' });
      return;
    }

    const token = authHeader.substring(7);
    if (!token) {
      res.status(401).json({ error: 'Token required' });
      return;
    }

    const decoded = await verifyFirebaseToken(token);
    const firebaseUid = decoded.uid;

    let user = await User.findOne({ firebaseUid });

    // ---------- Optional: Auto-register user on first login ----------
    if (!user) {
      user = await User.create({
        firebaseUid,
        email: decoded.email || '',
        displayName: decoded.name || decoded.email || '',
        role: 'user',
      });

      logger.info('User auto-created from auth middleware', { userId: user._id });
    }

    // ---------- (Optional) Bootstrap first admin ----------
    // If there are zero admins in DB, make first user an admin
    // const adminCount = await User.countDocuments({ role: 'admin' });
    // if (adminCount === 0) {
    //   user.role = 'admin';
    //   await user.save();
    //   logger.info('First user promoted to admin bootstrap', { userId: user._id });
    // }

    req.userId = user._id.toString();
    req.email = user.email;
    req.role = user.role;

    next();
  } catch (error) {
    logger.error('Authentication failed:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

// ---------- Role Middleware (Reusable) ----------
export function requireRole(role: 'admin' | 'user') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.role) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (req.role !== role) {
      return res.status(403).json({ error: `Requires ${role} role` });
    }

    next();
  };
}

// Backward-compatible alias
export const adminMiddleware = requireRole('admin');

// ---------- Optional Auth Middleware ----------
export function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) return next();

  const token = authHeader.substring(7);
  if (!token) return next();

  verifyFirebaseToken(token)
    .then(async (decoded) => {
      const user = await User.findOne({ firebaseUid: decoded.uid });
      if (user) {
        req.userId = user._id.toString();
        req.email = user.email;
        req.role = user.role;
      }
      next();
    })
    .catch(() => next());
}
