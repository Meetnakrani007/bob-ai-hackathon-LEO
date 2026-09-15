import { Router } from 'express';
import { login, register, refresh, logout, getMe, loginSchema, refreshSchema } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/login', validate({ body: loginSchema }), login);
router.post('/register', register);
router.post('/refresh', validate({ body: refreshSchema }), refresh);
router.post('/logout', logout);
router.get('/me', authenticateJWT, getMe);

export default router;
