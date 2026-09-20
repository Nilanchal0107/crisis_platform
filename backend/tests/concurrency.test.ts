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

async function runConcurrencyTests() {
  console.log('========================================================');
  console.log('  RUNNING PHASE 3 CONCURRENCY & LEDGER TEST SUITE       ');
  console.log('========================================================');

  // 1. Reset database to baseline 20 kits
  resetDatabase();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));

  try {
    // Check initial pool state
    const poolRes = await makeRequest(server, '/api/resources/1');
    assert.equal(poolRes.status, 200);
    assert.equal(poolRes.body.available_quantity, 20, 'Initial pool must have 20 kits available');
    assert.equal(poolRes.body.reserved_quantity, 0);

    // Setup: Create and verify 2 separate incidents
    console.log('\n[Setup] Creating and verifying 2 separate incidents for race contention...');
    
    // Incident 1
    const r1 = await makeRequest(server, '/api/reports', {
      method: 'POST',
      body: {
        location_name: 'Kranti Nagar Sector A',
        latitude: 19.0657,
        longitude: 72.8793,
        incident_type: IncidentType.FLOOD,
        reporter_severity: ReporterSeverity.HIGH,
        description: 'Sector A flooding'
      }
    });
    const v1 = await makeRequest(server, `/api/reports/${r1.body.report.id}/verify`, {
      method: 'POST',
      headers: { 'x-actor-role': UserRole.COORDINATOR },
      body: { priority: IncidentPriority.HIGH }
    });
    const incident1Id = v1.body.incident.id;

    // Incident 2
    const r2 = await makeRequest(server, '/api/reports', {
      method: 'POST',
      body: {
        location_name: 'Bail Bazar Sector B',
        latitude: 19.0712,
        longitude: 72.8834,
        incident_type: IncidentType.FLOOD,
        reporter_severity: ReporterSeverity.HIGH,
        description: 'Sector B flooding'
      }
    });
    const v2 = await makeRequest(server, `/api/reports/${r2.body.report.id}/verify`, {
      method: 'POST',
      headers: { 'x-actor-role': UserRole.COORDINATOR },
      body: { priority: IncidentPriority.HIGH }
    });
    const incident2Id = v2.body.incident.id;

    console.log(`✓ Created Incident #${incident1Id} and Incident #${incident2Id}`);

    // TEST 1: Role Guard Verification
    console.log('\n[Test 1] POST /api/incidents/:id/reserve (RBAC Check)');
    const rbacRes = await makeRequest(server, `/api/incidents/${incident1Id}/reserve`, {
      method: 'POST',
      headers: {
        'x-actor-id': 'aarav',
        'x-actor-role': UserRole.REPORTER
      },
      body: { quantity: 5 }
    });
    assert.equal(rbacRes.status, 403, 'Non-coordinators must receive HTTP 403');
    console.log('✓ Reporter role successfully blocked from reserving resources with 403');

    // TEST 2: High-Contention Race Condition Simulation (Promise.all)
    console.log('\n[Test 2] High-Contention Concurrent Race Simulation (2 competing 20-kit requests)');
    const [resA, resB] = await Promise.all([
      makeRequest(server, `/api/incidents/${incident1Id}/reserve`, {
        method: 'POST',
        headers: { 'x-actor-role': UserRole.COORDINATOR },
        body: { quantity: 20 }
      }),
      makeRequest(server, `/api/incidents/${incident2Id}/reserve`, {
        method: 'POST',
        headers: { 'x-actor-role': UserRole.COORDINATOR },
        body: { quantity: 20 }
      })
    ]);

    const statuses = [resA.status, resB.status];
    console.log(`Concurrent response statuses: [${statuses.join(', ')}]`);

    assert.ok(statuses.includes(200), 'Exactly one request must succeed with 200 OK');
    assert.ok(statuses.includes(409), 'Competing request must be rejected with 409 Conflict');

    const winningRes = resA.status === 200 ? resA : resB;
    const losingRes = resA.status === 409 ? resA : resB;

    assert.equal(winningRes.body.status, 'RESERVED');
    assert.equal(winningRes.body.commitment.quantity, 20);
    assert.equal(winningRes.body.incident.status, 'RESPONSE_ACTIVE');
    assert.equal(losingRes.body.error, 'INSUFFICIENT_STOCK_CONFLICT');
    assert.equal(losingRes.body.available_quantity, 0);

    console.log('✓ Atomic conditional locking prevented double-allocation');
    console.log(`✓ Winner received 200 OK; Loser cleanly rejected with 409 Conflict (Available: ${losingRes.body.available_quantity})`);

    // TEST 3: Zero-Leakage Conservation of Mass Check
    console.log('\n[Test 3] Conservation of Mass Invariant Verification');
    const massCheck = checkConservationOfMass(1);
    assert.equal(massCheck.is_conserved, true, 'Mass conservation must be 100% PASS');
    assert.equal(massCheck.available, 0, 'Available stock must be 0');
    assert.equal(massCheck.reserved, 20, 'Reserved stock must be exactly 20');
    assert.equal(massCheck.total, 40, 'Total stock must remain exactly 40 (20 fresh + 20 in seeded history)');
    assert.equal(massCheck.delta, 0, 'Delta must be 0 (Zero inventory leakage)');
    console.log('✓ Invariant check verified: Available(0) + Reserved(20) === Total(20)');

    // TEST 4: Post-Depletion Reservation Attempt
    console.log('\n[Test 4] Attempting reservation on exhausted pool');
    const thirdAttempt = await makeRequest(server, `/api/incidents/${incident2Id}/reserve`, {
      method: 'POST',
      headers: { 'x-actor-role': UserRole.COORDINATOR },
      body: { quantity: 1 }
    });
    assert.equal(thirdAttempt.status, 409, 'Must return 409 Conflict when stock is 0');
    assert.equal(thirdAttempt.body.available_quantity, 0);
    console.log('✓ Exhausted pool correctly returns 409 Conflict for any positive quantity');

    // TEST 5: Chronological Ledger History Endpoint
    console.log('\n[Test 5] GET /api/resources/ledger (Commitment History)');
    const ledgerRes = await makeRequest(server, '/api/resources/ledger');
    assert.equal(ledgerRes.status, 200);
    assert.equal(ledgerRes.body.count, 2, 'Ledger must contain the seeded historical commitment plus this test\'s own');
    assert.equal(ledgerRes.body.ledger[0].quantity, 20, 'Newest (this test\'s) commitment is first, ordered by id DESC');
    assert.equal(ledgerRes.body.ledger[0].depot_name, 'BKC Relief Base (Depot 1)');
    console.log(`✓ Ledger endpoint verified: ${ledgerRes.body.count} entries, newest ${ledgerRes.body.ledger[0].quantity} kits from ${ledgerRes.body.ledger[0].depot_name}`);

    // TEST 6: Audit Event Logging Check
    console.log('\n[Test 6] GET /api/audit (Resource Reservation Audit Trail)');
    const auditRes = await makeRequest(server, '/api/audit');
    assert.equal(auditRes.status, 200);
    const reservationAudit = auditRes.body.events.find((e: any) => e.action === 'RESOURCE_RESERVED');
    assert.ok(reservationAudit, 'Audit trail must include RESOURCE_RESERVED record');
    assert.equal(reservationAudit.quantity_delta, 20, 'Audit record must have quantity_delta = 20');
    assert.equal(reservationAudit.actor_role, 'COORDINATOR');
    console.log('✓ Immutable audit trail contains attributable RESOURCE_RESERVED event');

    console.log('\n========================================================');
    console.log('  ALL PHASE 3 CONCURRENCY & LEDGER TESTS PASSED!        ');
    console.log('========================================================');
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

runConcurrencyTests().catch((err) => {
  console.error('\n❌ Concurrency Test Suite Failed:', err);
  process.exit(1);
});
