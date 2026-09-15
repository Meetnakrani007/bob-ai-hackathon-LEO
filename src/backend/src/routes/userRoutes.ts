import { Router } from 'express';
import { listUsers, createUser, updateUserRole, deleteUser } from '../controllers/authController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

// All user management routes require JWT and Admin role
router.use(authenticateJWT);
router.use(requireRole('Admin'));

router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;
