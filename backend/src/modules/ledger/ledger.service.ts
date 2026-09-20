import { db, runTransaction } from '../../db/connection.js';
import {
  ResourcePool,
  ResourceCommitment,
  CanonicalIncident,
  AuditAction,
  IncidentStatus,
  ResourceLedgerEntry,
  ReservationResponse
} from '@vrl/shared';
import { logAuditEvent } from '../audit/audit.service.js';
import { ReserveResourceInput, AdjustStockInput } from './ledger.schema.js';

export class InsufficientStockError extends Error {
  currentAvailable: number;
  requestedQuantity: number;

  constructor(requested: number, available: number) {
    super(`INSUFFICIENT_STOCK_CONFLICT: Requested ${requested}, but only ${available} available.`);
    this.name = 'InsufficientStockError';
    this.requestedQuantity = requested;
    this.currentAvailable = available;
  }
}

export class LedgerService {
  /**
   * Retrieve all resource pools with current balances
   */
  static getResourcePools(): ResourcePool[] {
    return db.prepare(`
      SELECT * FROM resource_pools ORDER BY id ASC
    `).all() as unknown as ResourcePool[];
  }

  /**
   * Retrieve single resource pool
   */
  static getResourcePoolById(poolId = 1): ResourcePool | null {
    const pool = db.prepare(`
      SELECT * FROM resource_pools WHERE id = ?
    `).get(poolId) as unknown as ResourcePool | undefined;
    return pool || null;
  }

  /**
   * Retrieve full chronological ledger of resource commitments
   */
  static getResourceLedger(): ResourceLedgerEntry[] {
    return db.prepare(`
      SELECT c.*, p.resource_name as pool_name, p.depot_name, i.location_name as incident_location
      FROM resource_commitments c
      JOIN resource_pools p ON p.id = c.pool_id
      JOIN canonical_incidents i ON i.id = c.incident_id
      ORDER BY c.id DESC
    `).all() as unknown as ResourceLedgerEntry[];
  }

  /**
   * Retrieve commitments for a specific incident
   */
  static getCommitmentsForIncident(incidentId: number): ResourceCommitment[] {
    return db.prepare(`
      SELECT * FROM resource_commitments WHERE incident_id = ? ORDER BY id DESC
    `).all(incidentId) as unknown as ResourceCommitment[];
  }

  /**
   * Atomic Resource Reservation Engine (LOGIC-002)
   * Single SQL conditional update guaranteeing zero over-allocation
   */
  static reserveResources(
    incidentId: number,
    coordinatorId: string,
    input: ReserveResourceInput
  ): ReservationResponse {
    return runTransaction(() => {
      const poolId = input.pool_id || 1;

      // 1. Verify target incident exists
      const incident = db.prepare(`
        SELECT * FROM canonical_incidents WHERE id = ?
      `).get(incidentId) as unknown as CanonicalIncident | undefined;

      if (!incident) {
        throw new Error('INCIDENT_NOT_FOUND');
      }

      if (incident.status === IncidentStatus.CANCELLED || incident.status === IncidentStatus.RESOLVED) {
        throw new Error(`INCIDENT_CLOSED: Incident is ${incident.status}`);
      }

      // 2. Fetch current pool state for before-snapshot
      const poolBefore = db.prepare(`
        SELECT * FROM resource_pools WHERE id = ?
      `).get(poolId) as unknown as ResourcePool | undefined;

      if (!poolBefore) {
        throw new Error('RESOURCE_POOL_NOT_FOUND');
      }

      // 3. ATOMIC CONDITIONAL UPDATE (Single Query Lock)
      const updateStmt = db.prepare(`
        UPDATE resource_pools
        SET available_quantity = available_quantity - ?,
            reserved_quantity = reserved_quantity + ?
        WHERE id = ? AND available_quantity >= ?
      `);

      const result = updateStmt.run(input.quantity, input.quantity, poolId, input.quantity);

      // If changes === 0, available_quantity was less than input.quantity (RACE CONDITION / INSUFFICIENT)
      if (result.changes === 0) {
        const currentPool = db.prepare(`
          SELECT available_quantity FROM resource_pools WHERE id = ?
        `).get(poolId) as { available_quantity: number };

        throw new InsufficientStockError(input.quantity, currentPool.available_quantity);
      }

      // 4. Insert commitment record
      const insertCommitment = db.prepare(`
        INSERT INTO resource_commitments (
          pool_id, incident_id, quantity, status, committed_by, created_at, updated_at
        ) VALUES (?, ?, ?, 'RESERVED', ?, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
      `);

      insertCommitment.run(poolId, incidentId, input.quantity, coordinatorId);

      const commitment = db.prepare(`
        SELECT * FROM resource_commitments WHERE incident_id = ? ORDER BY id DESC LIMIT 1
      `).get(incidentId) as unknown as ResourceCommitment;

      // 5. Update incident status to RESPONSE_ACTIVE if previously VERIFIED
      if (incident.status === IncidentStatus.VERIFIED) {
        db.prepare(`
          UPDATE canonical_incidents SET status = 'RESPONSE_ACTIVE' WHERE id = ?
        `).run(incidentId);
      }

      const updatedPool = db.prepare(`
        SELECT * FROM resource_pools WHERE id = ?
      `).get(poolId) as unknown as ResourcePool;

      const updatedIncident = db.prepare(`
        SELECT * FROM canonical_incidents WHERE id = ?
      `).get(incidentId) as unknown as CanonicalIncident;

      // 6. Log immutable audit trail
      logAuditEvent({
        actorId: coordinatorId,
        actorRole: 'COORDINATOR',
        action: AuditAction.RESOURCE_RESERVED,
        entityType: 'resource_commitments',
        entityId: commitment.id.toString(),
        beforeState: {
          pool_id: poolId,
          available_quantity: poolBefore.available_quantity,
          reserved_quantity: poolBefore.reserved_quantity,
          incident_status: incident.status
        },
        afterState: {
          pool_id: poolId,
          available_quantity: updatedPool.available_quantity,
          reserved_quantity: updatedPool.reserved_quantity,
          commitment_id: commitment.id,
          incident_id: incidentId,
          incident_status: updatedIncident.status
        },
        quantityDelta: input.quantity,
        reason: input.notes || `Reserved ${input.quantity} ${updatedPool.unit} from ${updatedPool.depot_name} for Incident #${incidentId}`
      });

      return {
        status: 'RESERVED',
        commitment,
        pool: updatedPool,
        incident: updatedIncident
      };
    });
  }

