import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ConservationCheck } from '@vrl/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, '../../data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'vrl.db');

export const db = new DatabaseSync(DB_PATH);

// Enforce strict foreign keys, WAL journal mode, and busy timeout
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA busy_timeout = 5000;');

// Transaction wrapper helper with BEGIN IMMEDIATE for ACID safety
export function runTransaction<T>(action: () => T): T {
  db.exec('BEGIN IMMEDIATE;');
  try {
    const result = action();
    db.exec('COMMIT;');
    return result;
  } catch (err) {
    try {
      db.exec('ROLLBACK;');
    } catch {
      // ignore rollback failure if transaction wasn't active
    }
    throw err;
  }
}

// Invariant calculation helper (Conservation of Mass)
export function checkConservationOfMass(poolId = 1): ConservationCheck {
  const row = db.prepare(`
    SELECT total_quantity, available_quantity, reserved_quantity, in_transit_quantity, delivered_quantity
    FROM resource_pools
    WHERE id = ?
  `).get(poolId) as {
    total_quantity: number;
    available_quantity: number;
    reserved_quantity: number;
    in_transit_quantity: number;
    delivered_quantity: number;
  } | undefined;

  if (!row) {
    return {
      total: 0,
      available: 0,
      reserved: 0,
      in_transit: 0,
      delivered: 0,
      is_conserved: false,
      delta: -1
    };
  }

  const sum = row.available_quantity + row.reserved_quantity + row.in_transit_quantity + row.delivered_quantity;
  const is_conserved = sum === row.total_quantity;

  return {
    total: row.total_quantity,
    available: row.available_quantity,
    reserved: row.reserved_quantity,
    in_transit: row.in_transit_quantity,
    delivered: row.delivered_quantity,
    is_conserved,
    delta: row.total_quantity - sum
  };
}
