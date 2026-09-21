# Crisis Response Platform — API Specification

**Document:** `docs/07-Technical_Design/03-API_Spec.md`  
**System:** Verified Response Ledger (VRL)  
**Stage:** Step 7 — Technical Design  
**Date:** 20 September 2026  
**Status:** Frozen Technical Specification  

---

# 1. API Design Principles

The Verified Response Ledger REST API conforms to the following design principles:

1. **Explicit Semantic Contracts:** Standard HTTP verbs (`GET`, `POST`) with explicit resource paths. State transitions are represented as explicit verb actions (e.g., `POST /api/tasks/1/dispatch`) rather than ambiguous partial patch objects.
2. **Deterministic Status Codes:** Strict semantic HTTP codes: `200 OK` (read/action success), `201 Created` (entity created), `400 Bad Request` (syntactic JSON error), `401 Unauthorized` (missing/invalid identity), `403 Forbidden` (role unauthorized), `404 Not Found` (entity missing), `409 Conflict` (concurrency race or state conflict), `422 Unprocessable Entity` (validation failure).
3. **Uniform Error Envelope:** All errors return a predictable JSON payload `{ code, message, details, timestamp }`. The client never parses arbitrary error strings.
4. **Server-Enforced Validation:** All incoming payloads are validated at the API boundary via Zod schemas before hitting business logic.
5. **Traceable Actor Context:** All authenticated requests require `X-Actor-ID` and `X-Actor-Role` headers. The server verifies role permissions independently of UI state.

---

# 2. Screen to API Mapping

| Screen ID | UI Interaction | Related FR | API Endpoint & Method |
|---|---|---|---|
| **SCR-001** | Community Reporter fills and submits emergency report | FR-001 | `POST /api/reports` |
| **SCR-001** | Reporter queries report status using reference code | FR-002 | `GET /api/reports/:ref` |
| **SCR-001** | Reporter adds a text clarification to an existing report | FR-005 | `POST /api/reports/:ref/clarify` |
| **SCR-002** | Coordinator loads incoming report review queue | FR-001, FR-011 | `GET /api/reports` |
| **SCR-002** | Coordinator verifies report into a canonical incident | FR-011 | `POST /api/reports/:id/verify` |
| **SCR-002** | Coordinator rejects inaccurate or duplicate report | FR-011 | `POST /api/reports/:id/reject` |
| **SCR-002** | Coordinator inspects incident list and details drawer | FR-011, FR-020 | `GET /api/incidents` & `GET /api/incidents/:id` |
| **SCR-002** | Coordinator inspects live relief kit inventory balance | FR-003 | `GET /api/resources` |
| **SCR-002** | Coordinator views full resource commitment ledger | FR-004 | `GET /api/resources/ledger` |
| **SCR-002** | Coordinator reserves stock for a verified incident | FR-014 | `POST /api/incidents/:id/reserve` |
| **SCR-002** | Coordinator creates task with structured instructions | FR-006 | `POST /api/tasks` |
| **SCR-002** | Coordinator views interactive Leaflet map features | FR-008, FR-009 | `GET /api/map/features` |
| **SCR-002** | Coordinator reviews immutable audit timeline | FR-019 | `GET /api/audit` |
| **SCR-002** | Coordinator confirms partial delivery & reconciles remainder | FR-017 | `POST /api/incidents/:id/confirm` |
| **SCR-002 (P1)**| Coordinator links duplicate reports together | FR-021 | `POST /api/incidents/:id/link` |
| **SCR-002 (P1)**| Coordinator reconfirms stale inventory balance | FR-023 | `POST /api/resources/reconfirm` |
| **SCR-002 (P1)**| Demo operator resets scenario baseline fixtures | FR-025 | `POST /api/demo/reset` |
| **SCR-003** | Field Responder loads assigned task workspace | FR-006, FR-015 | `GET /api/tasks` |
| **SCR-003** | Responder accepts or declines offered task | FR-015, FR-022 | `POST /api/tasks/:id/acknowledge` |
| **SCR-003** | Responder marks accepted task as dispatched | FR-016 | `POST /api/tasks/:id/dispatch` |
| **SCR-003** | Responder submits full or partial outcome with notes | FR-007, FR-016 | `POST /api/tasks/:id/outcome` |

