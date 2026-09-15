import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationsController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

export default router;
