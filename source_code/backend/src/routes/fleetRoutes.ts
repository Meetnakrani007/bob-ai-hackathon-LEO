import { Router } from 'express';
import { getAvailableFleet, getFleetById } from '../controllers/fleetController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole('Supply Chain Analyst', 'Logistics Manager', 'Admin', 'Auditor'));

router.get('/available', getAvailableFleet);
router.get('/:id', getFleetById);

export default router;
