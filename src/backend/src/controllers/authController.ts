import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User, RefreshToken } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_supplyguard_2026_super_secure_key_32chars';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_supplyguard_2026_super_secure_key_32chars';

export const loginSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10, 'Valid refresh token is required'),
});

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase(), active: true });
  if (!user) {
    res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password combination',
      },
    });
    return;
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password combination',
      },
    });
    return;
  }

  const userPayload = {
    user_id: user.user_id,
    organization_id: user.organization_id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
  };

  const accessToken = jwt.sign(userPayload, JWT_ACCESS_SECRET, { expiresIn: '2h' });
  const refreshToken = jwt.sign({ user_id: user.user_id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  // Store refresh token in DB
  await RefreshToken.create({
    token_id: `RT-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    user_id: user.user_id,
    token_hash: refreshToken,
    expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    revoked: false,
    user_agent: req.headers['user-agent'],
    ip_address: req.ip,
  });

  res.json({
    data: {
      accessToken,
      refreshToken,
      user: userPayload,
    },
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { user_id: string };

    const tokenDoc = await RefreshToken.findOne({
      token_hash: refreshToken,
      user_id: decoded.user_id,
      revoked: false,
    });

    if (!tokenDoc) {
      res.status(401).json({
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Refresh token has been revoked or is not recognized',
        },
      });
      return;
    }

    const user = await User.findOne({ user_id: decoded.user_id, active: true });
    if (!user) {
      res.status(401).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User associated with refresh token no longer exists',
        },
      });
      return;
    }

    const userPayload = {
      user_id: user.user_id,
      organization_id: user.organization_id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
    };

    const newAccessToken = jwt.sign(userPayload, JWT_ACCESS_SECRET, { expiresIn: '2h' });

    res.json({
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (err) {
    res.status(401).json({
      error: {
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token',
      },
    });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await RefreshToken.updateMany({ token_hash: refreshToken }, { revoked: true });
  }

  res.json({
    data: {
      message: 'Successfully logged out and session revoked',
    },
  });
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
    return;
  }

  const user = await User.findOne({ user_id: req.user.user_id }).select('-password_hash');
  res.json({
    data: user || req.user,
  });
}

function getPermissionsForRole(role: string): string[] {
  switch (role) {
    case 'Admin':
      return ['*'];
    case 'Logistics Manager':
      return ['shipments:read', 'shipments:write', 'actions:approve', 'copilot:use', 'fleet:dispatch', 'simulate:run'];
    case 'Supply Chain Analyst':
      return ['shipments:read', 'copilot:use', 'simulate:run', 'analytics:read'];
    case 'Auditor':
      return ['shipments:read', 'audit:read', 'compliance:verify'];
    case 'Normal User':
    default:
      return ['shipments:read', 'view:read_only'];
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, role = 'Normal User' } = req.body;

  if (!name || !email || !password) {
    res.status(422).json({
      error: { code: 'VALIDATION_ERROR', message: 'Name, email, and password are required' },
    });
    return;
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409).json({
      error: { code: 'USER_EXISTS', message: 'An account with this email already exists' },
    });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const userId = `USR-${Date.now().toString(36).toUpperCase()}`;

  // Strict corporate zero-trust policy: Public self-registration ALWAYS creates a "Normal User" (Read-Only Viewer).
  // Elevated administrative, logistics management, or audit authority can ONLY be granted by an Admin via the Admin Console.
  const assignedRole = 'Normal User';

  const user = await User.create({
    user_id: userId,
    organization_id: 'ORG-GLC-001',
    email: email.toLowerCase(),
    name,
    role: assignedRole,
    permissions: getPermissionsForRole(assignedRole),
    password_hash: passwordHash,
    active: true,
  });

  const userPayload = {
    user_id: user.user_id,
    organization_id: user.organization_id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
  };

  const accessToken = jwt.sign(userPayload, JWT_ACCESS_SECRET, { expiresIn: '2h' });
  const refreshToken = jwt.sign({ user_id: user.user_id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  await RefreshToken.create({
    token_id: `RT-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    user_id: user.user_id,
    token_hash: refreshToken,
    expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    revoked: false,
    user_agent: req.headers['user-agent'],
    ip_address: req.ip,
  });

  res.status(201).json({
    data: {
      accessToken,
      refreshToken,
      user: userPayload,
    },
  });
}

// User Management (Admin Only)
export async function listUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  const users = await User.find({ active: true }).select('-password_hash').sort({ created_at: -1 });
  res.json({ data: users });
}

export async function createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { name, email, password = 'Password123!', role = 'Normal User' } = req.body;

  if (!name || !email) {
    res.status(422).json({
      error: { code: 'VALIDATION_ERROR', message: 'Name and email are required' },
    });
    return;
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409).json({
      error: { code: 'USER_EXISTS', message: 'User with this email already exists' },
    });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const userId = `USR-${Date.now().toString(36).toUpperCase()}`;

  const user = await User.create({
    user_id: userId,
    organization_id: 'ORG-GLC-001',
    email: email.toLowerCase(),
    name,
    role,
    permissions: getPermissionsForRole(role),
    password_hash: passwordHash,
    active: true,
  });

  res.status(201).json({
    data: {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
    },
  });
}

export async function updateUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { role } = req.body;

  if (!['Admin', 'Logistics Manager', 'Supply Chain Analyst', 'Auditor', 'Normal User'].includes(role)) {
    res.status(422).json({
      error: { code: 'INVALID_ROLE', message: 'Invalid role specified' },
    });
    return;
  }

  const user = await User.findOneAndUpdate(
    { user_id: id },
    { role, permissions: getPermissionsForRole(role) },
    { new: true }
  ).select('-password_hash');

  if (!user) {
    res.status(404).json({
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    });
    return;
  }

  res.json({ data: user });
}

export async function deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (req.user?.user_id === id) {
    res.status(400).json({
      error: { code: 'SELF_DELETION', message: 'Cannot deactivate your own admin account' },
    });
    return;
  }

  const user = await User.findOneAndUpdate(
    { user_id: id },
    { active: false },
    { new: true }
  );

  if (!user) {
    res.status(404).json({
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    });
    return;
  }

  res.json({ data: { message: `User ${user.email} deactivated successfully` } });
}
