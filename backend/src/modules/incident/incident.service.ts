import { db, runTransaction } from '../../db/connection.js';
import {
  SourceReport,
  CanonicalIncident,
  CoordinationUpdate,
  CoordinationUpdateType,
  ReportStatus,
  IncidentStatus,
  AuditAction,
  PublicReportView,
  ReporterTaskView,
  generateReferenceCode,
  mapSeverityToPriority
} from '@vrl/shared';
import { logAuditEvent } from '../audit/audit.service.js';
import { CreateReportInput, VerifyReportInput, RejectReportInput } from './incident.schema.js';

export class IncidentService {
  /**
   * Public or authenticated intake of community emergency report
   */
  static createReport(data: CreateReportInput, reporterId = 'aarav', actorRole = 'REPORTER'): SourceReport {
    return runTransaction(() => {
      // Ensure reporter exists or fallback to aarav
      const user = db.prepare('SELECT id FROM users WHERE id = ?').get(reporterId);
      const finalReporterId = user ? reporterId : 'aarav';

      // Generate unique reference code
      let referenceCode = '';
      for (let i = 0; i < 5; i++) {
        const candidate = generateReferenceCode();
        const existing = db.prepare('SELECT id FROM source_reports WHERE reference_code = ?').get(candidate);
        if (!existing) {
          referenceCode = candidate;
          break;
        }
      }
      if (!referenceCode) {
        referenceCode = `REF-${Date.now().toString().slice(-4)}-X`;
      }

      const stmt = db.prepare(`
        INSERT INTO source_reports (
          reference_code, reporter_id, location_name, latitude, longitude,
          incident_type, reporter_severity, description, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED')
      `);

      stmt.run(
        referenceCode,
        finalReporterId,
        data.location_name,
        data.latitude,
        data.longitude,
        data.incident_type,
        data.reporter_severity,
        data.description
      );

      const created = db.prepare(`
        SELECT * FROM source_reports WHERE reference_code = ?
      `).get(referenceCode) as unknown as SourceReport;

      // Immutable audit log
      logAuditEvent({
        actorId: finalReporterId,
        actorRole,
        action: AuditAction.REPORT_SUBMITTED,
        entityType: 'source_reports',
        entityId: created.id.toString(),
        beforeState: null,
        afterState: {
          reference_code: created.reference_code,
          location_name: created.location_name,
          incident_type: created.incident_type,
          reporter_severity: created.reporter_severity,
          status: created.status
        }
      });

      return created;
    });
  }

  /**
   * Public status lookup by reference code (No internal leaks)
   */
  static getReportByRef(referenceCode: string): PublicReportView | null {
    const report = db.prepare(`
      SELECT * FROM source_reports WHERE reference_code = ?
    `).get(referenceCode) as SourceReport | undefined;

    if (!report) {
      return null;
    }

    const clarifications = db.prepare(`
      SELECT id, author_id, message, created_at
      FROM coordination_updates
      WHERE report_id = ? AND update_type = 'CLARIFICATION'
      ORDER BY id ASC
    `).all(report.id) as { id: number; author_id: string; message: string; created_at: string }[];

    const canonical = db.prepare(`
      SELECT id, priority, status, verified_at, resolved_at, closure_notes
      FROM canonical_incidents
      WHERE primary_report_id = ?
    `).get(report.id) as { id: number; priority: any; status: any; verified_at: string; resolved_at?: string | null; closure_notes?: string | null } | undefined;

    // Qualitative task progress (stage + assigned responder's name only — no
    // quantities) so the reporter can see assignment/dispatch/delivery move without
    // exposing internal commitment numbers.
    const tasks = canonical
      ? (db.prepare(`
          SELECT t.id, t.status, t.offered_at, t.accepted_at, t.dispatched_at, t.completed_at,
            u.display_name as assigned_to_name
          FROM tasks t
          JOIN users u ON u.id = t.assigned_to
          WHERE t.incident_id = ?
          ORDER BY t.id ASC
        `).all(canonical.id) as unknown as ReporterTaskView[])
      : [];

    return {
      reference_code: report.reference_code,
      location_name: report.location_name,
      latitude: report.latitude,
      longitude: report.longitude,
      incident_type: report.incident_type,
      reporter_severity: report.reporter_severity,
      description: report.description,
      status: report.status,
      rejection_reason: report.rejection_reason,
      created_at: report.created_at,
      clarifications,
      canonical_incident: canonical ? { ...canonical, tasks } : null
    };
  }

