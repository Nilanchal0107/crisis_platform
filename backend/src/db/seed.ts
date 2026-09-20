import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { db, runTransaction, checkConservationOfMass } from './connection.js';
import { runMigrations } from './migrate.js';
import {
  MUMBAI_SCENARIO,
  KURLA_LOCATION_PRESETS,
  AuditAction,
  UserRole,
  GUEST_REPORTER_ID,
  IncidentType,
  ReporterSeverity,
  IncidentPriority,
  IncidentStatus,
  CommitmentStatus,
  TaskStatus,
  CoordinationUpdateType
} from '@vrl/shared';

// Past timestamps for synthetic history, so offered_at < accepted_at < ... reads as a
// plausible real timeline rather than everything defaulting to the same `now()`.
function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

// Additional login-selectable accounts beyond the three scripted-demo personas.
// The scripted "Run Demo Sequence" always uses aarav/rajesh/chetan directly;
// these exist so the role-wise login screen has more than one account per role to choose from.
const EXTRA_ACCOUNTS: { id: string; display_name: string; role: UserRole; contact_safe: string }[] = [
  { id: 'neha', display_name: 'Neha (Community Reporter)', role: UserRole.REPORTER, contact_safe: 'Neha Demo Contact (9820099887)' },
  { id: 'priya', display_name: 'Priya (BMC Duty Coordinator)', role: UserRole.COORDINATOR, contact_safe: 'BMC Duty Desk (022-22694730)' },
  { id: 'meera', display_name: 'Meera (Kurla QRT Volunteer)', role: UserRole.RESPONDER, contact_safe: 'Meera Field Mobile (9876543210)' },
  { id: 'imran', display_name: 'Imran (BMC Relief Volunteer)', role: UserRole.RESPONDER, contact_safe: 'Imran Field Mobile (9911223344)' }
];

// Demo passwords for every login-selectable account: '<id>123'. Hardcoded and hashed
// with bcrypt — fine for a local hackathon prototype with fixed synthetic identities;
// see the "Demo Credentials" panel on the landing page. The 'system' and 'guest' actors
// are the only accounts with no password since neither is login-selectable.
//
// Computed once, eagerly, at module load — not per resetDatabase() call. bcrypt hashing
// is deliberately slow, and /api/demo/reset (hit by every test file's setup and by
// `npm run reset:demo`) needs to stay fast; hashing all accounts on every reset made the
// 10-step E2E test blow its 500ms budget on hashing alone.
const DEMO_PASSWORD_HASHES: Record<string, string> = Object.fromEntries(
  [MUMBAI_SCENARIO.personas.aarav.id, MUMBAI_SCENARIO.personas.rajesh.id, MUMBAI_SCENARIO.personas.chetan.id,
    ...EXTRA_ACCOUNTS.map((a) => a.id)]
    .map((id) => [id, bcrypt.hashSync(`${id}123`, 10)])
);

