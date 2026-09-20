import { db } from '../../db/connection.js';
import { AuditAction } from '@vrl/shared';

export interface LogAuditEventParams {
  actorId: string;
  actorRole: string;
  action: AuditAction | string;
  entityType: string;
  entityId: string;
  beforeState?: Record<string, any> | null;
  afterState?: Record<string, any> | null;
  quantityDelta?: number;
  reason?: string | null;
}

export function logAuditEvent(params: LogAuditEventParams): void {
  const stmt = db.prepare(`
    INSERT INTO audit_events (
      actor_id, actor_role, action, entity_type, entity_id,
      before_state, after_state, quantity_delta, reason, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  `);

  stmt.run(
    params.actorId,
    params.actorRole,
    params.action,
    params.entityType,
    params.entityId,
    params.beforeState ? JSON.stringify(params.beforeState) : null,
    params.afterState ? JSON.stringify(params.afterState) : null,
    params.quantityDelta ?? 0,
    params.reason ?? null
  );
}

export function getAuditEvents(limit = 100) {
  return db.prepare(`
    SELECT * FROM audit_events ORDER BY id DESC LIMIT ?
  `).all(limit);
}
