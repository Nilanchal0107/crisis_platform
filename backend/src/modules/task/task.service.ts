import { db, runTransaction } from '../../db/connection.js';
import {
  Task,
  TaskDetailView,
  TaskStatus,
  AuditAction,
  CommitmentStatus
} from '@vrl/shared';
import { logAuditEvent } from '../audit/audit.service.js';
import { CreateTaskInput, AcknowledgeTaskInput, DispatchTaskInput, SubmitOutcomeInput, PostTaskUpdateInput } from './task.schema.js';

export class TaskNotFoundError extends Error {
  constructor(taskId: number) {
    super(`Task #${taskId} was not found.`);
    this.name = 'TaskNotFoundError';
  }
}

export class TaskForbiddenError extends Error {
  constructor(message = 'Access forbidden: You do not have permission to perform this task action.') {
    super(message);
    this.name = 'TaskForbiddenError';
  }
}

export class TaskStateConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskStateConflictError';
  }
}

export class PrematureDispatchError extends Error {
  constructor(message = 'Premature dispatch guard: Task must be explicitly accepted by assigned responder before dispatch can occur.') {
    super(message);
    this.name = 'PrematureDispatchError';
  }
}

export class MathMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MathMismatchError';
  }
}

export class TaskService {
  /**
   * Responder's own coordination-update history for a task (progress/exception/outcome
   * notes authored by the assigned responder). The coordinator's initial INSTRUCTION
   * message is deliberately excluded here — it's already shown as "Coordinator
   * Instructions" on the task card, so including it again would duplicate it.
   */
  private static attachOwnUpdates(task: TaskDetailView): TaskDetailView {
    const updates = db.prepare(`
      SELECT * FROM coordination_updates
      WHERE task_id = ? AND author_id = ?
      ORDER BY created_at ASC, id ASC
    `).all(task.id, task.assigned_to) as any[];
    return { ...task, updates };
  }