  /**
   * Public or reporter clarification note ingestion
   */
  static addClarification(
    referenceCode: string,
    message: string,
    authorId = 'aarav',
    authorRole = 'REPORTER'
  ): CoordinationUpdate {
    return runTransaction(() => {
      const report = db.prepare(`
        SELECT id, reference_code FROM source_reports WHERE reference_code = ?
      `).get(referenceCode) as SourceReport | undefined;

      if (!report) {
        throw new Error('REPORT_NOT_FOUND');
      }

      const stmt = db.prepare(`
        INSERT INTO coordination_updates (
          report_id, author_id, update_type, message
        ) VALUES (?, ?, ?, ?)
      `);

      stmt.run(report.id, authorId, CoordinationUpdateType.CLARIFICATION, message);

      const update = db.prepare(`
        SELECT * FROM coordination_updates WHERE report_id = ? ORDER BY id DESC LIMIT 1
      `).get(report.id) as unknown as CoordinationUpdate;

      logAuditEvent({
        actorId: authorId,
        actorRole: authorRole,
        action: AuditAction.REPORT_CLARIFIED,
        entityType: 'source_reports',
        entityId: report.id.toString(),
        beforeState: null,
        afterState: {
          update_id: update.id,
          message: update.message
        }
      });

      return update;
    });
  }

  /**
   * Coordinator review queue endpoint
   */
  static listReports(statusFilter?: string): (SourceReport & {
    canonical_id?: number | null;
    reporter_display_name?: string | null;
    reporter_phone?: string | null;
    clarifications_count: number;
    clarifications: CoordinationUpdate[];
  })[] {
    let query = `
      SELECT r.*, c.id as canonical_id,
        u.display_name as reporter_display_name, u.phone as reporter_phone,
        (SELECT COUNT(*) FROM coordination_updates u2 WHERE u2.report_id = r.id) as clarifications_count
      FROM source_reports r
      LEFT JOIN canonical_incidents c ON c.primary_report_id = r.id
      LEFT JOIN users u ON u.id = r.reporter_id
    `;

    const params: any[] = [];
    if (statusFilter) {
      query += ` WHERE r.status = ?`;
      params.push(statusFilter);
    }
    query += ` ORDER BY r.id DESC`;

    const reports = db.prepare(query).all(...params) as any[];
    for (const r of reports) {
      r.clarifications = db.prepare('SELECT * FROM coordination_updates WHERE report_id = ? ORDER BY id ASC').all(r.id);
    }
    return reports;
  }

  /**
   * A reporter's own submission history, newest first. Deliberately excludes the
   * anonymous 'guest' actor at the controller layer — every Quick Report shares that
   * one actor id, so listing "reports by guest" would leak every anonymous submitter's
   * reports to every other one, not just the caller's own.
   */
  static listReportsByReporter(reporterId: string): (SourceReport & {
    canonical_id?: number | null;
    canonical_status?: string | null;
    clarifications_count: number;
    latest_task_status?: string | null;
    latest_task_assignee?: string | null;
  })[] {
    return db.prepare(`
      SELECT r.*, c.id as canonical_id, c.status as canonical_status,
        (SELECT COUNT(*) FROM coordination_updates u WHERE u.report_id = r.id) as clarifications_count,
        (SELECT t.status FROM tasks t WHERE t.incident_id = c.id ORDER BY t.id DESC LIMIT 1) as latest_task_status,
        (SELECT u2.display_name FROM tasks t JOIN users u2 ON u2.id = t.assigned_to WHERE t.incident_id = c.id ORDER BY t.id DESC LIMIT 1) as latest_task_assignee
      FROM source_reports r
      LEFT JOIN canonical_incidents c ON c.primary_report_id = r.id
      WHERE r.reporter_id = ?
      ORDER BY r.id DESC
    `).all(reporterId) as any[];
  }

