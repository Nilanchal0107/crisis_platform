import { Router } from 'express';
import { UserRole } from '@vrl/shared';
import { requireRole } from '../middleware/auth.js';
import { IncidentController } from '../modules/incident/incident.controller.js';

const router = Router();

// Public & Community Reporter Endpoints
router.post('/', IncidentController.createReport);
router.get('/canonical', IncidentController.listCanonicalIncidents);
router.get('/mine', IncidentController.listMyReports);
router.get('/id/:id', IncidentController.getReportById);
router.get('/:ref', IncidentController.getReportByRef);
router.post('/:ref/clarify', IncidentController.addClarification);

// Agency Coordinator Endpoints (Strictly RBAC Guarded)
router.get('/', requireRole(UserRole.COORDINATOR), IncidentController.listReports);
router.post('/:id/verify', requireRole(UserRole.COORDINATOR), IncidentController.verifyReport);
router.post('/:id/reject', requireRole(UserRole.COORDINATOR), IncidentController.rejectReport);

export default router;
