import { fileURLToPath } from 'node:url';
import { db } from './connection.js';
import { SCHEMA_SQL } from './schema.js';
export function runMigrations() {
    db.exec(SCHEMA_SQL);
    console.log('[DB] Migrations executed successfully.');
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    runMigrations();
}