  /**
   * Get single report with all clarification notes
   */
  static getReportById(id: number) {
    const report = db.prepare(`
      SELECT r.*, c.id as canonical_id, c.priority as canonical_priority, c.status as canonical_status
      FROM source_reports r
      LEFT JOIN canonical_incidents c ON c.primary_report_id = r.id
      WHERE r.id = ?
    `).get(id) as any;

    if (!report) return null;

    const clarifications = db.prepare(`
      SELECT * FROM coordination_updates WHERE report_id = ? ORDER BY id ASC
    `).all(id) as unknown as CoordinationUpdate[];

    return {
      ...report,
      clarifications
    };
  }

  /**
   * Coordinator Verification Gateway (LOGIC-001)
   * Atomic promotion to canonical_incidents
   */
  static verifyReport(reportId: number, coordinatorId: string, input: VerifyReportInput): { incident: CanonicalIncident; report: SourceReport } {
    return runTransaction(() => {
      const report = db.prepare(`
        SELECT * FROM source_reports WHERE id = ?
      `).get(reportId) as SourceReport | undefined;

      if (!report) {
        throw new Error('REPORT_NOT_FOUND');
      }

      if (report.status !== ReportStatus.SUBMITTED) {
        throw new Error(`REPORT_ALREADY_PROCESSED: Status is ${report.status}`);
      }

      const priority = input.priority || mapSeverityToPriority(report.reporter_severity);

      // 1. Update source report status to LINKED_TO_INCIDENT
      db.prepare(`
        UPDATE source_reports SET status = 'LINKED_TO_INCIDENT' WHERE id = ?
      `).run(reportId);

      // 2. Insert canonical_incidents record
      const insertStmt = db.prepare(`
        INSERT INTO canonical_incidents (
          primary_report_id, verified_by, location_name, latitude, longitude,
          incident_type, priority, status, closure_notes, verified_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'VERIFIED', ?, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
      `);

      insertStmt.run(
        report.id,
        coordinatorId,
        report.location_name,
        report.latitude,
        report.longitude,
        report.incident_type,
        priority,
        input.closure_notes || null
      );

      const incident = db.prepare(`
        SELECT * FROM canonical_incidents WHERE primary_report_id = ?
      `).get(report.id) as unknown as CanonicalIncident;

      const updatedReport = db.prepare(`
        SELECT * FROM source_reports WHERE id = ?
      `).get(reportId) as unknown as SourceReport;

      // 3. Log audit event
      logAuditEvent({
        actorId: coordinatorId,
        actorRole: 'COORDINATOR',
        action: AuditAction.REPORT_VERIFIED,
        entityType: 'canonical_incidents',
        entityId: incident.id.toString(),
        beforeState: {
          report_id: report.id,
          status: ReportStatus.SUBMITTED
        },
        afterState: {
          incident_id: incident.id,
          priority: incident.priority,
          status: IncidentStatus.VERIFIED,
          verified_by: coordinatorId
        },
        reason: input.closure_notes || 'Promoted via human verification gateway'
      });

      return { incident, report: updatedReport };
    });
  }

  /**
   * Coordinator Rejection Gateway
   * Sets status to REJECTED with mandatory reason
   */
  static rejectReport(reportId: number, coordinatorId: string, input: RejectReportInput): SourceReport {
    return runTransaction(() => {
      const report = db.prepare(`
        SELECT * FROM source_reports WHERE id = ?
      `).get(reportId) as SourceReport | undefined;

      if (!report) {
        throw new Error('REPORT_NOT_FOUND');
      }

      if (report.status !== ReportStatus.SUBMITTED) {
        throw new Error(`REPORT_ALREADY_PROCESSED: Status is ${report.status}`);
      }

      db.prepare(`
        UPDATE source_reports
        SET status = 'REJECTED', rejection_reason = ?
        WHERE id = ?
      `).run(input.rejection_reason, reportId);

      const updatedReport = db.prepare(`
        SELECT * FROM source_reports WHERE id = ?
      `).get(reportId) as unknown as SourceReport;

      logAuditEvent({
        actorId: coordinatorId,
        actorRole: 'COORDINATOR',
        action: AuditAction.REPORT_REJECTED,
        entityType: 'source_reports',
        entityId: report.id.toString(),
        beforeState: {
          status: ReportStatus.SUBMITTED
        },
        afterState: {
          status: ReportStatus.REJECTED,
          rejection_reason: input.rejection_reason
        },
        reason: input.rejection_reason
      });

      return updatedReport;
    });
  }