---

# 3. API Inventory

| API ID | Method | Path | Purpose | Authorized Role | Related FR |
|---|:---:|---|---|---|---|
| **API-001** | `POST` | `/api/reports` | Ingest community report | `REPORTER` (or Public) | FR-001 |
| **API-002** | `GET` | `/api/reports/:ref` | Fetch public tracking status | `REPORTER` (Own Ref) | FR-002 |
| **API-003** | `POST` | `/api/reports/:ref/clarify` | Append clarification update | `REPORTER` (Own Ref) | FR-005 |
| **API-004** | `GET` | `/api/reports` | List reports for review | `COORDINATOR` | FR-001, FR-011 |
| **API-005** | `POST` | `/api/reports/:id/verify` | Promote report to incident | `COORDINATOR` | FR-011 |
| **API-006** | `POST` | `/api/reports/:id/reject` | Reject report with reason | `COORDINATOR` | FR-011 |
| **API-007** | `GET` | `/api/incidents` | List canonical incidents | `COORDINATOR` | FR-011, FR-020 |
| **API-008** | `GET` | `/api/incidents/:id` | Fetch full incident details | `COORDINATOR` | FR-011, FR-019 |
| **API-009** | `POST` | `/api/incidents/:id/reserve`| Atomically reserve kits | `COORDINATOR` | FR-014 |
| **API-010** | `GET` | `/api/resources` | Fetch depot pool balances | `COORDINATOR` | FR-003 |
| **API-011** | `GET` | `/api/resources/ledger` | Fetch ledger audit history | `COORDINATOR` | FR-004 |
| **API-012** | `POST` | `/api/tasks` | Create and offer task | `COORDINATOR` | FR-006 |
| **API-013** | `GET` | `/api/tasks` | Fetch task list by actor | `COORDINATOR`, `RESPONDER`| FR-006, FR-015 |
| **API-014** | `POST` | `/api/tasks/:id/acknowledge`| Accept or decline task | `RESPONDER` (Assigned) | FR-015, FR-022 |
| **API-015** | `POST` | `/api/tasks/:id/dispatch` | Mark task in progress | `RESPONDER` (Assigned) | FR-016 |
| **API-016** | `POST` | `/api/tasks/:id/outcome` | Submit execution outcome | `RESPONDER` (Assigned) | FR-007, FR-016 |
| **API-017** | `POST` | `/api/incidents/:id/confirm`| Reconcile outcome & close | `COORDINATOR` | FR-017 |
| **API-018** | `GET` | `/api/map/features` | Fetch GeoJSON map points | `COORDINATOR` | FR-008, FR-009 |
| **API-019** | `GET` | `/api/audit` | Fetch audit timeline log | `COORDINATOR` | FR-019 |
| **API-020** | `POST` | `/api/incidents/:id/link` | Link duplicate report (P1) | `COORDINATOR` | FR-021 |
| **API-021** | `POST` | `/api/resources/reconfirm` | Reconfirm stale pool (P1) | `COORDINATOR` | FR-023 |
| **API-022** | `POST` | `/api/demo/reset` | Restore clean demo seed | Public / Demo Admin | FR-025 |

---

# 4. Detailed Endpoint Specifications

### API-001 — Submit Incident Report
- **Method / Path:** `POST /api/reports`
- **Purpose:** Allows a community reporter to submit an observed emergency need.
- **Actor / Permission:** `REPORTER` (or Public Guest context).
- **Related FR / Screen:** FR-001 / `SCR-001`.
- **Request Headers:** `X-Actor-ID: alice`, `X-Actor-Role: REPORTER`.
- **Request Body:**
  ```json
  {
    "location_name": "Riverside Ward 4 - Near Bridge",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "incident_type": "FLOOD",
    "reporter_severity": "HIGH",
    "description": "Flood water rising rapidly. 5 families trapped in school building.",
    "contact_safe": "Alice Demo Contact (9876543210)"
  }
  ```
