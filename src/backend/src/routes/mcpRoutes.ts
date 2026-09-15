import { Router } from 'express';
import { listTools, callTool, listResources, readResource } from '../controllers/mcpController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

// MCP introspection routes
router.use(authenticateJWT);
router.use(requireRole('Supply Chain Analyst', 'Logistics Manager', 'Admin', 'Auditor'));

router.get('/tools', listTools);
router.post('/tools/:name/call', callTool);
router.get('/resources', listResources);
router.get('/resources/read', readResource);

export default router;
