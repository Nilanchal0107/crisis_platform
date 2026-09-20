import { Router, Request, Response } from 'express';
import { checkConservationOfMass } from '../db/connection.js';
import { MUMBAI_SCENARIO } from '@vrl/shared';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const invariant = checkConservationOfMass(1);

  res.json({
    status: 'HEALTHY',
    system: 'Verified Response Ledger (VRL)',
    scenario: MUMBAI_SCENARIO.ward,
    timestamp: new Date().toISOString(),
    conservation_check: {
      status: invariant.is_conserved ? 'PASS' : 'FAIL',
      ...invariant
    }
  });
});

export default router;
