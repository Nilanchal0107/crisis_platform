import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { LedgerService, InsufficientStockError } from './ledger.service.js';
import { ReserveResourceSchema, AdjustStockSchema } from './ledger.schema.js';

export class LedgerController {
  static async getResourcePools(req: Request, res: Response): Promise<void> {
    try {
      const pools = LedgerService.getResourcePools();
      res.status(200).json({
        count: pools.length,
        pools
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  static async getResourcePoolById(req: Request, res: Response): Promise<void> {
    try {
      const poolId = parseInt(req.params.id || '1', 10);
      const pool = LedgerService.getResourcePoolById(poolId);
      if (!pool) {
        res.status(404).json({ error: 'POOL_NOT_FOUND', message: `Resource pool ${poolId} not found` });
        return;
      }
      res.status(200).json(pool);
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  static async getResourceLedger(req: Request, res: Response): Promise<void> {
    try {
      const ledger = LedgerService.getResourceLedger();
      res.status(200).json({
        count: ledger.length,
        ledger
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  static async getCommitmentsForIncident(req: Request, res: Response): Promise<void> {
    try {
      const incidentId = parseInt(req.params.id, 10);
      if (isNaN(incidentId)) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid incident ID' });
        return;
      }
      const commitments = LedgerService.getCommitmentsForIncident(incidentId);
      res.status(200).json({
        incident_id: incidentId,
        count: commitments.length,
        commitments
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  static async reserveResources(req: Request, res: Response): Promise<void> {
    try {
      const incidentId = parseInt(req.params.id, 10);
      if (isNaN(incidentId)) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid incident ID' });
        return;
      }

      const parsed = ReserveResourceSchema.parse(req.body);
      const coordinatorId = req.actor?.id || 'rajesh';

      const result = LedgerService.reserveResources(incidentId, coordinatorId, parsed);
      res.status(200).json(result);
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'Invalid reservation parameters',
          details: err.errors
        });
        return;
      }
      if (err instanceof InsufficientStockError) {
        res.status(409).json({
          error: 'INSUFFICIENT_STOCK_CONFLICT',
          message: err.message,
          requested_quantity: err.requestedQuantity,
          available_quantity: err.currentAvailable
        });
        return;
      }
      if (err.message === 'INCIDENT_NOT_FOUND') {
        res.status(404).json({ error: 'INCIDENT_NOT_FOUND', message: `Incident #${req.params.id} not found` });
        return;
      }
      if (err.message?.startsWith('INCIDENT_CLOSED')) {
        res.status(409).json({ error: 'INCIDENT_CLOSED', message: err.message });
        return;
      }
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  static async adjustStock(req: Request, res: Response): Promise<void> {
    try {
      const poolId = parseInt(req.params.id, 10);
      if (isNaN(poolId)) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid pool ID' });
        return;
      }

      const parsed = AdjustStockSchema.parse(req.body);
      const coordinatorId = req.actor?.id || 'rajesh';

      const result = LedgerService.adjustStock(poolId, coordinatorId, parsed);
      res.status(200).json({ status: 'ADJUSTED', pool: result.pool, quantity_delta: result.delta });
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'Invalid stock adjustment parameters',
          details: err.errors
        });
        return;
      }
      if (err instanceof InsufficientStockError) {
        res.status(409).json({
          error: 'INSUFFICIENT_STOCK_CONFLICT',
          message: err.message,
          requested_quantity: err.requestedQuantity,
          available_quantity: err.currentAvailable
        });
        return;
      }
      if (err.message === 'RESOURCE_POOL_NOT_FOUND') {
        res.status(404).json({ error: 'RESOURCE_POOL_NOT_FOUND', message: `Resource pool #${req.params.id} not found` });
        return;
      }
      console.error('[adjustStock error]', err);
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
}
