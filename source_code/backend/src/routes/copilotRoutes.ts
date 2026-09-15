import { Router } from 'express';
import { queryCopilot } from '../controllers/copilotController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole('Supply Chain Analyst', 'Logistics Manager', 'Admin'));

router.post('/query', queryCopilot);

export default router;
