import { Router } from 'express';
import { getAuditLogs } from '../controllers/actionsController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole('Auditor', 'Admin', 'Logistics Manager'));

router.get('/', getAuditLogs);

export default router;
