import { fileURLToPath } from 'node:url';
import { db, runTransaction, checkConservationOfMass } from './connection.js';
import { runMigrations } from './migrate.js';
import { MUMBAI_SCENARIO, AuditAction, UserRole } from '@vrl/shared';
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
        // 1. Seed Users (System + Aarav, Rajesh, Chetan)
        const insertUser = db.prepare(`
      INSERT INTO users (id, display_name, role, contact_safe, is_active)
      VALUES (?, ?, ?, ?, 1)
    `);
        insertUser.run('system', 'System Automation Engine', UserRole.COORDINATOR, 'internal-daemon@vrl.local');
        const { aarav, rajesh, chetan } = MUMBAI_SCENARIO.personas;
        insertUser.run(aarav.id, aarav.display_name, aarav.role, aarav.contact_safe);
        insertUser.run(rajesh.id, rajesh.display_name, rajesh.role, rajesh.contact_safe);
        insertUser.run(chetan.id, chetan.display_name, chetan.role, chetan.contact_safe);
        // 2. Seed Primary Resource Pool (BKC Relief Base - 20 Relief Kits)
        const insertPool = db.prepare(`
      INSERT INTO resource_pools (
        id, resource_name, depot_name, unit, latitude, longitude,
        total_quantity, available_quantity, reserved_quantity, in_transit_quantity, delivered_quantity,
        provenance
      ) VALUES (1, ?, ?, ?, ?, ?, 20, 20, 0, 0, 0, 'SYNTHETIC_FIXTURE')
    `);
        insertPool.run(MUMBAI_SCENARIO.depot.resource_name, MUMBAI_SCENARIO.depot.name, MUMBAI_SCENARIO.depot.unit, MUMBAI_SCENARIO.depot.lat, MUMBAI_SCENARIO.depot.lng);
        // 3. Seed Initial Audit Event
        const insertAudit = db.prepare(`
      INSERT INTO audit_events (
        actor_id, actor_role, action, entity_type, entity_id, before_state, after_state, quantity_delta, reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        insertAudit.run('system', 'COORDINATOR', AuditAction.DEMO_RESET, 'RESOURCE_POOL', '1', null, JSON.stringify({ available: 20, total: 20 }), 20, 'Deterministic demo reset to Mumbai Kurla West baseline (20 relief kits)');
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