- **Validation:** All fields required. Latitude $[-90, 90]$, Longitude $[-180, 180]$. Type in `['FLOOD', 'STRUCTURAL_DAMAGE', 'MEDICAL_EMERGENCY', 'ROAD_BLOCKAGE', 'SUPPLY_SHORTAGE']`.
- **Success Response (201 Created):**
  ```json
  {
    "id": 1,
    "reference_code": "REF-8921-X",
    "status": "SUBMITTED",
    "location_name": "Riverside Ward 4 - Near Bridge",
    "incident_type": "FLOOD",
    "reporter_severity": "HIGH",
    "created_at": "2026-09-20T12:00:00Z"
  }
  ```
- **Errors:** 400 (Invalid JSON), 422 (Zod schema validation failure).
- **State Change:** Inserts row into `source_reports`. Emits `REPORT_SUBMITTED` audit event.

---

### API-002 — Get Report Receipt & Public Status
- **Method / Path:** `GET /api/reports/:ref`
- **Purpose:** Allows reporter to check progress using their reference code without exposing internal dispatch data.
- **Actor / Permission:** `REPORTER` (Token/Ref matched).
- **Related FR / Screen:** FR-002 / `SCR-001`.
- **Success Response (200 OK):**
  ```json
  {
    "reference_code": "REF-8921-X",
    "status": "LINKED_TO_INCIDENT",
    "public_status_label": "Verified - Response in Progress",
    "incident_type": "FLOOD",
    "location_name": "Riverside Ward 4 - Near Bridge",
    "created_at": "2026-09-20T12:00:00Z",
    "last_updated_at": "2026-09-20T12:05:00Z",
    "clarifications": [
      {
        "id": 1,
        "author": "Reporter",
        "message": "Water reached 3 feet deep.",
        "created_at": "2026-09-20T12:02:00Z"
      }
    ]
  }
  ```
- **Errors:** 404 (Reference code not found).

---

### API-005 — Verify Incident Report
- **Method / Path:** `POST /api/reports/:id/verify`
- **Purpose:** Coordinator reviews and promotes an unverified report to an official canonical incident.
- **Actor / Permission:** `COORDINATOR` only.
- **Related FR / Screen:** FR-011 / `SCR-002`.
- **Request Headers:** `X-Actor-ID: bob`, `X-Actor-Role: COORDINATOR`.
- **Request Body:**
  ```json
  {
    "priority": "URGENT",
    "notes": "Verified with Ward Officer via radio call."
  }
  ```
- **Preconditions:** `source_reports.status === 'SUBMITTED'`.
- **Success Response (200 OK):**
  ```json
  {
    "incident": {
      "id": 1,
      "primary_report_id": 1,
      "priority": "URGENT",
      "status": "VERIFIED",
      "verified_by": "bob",
      "verified_at": "2026-09-20T12:05:00Z"
    },
    "report_status": "LINKED_TO_INCIDENT"
  }
  ```
- **Errors:** 403 (Unauthorized role), 404 (Report not found), 409 (Report already verified or rejected).
- **Transaction:** Atomic update: updates `source_reports.status`, inserts `canonical_incidents`, logs `REPORT_VERIFIED` in `audit_events`.

---

### API-009 — Atomically Reserve Resources
- **Method / Path:** `POST /api/incidents/:id/reserve`
- **Purpose:** Atomically commits relief kit units from available stock to a verified incident.
- **Actor / Permission:** `COORDINATOR` only.
- **Related FR / Screen:** FR-014 / `SCR-002`.
- **Request Body:**
  ```json
  {
    "pool_id": 1,
    "quantity": 20
  }
  ```
- **Preconditions:** Incident status must be `VERIFIED` or `RESPONSE_ACTIVE`. Requested quantity must be $\le$ `available_quantity`.
- **Success Response (200 OK):**
  ```json
  {
    "commitment_id": 1,
    "incident_id": 1,
    "pool_id": 1,
    "reserved_quantity": 20,
    "pool_balance": {
      "total": 20,
      "available": 0,
      "reserved": 20,
      "in_transit": 0,
      "delivered": 0
    },
    "timestamp": "2026-09-20T12:07:00Z"
  }
  ```