export function resetDatabase() {
  return runTransaction(() => {
    // Ensure tables exist
    runMigrations();

    // Clear existing operational data (child tables before parent tables)
    db.exec(`
      DELETE FROM coordination_updates;
      DELETE FROM tasks;
      DELETE FROM resource_commitments;
      DELETE FROM duplicate_links;
      DELETE FROM canonical_incidents;
      DELETE FROM source_reports;
      DELETE FROM audit_events;
      DELETE FROM resource_pools;
      DELETE FROM users;
    `);

    // 1. Seed Users (System + Guest + Aarav, Rajesh, Chetan)
    // Every login-selectable account (including Reporter accounts) gets a password —
    // 'system' and 'guest' have none, since neither is login-selectable: 'system' is an
    // internal actor, and 'guest' is the fixed identity Quick Report submits as — kept
    // distinct from any real, loginable Reporter account like aarav.
    const insertUser = db.prepare(`
      INSERT INTO users (id, display_name, role, contact_safe, password_hash, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

    insertUser.run('system', 'System Automation Engine', UserRole.COORDINATOR, 'internal-daemon@vrl.local', null);
    insertUser.run(GUEST_REPORTER_ID, 'Guest Reporter (Anonymous Submission)', UserRole.REPORTER, 'Not collected (anonymous)', null);
    const { aarav, rajesh, chetan } = MUMBAI_SCENARIO.personas;
    insertUser.run(aarav.id, aarav.display_name, aarav.role, aarav.contact_safe, DEMO_PASSWORD_HASHES[aarav.id]);
    insertUser.run(rajesh.id, rajesh.display_name, rajesh.role, rajesh.contact_safe, DEMO_PASSWORD_HASHES[rajesh.id]);
    insertUser.run(chetan.id, chetan.display_name, chetan.role, chetan.contact_safe, DEMO_PASSWORD_HASHES[chetan.id]);
    for (const account of EXTRA_ACCOUNTS) {
      insertUser.run(account.id, account.display_name, account.role, account.contact_safe, DEMO_PASSWORD_HASHES[account.id]);
    }

    // 2. Seed Primary Resource Pool (BKC Relief Base). Total is 40, not 20: a fresh 20
    // kits stay available for live demo flows, and 20 are permanently accounted for as
    // the historical mission's delivered stock seeded below (conservation: 20+0+0+20=40).
    const insertPool = db.prepare(`
      INSERT INTO resource_pools (
        id, resource_name, depot_name, unit, latitude, longitude,
        total_quantity, available_quantity, reserved_quantity, in_transit_quantity, delivered_quantity,
        provenance
      ) VALUES (1, ?, ?, ?, ?, ?, 40, 20, 0, 0, 20, 'SYNTHETIC_FIXTURE')
    `);

    insertPool.run(
      MUMBAI_SCENARIO.depot.resource_name,
      MUMBAI_SCENARIO.depot.name,
      MUMBAI_SCENARIO.depot.unit,
      MUMBAI_SCENARIO.depot.lat,
      MUMBAI_SCENARIO.depot.lng
    );

    // 3. Seed synthetic history for aarav/rajesh/chetan so their screens aren't empty
    // on first login: one fully-resolved historical mission (the only thing that
    // permanently consumes pool stock, hence total=40 above), one incident already
    // verified but not yet resourced (a ready hook for a live demo), and one report
    // still awaiting triage. All use small fixed explicit IDs, same pattern as the
    // pool's id=1 above — safe every reset since DELETE FROM clears these tables first.
    const [kranti, bailBazar, mithiBridge] = KURLA_LOCATION_PRESETS;

    const insertReport = db.prepare(`
      INSERT INTO source_reports (
        id, reference_code, reporter_id, location_name, latitude, longitude,
        incident_type, reporter_severity, description, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertReport.run(
      1, 'REF-1001-H', aarav.id, kranti.name, kranti.latitude, kranti.longitude,
      IncidentType.FLOOD, ReporterSeverity.CRITICAL,
      'Mithi river overflow entering residential chawls. Families evacuated to upper floors.',
      'LINKED_TO_INCIDENT', hoursAgo(50)
    );
    insertReport.run(
      2, 'REF-1002-K', aarav.id, bailBazar.name, bailBazar.latitude, bailBazar.longitude,
      IncidentType.ROAD_BLOCKAGE, ReporterSeverity.HIGH,
      'Junction waterlogged axle-deep, relief vehicles cannot pass through.',
      'LINKED_TO_INCIDENT', hoursAgo(20)
    );
    insertReport.run(
      3, 'REF-1003-M', aarav.id, mithiBridge.name, mithiBridge.latitude, mithiBridge.longitude,
      IncidentType.STRUCTURAL_DAMAGE, ReporterSeverity.MEDIUM,
      'Bridge approach railing damaged by debris; pedestrians at risk after dark.',
      'SUBMITTED', hoursAgo(5)
    );

    const insertIncident = db.prepare(`
      INSERT INTO canonical_incidents (
        id, primary_report_id, verified_by, location_name, latitude, longitude,
        incident_type, priority, status, verified_at, resolved_at, closure_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertIncident.run(
      1, 1, rajesh.id, kranti.name, kranti.latitude, kranti.longitude,
      IncidentType.FLOOD, IncidentPriority.URGENT, IncidentStatus.RESOLVED,
      hoursAgo(48), hoursAgo(35),
      'Full delivery confirmed: 20 relief kits distributed to Kranti Nagar households.'
    );
    insertIncident.run(
      2, 2, rajesh.id, bailBazar.name, bailBazar.latitude, bailBazar.longitude,
      IncidentType.ROAD_BLOCKAGE, IncidentPriority.HIGH, IncidentStatus.VERIFIED,
      hoursAgo(18), null, null
    );

    const insertCommitment = db.prepare(`
      INSERT INTO resource_commitments (
        id, pool_id, incident_id, task_id, quantity, status, committed_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCommitment.run(1, 1, 1, 1, 20, CommitmentStatus.DELIVERED, rajesh.id, hoursAgo(47), hoursAgo(36));

    const insertTask = db.prepare(`
      INSERT INTO tasks (
        id, incident_id, commitment_id, assigned_to, assigned_by, instructions,
        assigned_quantity, dispatched_quantity, delivered_quantity, remainder_quantity,
        status, offered_at, accepted_at, dispatched_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTask.run(
      1, 1, 1, chetan.id, rajesh.id,
      'Deliver 20 emergency relief kits to Kranti Nagar evacuation outpost.',
      20, 20, 20, 0, TaskStatus.COMPLETED,
      hoursAgo(46), hoursAgo(45), hoursAgo(40), hoursAgo(36)
    );

    const insertUpdate = db.prepare(`
      INSERT INTO coordination_updates (
        report_id, incident_id, task_id, author_id, update_type, message, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertUpdate.run(null, 1, 1, rajesh.id, CoordinationUpdateType.INSTRUCTION,
      'Deliver 20 emergency relief kits to Kranti Nagar evacuation outpost.', hoursAgo(46));
    insertUpdate.run(null, 1, 1, chetan.id, CoordinationUpdateType.PROGRESS,
      'Mission accepted by assigned volunteer. Preparing for depot pickup and departure.', hoursAgo(45));
    insertUpdate.run(null, 1, 1, chetan.id, CoordinationUpdateType.PROGRESS,
      'Dispatched: 20 relief kits en route to Kranti Nagar.', hoursAgo(40));
    insertUpdate.run(null, 1, 1, chetan.id, CoordinationUpdateType.OUTCOME_NOTE,
      'Outcome recorded: 20 kits delivered, 0 returned. Reason: Full mission delivery executed.', hoursAgo(36));
    insertUpdate.run(3, null, null, aarav.id, CoordinationUpdateType.CLARIFICATION,
      'Damage looks worse at night — recommend barricading the approach until repaired.', hoursAgo(4));

    // 4. Seed audit trail for the historical mission above, then the deterministic
    // reset event (kept last, matching the pre-existing behavior).
    const insertAudit = db.prepare(`
      INSERT INTO audit_events (
        actor_id, actor_role, action, entity_type, entity_id, before_state, after_state, quantity_delta, reason, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAudit.run(aarav.id, 'REPORTER', AuditAction.REPORT_SUBMITTED, 'SOURCE_REPORT', '1', null, JSON.stringify({ status: 'SUBMITTED' }), 0, 'Historical: Kranti Nagar flood report submitted', hoursAgo(50));
    insertAudit.run(rajesh.id, 'COORDINATOR', AuditAction.REPORT_VERIFIED, 'CANONICAL_INCIDENT', '1', null, JSON.stringify({ status: 'VERIFIED' }), 0, 'Historical: verified into Canonical Incident #1', hoursAgo(48));
    insertAudit.run(rajesh.id, 'COORDINATOR', AuditAction.RESOURCE_RESERVED, 'resource_commitments', '1', null, JSON.stringify({ commitment_id: 1 }), 20, 'Historical: reserved 20 kits from BKC Relief Base for Incident #1', hoursAgo(47));
    insertAudit.run(rajesh.id, 'COORDINATOR', AuditAction.TASK_OFFERED, 'TASK', '1', null, JSON.stringify({ status: 'OFFERED' }), 20, 'Historical: mission offered to Chetan with 20 relief kits', hoursAgo(46));
    insertAudit.run(chetan.id, 'RESPONDER', AuditAction.TASK_ACCEPTED, 'TASK', '1', JSON.stringify({ status: 'OFFERED' }), JSON.stringify({ status: 'ACCEPTED' }), 0, 'Historical: field responder accepted mission ownership', hoursAgo(45));
    insertAudit.run(chetan.id, 'RESPONDER', AuditAction.TASK_DISPATCHED, 'TASK', '1', JSON.stringify({ status: 'ACCEPTED' }), JSON.stringify({ status: 'IN_PROGRESS' }), 20, 'Historical: volunteer took custody of 20 kits; departed from depot', hoursAgo(40));
    insertAudit.run(chetan.id, 'RESPONDER', AuditAction.OUTCOME_SUBMITTED, 'TASK', '1', JSON.stringify({ status: 'IN_PROGRESS' }), JSON.stringify({ status: 'COMPLETED', delivered_quantity: 20 }), 20, 'Historical: mission executed successfully in full', hoursAgo(36));
    insertAudit.run(rajesh.id, 'COORDINATOR', AuditAction.OUTCOME_RECONCILED, 'canonical_incidents', '1', JSON.stringify({ status: 'RESPONSE_ACTIVE' }), JSON.stringify({ status: 'RESOLVED', delivered_quantity: 20, restocked_quantity: 0 }), 0, 'Historical: Reconciled: Full delivery of 20 kits completed.', hoursAgo(35));
    insertAudit.run(aarav.id, 'REPORTER', AuditAction.REPORT_SUBMITTED, 'SOURCE_REPORT', '2', null, JSON.stringify({ status: 'SUBMITTED' }), 0, 'Historical: Bail Bazar Junction road blockage report submitted', hoursAgo(20));
    insertAudit.run(rajesh.id, 'COORDINATOR', AuditAction.REPORT_VERIFIED, 'CANONICAL_INCIDENT', '2', null, JSON.stringify({ status: 'VERIFIED' }), 0, 'Historical: verified into Canonical Incident #2 (awaiting resourcing)', hoursAgo(18));
    insertAudit.run(aarav.id, 'REPORTER', AuditAction.REPORT_SUBMITTED, 'SOURCE_REPORT', '3', null, JSON.stringify({ status: 'SUBMITTED' }), 0, 'Historical: Mithi River Bridge structural damage report submitted, pending triage', hoursAgo(5));

    insertAudit.run(
      'system',
      'COORDINATOR',
      AuditAction.DEMO_RESET,
      'RESOURCE_POOL',
      '1',
      null,
      JSON.stringify({ available: 20, total: 40 }),
      20,
      'Deterministic demo reset to Mumbai Kurla West baseline (20 fresh relief kits; 20 more already delivered in seeded history)',
      hoursAgo(0)
    );

    const invariant = checkConservationOfMass(1);
    return {
      status: 'RESET_SUCCESSFUL',
      scenario: MUMBAI_SCENARIO.ward,
      timestamp: new Date().toISOString(),
      invariant_check: {
        conservation_of_mass: invariant.is_conserved ? 'PASS' : 'FAIL',
        details: invariant
      }
    };
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const res = resetDatabase();
  console.log('[DB] Database reset complete:\n', JSON.stringify(res, null, 2));
}
