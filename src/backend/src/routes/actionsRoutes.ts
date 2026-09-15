import { Router } from 'express';
import { approveAction, approveActionSchema } from '../controllers/actionsController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticateJWT);

// Only Logistics Manager and Admin can approve operational interventions
router.post(
  '/:id/approve',
  requireRole('Logistics Manager', 'Admin'),
  validate({ body: approveActionSchema }),
  approveAction
);

export default router;