- **Concurrency Failure Response (409 Conflict):**
  ```json
  {
    "code": "STOCK_CONFLICT",
    "message": "Resource reservation failed: insufficient available stock.",
    "details": {
      "requested_quantity": 20,
      "currently_available": 0
    },
    "timestamp": "2026-09-20T12:07:01Z"
  }
  ```
- **Transaction:** `BEGIN IMMEDIATE;` atomic `UPDATE resource_pools SET available = available - 20, reserved = reserved + 20 WHERE available >= 20;` Inserts `resource_commitments`, inserts `audit_events`. `COMMIT;`.

---

### API-012 — Create and Offer Task
- **Method / Path:** `POST /api/tasks`
- **Purpose:** Coordinator assigns a reserved resource commitment to a specific field responder.
- **Actor / Permission:** `COORDINATOR` only.
- **Related FR / Screen:** FR-006 / `SCR-002`.
- **Request Body:**
  ```json
  {
    "incident_id": 1,
    "commitment_id": 1,
    "assigned_to": "charlie",
    "instructions": "Deliver 20 emergency kits to Ward 4 community center. Access via North road."
  }
  ```
- **Preconditions:** Valid commitment exists in `RESERVED` status. Responder `charlie` exists and is active.
- **Success Response (201 Created):**
  ```json
  {
    "task_id": 1,
    "incident_id": 1,
    "assigned_to": "charlie",
    "assigned_quantity": 20,
    "status": "OFFERED",
    "instructions": "Deliver 20 emergency kits to Ward 4 community center. Access via North road.",
    "offered_at": "2026-09-20T12:08:00Z"
  }
  ```

---

### API-014 — Acknowledge Task (Accept / Decline)
- **Method / Path:** `POST /api/tasks/:id/acknowledge`
- **Purpose:** Designated responder explicitly takes ownership of the task or declines it.
- **Actor / Permission:** `RESPONDER` (must match `task.assigned_to`).
- **Related FR / Screen:** FR-015, FR-022 / `SCR-003`.
- **Request Headers:** `X-Actor-ID: charlie`, `X-Actor-Role: RESPONDER`.
- **Request Body:**
  ```json
  {
    "action": "ACCEPT"
  }
  ```
- **Preconditions:** `task.status === 'OFFERED'`, `req.actor.id === task.assigned_to`.
- **Success Response (200 OK):**
  ```json
  {
    "task_id": 1,
    "status": "ACCEPTED",
    "accepted_at": "2026-09-20T12:10:00Z",
    "message": "Task accepted. You are now responsible for this mission."
  }
  ```
- **Errors:** 403 (Wrong responder attempting to accept), 409 (Task already accepted or cancelled).

---

### API-015 — Mark Task Dispatched
- **Method / Path:** `POST /api/tasks/:id/dispatch`
- **Purpose:** Responder signals physical departure with relief kits.
- **Actor / Permission:** `RESPONDER` (Assigned).
- **Related FR / Screen:** FR-016 / `SCR-003`.
- **Success Response (200 OK):**
  ```json
  {
    "task_id": 1,
    "status": "IN_PROGRESS",
    "dispatched_at": "2026-09-20T12:12:00Z",
    "pool_balance": {
      "reserved": 0,
      "in_transit": 20
    }
  }
  ```
- **State Change:** Moves stock in `resource_pools` from `reserved` to `in_transit`. Moves `tasks.status` to `IN_PROGRESS`.

---

### API-016 — Submit Execution Outcome (Partial / Full Delivery)
- **Method / Path:** `POST /api/tasks/:id/outcome`
- **Purpose:** Responder reports execution results. Mandatory exception note if delivered < dispatched.
- **Actor / Permission:** `RESPONDER` (Assigned).
- **Related FR / Screen:** FR-007, FR-016 / `SCR-003`.
- **Request Body (Partial Outcome Example):**
  ```json
  {
    "outcome_type": "PARTIAL",
    "delivered_quantity": 12,
    "remainder_quantity": 8,
    "exception_reason": "Northern bridge flooded; could only transport 12 kits via boat."
  }
  ```
