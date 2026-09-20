// Authoritative SQL DDL for Verified Response Ledger (VRL)
export const SCHEMA_SQL = `
-- Table 1: users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('REPORTER', 'COORDINATOR', 'RESPONDER')),
    contact_safe TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- Table 2: source_reports
CREATE TABLE IF NOT EXISTS source_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference_code TEXT NOT NULL UNIQUE,
    reporter_id TEXT NOT NULL,
    location_name TEXT NOT NULL,
    latitude REAL NOT NULL CHECK (latitude BETWEEN -90.0 AND 90.0),
    longitude REAL NOT NULL CHECK (longitude BETWEEN -180.0 AND 180.0),
    incident_type TEXT NOT NULL CHECK (incident_type IN ('FLOOD', 'STRUCTURAL_DAMAGE', 'MEDICAL_EMERGENCY', 'ROAD_BLOCKAGE', 'SUPPLY_SHORTAGE')),
    reporter_severity TEXT NOT NULL CHECK (reporter_severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT NOT NULL CHECK (length(trim(description)) > 0 AND length(description) <= 1000),
    status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'LINKED_TO_INCIDENT', 'REJECTED')),
    rejection_reason TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (reporter_id) REFERENCES users (id) ON DELETE RESTRICT
);

-- Table 3: canonical_incidents
CREATE TABLE IF NOT EXISTS canonical_incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    primary_report_id INTEGER NOT NULL UNIQUE,
    verified_by TEXT NOT NULL,
    location_name TEXT NOT NULL,
    latitude REAL NOT NULL CHECK (latitude BETWEEN -90.0 AND 90.0),
    longitude REAL NOT NULL CHECK (longitude BETWEEN -180.0 AND 180.0),
    incident_type TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (status IN ('VERIFIED', 'RESPONSE_ACTIVE', 'PARTIALLY_RESOLVED', 'RESOLVED', 'CANCELLED')),
    verified_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    resolved_at TEXT,
    closure_notes TEXT,
    FOREIGN KEY (primary_report_id) REFERENCES source_reports (id) ON DELETE RESTRICT,
    FOREIGN KEY (verified_by) REFERENCES users (id) ON DELETE RESTRICT
);

-- Table 4: resource_pools
CREATE TABLE IF NOT EXISTS resource_pools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_name TEXT NOT NULL,
    depot_name TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'KITS',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    total_quantity INTEGER NOT NULL CHECK (total_quantity >= 0),
    available_quantity INTEGER NOT NULL CHECK (available_quantity >= 0),
    reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    in_transit_quantity INTEGER NOT NULL DEFAULT 0 CHECK (in_transit_quantity >= 0),
    delivered_quantity INTEGER NOT NULL DEFAULT 0 CHECK (delivered_quantity >= 0),
    provenance TEXT NOT NULL DEFAULT 'SYNTHETIC_FIXTURE',
    last_confirmed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    CONSTRAINT chk_pool_conservation CHECK (
        available_quantity + reserved_quantity + in_transit_quantity + delivered_quantity = total_quantity
    )
);

-- Table 5: resource_commitments
CREATE TABLE IF NOT EXISTS resource_commitments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pool_id INTEGER NOT NULL,
    incident_id INTEGER NOT NULL,
    task_id INTEGER,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status TEXT NOT NULL DEFAULT 'RESERVED' CHECK (status IN ('RESERVED', 'IN_TRANSIT', 'DELIVERED', 'EXCEPTION_RETURNED', 'RELEASED')),
    committed_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (pool_id) REFERENCES resource_pools (id) ON DELETE RESTRICT,
    FOREIGN KEY (incident_id) REFERENCES canonical_incidents (id) ON DELETE RESTRICT,
    FOREIGN KEY (committed_by) REFERENCES users (id) ON DELETE RESTRICT
);

-- Table 6: tasks
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id INTEGER NOT NULL,
    commitment_id INTEGER NOT NULL UNIQUE,
    assigned_to TEXT NOT NULL,
    assigned_by TEXT NOT NULL,
    instructions TEXT NOT NULL CHECK (length(trim(instructions)) > 0),
    assigned_quantity INTEGER NOT NULL CHECK (assigned_quantity > 0),
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
    CONSTRAINT chk_task_quantities CHECK (delivered_quantity + remainder_quantity <= assigned_quantity)
);

-- Table 7: coordination_updates
CREATE TABLE IF NOT EXISTS coordination_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER,
    incident_id INTEGER,
    task_id INTEGER,
    author_id TEXT NOT NULL,
    update_type TEXT NOT NULL CHECK (update_type IN ('CLARIFICATION', 'INSTRUCTION', 'PROGRESS', 'EXCEPTION', 'OUTCOME_NOTE')),
    message TEXT NOT NULL CHECK (length(trim(message)) > 0 AND length(message) <= 2000),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (report_id) REFERENCES source_reports (id) ON DELETE CASCADE,
    FOREIGN KEY (incident_id) REFERENCES canonical_incidents (id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE RESTRICT
);

-- Table 8: audit_events (Immutable append-only)
CREATE TABLE IF NOT EXISTS audit_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    actor_id TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    before_state TEXT,
    after_state TEXT,
    quantity_delta INTEGER DEFAULT 0,
    reason TEXT,
    FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE RESTRICT
);

-- Table 9: duplicate_links (P1 duplicate linking)
CREATE TABLE IF NOT EXISTS duplicate_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    canonical_incident_id INTEGER NOT NULL,
    duplicate_report_id INTEGER NOT NULL UNIQUE,
    linked_by TEXT NOT NULL,
    link_reason TEXT NOT NULL,
    linked_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    FOREIGN KEY (canonical_incident_id) REFERENCES canonical_incidents (id) ON DELETE CASCADE,
    FOREIGN KEY (duplicate_report_id) REFERENCES source_reports (id) ON DELETE RESTRICT,
    FOREIGN KEY (linked_by) REFERENCES users (id) ON DELETE RESTRICT
);

-- Indices for rapid query & lookup
CREATE INDEX IF NOT EXISTS idx_source_reports_status ON source_reports (status);
CREATE INDEX IF NOT EXISTS idx_canonical_incidents_status ON canonical_incidents (status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks (assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON audit_events (timestamp DESC);
`;
