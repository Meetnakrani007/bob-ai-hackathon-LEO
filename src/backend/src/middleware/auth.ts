import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';

export interface AuthUser {
  user_id: string;
  organization_id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_supplyguard_2026_super_secure_key_32chars';

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token is required. Format: Bearer <token>',
      },
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired. Please refresh your session.',
        },
      });
      return;
    }

    res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Provided access token is invalid or malformed.',
      },
    });
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required prior to authorization check',
        },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'Admin') {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
        },
      });
      return;
    }

    next();
  };
}
