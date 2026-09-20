import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import { authMiddleware } from './middleware/auth.js';
import authRouter from './routes/auth.js';
import healthRouter from './routes/health.js';
import demoRouter from './routes/demo.js';
import reportsRouter from './routes/reports.js';
import resourcesRouter from './routes/resources.js';
import tasksRouter from './routes/tasks.js';
import { LedgerController } from './modules/ledger/ledger.controller.js';
import { IncidentController } from './modules/incident/incident.controller.js';
import { requireRole } from './middleware/auth.js';
import { UserRole } from '@vrl/shared';
import { getAuditEvents } from './modules/audit/audit.service.js';
import { runMigrations } from './db/migrate.js';
import { resetDatabase } from './db/seed.js';
import { db } from './db/connection.js';

import { GISController } from './modules/gis/gis.controller.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Basic Middlewares
app.use(cors());
app.use(express.json());
app.use(authMiddleware);

// Initialize DB schema & seed if clean
runMigrations();
const userCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number };
if (userCount.cnt === 0) {
  console.log('[Server] Database is empty. Running initial synthetic seed...');
  resetDatabase();
}

// Routes
app.use('/api/auth', authRouter);
app.use('/api/health', healthRouter);
app.use('/api/demo', demoRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/tasks', tasksRouter);
app.get('/api/map/features', GISController.getFeatures);
app.post('/api/incidents/:id/reserve', requireRole(UserRole.COORDINATOR), LedgerController.reserveResources);
app.post('/api/incidents/:id/confirm', requireRole(UserRole.COORDINATOR), IncidentController.confirmReconciliation);
app.get('/api/audit', (req, res) => {
  const events = getAuditEvents(100);
  res.json({ count: events.length, events });
});

// Fallback error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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