  /**
   * Coordinator manual stock adjustment (add a new shipment, or write off damaged/expired
   * stock). total_quantity and available_quantity always move together by the same delta,
   * so conservation of mass holds by construction — the conditional UPDATE below is only
   * needed to stop a removal from taking available_quantity negative under concurrent use,
   * mirroring the same atomic-conditional-update pattern reserveResources uses.
   */
  static adjustStock(poolId: number, coordinatorId: string, input: AdjustStockInput): { pool: ResourcePool; delta: number } {
    return runTransaction(() => {
      const poolBefore = db.prepare(`
        SELECT * FROM resource_pools WHERE id = ?
      `).get(poolId) as unknown as ResourcePool | undefined;

      if (!poolBefore) {
        throw new Error('RESOURCE_POOL_NOT_FOUND');
      }

      const delta = input.quantity_delta;

      if (delta > 0) {
        db.prepare(`
          UPDATE resource_pools
          SET available_quantity = available_quantity + ?,
              total_quantity = total_quantity + ?,
              last_confirmed_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
          WHERE id = ?
        `).run(delta, delta, poolId);
      } else {
        const removeQty = Math.abs(delta);
        const result = db.prepare(`
          UPDATE resource_pools
          SET available_quantity = available_quantity - ?,
              total_quantity = total_quantity - ?,
              last_confirmed_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
          WHERE id = ? AND available_quantity >= ?
        `).run(removeQty, removeQty, poolId, removeQty);

        if (result.changes === 0) {
          throw new InsufficientStockError(removeQty, poolBefore.available_quantity);
        }
      }

      const updatedPool = db.prepare(`
        SELECT * FROM resource_pools WHERE id = ?
      `).get(poolId) as unknown as ResourcePool;

      // Defensive re-verification, mirroring the same check confirmReconciliation performs.
      const sum = updatedPool.available_quantity + updatedPool.reserved_quantity
        + updatedPool.in_transit_quantity + updatedPool.delivered_quantity;
      if (sum !== updatedPool.total_quantity) {
        throw new Error(`CRITICAL_INVARIANT_VIOLATION: Mass conservation failed during stock adjustment on pool #${poolId}`);
      }

      logAuditEvent({
        actorId: coordinatorId,
        actorRole: 'COORDINATOR',
        action: AuditAction.STOCK_ADJUSTED,
        entityType: 'resource_pools',
        entityId: poolId.toString(),
        beforeState: {
          total_quantity: poolBefore.total_quantity,
          available_quantity: poolBefore.available_quantity
        },
        afterState: {
          total_quantity: updatedPool.total_quantity,
          available_quantity: updatedPool.available_quantity
        },
        quantityDelta: delta,
        reason: input.reason
      });

      return { pool: updatedPool, delta };
    });
  }
}