  /**
   * List all verified canonical incidents
   */
  static listCanonicalIncidents(): CanonicalIncident[] {
    return db.prepare(`
      SELECT * FROM canonical_incidents ORDER BY id DESC
    `).all() as unknown as CanonicalIncident[];
  }

  /**
   * Confirm physical outcome reconciliation (LOGIC-004 / FR-017)
   * Restocks remainder kits to BKC Depot and sets incident to PARTIALLY_RESOLVED or RESOLVED
   */
  static confirmReconciliation(
    incidentId: number,
    coordinatorId: string,
    input: { closure_notes?: string }
  ): CanonicalIncident {
    return runTransaction(() => {
      const incident = db.prepare(`
        SELECT * FROM canonical_incidents WHERE id = ?
      `).get(incidentId) as CanonicalIncident | undefined;

      if (!incident) {
        throw new Error('INCIDENT_NOT_FOUND');
      }

      // Fetch tasks for this incident
      const tasks = db.prepare(`
        SELECT t.*, c.pool_id
        FROM tasks t
        JOIN resource_commitments c ON c.id = t.commitment_id
        WHERE t.incident_id = ?
      `).all(incidentId) as any[];

      if (tasks.length === 0) {
        throw new Error('NO_TASKS_FOR_INCIDENT');
      }

      const hasActiveTasks = tasks.some(
        (t) => t.status === 'OFFERED' || t.status === 'ACCEPTED' || t.status === 'IN_PROGRESS'
      );
      if (hasActiveTasks) {
        throw new Error('TASKS_STILL_ACTIVE: All tasks must be completed before reconciliation');
      }

      const totalDelivered = tasks.reduce((sum, t) => sum + (t.delivered_quantity || 0), 0);
      const totalRemainder = tasks.reduce((sum, t) => sum + (t.remainder_quantity || 0), 0);
      const poolId = tasks[0]?.pool_id || 1;

      // Two-step physical inventory Step 2:
      // If remainder kits > 0, restock them from in_transit to available in the pool
      if (totalRemainder > 0) {
        db.prepare(`
          UPDATE resource_pools
          SET in_transit_quantity = in_transit_quantity - ?,
              available_quantity = available_quantity + ?,
              last_confirmed_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
          WHERE id = ? AND in_transit_quantity >= ?
        `).run(totalRemainder, totalRemainder, poolId, totalRemainder);
      }

      // Verify mass conservation invariant
      const pool = db.prepare('SELECT * FROM resource_pools WHERE id = ?').get(poolId) as any;
      if (
        pool.available_quantity +
        pool.reserved_quantity +
        pool.in_transit_quantity +
        pool.delivered_quantity !==
        pool.total_quantity
      ) {
        throw new Error(`CRITICAL_INVARIANT_VIOLATION: Mass conservation failed during reconciliation on pool #${pool.id}`);
      }

      const nextStatus = totalRemainder > 0 ? IncidentStatus.PARTIALLY_RESOLVED : IncidentStatus.RESOLVED;
      const notes = input.closure_notes || (totalRemainder > 0
        ? `Reconciled: ${totalDelivered} kits delivered, ${totalRemainder} kits returned to depot due to access blockage.`
        : `Reconciled: Full delivery of ${totalDelivered} kits completed.`);

      // Update canonical incident
      db.prepare(`
        UPDATE canonical_incidents
        SET status = ?,
            resolved_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now'),
            closure_notes = ?
        WHERE id = ?
      `).run(nextStatus, notes, incidentId);

      // Log coordination update
      db.prepare(`
        INSERT INTO coordination_updates (incident_id, author_id, update_type, message)
        VALUES (?, ?, 'OUTCOME_NOTE', ?)
      `).run(incidentId, coordinatorId, notes);

      // Log audit event
      logAuditEvent({
        actorId: coordinatorId,
        actorRole: 'COORDINATOR',
        action: AuditAction.OUTCOME_RECONCILED,
        entityType: 'canonical_incidents',
        entityId: incidentId.toString(),
        beforeState: { status: incident.status },
        afterState: {
          status: nextStatus,
          delivered_quantity: totalDelivered,
          restocked_quantity: totalRemainder
        },
        quantityDelta: totalRemainder,
        reason: notes
      });

      const updated = db.prepare(`
        SELECT * FROM canonical_incidents WHERE id = ?
      `).get(incidentId) as unknown as CanonicalIncident;

      return updated;
    });
  }
}
