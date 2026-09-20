import assert from 'node:assert/strict';
import app from '../src/server.js';
import { db } from '../src/db/connection.js';
import { resetDatabase } from '../src/db/seed.js';
import { UserRole, IncidentType, ReporterSeverity, IncidentPriority } from '@vrl/shared';

// Helper for calling Express app in-memory using fetch-like semantics or request helper
// Since Express app can be listened on an ephemeral port or tested via http:
import http from 'node:http';

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

async function runTests() {
  console.log('====================================================');
  console.log('  RUNNING PHASE 2 INTAKE & VERIFICATION TEST SUITE  ');
  console.log('====================================================');

  // Reset database to clean synthetic fixture
  resetDatabase();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));

  try {
    // TEST 1: Community Report Submission (Aarav)
    console.log('\n[Test 1] POST /api/reports (Valid Submission)');
    const reportRes = await makeRequest(server, '/api/reports', {
      method: 'POST',
      headers: {
        'x-actor-id': 'aarav',
        'x-actor-role': UserRole.REPORTER
      },
      body: {
        location_name: 'Kranti Nagar (Mithi River Basin)',
        latitude: 19.0657,
        longitude: 72.8793,
        incident_type: IncidentType.FLOOD,
        reporter_severity: ReporterSeverity.HIGH,
        description: 'Mithi River overflowing into low-lying shanties. Water level rising fast.',
        contact_safe: 'Aarav (9820011223)'
      }
    });

    assert.equal(reportRes.status, 201, 'Should return HTTP 201 Created');
    assert.ok(reportRes.body.report, 'Response should contain report');
    assert.match(reportRes.body.report.reference_code, /^REF-\d{4}-[A-Z]$/, 'Should generate reference code REF-XXXX-X');
    assert.equal(reportRes.body.report.status, 'SUBMITTED', 'Status should be SUBMITTED');
    console.log(`✓ Report created successfully with reference: ${reportRes.body.report.reference_code}`);

    const refCode = reportRes.body.report.reference_code;
    const reportId = reportRes.body.report.id;

    // TEST 2: Zod Validation Guard (Invalid coordinates)
    console.log('\n[Test 2] POST /api/reports (Invalid Coordinates Guard)');
    const invalidRes = await makeRequest(server, '/api/reports', {
      method: 'POST',
      body: {
        location_name: 'Invalid Lat',
        latitude: 195.0, // Out of bounds
        longitude: 72.8793,
        incident_type: IncidentType.FLOOD,
        reporter_severity: ReporterSeverity.HIGH,
        description: 'Testing validation error'
      }
    });
    assert.equal(invalidRes.status, 422, 'Should reject out-of-bounds coordinates with HTTP 422');
    console.log('✓ Validation error returned cleanly for out-of-bounds coordinate');

    // TEST 3: Public Status Lookup (Privacy Isolation)
    console.log('\n[Test 3] GET /api/reports/:ref (Public Status Lookup)');
    const publicRes = await makeRequest(server, `/api/reports/${refCode}`);
    assert.equal(publicRes.status, 200, 'Should return HTTP 200');
    assert.equal(publicRes.body.reference_code, refCode, 'Reference code must match');
    assert.equal(publicRes.body.status, 'SUBMITTED', 'Status should be SUBMITTED');
    assert.equal(publicRes.body.internal_stock, undefined, 'Must not leak internal stock');
    assert.equal(publicRes.body.assigned_responder, undefined, 'Must not leak internal responder');
    console.log('✓ Public status lookup succeeded without internal leaks');

    // TEST 4: Linked Clarification (Aarav updates timeline)
    console.log('\n[Test 4] POST /api/reports/:ref/clarify (Clarification Note)');
    const clarifyRes = await makeRequest(server, `/api/reports/${refCode}/clarify`, {
      method: 'POST',
      headers: {
        'x-actor-id': 'aarav',
        'x-actor-role': UserRole.REPORTER
      },
      body: {
        message: 'Water has now risen by 1.5 feet. Need emergency boats and dry ration kits.'
      }
    });
    assert.equal(clarifyRes.status, 201, 'Should return HTTP 201 Created');
    assert.ok(clarifyRes.body.update, 'Should return created update');
    console.log('✓ Clarification appended successfully to coordination updates');

    // Verify clarification is present in public view
    const updatedPublicRes = await makeRequest(server, `/api/reports/${refCode}`);
    assert.equal(updatedPublicRes.body.clarifications.length, 1, 'Public view should contain 1 clarification');
    assert.equal(updatedPublicRes.body.clarifications[0].message, clarifyRes.body.update.message);
    console.log('✓ Clarification reflected in public status view');

    // TEST 5: Role Guard on Coordinator Review Queue
    console.log('\n[Test 5] GET /api/reports (Role Guard Check)');
    const forbiddenRes = await makeRequest(server, '/api/reports', {
      headers: {
        'x-actor-id': 'aarav',
        'x-actor-role': UserRole.REPORTER
      }
    });
    assert.equal(forbiddenRes.status, 403, 'Non-coordinators must receive HTTP 403 Forbidden');
    console.log('✓ Reporter calling coordinator queue correctly blocked with 403');

    const coordinatorQueueRes = await makeRequest(server, '/api/reports', {
      headers: {
        'x-actor-id': 'rajesh',
        'x-actor-role': UserRole.COORDINATOR
      }
    });
    assert.equal(coordinatorQueueRes.status, 200, 'Coordinator must receive HTTP 200');
    assert.ok(coordinatorQueueRes.body.reports.length >= 1, 'Should list submitted report');
    console.log(`✓ Coordinator review queue listed ${coordinatorQueueRes.body.reports.length} report(s)`);

    // TEST 6: Human Verification Gateway (Rajesh verifies Aarav\'s report)
    console.log('\n[Test 6] POST /api/reports/:id/verify (Atomic Verification Gateway)');
    const verifyRes = await makeRequest(server, `/api/reports/${reportId}/verify`, {
      method: 'POST',
      headers: {
        'x-actor-id': 'rajesh',
        'x-actor-role': UserRole.COORDINATOR
      },
      body: {
        priority: IncidentPriority.HIGH,
        closure_notes: 'Verified against Mithi River water level sensor and ward field reports.'
      }
    });

    assert.equal(verifyRes.status, 200, 'Should return HTTP 200 OK');
    assert.equal(verifyRes.body.status, 'VERIFIED', 'Verification status should be VERIFIED');
    assert.ok(verifyRes.body.incident, 'Should return created canonical incident');
    assert.equal(verifyRes.body.incident.primary_report_id, reportId, 'Incident must link to primary report');
    assert.equal(verifyRes.body.report.status, 'LINKED_TO_INCIDENT', 'Report status must transition to LINKED_TO_INCIDENT');
    console.log(`✓ Report #${reportId} verified into Canonical Incident #${verifyRes.body.incident.id}`);

    // TEST 7: Tamper Guard (Cannot re-verify already verified report)
    console.log('\n[Test 7] POST /api/reports/:id/verify (Tamper Guard)');
    const doubleVerifyRes = await makeRequest(server, `/api/reports/${reportId}/verify`, {
      method: 'POST',
      headers: {
        'x-actor-id': 'rajesh',
        'x-actor-role': UserRole.COORDINATOR
      },
      body: {
        priority: IncidentPriority.URGENT
      }
    });
    assert.equal(doubleVerifyRes.status, 409, 'Double verification must return HTTP 409 Conflict');
    console.log('✓ Re-verification blocked with HTTP 409 Conflict');

    // TEST 8: Rejection Gateway Test
    console.log('\n[Test 8] POST /api/reports/:id/reject (Rejection Gateway)');
    // First create a junk report to reject
    const junkReportRes = await makeRequest(server, '/api/reports', {
      method: 'POST',
      body: {
        location_name: 'Unknown alley',
        latitude: 19.0600,
        longitude: 72.8700,
        incident_type: IncidentType.ROAD_BLOCKAGE,
        reporter_severity: ReporterSeverity.LOW,
        description: 'Someone parked a rickshaw across a walkway.'
      }
    });
    const junkId = junkReportRes.body.report.id;
    const junkRef = junkReportRes.body.report.reference_code;

    // Reject without reason should fail
    const rejectNoReason = await makeRequest(server, `/api/reports/${junkId}/reject`, {
      method: 'POST',
      headers: {
        'x-actor-id': 'rajesh',
        'x-actor-role': UserRole.COORDINATOR
      },
      body: {
        rejection_reason: '  ' // Empty string
      }
    });
    assert.equal(rejectNoReason.status, 422, 'Empty rejection reason must return HTTP 422');

    // Reject with reason
    const rejectValid = await makeRequest(server, `/api/reports/${junkId}/reject`, {
      method: 'POST',
      headers: {
        'x-actor-id': 'rajesh',
        'x-actor-role': UserRole.COORDINATOR
      },
      body: {
        rejection_reason: 'Non-emergency municipal parking obstruction. Outside disaster scope.'
      }
    });
    assert.equal(rejectValid.status, 200, 'Valid rejection must return HTTP 200 OK');
    assert.equal(rejectValid.body.report.status, 'REJECTED');

    // Check public receipt reflects rejection reason
    const junkPublic = await makeRequest(server, `/api/reports/${junkRef}`);
    assert.equal(junkPublic.body.status, 'REJECTED');
    assert.equal(junkPublic.body.rejection_reason, 'Non-emergency municipal parking obstruction. Outside disaster scope.');
    console.log('✓ Rejection gateway successfully processed with mandatory reason');

    // TEST 9: Audit Trail Integrity Check
    console.log('\n[Test 9] GET /api/audit (Audit Trail Verification)');
    const auditRes = await makeRequest(server, '/api/audit');
    assert.equal(auditRes.status, 200);
    assert.ok(auditRes.body.events.length >= 4, 'Should contain all logged audit events');
    const actions = auditRes.body.events.map((e: any) => e.action);
    assert.ok(actions.includes('REPORT_SUBMITTED'), 'Audit trail must include REPORT_SUBMITTED');
    assert.ok(actions.includes('REPORT_CLARIFIED'), 'Audit trail must include REPORT_CLARIFIED');
    assert.ok(actions.includes('REPORT_VERIFIED'), 'Audit trail must include REPORT_VERIFIED');
    assert.ok(actions.includes('REPORT_REJECTED'), 'Audit trail must include REPORT_REJECTED');
    console.log(`✓ Audit trail verified: ${auditRes.body.events.length} chronological immutable records`);

    // TEST 10: Invariant Check (Conservation of Mass)
    console.log('\n[Test 10] GET /api/health (Conservation of Mass Check)');
    const healthRes = await makeRequest(server, '/api/health');
    assert.equal(healthRes.status, 200);
    assert.equal(healthRes.body.conservation_check.is_conserved, true, 'Mass must be 100% conserved');
    assert.equal(healthRes.body.conservation_check.available, 20, 'Kits must remain 20');
    console.log('✓ Mass conservation invariant held: 20/20 kits intact');

    console.log('\n====================================================');
    console.log('  ALL PHASE 2 BACKEND ACCEPTANCE TESTS PASSED!       ');
    console.log('====================================================');
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

runTests().catch((err) => {
  console.error('\n❌ Test Suite Failed with error:', err);
  process.exit(1);
});
