import { fileURLToPath } from 'node:url';
import { db } from './connection.js';
import { SCHEMA_SQL } from './schema.js';

export function runMigrations() {
  db.exec(SCHEMA_SQL);

  // Backfill for databases created before these columns existed on users
  // (CREATE TABLE IF NOT EXISTS above is a no-op on an already-existing table).
  const columns = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  if (!columns.some((col) => col.name === 'password_hash')) {
    db.exec('ALTER TABLE users ADD COLUMN password_hash TEXT');
  }
  if (!columns.some((col) => col.name === 'phone')) {
    db.exec('ALTER TABLE users ADD COLUMN phone TEXT');
  }

  // Backfill for databases created before dispatched_quantity existed on tasks. SQLite
  // can't ALTER a CHECK constraint in place (chk_task_quantities now references
  // dispatched_quantity instead of assigned_quantity), so rebuild the table following
  // SQLite's documented 12-step recipe (https://www.sqlite.org/lang_altertable.html #7):
  // disable FK enforcement, swap the table inside a transaction, verify referential
  // integrity, then re-enable FK enforcement — otherwise coordination_updates' foreign
  // key to tasks(id) can be left pointing at nothing.
  // Every task dispatched under the old code always moved its full assigned_quantity, so
  // that's the correct backfill value for any task that reached IN_PROGRESS or beyond.
  const taskColumns = db.prepare("PRAGMA table_info(tasks)").all() as { name: string }[];
  if (!taskColumns.some((col) => col.name === 'dispatched_quantity')) {
    db.exec('PRAGMA foreign_keys = OFF');
    db.exec('BEGIN TRANSACTION');
    try {
      db.exec(`
        CREATE TABLE tasks_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            incident_id INTEGER NOT NULL,
            commitment_id INTEGER NOT NULL UNIQUE,
            assigned_to TEXT NOT NULL,
            assigned_by TEXT NOT NULL,
            instructions TEXT NOT NULL CHECK (length(trim(instructions)) > 0),
            assigned_quantity INTEGER NOT NULL CHECK (assigned_quantity > 0),
            dispatched_quantity INTEGER NOT NULL DEFAULT 0 CHECK (dispatched_quantity >= 0 AND dispatched_quantity <= assigned_quantity),
            delivered_quantity INTEGER NOT NULL DEFAULT 0 CHECK (delivered_quantity >= 0),
            remainder_quantity INTEGER NOT NULL DEFAULT 0 CHECK (remainder_quantity >= 0),
            status TEXT NOT NULL DEFAULT 'OFFERED' CHECK (status IN ('OFFERED', 'ACCEPTED', 'DECLINED', 'IN_PROGRESS', 'PARTIALLY_COMPLETED', 'COMPLETED', 'FAILED', 'CANCELLED')),
            exception_reason TEXT,
            offered_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
            accepted_at TEXT,
            dispatched_at TEXT,
            completed_at TEXT,
            FOREIGN KEY (incident_id) REFERENCES canonical_incidents (id) ON DELETE RESTRICT,
            FOREIGN KEY (commitment_id) REFERENCES resource_commitments (id) ON DELETE RESTRICT,
            FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE RESTRICT,
            FOREIGN KEY (assigned_by) REFERENCES users (id) ON DELETE RESTRICT,
            CONSTRAINT chk_task_quantities CHECK (delivered_quantity + remainder_quantity <= dispatched_quantity)
        )
      `);

      db.exec(`
        INSERT INTO tasks_new (
          id, incident_id, commitment_id, assigned_to, assigned_by, instructions,
          assigned_quantity, dispatched_quantity, delivered_quantity, remainder_quantity,
          status, exception_reason, offered_at, accepted_at, dispatched_at, completed_at
        )
        SELECT
          id, incident_id, commitment_id, assigned_to, assigned_by, instructions,
          assigned_quantity,
          CASE WHEN status IN ('IN_PROGRESS', 'PARTIALLY_COMPLETED', 'COMPLETED', 'FAILED')
               THEN assigned_quantity ELSE 0 END,
          delivered_quantity, remainder_quantity,
          status, exception_reason, offered_at, accepted_at, dispatched_at, completed_at
        FROM tasks
      `);

      db.exec('DROP TABLE tasks');
      db.exec('ALTER TABLE tasks_new RENAME TO tasks');
      db.exec('CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks (assigned_to, status)');

      const fkIssues = db.prepare('PRAGMA foreign_key_check').all();
      if (fkIssues.length > 0) {
        throw new Error(`Task table rebuild left dangling foreign keys: ${JSON.stringify(fkIssues)}`);
      }

      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    } finally {
      db.exec('PRAGMA foreign_keys = ON');
    }
  }

  console.log('[DB] Migrations executed successfully.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runMigrations();
}
