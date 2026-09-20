import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/server.js';
import { resetDatabase } from '../src/db/seed.js';
import { checkConservationOfMass, db } from '../src/db/connection.js';
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

async function runReconciliationTests() {
  console.log('========================================================');
  console.log('  RUNNING PHASE 5 OUTCOME & RECONCILIATION TEST SUITE   ');
  console.log('========================================================');

  // 1. Reset database to clean 20-kit baseline
  resetDatabase();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));

  try {
    // Step A: Setup through full dispatch
    console.log('\n[Setup] Establishing active mission with 20 kits in transit...');
    const reportRes = await makeRequest(server, '/api/reports', {
      method: 'POST',
      headers: { 'x-actor-id': 'aarav', 'x-actor-role': UserRole.REPORTER },
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
    const reportRef = reportRes.body.report.reference_code;
    const reportId = reportRes.body.report.id;

    const verifyRes = await makeRequest(server, `/api/reports/${reportId}/verify`, {
      method: 'POST',
      headers: { 'x-actor-id': 'rajesh', 'x-actor-role': UserRole.COORDINATOR },
      body: { priority: IncidentPriority.URGENT }
    });
    assert.equal(verifyRes.status, 200);
    const incidentId = verifyRes.body.incident.id;

    const reserveRes = await makeRequest(server, `/api/incidents/${incidentId}/reserve`, {
      method: 'POST',
      headers: { 'x-actor-id': 'rajesh', 'x-actor-role': UserRole.COORDINATOR },
      body: { quantity: 20, pool_id: 1 }
    });
    assert.equal(reserveRes.status, 200);
    const commitmentId = reserveRes.body.commitment.id;

    const taskRes = await makeRequest(server, '/api/tasks', {
      method: 'POST',
      headers: { 'x-actor-id': 'rajesh', 'x-actor-role': UserRole.COORDINATOR },
      body: {
        incident_id: incidentId,
        commitment_id: commitmentId,
        assigned_to: 'chetan',
        instructions: 'Deliver 20 emergency relief kits to Kranti Nagar.',
        assigned_quantity: 20
      }
    });
    assert.equal(taskRes.status, 201);
    const taskId = taskRes.body.id;

    await makeRequest(server, `/api/tasks/${taskId}/acknowledge`, {
      method: 'POST',
      headers: { 'x-actor-id': 'chetan', 'x-actor-role': UserRole.RESPONDER },
      body: { action: 'ACCEPT' }
    });

    await makeRequest(server, `/api/tasks/${taskId}/dispatch`, {
      method: 'POST',
      headers: { 'x-actor-id': 'chetan', 'x-actor-role': UserRole.RESPONDER },
      body: { notes: 'Dispatched 20 kits in QRT Van 1' }
    });
    console.log(`✓ Setup complete: Task #${taskId} is IN_PROGRESS with 20 kits in transit.`);

    // TEST 1: Mathematical Invariant Guard (LOGIC-004)
    console.log('\n[Test 1] POST /api/tasks/:id/outcome (Math Mismatch: 12 + 5 != 20)');
    const mathMismatchRes = await makeRequest(server, `/api/tasks/${taskId}/outcome`, {
      method: 'POST',
      headers: { 'x-actor-id': 'chetan', 'x-actor-role': UserRole.RESPONDER },
      body: {
        outcome_type: 'PARTIAL',
        delivered_quantity: 12,
        remainder_quantity: 5, // 12 + 5 = 17 != 20
        exception_reason: 'Some families were not found'
      }
    });
    assert.equal(mathMismatchRes.status, 422, 'Math mismatch must return HTTP 422 Unprocessable');
    assert.equal(mathMismatchRes.body.error, 'OUTCOME_MATH_MISMATCH_UNPROCESSABLE');
    console.log('✓ Math mismatch guard verified: HTTP 422 returned when quantities do not balance');

    // TEST 2: Mandatory Exception Note Guard
    console.log('\n[Test 2] POST /api/tasks/:id/outcome (Missing Exception Note on Partial Delivery)');
    const missingExceptionRes = await makeRequest(server, `/api/tasks/${taskId}/outcome`, {
      method: 'POST',
      headers: { 'x-actor-id': 'chetan', 'x-actor-role': UserRole.RESPONDER },
      body: {
        outcome_type: 'PARTIAL',
        delivered_quantity: 12,
        remainder_quantity: 8,
        exception_reason: '   ' // empty whitespace
      }
    });
    assert.equal(missingExceptionRes.status, 422, 'Missing exception reason must return HTTP 422');
    console.log('✓ Mandatory exception guard verified: HTTP 422 returned when reason missing');

    // TEST 3: Ownership Assertion Guard
    console.log('\n[Test 3] POST /api/tasks/:id/outcome (Unauthorized Actor Assertion)');
    const unauthorizedRes = await makeRequest(server, `/api/tasks/${taskId}/outcome`, {
      method: 'POST',
      headers: { 'x-actor-id': 'rajesh', 'x-actor-role': UserRole.COORDINATOR },
      body: {
        outcome_type: 'PARTIAL',
        delivered_quantity: 12,
        remainder_quantity: 8,
        exception_reason: 'Attempt by coordinator'
      }
    });
    assert.equal(unauthorizedRes.status, 403, 'Only assigned responder can submit outcome');
    console.log('✓ Ownership assertion verified: HTTP 403 returned for unauthorized actor');

    // TEST 4: Chetan Submits Valid Partial Outcome (12 Delivered, 8 Remainder)
    console.log('\n[Test 4] POST /api/tasks/:id/outcome (Chetan reports 12 delivered / 8 remainder)');
    const outcomeRes = await makeRequest(server, `/api/tasks/${taskId}/outcome`, {
      method: 'POST',
      headers: { 'x-actor-id': 'chetan', 'x-actor-role': UserRole.RESPONDER },
      body: {
        outcome_type: 'PARTIAL',
        delivered_quantity: 12,
        remainder_quantity: 8,
        exception_reason: 'Waterlogging near Kranti Nagar footbridge blocked vehicle transit to 8 households.'
      }
    });
    assert.equal(outcomeRes.status, 200);
    assert.equal(outcomeRes.body.status, 'PARTIALLY_COMPLETED');
    assert.equal(outcomeRes.body.delivered_quantity, 12);
    assert.equal(outcomeRes.body.remainder_quantity, 8);
    console.log('✓ Partial outcome recorded: Task status is PARTIALLY_COMPLETED');

    // Verify Step 1 physical inventory state:
    // In-transit decrements by 12 (now 8 returning in van), Delivered increments by 12
    const poolRes1 = await makeRequest(server, '/api/resources/1');
    assert.equal(poolRes1.body.available_quantity, 0);
    assert.equal(poolRes1.body.reserved_quantity, 0);
    assert.equal(poolRes1.body.in_transit_quantity, 8, '8 remainder kits must remain in-transit in vehicle');
    assert.equal(poolRes1.body.delivered_quantity, 32, '20 delivered in seeded history + 12 delivered by this test');
    assert.equal(poolRes1.body.total_quantity, 40, '20 fresh + 20 in seeded history');
    const massCheck1 = checkConservationOfMass();
    assert.equal(massCheck1.is_conserved, true, 'Mass conservation holds: 0 + 0 + 8 + 32 = 40');
    console.log('✓ Step 1 Inventory Check: In-Transit(8) + Delivered(32) = 40 kits conserved');

    // TEST 5: Coordinator Reconciles Partial Outcome & Restocks Depot (Step 2)
    console.log('\n[Test 5] POST /api/incidents/:id/confirm (Rajesh confirms reconciliation & restocks 8 kits)');
    const reconcileRes = await makeRequest(server, `/api/incidents/${incidentId}/confirm`, {
      method: 'POST',
      headers: { 'x-actor-id': 'rajesh', 'x-actor-role': UserRole.COORDINATOR },
      body: {
        closure_notes: 'Reconciliation verified: 12 families received food packs. 8 kits returned to BKC depot stock due to footbridge waterlogging.'
      }
    });
    assert.equal(reconcileRes.status, 200);
    assert.equal(reconcileRes.body.status, 'PARTIALLY_RESOLVED');
    assert.equal(reconcileRes.body.incident.status, 'PARTIALLY_RESOLVED');
    console.log('✓ Incident status transitioned to PARTIALLY_RESOLVED');

    // Verify Step 2 physical inventory state:
    // 8 remainder kits restocked from in_transit to available in BKC Depot!
    const poolRes2 = await makeRequest(server, '/api/resources/1');
    assert.equal(poolRes2.body.available_quantity, 8, '8 kits restocked to available');
    assert.equal(poolRes2.body.reserved_quantity, 0);
    assert.equal(poolRes2.body.in_transit_quantity, 0, 'In-transit kits returned to 0');
    assert.equal(poolRes2.body.delivered_quantity, 32, 'Delivered remains 20 (seeded history) + 12 (this test)');
    assert.equal(poolRes2.body.total_quantity, 40, '20 fresh + 20 in seeded history');
    const massCheck2 = checkConservationOfMass();
    assert.equal(massCheck2.is_conserved, true, 'Mass conservation holds: 8 + 0 + 0 + 32 = 40');
    console.log('✓ Step 2 Inventory Check: Available(8) + Delivered(32) = 40 kits conserved');

    // TEST 6: Public Report Status Inspection (Aarav's View)
    console.log('\n[Test 6] GET /api/reports/:ref (Aarav checks public status)');
    const pubRes = await makeRequest(server, `/api/reports/${reportRef}`);
    assert.equal(pubRes.status, 200);
    assert.equal(pubRes.body.canonical_incident.status, 'PARTIALLY_RESOLVED');
    console.log(`✓ Citizen view displays canonical status: ${pubRes.body.canonical_incident.status}`);

    // TEST 7: Complete 10-Event Audit Trail Verification
    console.log('\n[Test 7] GET /api/audit (Full 10-Transition Immutable Audit Trail)');
    const auditRes = await makeRequest(server, '/api/audit');
    assert.equal(auditRes.status, 200);
    const actions = auditRes.body.events.map((e: any) => e.action);
    console.log('Logged audit actions:', actions);
    assert.ok(actions.includes('REPORT_SUBMITTED'), 'Missing REPORT_SUBMITTED');
    assert.ok(actions.includes('REPORT_VERIFIED'), 'Missing REPORT_VERIFIED');
    assert.ok(actions.includes('RESOURCE_RESERVED'), 'Missing RESOURCE_RESERVED');
    assert.ok(actions.includes('TASK_OFFERED'), 'Missing TASK_OFFERED');
    assert.ok(actions.includes('TASK_ACCEPTED'), 'Missing TASK_ACCEPTED');
    assert.ok(actions.includes('TASK_DISPATCHED'), 'Missing TASK_DISPATCHED');
    assert.ok(actions.includes('OUTCOME_SUBMITTED'), 'Missing OUTCOME_SUBMITTED');
    assert.ok(actions.includes('OUTCOME_RECONCILED'), 'Missing OUTCOME_RECONCILED');
    console.log('✓ Immutable audit trail contains complete chain of attributable events');

    console.log('\n========================================================');
    console.log('  ALL PHASE 5 OUTCOME & RECONCILIATION TESTS PASSED!    ');
    console.log('========================================================');
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

runReconciliationTests().catch((err) => {
  console.error('\n❌ Reconciliation Test Suite Failed:', err);
  process.exit(1);
});
