import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/server.js';
import { resetDatabase } from '../src/db/seed.js';
import { checkConservationOfMass } from '../src/db/connection.js';
import { UserRole, IncidentType, ReporterSeverity, IncidentPriority } from '@vrl/shared';

async function makeRequest(
  server: http.Server,
  path: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  } = {}
) {
  const port = (server.address() as any).port;
  const url = `http://127.0.0.1:${port}${path}`;

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }

  return {
    status: res.status,
    headers: res.headers,
    body: json
  };
}

async function runTaskTests() {
  console.log('========================================================');
  console.log('  RUNNING PHASE 4 TASK ASSIGNMENT & DISPATCH TESTS       ');
  console.log('========================================================');

  // 1. Reset DB
  resetDatabase();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));

  try {
    // Step A: Create and verify incident #1
    console.log('\n[Setup] Submitting report, verifying incident, reserving 20 kits...');
    const reportRes = await makeRequest(server, '/api/reports', {
      method: 'POST',
      headers: {
        'x-actor-id': 'aarav',
        'x-actor-role': UserRole.REPORTER
      },
      body: {
        location_name: 'Kranti Nagar, Kurla West',
        latitude: 19.0688,
        longitude: 72.8812,
        incident_type: IncidentType.FLOOD,
        reporter_severity: ReporterSeverity.CRITICAL,
        description: 'Severe waterlogging near bridge. 15 families stranded.',
        contact_safe: '+91-98200-XXXXX'
      }
    });
    assert.equal(reportRes.status, 201);
    const reportId = reportRes.body.report.id;

    const verifyRes = await makeRequest(server, `/api/reports/${reportId}/verify`, {
      method: 'POST',
      headers: { 'x-actor-id': 'rajesh', 'x-actor-role': UserRole.COORDINATOR },
      body: { priority: IncidentPriority.URGENT }
    });
    assert.equal(verifyRes.status, 200);
    const incidentId = verifyRes.body.incident.id;

    // Step B: Reserve 20 kits
    const reserveRes = await makeRequest(server, `/api/incidents/${incidentId}/reserve`, {
      method: 'POST',
      headers: { 'x-actor-id': 'rajesh', 'x-actor-role': UserRole.COORDINATOR },
      body: { quantity: 20, pool_id: 1 }
    });
    assert.equal(reserveRes.status, 200);
    const commitmentId = reserveRes.body.commitment.id;
    console.log(`✓ Setup complete: Incident #${incidentId} resourced with Commitment #${commitmentId} (20 kits)`);

    // TEST 1: Task Creation (Coordinator offers task to Chetan)
    console.log('\n[Test 1] POST /api/tasks (Coordinator offers mission to Chetan)');
    const createTaskRes = await makeRequest(server, '/api/tasks', {
      method: 'POST',
      headers: { 'x-actor-id': 'rajesh', 'x-actor-role': UserRole.COORDINATOR },
      body: {
        incident_id: incidentId,
        commitment_id: commitmentId,
        assigned_to: 'chetan',
        instructions: 'Deliver 20 emergency relief kits to Kranti Nagar community center.',
        assigned_quantity: 20
      }
    });
    assert.equal(createTaskRes.status, 201);
    assert.equal(createTaskRes.body.status, 'OFFERED');
    assert.equal(createTaskRes.body.assigned_to, 'chetan');
    assert.equal(createTaskRes.body.assigned_quantity, 20);
    const taskId = createTaskRes.body.id;
    console.log(`✓ Task #${taskId} successfully created in OFFERED status for Chetan`);

    // TEST 2: Role-based Task Listing Privacy Isolation
    console.log('\n[Test 2] GET /api/tasks (Actor Visibility Isolation)');
    // Chetan sees his task
    const chetanTasks = await makeRequest(server, '/api/tasks', {
      headers: { 'x-actor-id': 'chetan', 'x-actor-role': UserRole.RESPONDER }
    });
    assert.equal(chetanTasks.status, 200);
    // 1 seeded historical (COMPLETED) mission + this test's own newly offered task
    assert.equal(chetanTasks.body.count, 2, 'Chetan must see his offered task plus his seeded history');

    // Aarav (Reporter) sees 0 tasks
    const aaravTasks = await makeRequest(server, '/api/tasks', {
      headers: { 'x-actor-id': 'aarav', 'x-actor-role': UserRole.REPORTER }
    });
    assert.equal(aaravTasks.status, 200);
    assert.equal(aaravTasks.body.count, 0, 'Reporter must not see internal task list');

    // Rajesh sees all tasks
    const rajeshTasks = await makeRequest(server, '/api/tasks', {
      headers: { 'x-actor-id': 'rajesh', 'x-actor-role': UserRole.COORDINATOR }
    });
    assert.equal(rajeshTasks.status, 200);
    assert.equal(rajeshTasks.body.count, 2, '1 seeded historical task + this test\'s own');
    console.log('✓ Actor isolation verified: Responders see assigned tasks only; Reporters see zero');

    // TEST 3: Premature Dispatch Guard (Cannot dispatch an OFFERED task)
    console.log('\n[Test 3] POST /api/tasks/:id/dispatch on OFFERED task (Premature Dispatch Guard)');
    const prematureDispatch = await makeRequest(server, `/api/tasks/${taskId}/dispatch`, {
      method: 'POST',
      headers: { 'x-actor-id': 'chetan', 'x-actor-role': UserRole.RESPONDER },
      body: { notes: 'Trying to dispatch prematurely' }
    });
    assert.equal(prematureDispatch.status, 422, 'Dispatching an OFFERED task must return HTTP 422 Unprocessable');
    assert.equal(prematureDispatch.body.error, 'PREMATURE_DISPATCH_UNPROCESSABLE');
    console.log('✓ Premature dispatch guard verified: HTTP 422 returned when task not yet ACCEPTED');

    // TEST 4: Ownership Assertion Guard (Coordinator cannot accept on volunteer behalf)
    console.log('\n[Test 4] POST /api/tasks/:id/acknowledge as unauthorized actor (Ownership Assertion)');
    const rajeshAccept = await makeRequest(server, `/api/tasks/${taskId}/acknowledge`, {
      method: 'POST',
      headers: { 'x-actor-id': 'rajesh', 'x-actor-role': UserRole.COORDINATOR },
      body: { action: 'ACCEPT' }
    });
    assert.equal(rajeshAccept.status, 403, 'Coordinator cannot accept task on volunteer behalf');
    console.log('✓ Ownership assertion verified: HTTP 403 returned for non-assigned actor');

    // TEST 5: Chetan Explicitly Accepts Mission (Two-Phase Handover Phase 1)
    console.log('\n[Test 5] POST /api/tasks/:id/acknowledge (Chetan accepts mission ownership)');
    const chetanAccept = await makeRequest(server, `/api/tasks/${taskId}/acknowledge`, {
      method: 'POST',
      headers: { 'x-actor-id': 'chetan', 'x-actor-role': UserRole.RESPONDER },
      body: { action: 'ACCEPT' }
    });
    assert.equal(chetanAccept.status, 200);
    assert.equal(chetanAccept.body.status, 'ACCEPTED');
    assert.ok(chetanAccept.body.accepted_at, 'accepted_at timestamp must be recorded');
    console.log('✓ Chetan accepted mission: Status transitioned to ACCEPTED');

    // TEST 6: Double Acknowledgement Guard
    console.log('\n[Test 6] POST /api/tasks/:id/acknowledge (Double acceptance prevention)');
    const doubleAccept = await makeRequest(server, `/api/tasks/${taskId}/acknowledge`, {
      method: 'POST',
      headers: { 'x-actor-id': 'chetan', 'x-actor-role': UserRole.RESPONDER },
      body: { action: 'ACCEPT' }
    });
    assert.equal(doubleAccept.status, 409, 'Re-acknowledging already decided task must return HTTP 409 Conflict');
    console.log('✓ Double acknowledgement guard verified: HTTP 409 Conflict');

    // TEST 7: Chetan Marks Dispatched (Two-Phase Handover Phase 2)
    console.log('\n[Test 7] POST /api/tasks/:id/dispatch (Departure & Stock shift to IN_TRANSIT)');
    const dispatchRes = await makeRequest(server, `/api/tasks/${taskId}/dispatch`, {
      method: 'POST',
      headers: { 'x-actor-id': 'chetan', 'x-actor-role': UserRole.RESPONDER },
      body: { notes: 'Departed BKC Base via LBS Marg with 20 kits' }
    });
    assert.equal(dispatchRes.status, 200);
    assert.equal(dispatchRes.body.status, 'IN_PROGRESS');
    assert.ok(dispatchRes.body.dispatched_at, 'dispatched_at timestamp must be set');

    // Verify pool stock shifted from RESERVED -> IN_TRANSIT
    const poolRes = await makeRequest(server, '/api/resources/1');
    assert.equal(poolRes.body.available_quantity, 0);
    assert.equal(poolRes.body.reserved_quantity, 0, 'Reserved quantity must be 0 after dispatch');
    assert.equal(poolRes.body.in_transit_quantity, 20, 'In-transit quantity must be 20');
    assert.equal(poolRes.body.total_quantity, 40, '20 fresh + 20 in seeded history');

    const massCheck = checkConservationOfMass();
    assert.equal(massCheck.is_conserved, true, 'Mass conservation must hold: 0 + 0 + 20 + 20 = 40');
    console.log('✓ Dispatch verified: Task IN_PROGRESS, stock shifted to IN_TRANSIT, Mass Conserved 20/20');

    // TEST 7b: Partial Dispatch (separate incident/commitment/task so it doesn't
    // disturb the full-dispatch assertions above)
    console.log('\n[Test 7b] POST /api/tasks/:id/dispatch with a partial quantity');
    const report2Res = await makeRequest(server, '/api/reports', {
      method: 'POST',
      headers: { 'x-actor-id': 'aarav', 'x-actor-role': UserRole.REPORTER },
      body: {
        location_name: 'Bail Bazar Junction, Kurla West',
        latitude: 19.0712,
        longitude: 72.8834,
        incident_type: IncidentType.ROAD_BLOCKAGE,
        reporter_severity: ReporterSeverity.HIGH,
        description: 'Waterlogged junction blocking relief vehicle access.',
        contact_safe: '+91-98200-XXXXX'
      }
    });
    assert.equal(report2Res.status, 201);
    const verify2Res = await makeRequest(server, `/api/reports/${report2Res.body.report.id}/verify`, {
      method: 'POST',
      headers: { 'x-actor-id': 'rajesh', 'x-actor-role': UserRole.COORDINATOR },
      body: { priority: IncidentPriority.HIGH }
    });
    assert.equal(verify2Res.status, 200);
    const incident2Id = verify2Res.body.incident.id;

    // Adjust stock so pool 1 has 20 more available to reserve (it's currently 0/0/20/0)
    const adjustRes = await makeRequest(server, '/api/resources/1/adjust', {
      method: 'POST',
      headers: { 'x-actor-id': 'rajesh', 'x-actor-role': UserRole.COORDINATOR },
      body: { quantity_delta: 20, reason: 'Restock for partial-dispatch test scenario' }
    });
    assert.equal(adjustRes.status, 200);

    const reserve2Res = await makeRequest(server, `/api/incidents/${incident2Id}/reserve`, {
      method: 'POST',
      headers: { 'x-actor-id': 'rajesh', 'x-actor-role': UserRole.COORDINATOR },
      body: { quantity: 20, pool_id: 1 }
    });
    assert.equal(reserve2Res.status, 200);
    const commitment2Id = reserve2Res.body.commitment.id;

    const task2Res = await makeRequest(server, '/api/tasks', {
      method: 'POST',
      headers: { 'x-actor-id': 'rajesh', 'x-actor-role': UserRole.COORDINATOR },
      body: {
        incident_id: incident2Id,
        commitment_id: commitment2Id,
        assigned_to: 'chetan',
        instructions: 'Deliver up to 20 kits to Bail Bazar; vehicle may not fit all.',
        assigned_quantity: 20
      }
    });
    assert.equal(task2Res.status, 201);
    const task2Id = task2Res.body.id;

    await makeRequest(server, `/api/tasks/${task2Id}/acknowledge`, {
      method: 'POST',
      headers: { 'x-actor-id': 'chetan', 'x-actor-role': UserRole.RESPONDER },
      body: { action: 'ACCEPT' }
    });

    const partialDispatchRes = await makeRequest(server, `/api/tasks/${task2Id}/dispatch`, {
      method: 'POST',
      headers: { 'x-actor-id': 'chetan', 'x-actor-role': UserRole.RESPONDER },
      body: { quantity: 12, notes: 'Van only fits 12 kits; 8 held back at depot.' }
    });
    assert.equal(partialDispatchRes.status, 200);
    assert.equal(partialDispatchRes.body.status, 'IN_PROGRESS');
    assert.equal(partialDispatchRes.body.dispatched_quantity, 12, 'dispatched_quantity must reflect the partial amount');
    assert.equal(partialDispatchRes.body.assigned_quantity, 20, 'assigned_quantity must remain the original reservation');

    const poolAfterPartial = await makeRequest(server, '/api/resources/1');
    assert.equal(poolAfterPartial.body.reserved_quantity, 8, '8 kits held back must remain RESERVED');
    assert.equal(poolAfterPartial.body.in_transit_quantity, 32, '20 (Test 7) + 12 (this test) = 32 in transit');
    const massAfterPartial = checkConservationOfMass();
    assert.equal(massAfterPartial.is_conserved, true, 'Mass conservation must hold after partial dispatch');
    console.log('✓ Partial dispatch verified: 12 of 20 dispatched, 8 kits remain RESERVED at depot, Mass Conserved');

    // Outcome math must be checked against dispatched_quantity (12), not assigned_quantity (20)
    const badOutcomeRes = await makeRequest(server, `/api/tasks/${task2Id}/outcome`, {
      method: 'POST',
      headers: { 'x-actor-id': 'chetan', 'x-actor-role': UserRole.RESPONDER },
      body: { outcome_type: 'FULL', delivered_quantity: 20, remainder_quantity: 0 }
    });
    assert.equal(badOutcomeRes.status, 422, 'Outcome math must reject totals based on assigned_quantity rather than dispatched_quantity');

    const goodOutcomeRes = await makeRequest(server, `/api/tasks/${task2Id}/outcome`, {
      method: 'POST',
      headers: { 'x-actor-id': 'chetan', 'x-actor-role': UserRole.RESPONDER },
      body: { outcome_type: 'FULL', delivered_quantity: 12, remainder_quantity: 0 }
    });
    assert.equal(goodOutcomeRes.status, 200);
    assert.equal(goodOutcomeRes.body.status, 'COMPLETED');

    const poolAfterOutcome = await makeRequest(server, '/api/resources/1');
    assert.equal(poolAfterOutcome.body.reserved_quantity, 8, '8 held-back kits are unaffected by this task\'s outcome and remain RESERVED (known limitation: no re-dispatch flow yet)');
    const massAfterOutcome = checkConservationOfMass();
    assert.equal(massAfterOutcome.is_conserved, true, 'Mass conservation must hold after partial-dispatch outcome');
    console.log('✓ Outcome correctly validated against dispatched_quantity, not assigned_quantity');

    // TEST 8: Audit Trail Inspection
    console.log('\n[Test 8] GET /api/audit (Full Handover Audit Trail)');
    const auditRes = await makeRequest(server, '/api/audit');
    assert.equal(auditRes.status, 200);
    const actions = auditRes.body.events.map((e: any) => e.action);
    assert.ok(actions.includes('TASK_OFFERED'), 'Audit trail must contain TASK_OFFERED');
    assert.ok(actions.includes('TASK_ACCEPTED'), 'Audit trail must contain TASK_ACCEPTED');
    assert.ok(actions.includes('TASK_DISPATCHED'), 'Audit trail must contain TASK_DISPATCHED');
    console.log('✓ Immutable audit trail contains attributable TASK_OFFERED, TASK_ACCEPTED, TASK_DISPATCHED events');

    console.log('\n========================================================');
    console.log('  ALL PHASE 4 TASK TESTS PASSED SUCCESSFULLY!          ');
    console.log('========================================================');
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

runTaskTests().catch((err) => {
  console.error('\n❌ Task Test Suite Failed:', err);
  process.exit(1);
});
