import { Router } from 'express';
import { getPorts, getPortStatus } from '../controllers/portsController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole('Supply Chain Analyst', 'Logistics Manager', 'Admin', 'Auditor'));

router.get('/', getPorts);
router.get('/:id/status', getPortStatus);

export default router;
