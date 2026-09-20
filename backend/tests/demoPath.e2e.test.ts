import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/server.js';
import { resetDatabase } from '../src/db/seed.js';
import { checkConservationOfMass, db } from '../src/db/connection.js';
import { UserRole, IncidentType, ReporterSeverity, IncidentPriority, AuditAction } from '@vrl/shared';

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

async function runDemoPathE2ETest() {
  console.log('================================================================');
  console.log('  VERIFIED RESPONSE LEDGER (VRL) - 10-STEP E2E INTEGRATION TEST ');
  console.log('  Scenario: Kurla West Flood Inundation & Clean Kit Dispatch    ');
  console.log('================================================================\n');

  const startTime = performance.now();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));

  try {
    // -------------------------------------------------------------------------
    // STEP 1: Baseline Reset & Invariant Verification
    // -------------------------------------------------------------------------
    console.log('[Step 1] POST /api/demo/reset -> Deterministic Baseline');
    const resetRes = await makeRequest(server, '/api/demo/reset', { method: 'POST' });
    assert.equal(resetRes.status, 200);
    assert.equal(resetRes.body.status, 'RESET_SUCCESSFUL');

    const pool1 = await makeRequest(server, '/api/resources/1');
    assert.equal(pool1.status, 200);
    assert.equal(pool1.body.available_quantity, 20);
    assert.equal(pool1.body.reserved_quantity, 0);
    assert.equal(pool1.body.in_transit_quantity, 0);
    assert.equal(pool1.body.delivered_quantity, 20, '20 already delivered in seeded history');
    assert.equal(pool1.body.total_quantity, 40, '20 fresh + 20 in seeded history');

    const mass1 = checkConservationOfMass(1);
    assert.equal(mass1.is_conserved, true, 'Mass conservation failed at Step 1');
    console.log('  ✓ Baseline established: 20 available, 0 reserved, 0 in-transit, 20 delivered (seeded history). Conserved: PASS');

    // Verify initial GeoJSON features (Depot + Mithi River hazard line)
    const mapFeatures1 = await makeRequest(server, '/api/map/features');
    assert.equal(mapFeatures1.status, 200);
    assert.equal(mapFeatures1.body.type, 'FeatureCollection');
    assert.ok(mapFeatures1.body.features.length >= 2, 'Must include depot and hazard line');
    console.log(`  ✓ Tactical GeoJSON delivers ${mapFeatures1.body.features.length} features (BKC Depot + Mithi River Basin)`);

    // -------------------------------------------------------------------------
    // STEP 2: Aarav Submits Source Report
    // -------------------------------------------------------------------------
    console.log('\n[Step 2] POST /api/reports -> Aarav (Citizen) Submits Urgent Flood Report');
    const reportRes = await makeRequest(server, '/api/reports', {
      method: 'POST',
      headers: { 'x-actor-id': 'aarav', 'x-actor-role': UserRole.REPORTER },
      body: {
        location_name: 'Kranti Nagar, Kurla West',
        latitude: 19.0688,
        longitude: 72.8812,
        incident_type: IncidentType.FLOOD,
        reporter_severity: ReporterSeverity.CRITICAL,
        description: 'Mithi river overflow entering residential chawls. 15 families stranded on roofs.',
        contact_safe: '+91-98200-XXXXX'
      }
    });
    assert.equal(reportRes.status, 201);
    const report = reportRes.body.report;
    const reportRef = report.reference_code;
    const reportId = report.id;
    assert.ok(reportRef.startsWith('REF-'), 'Reference code must start with REF-');
    assert.equal(report.status, 'SUBMITTED');
    console.log(`  ✓ Report submitted successfully. Ref: ${reportRef}, ID: ${reportId}, Status: ${report.status}`);

    // -------------------------------------------------------------------------
    // STEP 3: Aarav Adds Citizen Clarification Note
    // -------------------------------------------------------------------------
    console.log('\n[Step 3] POST /api/reports/:ref/clarify -> Aarav Adds Field Clarification');
    const clarifyRes = await makeRequest(server, `/api/reports/${reportRef}/clarify`, {
      method: 'POST',
      headers: { 'x-actor-id': 'aarav', 'x-actor-role': UserRole.REPORTER },
      body: {
        message: 'Water level risen by 2.5 feet in 20 minutes. Ground floor completely inundated.'
      }
    });
    assert.equal(clarifyRes.status, 201);
    assert.equal(clarifyRes.body.update.report_id, reportId);
    assert.equal(clarifyRes.body.update.author_id, 'aarav');
    assert.equal(clarifyRes.body.update.update_type, 'CLARIFICATION');
    console.log(`  ✓ Clarification note logged by citizen: "${clarifyRes.body.update.message}"`);

    // -------------------------------------------------------------------------
    // STEP 4: Rajesh (Coordinator) Verifies Report & Promotes to Canonical Incident
    // -------------------------------------------------------------------------
    console.log('\n[Step 4] POST /api/reports/:id/verify -> Rajesh Verifies & Promotes to Incident');
    const verifyRes = await makeRequest(server, `/api/reports/${reportId}/verify`, {
      method: 'POST',
      headers: { 'x-actor-id': 'rajesh', 'x-actor-role': UserRole.COORDINATOR },
      body: { priority: IncidentPriority.URGENT }
    });
    assert.equal(verifyRes.status, 200);
    const incident = verifyRes.body.incident;
    const incidentId = incident.id;
    assert.equal(incident.priority, IncidentPriority.URGENT);
    assert.equal(incident.status, 'VERIFIED');
    console.log(`  ✓ Incident #${incidentId} promoted to Canonical Incident with Priority: ${incident.priority}`);

    // Check tactical GeoJSON now includes the verified incident point
    const mapFeatures2 = await makeRequest(server, '/api/map/features');
    const incidentFeature = mapFeatures2.body.features.find((f: any) => f.properties.category === 'INCIDENT' && f.properties.canonical_id === incidentId);
    assert.ok(incidentFeature, 'Tactical GeoJSON must include the verified canonical incident');
    assert.equal(incidentFeature.properties.priority, IncidentPriority.URGENT);
    console.log(`  ✓ Tactical GeoJSON updated: Incident marker present for Canonical #${incidentId} with Priority ${incidentFeature.properties.priority}`);

    // -------------------------------------------------------------------------
    // STEP 5: Rajesh Commits 20 Emergency Kits from BKC Depot (LOGIC-002)
    // -------------------------------------------------------------------------
    console.log('\n[Step 5] POST /api/incidents/:id/reserve -> Rajesh Reserves 20 Relief Kits');
    const reserveRes = await makeRequest(server, `/api/incidents/${incidentId}/reserve`, {
      method: 'POST',
      headers: { 'x-actor-id': 'rajesh', 'x-actor-role': UserRole.COORDINATOR },
      body: { quantity: 20, pool_id: 1 }
    });
    assert.equal(reserveRes.status, 200);
    const commitmentId = reserveRes.body.commitment.id;

    // Verify inventory transition: Available 20 -> 0, Reserved 0 -> 20
    const pool2 = await makeRequest(server, '/api/resources/1');
    assert.equal(pool2.body.available_quantity, 0);
    assert.equal(pool2.body.reserved_quantity, 20);
    assert.equal(pool2.body.in_transit_quantity, 0);
    assert.equal(pool2.body.delivered_quantity, 20, '20 already delivered in seeded history');
    assert.equal(pool2.body.total_quantity, 40, '20 fresh + 20 in seeded history');
    const mass2 = checkConservationOfMass(1);
    assert.equal(mass2.is_conserved, true, 'Mass conservation failed at Step 5');
    console.log('  ✓ Ledger updated: Available(0) + Reserved(20) + InTransit(0) + Delivered(20) = 40. Conserved: PASS');

    // -------------------------------------------------------------------------
    // STEP 6: Rajesh Assigns Mission Task to Responder Chetan (Phase 4)
    // -------------------------------------------------------------------------
    console.log('\n[Step 6] POST /api/tasks -> Rajesh Offers Mission to Chetan');
    const taskRes = await makeRequest(server, '/api/tasks', {
      method: 'POST',
      headers: { 'x-actor-id': 'rajesh', 'x-actor-role': UserRole.COORDINATOR },
      body: {
        incident_id: incidentId,
        commitment_id: commitmentId,
        assigned_to: 'chetan',
        instructions: 'Deliver 20 emergency relief kits to Kranti Nagar relief outpost.',
        assigned_quantity: 20
      }
    });
    assert.equal(taskRes.status, 201);
    const taskId = taskRes.body.id;
    assert.equal(taskRes.body.status, 'OFFERED');
    console.log(`  ✓ Mission Task #${taskId} offered to Chetan (Quantity: 20, Status: OFFERED)`);

    // -------------------------------------------------------------------------
    // STEP 7: Chetan Formally Accepts Mission
    // -------------------------------------------------------------------------
    console.log('\n[Step 7] POST /api/tasks/:id/acknowledge -> Chetan Accepts Mission');
    const ackRes = await makeRequest(server, `/api/tasks/${taskId}/acknowledge`, {
      method: 'POST',
      headers: { 'x-actor-id': 'chetan', 'x-actor-role': UserRole.RESPONDER },
      body: { action: 'ACCEPT' }
    });
    assert.equal(ackRes.status, 200);
    assert.equal(ackRes.body.status, 'ACCEPTED');
    console.log(`  ✓ Task #${taskId} accepted by responder Chetan`);

    // -------------------------------------------------------------------------
    // STEP 8: Chetan Dispatches Vehicle with 20 Kits (LOGIC-003)
    // -------------------------------------------------------------------------
    console.log('\n[Step 8] POST /api/tasks/:id/dispatch -> Chetan Dispatches Loaded Vehicle');
    const dispatchRes = await makeRequest(server, `/api/tasks/${taskId}/dispatch`, {
      method: 'POST',
      headers: { 'x-actor-id': 'chetan', 'x-actor-role': UserRole.RESPONDER },
      body: { notes: 'QRT Van 1 loaded with 20 kits departed BKC Depot.' }
    });
    assert.equal(dispatchRes.status, 200);
    assert.equal(dispatchRes.body.status, 'IN_PROGRESS');

    // Verify inventory transition: Reserved 20 -> 0, In-Transit 0 -> 20
    const pool3 = await makeRequest(server, '/api/resources/1');
    assert.equal(pool3.body.available_quantity, 0);
    assert.equal(pool3.body.reserved_quantity, 0);
    assert.equal(pool3.body.in_transit_quantity, 20);
    assert.equal(pool3.body.delivered_quantity, 20, '20 already delivered in seeded history');
    assert.equal(pool3.body.total_quantity, 40, '20 fresh + 20 in seeded history');
    const mass3 = checkConservationOfMass(1);
    assert.equal(mass3.is_conserved, true, 'Mass conservation failed at Step 8');
    console.log('  ✓ Ledger updated: Available(0) + Reserved(0) + InTransit(20) + Delivered(20) = 40. Conserved: PASS');

    // -------------------------------------------------------------------------
    // STEP 9: Chetan Submits Partial Delivery Outcome (LOGIC-004)
    // -------------------------------------------------------------------------
    console.log('\n[Step 9] POST /api/tasks/:id/outcome -> Chetan Submits Partial Delivery Outcome');
    const outcomeRes = await makeRequest(server, `/api/tasks/${taskId}/outcome`, {
      method: 'POST',
      headers: { 'x-actor-id': 'chetan', 'x-actor-role': UserRole.RESPONDER },
      body: {
        outcome_type: 'PARTIAL',
        delivered_quantity: 12,
        remainder_quantity: 8,
        exception_reason: 'Waterlogged footbridge blocked van access to remaining 8 tenements.'
      }
    });
    assert.equal(outcomeRes.status, 200);
    assert.equal(outcomeRes.body.status, 'PARTIALLY_COMPLETED');
    assert.equal(outcomeRes.body.delivered_quantity, 12);
    assert.equal(outcomeRes.body.remainder_quantity, 8);

    // Verify inventory transition: In-Transit 20 -> 8, Delivered 0 -> 12
    const pool4 = await makeRequest(server, '/api/resources/1');
    assert.equal(pool4.body.available_quantity, 0);
    assert.equal(pool4.body.reserved_quantity, 0);
    assert.equal(pool4.body.in_transit_quantity, 8);
    assert.equal(pool4.body.delivered_quantity, 32, '20 in seeded history + 12 delivered by this run');
    assert.equal(pool4.body.total_quantity, 40, '20 fresh + 20 in seeded history');
    const mass4 = checkConservationOfMass(1);
    assert.equal(mass4.is_conserved, true, 'Mass conservation failed at Step 9');
    console.log('  ✓ Outcome recorded: Delivered(32), Remainder in van(8). Conserved: PASS');

    // -------------------------------------------------------------------------
    // STEP 10: Rajesh Confirms Reconciliation & Restocks Remainder to Depot (LOGIC-005)
    // -------------------------------------------------------------------------
    console.log('\n[Step 10] POST /api/incidents/:id/confirm -> Rajesh Reconciles & Restocks');
    const reconcileRes = await makeRequest(server, `/api/incidents/${incidentId}/confirm`, {
      method: 'POST',
      headers: { 'x-actor-id': 'rajesh', 'x-actor-role': UserRole.COORDINATOR },
      body: {
        closure_notes: '12 kits confirmed delivered at Kranti Nagar shelter; 8 remainder kits safely returned to BKC stock.'
      }
    });
    assert.equal(reconcileRes.status, 200);
    assert.equal(reconcileRes.body.status, 'PARTIALLY_RESOLVED');
    assert.equal(reconcileRes.body.incident.status, 'PARTIALLY_RESOLVED');

    // Verify final physical inventory state:
    // In-Transit 8 -> 0, Available 0 -> 8 (Restocked!), Delivered remains 12
    const pool5 = await makeRequest(server, '/api/resources/1');
    assert.equal(pool5.body.available_quantity, 8, '8 remainder kits must be restocked to available');
    assert.equal(pool5.body.reserved_quantity, 0);
    assert.equal(pool5.body.in_transit_quantity, 0);
    assert.equal(pool5.body.delivered_quantity, 32, '20 in seeded history + 12 delivered by this run');
    assert.equal(pool5.body.total_quantity, 40, '20 fresh + 20 in seeded history');
    const mass5 = checkConservationOfMass(1);
    assert.equal(mass5.is_conserved, true, 'Mass conservation failed at Step 10');
    console.log('  ✓ Final Ledger State: Available(8) + Delivered(32) = 40 Total Kits. Conserved: PASS');

    // Citizen Public View verification
    const pubRes = await makeRequest(server, `/api/reports/${reportRef}`);
    assert.equal(pubRes.status, 200);
    assert.equal(pubRes.body.canonical_incident.status, 'PARTIALLY_RESOLVED');
    console.log(`  ✓ Public citizen tracking view accurately displays canonical status: ${pubRes.body.canonical_incident.status}`);

    // Audit Trail Complete Verification
    console.log('\n[Audit Verification] GET /api/audit -> Comprehensive Trail Inspection');
    const auditRes = await makeRequest(server, '/api/audit');
    assert.equal(auditRes.status, 200);
    const actions = auditRes.body.events.map((e: any) => e.action);
    console.log('  Audit events in ledger:', actions);

    const requiredActions = [
      AuditAction.DEMO_RESET,
      AuditAction.REPORT_SUBMITTED,
      AuditAction.REPORT_CLARIFIED,
      AuditAction.REPORT_VERIFIED,
      AuditAction.RESOURCE_RESERVED,
      AuditAction.TASK_OFFERED,
      AuditAction.TASK_ACCEPTED,
      AuditAction.TASK_DISPATCHED,
      AuditAction.OUTCOME_SUBMITTED,
      AuditAction.OUTCOME_RECONCILED
    ];

    for (const requiredAction of requiredActions) {
      assert.ok(actions.includes(requiredAction), `Missing mandatory audit event: ${requiredAction}`);
    }
    console.log('  ✓ All 10 deterministic lifecycle events recorded in immutable audit log');

    const duration = performance.now() - startTime;
    console.log(`\n================================================================`);
    console.log(`  10-STEP E2E TEST PASSED IN ${duration.toFixed(2)}ms (< 500ms TARGET) `);
    console.log(`================================================================`);
    assert.ok(duration < 500, `Execution time ${duration.toFixed(2)}ms exceeded 500ms target!`);

  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

runDemoPathE2ETest().catch((err) => {
  console.error('\n❌ 10-Step E2E Test Suite Failed:', err);
  process.exit(1);
});
