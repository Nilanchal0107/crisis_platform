import { Router } from 'express';
import { UserRole } from '@vrl/shared';
import { requireRole } from '../middleware/auth.js';
import { LedgerController } from '../modules/ledger/ledger.controller.js';

const router = Router();

// Pool and Ledger Endpoints
router.get('/', LedgerController.getResourcePools);
router.get('/ledger', LedgerController.getResourceLedger);
router.get('/:id', LedgerController.getResourcePoolById);
router.get('/commitments/incident/:id', LedgerController.getCommitmentsForIncident);
router.post('/:id/adjust', requireRole(UserRole.COORDINATOR), LedgerController.adjustStock);

export default router;
