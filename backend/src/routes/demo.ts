import { Router, Request, Response } from 'express';
import { resetDatabase } from '../db/seed.js';

const router = Router();

router.post('/reset', (req: Request, res: Response) => {
  try {
    const result = resetDatabase();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      status: 'RESET_FAILED',
      error: error.message || String(error)
    });
  }
});

export default router;
