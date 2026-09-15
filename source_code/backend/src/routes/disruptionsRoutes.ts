import { Router } from 'express';
import { getActiveDisruptions, getDisruptionById } from '../controllers/disruptionsController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole('Supply Chain Analyst', 'Logistics Manager', 'Admin', 'Auditor'));

router.get('/active', getActiveDisruptions);
router.get('/:id', getDisruptionById);

export default router;
