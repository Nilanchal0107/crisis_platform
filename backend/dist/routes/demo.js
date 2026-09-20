import { Router } from 'express';
import { resetDatabase } from '../db/seed.js';
const router = Router();
router.post('/reset', (req, res) => {
    try {
        const result = resetDatabase();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            status: 'RESET_FAILED',
            error: error.message || String(error)
        });
    }
});
export default router;