  /**
   * Create an offered task linked to a reserved commitment
   */
  static createTask(input: CreateTaskInput, actor: { id: string; role: string }): TaskDetailView {
    // 1. Verify commitment exists and is RESERVED
    const commitment = db.prepare(`
      SELECT * FROM resource_commitments WHERE id = ?
    `).get(input.commitment_id) as any;

    if (!commitment) {
      throw new TaskStateConflictError(`Resource commitment #${input.commitment_id} does not exist.`);
    }

    if (commitment.status !== CommitmentStatus.RESERVED) {
      throw new TaskStateConflictError(`Resource commitment #${input.commitment_id} is in status '${commitment.status}', expected 'RESERVED'.`);
    }

    // 2. Check if active task already exists for this commitment
    const existingTask = db.prepare(`
      SELECT id FROM tasks WHERE commitment_id = ? AND status NOT IN ('DECLINED', 'CANCELLED', 'FAILED')
    `).get(input.commitment_id) as any;

    if (existingTask) {
      throw new TaskStateConflictError(`An active task (#${existingTask.id}) is already linked to commitment #${input.commitment_id}.`);
    }

    // 3. Verify assigned user exists
    const user = db.prepare(`
      SELECT id, role, display_name FROM users WHERE id = ? AND is_active = 1
    `).get(input.assigned_to) as any;

    if (!user) {
      throw new TaskStateConflictError(`Designated responder '${input.assigned_to}' does not exist or is inactive.`);
    }

    // 4. Create task in transaction
    const taskId = runTransaction(() => {
      const result = db.prepare(`
        INSERT INTO tasks (
          incident_id,
          commitment_id,
          assigned_to,
          assigned_by,
          instructions,
          assigned_quantity,
          status,
          offered_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'OFFERED', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
      `).run(
        input.incident_id,
        input.commitment_id,
        input.assigned_to,
        actor.id,
        input.instructions,
        input.assigned_quantity
      );

      const newTaskId = Number(result.lastInsertRowid);

      // Link commitment to task
      db.prepare(`
        UPDATE resource_commitments SET task_id = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ?
      `).run(newTaskId, input.commitment_id);

      // Log coordination instruction update
      db.prepare(`
        INSERT INTO coordination_updates (
          incident_id, task_id, author_id, update_type, message
        ) VALUES (?, ?, ?, 'INSTRUCTION', ?)
      `).run(input.incident_id, newTaskId, actor.id, input.instructions);

      // Log audit event
      logAuditEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: AuditAction.TASK_OFFERED,
        entityType: 'TASK',
        entityId: String(newTaskId),
        beforeState: null,
        afterState: { status: TaskStatus.OFFERED },
        quantityDelta: input.assigned_quantity,
        reason: `Mission offered to ${user.display_name} with ${input.assigned_quantity} relief kits`
      });

      return newTaskId;
    });

    const task = this.getTaskById(taskId, actor);
    return task;
  }

  /**
   * List tasks filtered by actor role & identity
   */
  static listTasks(actor: { id: string; role: string }): TaskDetailView[] {
    let query = `
      SELECT t.*,
             i.location_name as incident_location, i.incident_type, i.latitude, i.longitude,
             sr.reference_code,
             u_rep.display_name as reporter_name, u_rep.contact_safe as reporter_contact_safe,
             p.depot_name, p.resource_name,
             u_resp.display_name as assigned_to_name,
             u_coord.display_name as assigned_by_name
      FROM tasks t
      JOIN canonical_incidents i ON i.id = t.incident_id
      JOIN source_reports sr ON sr.id = i.primary_report_id
      JOIN resource_commitments c ON c.id = t.commitment_id
      JOIN resource_pools p ON p.id = c.pool_id
      JOIN users u_resp ON u_resp.id = t.assigned_to
      JOIN users u_coord ON u_coord.id = t.assigned_by
      LEFT JOIN users u_rep ON u_rep.id = sr.reporter_id
    `;

    if (actor.role === 'COORDINATOR') {
      query += ` ORDER BY t.id DESC`;
      const tasks = db.prepare(query).all() as unknown as TaskDetailView[];
      return tasks.map((t) => this.attachOwnUpdates(t));
    } else if (actor.role === 'RESPONDER') {
      query += ` WHERE t.assigned_to = ? ORDER BY t.id DESC`;
      const tasks = db.prepare(query).all(actor.id) as unknown as TaskDetailView[];
      return tasks.map((t) => this.attachOwnUpdates(t));
    } else {
      // Reporters or public cannot view internal tasks
      return [];
    }
  }

  /**
   * Get single task with access check
   */
  static getTaskById(taskId: number, actor?: { id: string; role: string }): TaskDetailView {
    const task = db.prepare(`
      SELECT t.*,
             i.location_name as incident_location, i.incident_type, i.latitude, i.longitude,
             sr.reference_code,
             u_rep.display_name as reporter_name, u_rep.contact_safe as reporter_contact_safe,
             p.depot_name, p.resource_name,
             u_resp.display_name as assigned_to_name,
             u_coord.display_name as assigned_by_name
      FROM tasks t
      JOIN canonical_incidents i ON i.id = t.incident_id
      JOIN source_reports sr ON sr.id = i.primary_report_id
      JOIN resource_commitments c ON c.id = t.commitment_id
      JOIN resource_pools p ON p.id = c.pool_id
      JOIN users u_resp ON u_resp.id = t.assigned_to
      JOIN users u_coord ON u_coord.id = t.assigned_by
      LEFT JOIN users u_rep ON u_rep.id = sr.reporter_id
      WHERE t.id = ?
    `).get(taskId) as unknown as TaskDetailView | undefined;

    if (!task) {
      throw new TaskNotFoundError(taskId);
    }

    if (actor && actor.role !== 'COORDINATOR' && actor.id !== task.assigned_to) {
      throw new TaskForbiddenError('You do not have permission to view this task.');
    }

    return this.attachOwnUpdates(task);
  }

  /**
   * Two-phase acknowledgement (LOGIC-003): ACCEPT or DECLINE
   */
  static acknowledgeTask(taskId: number, input: AcknowledgeTaskInput, actor: { id: string; role: string }): TaskDetailView {
    const rawTask = db.prepare(`
      SELECT * FROM tasks WHERE id = ?
    `).get(taskId) as any;

    if (!rawTask) {
      throw new TaskNotFoundError(taskId);
    }

    // Guard: Ownership assertion
    if (rawTask.assigned_to !== actor.id) {
      throw new TaskForbiddenError(`Designated responder ownership assertion failed: Task #${taskId} is assigned to '${rawTask.assigned_to}', but request came from '${actor.id}'. Only the assigned responder can accept or decline.`);
    }

    // Guard: Status check
    if (rawTask.status !== TaskStatus.OFFERED) {
      throw new TaskStateConflictError(`Task #${taskId} cannot be acknowledged in status '${rawTask.status}'. Expected 'OFFERED'.`);
    }

    runTransaction(() => {
      if (input.action === 'ACCEPT') {
        db.prepare(`
          UPDATE tasks
          SET status = 'ACCEPTED', accepted_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
          WHERE id = ?
        `).run(taskId);

        db.prepare(`
          INSERT INTO coordination_updates (
            incident_id, task_id, author_id, update_type, message
          ) VALUES (?, ?, ?, 'PROGRESS', 'Mission accepted by assigned volunteer. Preparing for depot pickup and departure.')
        `).run(rawTask.incident_id, taskId, actor.id);

        logAuditEvent({
          actorId: actor.id,
          actorRole: actor.role,
          action: AuditAction.TASK_ACCEPTED,
          entityType: 'TASK',
          entityId: String(taskId),
          beforeState: { status: TaskStatus.OFFERED },
          afterState: { status: TaskStatus.ACCEPTED },
          quantityDelta: 0,
          reason: 'Field responder accepted mission ownership'
        });
      } else {
        // DECLINE
        db.prepare(`
          UPDATE tasks
          SET status = 'DECLINED', exception_reason = ?
          WHERE id = ?
        `).run(input.decline_reason || 'Responder declined mission', taskId);

        // Unlink commitment so coordinator can re-assign
        db.prepare(`
          UPDATE resource_commitments SET task_id = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ?
        `).run(rawTask.commitment_id);

        db.prepare(`
          INSERT INTO coordination_updates (
            incident_id, task_id, author_id, update_type, message
          ) VALUES (?, ?, ?, 'EXCEPTION', ?)
        `).run(
          rawTask.incident_id,
          taskId,
          actor.id,
          `Mission declined by volunteer: ${input.decline_reason || 'No reason specified'}`
        );

        logAuditEvent({
          actorId: actor.id,
          actorRole: actor.role,
          action: AuditAction.TASK_DECLINED,
          entityType: 'TASK',
          entityId: String(taskId),
          beforeState: { status: TaskStatus.OFFERED },
          afterState: { status: TaskStatus.DECLINED },
          quantityDelta: 0,
          reason: input.decline_reason || 'Responder declined mission'
        });
      }
    });

    return this.getTaskById(taskId, actor);
  }

  /**
   * Mark dispatched: shifts stock from RESERVED -> IN_TRANSIT
   */
  static dispatchTask(taskId: number, input: DispatchTaskInput, actor: { id: string; role: string }): TaskDetailView {
    const task = db.prepare(`
      SELECT t.*, c.pool_id, c.quantity as commitment_quantity
      FROM tasks t
      JOIN resource_commitments c ON c.id = t.commitment_id
      WHERE t.id = ?
    `).get(taskId) as any;

    if (!task) {
      throw new TaskNotFoundError(taskId);
    }

    // Guard: Ownership assertion
    if (task.assigned_to !== actor.id) {
      throw new TaskForbiddenError(`Designated responder ownership assertion failed: Only '${task.assigned_to}' can mark dispatch. Actor '${actor.id}' unauthorized.`);
    }

    // Guard: Premature dispatch check
    if (task.status === TaskStatus.OFFERED) {
      throw new PrematureDispatchError(`Premature dispatch: Task #${taskId} is in 'OFFERED' status. Field responder must explicitly accept mission ownership before departure can be marked.`);
    }

    if (task.status !== TaskStatus.ACCEPTED) {
      throw new TaskStateConflictError(`Task #${taskId} is in status '${task.status}', expected 'ACCEPTED'.`);
    }

    // Guard: dispatch quantity defaults to the full assigned quantity, but a responder
    // may dispatch fewer kits than reserved (e.g. vehicle capacity) — the remainder stays
    // RESERVED against this commitment at the depot rather than moving to in-transit.
    const dispatchQty = input.quantity ?? task.assigned_quantity;
    if (dispatchQty < 1 || dispatchQty > task.assigned_quantity) {
      throw new TaskStateConflictError(`Dispatch quantity ${dispatchQty} is invalid: must be between 1 and the assigned quantity (${task.assigned_quantity}).`);
    }
    const heldBackQty = task.assigned_quantity - dispatchQty;

    runTransaction(() => {
      // 1. Update task to IN_PROGRESS
      db.prepare(`
        UPDATE tasks
        SET status = 'IN_PROGRESS', dispatched_quantity = ?, dispatched_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
        WHERE id = ?
      `).run(dispatchQty, taskId);

      // 2. Update resource commitment status to IN_TRANSIT (single-status simplification:
      // even a partial dispatch marks the whole commitment IN_TRANSIT, since the data
      // model tracks one status per commitment, not a split reserved/in-transit split)
      db.prepare(`
        UPDATE resource_commitments
        SET status = 'IN_TRANSIT', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
        WHERE id = ?
      `).run(task.commitment_id);

      // 3. Atomically move only the dispatched quantity from RESERVED to IN_TRANSIT
      const poolUpdate = db.prepare(`
        UPDATE resource_pools
        SET reserved_quantity = reserved_quantity - ?,
            in_transit_quantity = in_transit_quantity + ?,
            last_confirmed_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
        WHERE id = ? AND reserved_quantity >= ?
      `).run(dispatchQty, dispatchQty, task.pool_id, dispatchQty);

      if (poolUpdate.changes === 0) {
        throw new TaskStateConflictError(`Failed to update depot pool #${task.pool_id}: Insufficient reserved stock to mark ${dispatchQty} in-transit.`);
      }

      // 4. Verify conservation of mass check
      const pool = db.prepare(`
        SELECT * FROM resource_pools WHERE id = ?
      `).get(task.pool_id) as any;

      if (pool.available_quantity + pool.reserved_quantity + pool.in_transit_quantity + pool.delivered_quantity !== pool.total_quantity) {
        throw new Error(`CRITICAL_INVARIANT_VIOLATION: Mass conservation failed for pool #${pool.id}`);
      }

      // 5. Insert coordination update
      const dispatchMessage = input.notes
        || (heldBackQty > 0
          ? `Dispatched: ${dispatchQty} of ${task.assigned_quantity} relief kits en route; ${heldBackQty} kits held back and remain reserved at depot.`
          : `Dispatched: ${dispatchQty} relief kits en route to ${task.incident_id}`);
      db.prepare(`
        INSERT INTO coordination_updates (
          incident_id, task_id, author_id, update_type, message
        ) VALUES (?, ?, ?, 'PROGRESS', ?)
      `).run(task.incident_id, taskId, actor.id, dispatchMessage);

      // 6. Log audit event
      logAuditEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: AuditAction.TASK_DISPATCHED,
        entityType: 'TASK',
        entityId: String(taskId),
        beforeState: { status: TaskStatus.ACCEPTED },
        afterState: { status: TaskStatus.IN_PROGRESS, dispatched_quantity: dispatchQty },
        quantityDelta: dispatchQty,
        reason: input.notes || `Volunteer took custody of ${dispatchQty} kits; departed from depot`
      });
    });

    return this.getTaskById(taskId, actor);
  }

  /**
   * Post a free-text progress or exception update while a mission is underway
   * (accepted through in-progress) — distinct from the final outcome submission.
   */
  static postProgressUpdate(taskId: number, input: PostTaskUpdateInput, actor: { id: string; role: string }): TaskDetailView {
    const task = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(taskId) as any;

    if (!task) {
      throw new TaskNotFoundError(taskId);
    }

    if (task.assigned_to !== actor.id) {
      throw new TaskForbiddenError(`Only the assigned responder '${task.assigned_to}' can post updates on this mission.`);
    }

    if (task.status !== TaskStatus.ACCEPTED && task.status !== TaskStatus.IN_PROGRESS) {
      throw new TaskStateConflictError(`Task #${taskId} cannot accept a progress update in status '${task.status}'. Expected 'ACCEPTED' or 'IN_PROGRESS'.`);
    }

    const updateType = input.update_type || 'PROGRESS';

    runTransaction(() => {
      db.prepare(`
        INSERT INTO coordination_updates (
          incident_id, task_id, author_id, update_type, message
        ) VALUES (?, ?, ?, ?, ?)
      `).run(task.incident_id, taskId, actor.id, updateType, input.message);

      logAuditEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: AuditAction.TASK_PROGRESS_UPDATE,
        entityType: 'TASK',
        entityId: String(taskId),
        beforeState: null,
        afterState: { update_type: updateType },
        quantityDelta: 0,
        reason: input.message
      });
    });

    return this.getTaskById(taskId, actor);
  }

  /**
   * Submit physical execution outcome (LOGIC-004)
   * Enforces: delivered + remainder === assigned_quantity
   */
  static submitOutcome(taskId: number, input: SubmitOutcomeInput, actor: { id: string; role: string }): TaskDetailView {
    const task = db.prepare(`
      SELECT t.*, c.pool_id
      FROM tasks t
      JOIN resource_commitments c ON c.id = t.commitment_id
      WHERE t.id = ?
    `).get(taskId) as any;

    if (!task) {
      throw new TaskNotFoundError(taskId);
    }

    // Guard: Ownership assertion
    if (task.assigned_to !== actor.id) {
      throw new TaskForbiddenError(`Only assigned responder '${task.assigned_to}' can report mission outcome.`);
    }

    // Guard: Task must be IN_PROGRESS
    if (task.status !== TaskStatus.IN_PROGRESS) {
      throw new TaskStateConflictError(`Task #${taskId} must be in status 'IN_PROGRESS' to submit outcome (current: '${task.status}').`);
    }

    // Invariant Check (LOGIC-004): delivered + remainder === dispatched_quantity
    // (the physical custody the responder actually took, not necessarily the full
    // assigned_quantity if fewer kits were dispatched)
    if (input.delivered_quantity + input.remainder_quantity !== task.dispatched_quantity) {
      throw new MathMismatchError(
        `Quantity reconciliation math mismatch: Delivered (${input.delivered_quantity}) + Remainder (${input.remainder_quantity}) does not equal dispatched quantity (${task.dispatched_quantity}).`
      );
    }

    // Mandatory exception note on partial or failed delivery
    if (input.outcome_type !== 'FULL' && (!input.exception_reason || input.exception_reason.trim().length === 0)) {
      throw new MathMismatchError('Exception reason is strictly mandatory when reporting a partial or failed delivery outcome.');
    }

    let nextTaskStatus = TaskStatus.COMPLETED;
    let commitmentStatus = CommitmentStatus.DELIVERED;
    if (input.outcome_type === 'PARTIAL') {
      nextTaskStatus = TaskStatus.PARTIALLY_COMPLETED;
      commitmentStatus = CommitmentStatus.EXCEPTION_RETURNED;
    } else if (input.outcome_type === 'FAILED') {
      nextTaskStatus = TaskStatus.FAILED;
      commitmentStatus = CommitmentStatus.EXCEPTION_RETURNED;
    }

    runTransaction(() => {
      // 1. Update task record
      db.prepare(`
        UPDATE tasks
        SET status = ?,
            delivered_quantity = ?,
            remainder_quantity = ?,
            exception_reason = ?,
            completed_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
        WHERE id = ?
      `).run(
        nextTaskStatus,
        input.delivered_quantity,
        input.remainder_quantity,
        input.exception_reason || null,
        taskId
      );

      // 2. Update commitment record status
      db.prepare(`
        UPDATE resource_commitments
        SET status = ?,
            updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
        WHERE id = ?
      `).run(commitmentStatus, task.commitment_id);

      // 3. Two-Step Inventory Step 1:
      // Move delivered units from in_transit to delivered.
      // The remainder units stay in in_transit until Coordinator reconciles and restocks to depot.
      db.prepare(`
        UPDATE resource_pools
        SET in_transit_quantity = in_transit_quantity - ?,
            delivered_quantity = delivered_quantity + ?,
            last_confirmed_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
        WHERE id = ?
      `).run(input.delivered_quantity, input.delivered_quantity, task.pool_id);

      // 4. Assert conservation of mass holds
      const pool = db.prepare('SELECT * FROM resource_pools WHERE id = ?').get(task.pool_id) as any;
      if (pool.available_quantity + pool.reserved_quantity + pool.in_transit_quantity + pool.delivered_quantity !== pool.total_quantity) {
        throw new Error(`CRITICAL_INVARIANT_VIOLATION: Mass conservation failed during outcome submission on pool #${pool.id}`);
      }

      // 5. Log coordination update note
      db.prepare(`
        INSERT INTO coordination_updates (
          incident_id, task_id, author_id, update_type, message
        ) VALUES (?, ?, ?, 'OUTCOME_NOTE', ?)
      `).run(
        task.incident_id,
        taskId,
        actor.id,
        `Outcome recorded: ${input.delivered_quantity} kits delivered, ${input.remainder_quantity} returned. Reason: ${input.exception_reason || 'Full mission delivery executed.'}`
      );

      // 6. Log audit event
      logAuditEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: AuditAction.OUTCOME_SUBMITTED,
        entityType: 'TASK',
        entityId: String(taskId),
        beforeState: { status: task.status, assigned_quantity: task.assigned_quantity },
        afterState: {
          status: nextTaskStatus,
          delivered_quantity: input.delivered_quantity,
          remainder_quantity: input.remainder_quantity
        },
        quantityDelta: input.delivered_quantity,
        reason: input.exception_reason || 'Mission executed successfully in full.'
      });
    });

    return this.getTaskById(taskId, actor);
  }
}