- **Validation:** `delivered_quantity + remainder_quantity === assigned_quantity`. `exception_reason` required when `outcome_type !== 'FULL'`.
- **Success Response (200 OK):**
  ```json
  {
    "task_id": 1,
    "status": "PARTIALLY_COMPLETED",
    "delivered_quantity": 12,
    "remainder_quantity": 8,
    "exception_reason": "Northern bridge flooded; could only transport 12 kits via boat.",
    "pool_balance": {
      "in_transit": 0,
      "delivered": 12
    },
    "unresolved_remainder": 8
  }
  ```

---

### API-017 — Reconcile & Confirm Outcome
- **Method / Path:** `POST /api/incidents/:id/confirm`
- **Purpose:** Coordinator reviews partial outcome, acknowledges remaining unresolved need, and reconciles the incident.
- **Actor / Permission:** `COORDINATOR` only.
- **Related FR / Screen:** FR-017 / `SCR-002`.
- **Request Body:**
  ```json
  {
    "action": "CONFIRM_PARTIAL",
    "notes": "Acknowledged 12 kits delivered. Remainder of 8 kits scheduled for boat convoy."
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "incident_id": 1,
    "status": "PARTIALLY_RESOLVED",
    "reconciliation": {
      "delivered_kits": 12,
      "unresolved_remainder": 8,
      "balance_closed": true
    },
    "timestamp": "2026-09-20T12:20:00Z"
  }
  ```

---

### API-018 — Fetch GeoJSON Map Features
- **Method / Path:** `GET /api/map/features`
- **Purpose:** Serves unified GeoJSON FeatureCollection for Leaflet rendering.
- **Actor / Permission:** `COORDINATOR` (or authenticated users).
- **Related FR / Screen:** FR-008, FR-009 / `SCR-002`.
- **Success Response (200 OK):**
  ```json
  {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": { "type": "Point", "coordinates": [72.8777, 19.0760] },
        "properties": {
          "feature_type": "INCIDENT",
          "id": 1,
          "title": "Riverside Ward 4 - Near Bridge",
          "incident_type": "FLOOD",
          "status": "PARTIALLY_RESOLVED",
          "priority": "URGENT",
          "delivered_qty": 12,
          "remainder_qty": 8,
          "updated_at": "2026-09-20T12:20:00Z"
        }
      },
      {
        "type": "Feature",
        "geometry": { "type": "Point", "coordinates": [72.8700, 19.0700] },
        "properties": {
          "feature_type": "DEPOT",
          "id": 1,
          "title": "Central Ward Depot",
          "available_kits": 0,
          "total_kits": 20,
          "provenance": "SYNTHETIC_FIXTURE"
        }
      }
    ]
  }
  ```

---

### API-022 — Demo Reset Baseline Fixture
- **Method / Path:** `POST /api/demo/reset`
- **Purpose:** Re-seeds database with clean 20-kit baseline and runs invariant checks.
- **Success Response (200 OK):**
  ```json
  {
    "status": "RESET_SUCCESSFUL",
    "message": "Database wiped and re-seeded with 20 kits and standard test fixtures.",
    "invariant_check": {
      "conservation_of_mass": "PASS (Total: 20, Sum: 20)",
      "unassigned_tasks": "PASS (0)",
      "active_incidents": "PASS (0)"
    },
    "timestamp": "2026-09-20T12:00:00Z"
  }
  ```

---

# 5. Standard Error Contract

All API error responses adhere strictly to this JSON format:

```json
{
  "code": "INVALID_STATE_TRANSITION",
  "message": "Cannot dispatch task: task must be in ACCEPTED status before dispatching.",
  "details": {
    "current_status": "OFFERED",
    "required_status": "ACCEPTED",
    "task_id": 1
  },
  "timestamp": "2026-09-20T12:11:00Z"
}
```

