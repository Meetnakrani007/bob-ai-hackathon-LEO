import { Router } from 'express';
import { getShipments, getShipmentById, getShipmentRisk } from '../controllers/shipmentsController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

// All shipment queries require at least Analyst role
router.use(authenticateJWT);
router.use(requireRole('Supply Chain Analyst', 'Logistics Manager', 'Admin', 'Auditor'));

router.get('/', getShipments);
router.get('/:id', getShipmentById);
router.get('/:id/risk', getShipmentRisk);

export default router;
