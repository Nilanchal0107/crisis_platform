import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import { authMiddleware } from './middleware/auth.js';
import healthRouter from './routes/health.js';
import demoRouter from './routes/demo.js';
import { runMigrations } from './db/migrate.js';
import { resetDatabase } from './db/seed.js';
import { db } from './db/connection.js';
const app = express();
const PORT = process.env.PORT || 3000;
// Basic Middlewares
app.use(cors());
app.use(express.json());
app.use(authMiddleware);
// Initialize DB schema & seed if clean
runMigrations();
const userCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get();
if (userCount.cnt === 0) {
    console.log('[Server] Database is empty. Running initial synthetic seed...');
    resetDatabase();
}
// Routes
app.use('/api/health', healthRouter);
app.use('/api/demo', demoRouter);
// Fallback error handler
app.use((err, req, res, next) => {
    console.error('[Unhandled Server Error]', err);
    res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: err.message || 'An unexpected error occurred'
    });
});
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`  VERIFIED RESPONSE LEDGER (VRL) BACKEND RUNNING`);
        console.log(`  Port: http://localhost:${PORT}`);
        console.log(`  Scenario: Mumbai L-Ward (Kurla West)`);
        console.log(`====================================================`);
    });
}
export default app;
