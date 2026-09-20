import { db } from './connection.js';
console.log('--- TEST 1: Check constraint rejects negative available_quantity ---');
try {
    db.prepare(`
    INSERT INTO resource_pools (
      id, resource_name, depot_name, unit, latitude, longitude,
      total_quantity, available_quantity, reserved_quantity, in_transit_quantity, delivered_quantity, provenance
    ) VALUES (99, 'Bad Pool', 'Depot', 'KITS', 19.0, 72.8, 20, -5, 0, 0, 0, 'TEST')
  `).run();
    console.error('FAIL: Negative quantity was accepted!');
    process.exit(1);
}
catch (err) {
    console.log('PASS: Negative quantity rejected:', err.message);
}
console.log('--- TEST 2: Check constraint rejects broken conservation invariant (sum != total) ---');
try {
    db.prepare(`
    INSERT INTO resource_pools (
      id, resource_name, depot_name, unit, latitude, longitude,
      total_quantity, available_quantity, reserved_quantity, in_transit_quantity, delivered_quantity, provenance
    ) VALUES (99, 'Leaking Pool', 'Depot', 'KITS', 19.0, 72.8, 20, 10, 5, 0, 0, 'TEST')
  `).run();
    console.error('FAIL: Non-conserved pool was accepted!');
    process.exit(1);
}
catch (err) {
    console.log('PASS: Non-conserved pool rejected:', err.message);
}
console.log('--- TEST 3: Users table rejects invalid role ---');
try {
    db.prepare(`
    INSERT INTO users (id, display_name, role, contact_safe)
    VALUES ('hacker', 'Hacker', 'SUPERADMIN', 'fake')
  `).run();
    console.error('FAIL: Invalid role was accepted!');
    process.exit(1);
}
catch (err) {
    console.log('PASS: Invalid role rejected:', err.message);
}
console.log('ALL INTEGRITY TESTS PASSED SUCCESSFULLY.');