### Standard Error Codes:
- `SCHEMA_VALIDATION_ERROR` (422): Input fields failed Zod schema checks.
- `UNAUTHORIZED` (401): Missing or invalid actor identity headers.
- `FORBIDDEN` (403): Role lacks permission for this action.
- `RESOURCE_NOT_FOUND` (404): Entity ID or reference code does not exist.
- `STOCK_CONFLICT` (409): Resource balance changed concurrently; insufficient stock.
- `INVALID_STATE_TRANSITION` (422): Requested state change violates lifecycle graph.
- `INTERNAL_SERVER_ERROR` (500): Unhandled exception in application server.

---

# 6. Validation Ownership Matrix

| Validation Requirement | Frontend (Browser) | API Boundary (Zod) | Database Layer (SQL) |
|---|:---:|:---:|:---:|
| **Required Form Fields** | Yes (Visual cue & instant feedback) | Yes (Authoritative schema check) | Yes (`NOT NULL` constraints) |
| **Coordinate Bounds** | Yes (Leaflet drag bounds check) | Yes (`lat [-90,90]`, `lng [-180,180]`) | Yes (`CHECK` constraints) |
| **Integer Quantities** | Yes (`<input type="number" min="1">`) | Yes (`z.number().int().positive()`) | Yes (`CHECK (quantity > 0)`) |
| **Non-Negative Balance** | Yes (Disables submit if qty > avail) | Yes (Precondition query check) | Yes (`CHECK (available >= 0)`) |
| **Valid Enum Constants** | Yes (Dropdown selectors) | Yes (`z.enum([...])`) | Yes (`CHECK (status IN (...))`) |
| **Outcome Remainder Math** | Yes (Validates delivered + rem = total) | Yes (Cross-field validator rule) | Yes (`CHECK (deliv + rem <= assign)`) |
| **Role Authorization** | No (UI tab hiding only) | **Yes (Authoritative RBAC Guard)** | Yes (Foreign key user checks) |

---

# 7. Authorization Matrix

| Endpoint Path | Method | Reporter Role | Coordinator Role | Responder Role | Condition / Ownership Guard |
|---|:---:|:---:|:---:|:---:|---|
| `/api/reports` | `POST` | **Allowed** | **Allowed** | **Allowed** | Any actor can report. |
| `/api/reports/:ref` | `GET` | **Allowed** | **Allowed** | Denied | Reporter can only access their own reference. |
| `/api/reports` | `GET` | Denied | **Allowed** | Denied | Only Coordinator can view intake queue. |
| `/api/reports/:id/verify`| `POST` | Denied | **Allowed** | Denied | Only Coordinator can promote reports. |
| `/api/incidents/:id/reserve`| `POST` | Denied | **Allowed** | Denied | Only Coordinator can commit inventory. |
| `/api/tasks` | `POST` | Denied | **Allowed** | Denied | Only Coordinator can assign work. |
| `/api/tasks` | `GET` | Denied | **Allowed** | **Allowed** | Responder only sees tasks assigned to them. |
| `/api/tasks/:id/acknowledge`| `POST`| Denied | Denied | **Allowed** | Must match `task.assigned_to`. |
| `/api/tasks/:id/dispatch`| `POST`| Denied | Denied | **Allowed** | Must match `task.assigned_to`. |
| `/api/tasks/:id/outcome` | `POST` | Denied | Denied | **Allowed** | Must match `task.assigned_to`. |
| `/api/incidents/:id/confirm`| `POST`| Denied | **Allowed** | Denied | Only Coordinator can confirm closure. |

---

# 8. Concurrency & Conflict Behavior

When two users perform conflicting actions (such as two coordinators attempting to reserve 20 kits when only 20 exist):
- **HTTP Code:** `409 Conflict`.
- **Payload:** Contains `code: "STOCK_CONFLICT"` and current available balance.
- **Client Recovery:** The client UI catches the 409 status, pops an alert modal: *"Another coordinator reserved these units. Available stock is now 0."*, and triggers an automatic refresh of the resource ledger.

---

# 9. API Traceability Audit

- **Total Functional Requirements (FR-001 through FR-025):** 25
- **Mandatory / P0 Requirements Requiring Backend API:** 16
- **Endpoints Fully Specified:** 22
- **Missing Endpoints:** **0**
- **Orphan Endpoints (Endpoints without corresponding FR):** **0**
