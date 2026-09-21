# Verified Response Ledger — Product Requirements Document

**Stage:** Step 5 — after PS Analysis, SWOT, Solution Design, and Scope Lock  
**Working product name:** Verified Response Ledger  
**Purpose:** Define precise, testable product behavior within the frozen prototype scope  
**PRD date:** 20 September 2026  
**Status:** Prototype PRD; no UI layout, technical architecture, database schema, API design, or implementation plan

---

## Document Authority

1. Original Problem Statement and organizer requirements.
2. `docs/04-Scope_Lock.md` for implementation scope.
3. `docs/03-Solution_Design.md` for selected solution intent.
4. `docs/01-PS_Analysis.md` and `docs/02-SWOT.md` for context and risk.

No unresolved authority conflict was found. The Scope Lock’s narrow interpretation of “communication” and prototype interpretation of “real time” are preserved and remain explicit assumptions.

---

# 1. Product Baseline

| Item | Locked product baseline |
|---|---|
| **Product name** | Verified Response Ledger — neutral working name; no branding work is authorized. |
| **Product definition** | A narrow full-stack GIS coordination prototype that binds incident verification, resource commitment, responsibility acknowledgement, structured updates, distribution/outcome state, and audit history. |
| **Problem being solved** | Crisis actors cannot reliably tell whether an uncertain report has become a valid, resourced, owned, and completed response because reports, stock, assignments, communication, and outcomes are fragmented. |
| **Primary users** | Community Reporter, Agency Coordinator/Dispatcher, Volunteer/Responder. |
| **Secondary/indirect users** | Resource Custodian and Supervisor/Auditor are represented through coordinator actions; affected recipient is synthetic/deferred. |
| **Core user job** | Verify a reported need, commit genuinely available resources, transfer responsibility explicitly, and know whether the intended outcome was fully, partially, or not achieved. |
| **Selected solution** | A governed response ledger with an interactive map as a view of the same persisted operational state. |
| **Core workflow** | Report → validate → verify → inspect resource → reserve → assign/instruct → acknowledge → dispatch → full/partial/failed outcome → reconcile/confirm/follow up → audit/map/status update. |
| **Main differentiator** | Reported ≠ verified; displayed available ≠ uncommitted; sent ≠ accepted; dispatched ≠ delivered; partial ≠ complete. |
| **Mandatory organizer requirements** | PS-R01 Incident Reporting; PS-R02 Resource Tracking; PS-R03 Coordinated Response; PS-R04 Real-Time Geographic Visibility. |
| **P0** | C-01 persistence; C-02 human verification; C-03 authorization/transitions; C-04 atomic reservation; C-05 acknowledgement; C-06 outcome reconciliation; C-07 provenance/freshness/simulation labels; C-08 audit timeline; C-09 shared-state binding. |
| **P1** | S-01 duplicate candidate/link; S-02 decline/timeout/reassignment; S-03 stale-resource reconfirmation; S-04 list fallback; S-05 demo seed/reset/invariant support. |
| **P2** | T-01 recipient confirmation; T-02 multilingual controlled labels; T-03 real-format sample import/export if supplied; T-04 recorded official-alert overlay. |
| **Explicit OUT** | General chat; all AI/ML; blockchain; payments/donations; live GPS/routing; social ingestion; full offline sync/map packs; external messaging; live government integrations; multi-hazard/resource/agency expansion; enterprise admin/IAM; analytics; native app; microservices; advanced exports. |
| **Must be real** | Submission/persistence; connected propagation; authorization; verification; resource states; atomic reservation; acknowledgement; structured updates; outcomes/reconciliation; audit; interactive map and shared-state binding. |
| **May be simulated** | Physical stock, people/events, agency systems/directories, notifications, official feeds, GPS/routes, production identity, large-scale infrastructure. |

---

# 2. Product Objective

## Primary objective

Enable a coordinator to convert one community incident report into a verified, resource-backed, explicitly acknowledged, geographically visible, and quantity-reconciled response while the reporter and responder receive the minimum structured communication needed to participate.

## Prototype proof

The working system must demonstrate that:

1. a user-submitted incident becomes shared persisted state and appears on an interactive map;
2. only an authorized coordinator can verify and allocate;
3. the same limited stock cannot be committed twice;
4. a task remains unowned until a responder acknowledges it;
5. distribution state distinguishes reserved, in transit, and delivered;
6. a 12-of-20 partial delivery leaves 8 explicitly unresolved/released/follow-up;
7. all critical actions remain attributable and consistent across views.

## Non-goals

- Production-grade emergency dispatch or official warning issuance.
- General messaging, chat, calls, video, or social networking.
- AI classification, severity scoring, dispatch, chatbot, computer vision, translation, summarization, or forecasting.
- Real agency inventory, volunteer registry, GPS, routing, SMS, email, push, government APIs, or satellite feeds.
- Multiple hazard families, incompatible resource models, agencies, jurisdictions, or nationwide scale.
- Full offline synchronization, offline maps, native mobile applications, or enterprise IAM/admin.
- Analytics/heat maps, donations/payments, gamification, blockchain, or advanced exports.
- Claims of field adoption, response-time reduction, real inventory accuracy, safety impact, legal compliance, or production readiness based on synthetic data.

---

# 3. Requirement ID System

| Requirement class | Format | Example / rule |
|---|---|---|
| Organizer requirement | `PS-Rxx` | Preserve PS-R01 through PS-R04 exactly. |
| Scope item | `M-xx`, `C-xx`, `S-xx`, `T-xx` | Preserve IDs from Scope Lock. |
| User story | `US-xxx` | Sequential within this PRD. |
| Functional requirement | `FR-xxx` | Sequential and stable after approval. |
| Business rule | `BR-xxx` | Enforced product behavior. |
| Non-functional requirement | `NFR-xxx` | Prototype and production expectation. |
| Acceptance criterion | `AC-FRxxx-yy` | Attached to one functional requirement. |

IDs may not be recycled after deletion. A changed requirement retains its ID and records the change through Scope Lock governance.

---

# 4. Requirement Traceability Baseline

| PS ID | Organizer requirement | Scope classification | Implementation depth | PRD coverage |
|---|---|---|---|---|
| **PS-R01** | Allow users to report incidents in real time with location, type, and severity | Mandatory M-01 | Standard | US-001/002; FR-001, FR-002, FR-010, FR-011, FR-020 |
| **PS-R02** | Monitor availability and distribution of emergency resources | Mandatory M-02 + P0 integrity | Deep | US-005/008/009; FR-003, FR-004, FR-014, FR-016, FR-017, FR-018–020 |
| **PS-R03** | Enable communication and task coordination among community members, volunteers, and response agencies | Mandatory M-03 + P0 handoff | Deep coordination / minimal communication | US-002/006–009; FR-005–007, FR-015–020 |
| **PS-R04** | Present incidents and resources on an interactive map for at-a-glance situational awareness | Mandatory M-04 | Standard | US-004; FR-008, FR-009, FR-018, FR-020 |

**Coverage gate:** 4/4 organizer requirements map to PRD requirements. No mandatory requirement is missing.

---

# 5. Personas / Actors

## Interactive actors

| Actor | Goal | Core actions | Information needed | Decisions made |
|---|---|---|---|---|
| **Community Reporter** | Submit a locatable need and know that it entered an accountable process | Create report; receive reference; view own limited status; add one linked clarification/follow-up | Required fields, submission result, reference, permitted incident/task status | Whether submitted details are accurate and whether clarification is needed |
| **Agency Coordinator** | Turn a report into a verified, resource-backed, owned, and reconciled response | Review/verify/reject; inspect map/resource; reserve; create task/instructions; review updates; confirm partial/full outcome; inspect audit | Report source/time/location; verification state; resource quantity/freshness; task ownership; exceptions; audit | Verification, reservation quantity, assignment, confirmation/follow-up, cancellation/release within locked states |
| **Volunteer / Responder** | Understand and explicitly own a feasible task, then report execution honestly | View assigned task; accept/decline; mark dispatch; submit progress/exception/full/partial/failed outcome | Incident/task context, instructions, assigned quantity, location, current task state | Accept/decline; dispatch; outcome type and quantity actually delivered |

## Indirect actors

| Actor | How represented | Interface requirement |
|---|---|---|
| Resource Custodian | Coordinator-provided synthetic opening/reconfirmed balance | No separate surface |
| Supervisor / Auditor | Coordinator opens critical-event timeline | No separate dashboard |
| Affected Recipient | Synthetic scenario/evidence; P2 confirmation only | None in Mandatory/P0 |

## External systems

| External system | Prototype status |
|---|---|
| Agency inventory/ERP | Simulated through synthetic resource pool |
| Volunteer/identity directory | Simulated through prepared fictional accounts |
| Base-map source | Real permitted/prepared context; online service must have local fallback |
| Official alert/GIS feed | Deferred; recorded P2 sample only if reached |
| Messaging, GPS, routing, AI providers | Not integrated; out of scope |

---

# 6. Role Responsibility Matrix

| Action | Community Reporter | Agency Coordinator | Volunteer / Responder |
|---|---|---|---|
| Create incident report | **Create** | View | Not Allowed |
| View report receipt/own limited status | **View** | View | Not Allowed |
| Add linked clarification | **Create** for own report | View / may record response context | Not Allowed |
| View full operational incident details | Not Allowed | **View** | View only for assigned task context |
| Verify incident | Not Allowed | **Approve** | Not Allowed |
| Reject incident | Not Allowed | **Reject** | Not Allowed |
| View full resource availability | Not Allowed | **View** | View assigned quantity/context only |
| Reserve/release resource | Not Allowed | **Modify / Approve** | Not Allowed |
| Create and assign task | Not Allowed | **Assign** | Not Allowed |
| Accept/decline task | Not Allowed | View | **Approve / Reject ownership** |
| Modify task instructions before dispatch | Not Allowed | **Modify** within allowed state | View |
| Mark dispatch/in progress | Not Allowed | View | **Modify** |
| Submit progress/exception/outcome | Not Allowed | View | **Create / Complete** |
| Confirm/follow up on outcome | View limited status | **Approve / Modify state** | View own submitted outcome |
| View full audit timeline | Not Allowed | **View** | View own task history only if exposed within task; not required as full audit |
| Interact with operational map | No requirement | **View / select / filter** | View assigned location if included in task; no full map required |
| Change opening inventory | Not Allowed | **Modify only through prototype-approved resource action** | Not Allowed |
| Delete critical history | Not Allowed | Not Allowed | Not Allowed |

---

# 7. Core User Journey

| Step | Actor | Input | Preconditions | Action | System response | State change | Failure possibility | Recovery |
|---:|---|---|---|---|---|---|---|---|
| 1 | Reporter | Location, type, severity, description, safe contact/reference | Reporter role is active; required choices available | Submit incident | Validate input; reject invalid data or persist valid report and issue reference | Report → Submitted/Under Review | Missing/invalid location/type/severity; duplicate submission | Correct fields and retry; repeated submission remains separate unless P1 duplicate linking is built |
| 2 | System | Persisted report | Valid submission | Propagate report to coordinator queue and map | Show source, time, unverified status, and marker | Shared views reference same report | Propagation/map refresh fails | Report remains persisted; refresh/retry; no manual database edit |
| 3 | Coordinator | Report and contextual evidence | Report is Under Review; coordinator authorized | Verify or reject | Enforce role/state rule; record decision | Report linked to incident; incident Unverified → Verified, or report → Rejected | Unauthorized actor; report already decided; insufficient evidence | Deny invalid action; coordinator may leave Under Review until sufficient evidence |
| 4 | Coordinator | Verified incident and resource pool | Incident Verified; resource data present | Inspect quantity, source, freshness | Show available/reserved/in-transit/delivered and simulation/freshness labels | None | Resource missing/stale | Do not imply valid allocation; P1 reconfirmation if built; otherwise show limitation |
| 5 | Coordinator | Quantity 20 | Verified incident; sufficient available stock | Reserve 20 kits | Atomically commit quantity; update ledger and audit | 20 Available → Reserved | Simultaneous/insufficient request | Reject losing/invalid reservation; preserve existing commitment and consistent totals |
| 6 | Coordinator | Responder and structured instructions | Reservation valid; task can be created | Offer/assign task | Persist task and show in responder queue | Task → Offered/Pending Acknowledgement | Responder missing; duplicate assignment; invalid state | Reject invalid action; coordinator corrects before dispatch |
| 7 | Responder | Acceptance or decline | Task Offered; responder is assigned actor | Accept task | Record acknowledgement and enable dispatch | Offered → Accepted | Wrong responder; repeated acceptance; task cancelled | Deny; show current state; no duplicate owner transition |
| 8 | Responder | Dispatch action and quantity | Task Accepted; reservation valid | Mark dispatch | Move committed quantity to in transit and audit | Reserved → In Transit; Task → Dispatched/In Progress | Quantity mismatch; invalid state | Reject without state change; correct input/state and retry |
| 9 | Responder | Delivered quantity 12, exception text for 8 | Task In Progress; 20 in transit | Submit partial outcome | Validate quantity; persist outcome and structured exception | Task → Partially Completed; 12 In Transit → Delivered; 8 remain Exception/Unresolved | Delivered > dispatched; missing exception for partial | Reject; require corrected quantities/exception |
| 10 | Coordinator | Partial outcome evidence/reference | Partial outcome exists; coordinator authorized | Confirm partial result and retain/create follow-up state | Reconcile totals, update reporter status/map/timeline | Incident → Partially Resolved; 8 remain explicit | Confirmation attempts to close all 20 | Reject invalid full closure; require reconciled remaining quantity |
| 11 | Reporter/Coordinator | Reference / incident | State updated | View status and audit evidence | Reporter sees limited status; coordinator sees full timeline and consistent map/ledger/task | No independent state | View mismatch/stale UI | Reload/refetch shared state; inconsistency is a defect, not an accepted condition |

---

# 8. Supporting User Journeys

| Journey ID | Actor | Trigger | Preconditions | Steps | Expected outcome | Failure outcome | Related PS | Scope item |
|---|---|---|---|---|---|---|---|---|
| **J-01 Verification/Rejection** | Coordinator | New report arrives | Report Under Review; authorized role | Review source/time/location/details → verify or reject → record reason where applicable | Verified incident can proceed; rejected report cannot be allocated | Invalid role/state denied; report remains unchanged | PS-R01/03 | C-02, C-03 |
| **J-02 Reporter Clarification** | Reporter | Reporter needs to correct/supplement own report or coordinator requests context | Valid reference; report belongs to reporter/session | Open own status → submit linked clarification → system records actor/time | Coordinator sees clarification attached to source report/incident | Unauthorized/wrong reference denied; original report not overwritten | PS-R03 | M-03 |
| **J-03 Reservation Conflict** | Coordinator/System | Two commitments target insufficient stock | Verified incidents; same resource pool | First valid reservation commits → second checks current balance → second rejected | Exactly one valid commitment; totals remain non-negative and auditable | Both success or corrupted balance is a critical defect | PS-R02/03 | C-04 |
| **J-04 Structured Task Coordination** | Coordinator/Responder | Verified incident has reserved resource | Task may be offered | Coordinator sends instructions → responder acknowledges → responder posts update/exception/outcome | Task ownership and progress are explicit | Sent task remains Pending; wrong actor/action denied | PS-R03 | M-03, C-05, C-06 |
| **J-05 Partial Outcome Reconciliation** | Responder/Coordinator | Delivered quantity differs from dispatched | Task In Progress | Responder submits partial quantity + exception → coordinator confirms/follows up | Delivered and remaining quantities reconcile; incident Partially Resolved | Invalid quantity/closure rejected | PS-R02/03 | C-06 |
| **J-06 Map Awareness** | Coordinator | Operational records exist/change | Map available; user authorized | Pan/zoom/select → inspect incident/resource state → observe updates | Geographic view reflects same current state as queue/ledger | Base context failure is visible; P1 list fallback may preserve workflow | PS-R04 | M-04, C-09 |
| **J-07 Duplicate Review** | Coordinator | Similar reports exist | P1 enabled | System suggests using deterministic cues → coordinator links/unlinks | Source reports preserved under canonical incident | No auto-merge; feature may be omitted entirely | PS-R01 | S-01 |
| **J-08 Decline/Timeout/Reassign** | Responder/Coordinator | Responder declines or acknowledgement expires | P1 enabled; task Offered | Decline/timeout recorded → task returns to unowned/eligible reassignment → coordinator offers again | No false coverage; history retained | Task remains visibly unowned if no replacement | PS-R03 | S-02 |
| **J-09 Stale Reconfirmation** | Coordinator | Resource is stale | P1 enabled | Review source/time → reconfirm/update or leave stale | New freshness event permits informed allocation | Stale state remains visible; no silent refresh | PS-R02 | S-03 |
| **J-10 Map Failure Continuity** | Coordinator | Map/base context fails | P1 enabled | System reports failure → user uses operational list/details | Core workflow continues; map compliance is shown separately with working local/prepared map | No state loss | PS-R04 support | S-04 |
| **J-11 Demo Reset/Verification** | Demo operator/test support | Scenario must be repeated | P1 enabled; non-production demo mode | Reset fixtures → verify invariants → start known state | Reliable 20-kit initial state without manual database edits | Reset failure blocks reliable demo and must be fixed | All | S-05 |

P2 journeys remain deferred and cannot become dependencies of the journeys above.

---

# 9. User Stories

| ID | User story | Source | Related requirement(s) | Preconditions | Success outcome | Failure outcome |
|---|---|---|---|---|---|---|
| **US-001** | As a Community Reporter, I want to submit a locatable incident with type and severity so that it enters an accountable response process. | PS-R01 / M-01 | FR-001 | Reporter role; valid input | Persisted report and reference; coordinator/map visibility | Invalid input explained; no partial record |
| **US-002** | As a Community Reporter, I want to see my report’s limited status and add a clarification so that I know it was received and can correct context. | PS-R03 / M-03 | FR-002, FR-005 | Valid own reference | Linked status and clarification retained | Other users’ records inaccessible; failed update not presented as saved |
| **US-003** | As an Agency Coordinator, I want to verify or reject a report so that untrusted input does not automatically consume resources. | P0 C-02/C-03 | FR-011–013 | Report Under Review; authorized role | Actionable verified incident or rejected report with audit | Unauthorized/invalid transition denied |
| **US-004** | As an Agency Coordinator, I want an interactive map of incidents and resources so that I can understand where governed operational state exists. | PS-R04 / M-04 | FR-008, FR-009, FR-018, FR-020 | Operational records available | Selectable current markers with status/freshness | Failure is visible; underlying state remains intact |
| **US-005** | As an Agency Coordinator, I want to inspect and reserve current resource quantity so that the same units are not promised twice. | PS-R02 / M-02 / C-04 | FR-003, FR-004, FR-014 | Verified incident; known resource state | Valid commitment or explicit shortage/conflict | No negative quantity or silent overwrite |
| **US-006** | As an Agency Coordinator, I want to send one task with structured instructions so that a responder knows the expected action and quantity. | PS-R03 / M-03 | FR-006 | Valid reservation; responder exists | Offered task linked to incident/resource | Invalid task not created |
| **US-007** | As a Volunteer/Responder, I want to accept or decline an offered task so that responsibility is explicit. | P0 C-05 | FR-015 | Task Offered to current responder | Accepted owner or recorded decline | Duplicate/wrong-user response denied |
| **US-008** | As a Volunteer/Responder, I want to record dispatch, progress, exceptions, and outcome so that the coordinator sees what actually happened. | PS-R02/03 / M-02/M-03 | FR-007, FR-016 | Accepted task | Valid state/quantity update | Invalid quantity/state rejected without corruption |
| **US-009** | As an Agency Coordinator, I want to confirm a full, partial, or failed outcome so that resources and incident status reconcile honestly. | P0 C-06 | FR-017 | Submitted outcome | Consistent quantities and correct incident/task state | False full closure rejected |
| **US-010** | As an Agency Coordinator, I want provenance, freshness, simulation labels, and an audit timeline so that I can evaluate and explain operational state. | P0 C-07/C-08 | FR-018, FR-019 | Operational records/events exist | Source/time/actor/change visible | Missing audit or unlabeled synthetic data is a failed requirement |
| **US-011** | As an operational user, I want all views to reflect the same state so that I do not make decisions from contradictions. | P0 C-09 | FR-020 | State changes occur | Queue/map/task/ledger/status agree | Divergence is reported as error/defect |
| **US-012** | As a Coordinator, I want deterministic duplicate candidates and reversible links so that repeated reports do not automatically create duplicate work. | P1 S-01 | FR-021 | P1 enabled; similar reports | Human-controlled link/unlink with preserved sources | No auto-merge; omission does not block core |
| **US-013** | As a Coordinator, I want declined/timed-out tasks to return for reassignment so that unowned work stays visible. | P1 S-02 | FR-022 | P1 enabled | Decline/timeout/reassignment audited | Task remains visibly unowned if no replacement |
| **US-014** | As a Coordinator, I want to reconfirm stale resource state so that I do not treat old stock as current. | P1 S-03 | FR-023 | P1 enabled; resource stale | New confirmed timestamp/source | Stale remains visible if not reconfirmed |
| **US-015** | As a Coordinator, I want a list fallback when map context fails so that the workflow can continue. | P1 S-04 | FR-024 | P1 enabled; map failure | Operational records remain usable | Map requirement still needs separate working proof |
| **US-016** | As a demo operator, I want a deterministic reset and invariant check so that the core proof can be repeated safely. | P1 S-05 | FR-025 | Prototype demo mode | Known seed and verified totals | Reset failure is visible and blocks rehearsal |
| **US-017** | As an authorized confirming actor, I may confirm/dispute an outcome so that delivery evidence is stronger. | P2 T-01 | FR-026 | P2 explicitly approved | Confirmation/dispute recorded | Not built by default |
| **US-018** | As a target-language user, I may use controlled translated labels so that essential states are understandable. | P2 T-02 | FR-027 | P2 approved; language validated | Approved labels shown consistently | No automatic free-text translation |
| **US-019** | As an integration stakeholder, I may exchange a real documented sample format so that future system boundaries are testable. | P2 T-03 | FR-028 | Real format supplied and approved | Sample import/export preserves source | No fabricated API/schema claim |
| **US-020** | As a Coordinator, I may view a recorded official-alert context layer so that I can compare operational incidents with external context. | P2 T-04 | FR-029 | P2 approved; licensed sample | Clearly labelled recorded context | Never represented as live |

---

# 10. Functional Requirements

## FR-001 — Submit Incident Report

| Field | Requirement |
|---|---|
| **Requirement** | The system shall allow a Community Reporter to submit one incident report containing location, incident type, severity, and a concise description. |
| **Purpose** | Satisfy PS-R01 and create the traceable starting point for the response workflow. |
| **Actors** | Community Reporter; Agency Coordinator as downstream viewer. |
| **Trigger** | Reporter chooses to create a new incident report. |
| **Preconditions** | Reporter role/context is active; prototype is accepting submissions. |
| **Input** | Location, controlled incident type, controlled severity, description, and minimum safe contact/reference data defined in Section 15. |
| **Expected behavior** | Validate all required inputs; on success create exactly one report with a unique reference, source, creation time, and `Submitted/Under Review` state. |
| **Output** | Submission result, report reference, and initial status. |
| **State change** | No record → Source Report `Submitted/Under Review`. |
| **Failure behavior** | Invalid input creates no committed report; reporter receives field-level/relevant reason and may correct/retry. Repeated requests must not silently create indeterminate state. |
| **Related PS / scope** | PS-R01; M-01; C-01; C-07. |
| **Related story** | US-001. |
| **Priority** | **Mandatory Organizer**. |

## FR-002 — Report Receipt and Limited Reporter Status

| Field | Requirement |
|---|---|
| **Requirement** | The system shall provide the Reporter with a reference and a limited status view for that reporter’s submitted incident. |
| **Purpose** | Confirm receipt and satisfy the community side of structured coordination without exposing restricted operational data. |
| **Actors** | Community Reporter. |
| **Trigger** | Successful submission or later access using the valid prototype context/reference. |
| **Preconditions** | Report exists and belongs to the reporter/session represented in the prototype. |
| **Input** | Report reference or current reporter context. |
| **Expected behavior** | Show the report’s allowed status, last visible update time, and any public-safe coordinator response/status; do not expose stock locations, responder identity, internal audit, or other incidents. |
| **Output** | Limited report/incident status and permitted updates. |
| **State change** | None; read operation. |
| **Failure behavior** | Unknown or unauthorized reference reveals no protected record and explains that the report cannot be accessed. |
| **Related PS / scope** | PS-R01, PS-R03; M-01, M-03; C-03, C-07, C-09. |
| **Related story** | US-002. |
| **Priority** | **Mandatory Organizer**. |

## FR-003 — View Resource Availability

| Field | Requirement |
|---|---|
| **Requirement** | The system shall show the authorized Coordinator one synthetic emergency-resource pool with current quantities by locked state, source/simulation label, and last-updated information. |
| **Purpose** | Satisfy the availability portion of PS-R02 and provide decision context before commitment. |
| **Actors** | Agency Coordinator; Responder sees assigned quantity only. |
| **Trigger** | Coordinator reviews a verified incident or resource state. |
| **Preconditions** | Resource pool exists in the prototype. |
| **Input** | None beyond current operational context. |
| **Expected behavior** | Present available, reserved, in-transit, delivered, and released/exception quantities consistently; totals must correspond to persisted ledger events. |
| **Output** | Resource state with provenance/freshness/simulation metadata. |
| **State change** | None; read operation. |
| **Failure behavior** | Missing/unreadable state must be shown as unavailable/unknown, never as zero or fresh by default. |
| **Related PS / scope** | PS-R02; M-02; C-07; C-09. |
| **Related story** | US-005, US-010. |
| **Priority** | **Mandatory Organizer**. |

## FR-004 — Track Resource Distribution State

| Field | Requirement |
|---|---|
| **Requirement** | The system shall track committed resource quantity through `Reserved`, `In Transit`, `Delivered`, and applicable `Released/Returned/Exception` outcomes while preserving the remaining balance. |
| **Purpose** | Satisfy the distribution portion of PS-R02 and prevent dispatch from being presented as delivery. |
| **Actors** | Agency Coordinator, Volunteer/Responder. |
| **Trigger** | Valid reservation, dispatch, release, or outcome action. |
| **Preconditions** | A valid incident/resource/task relationship exists for the requested transition. |
| **Input** | Authorized action, quantity, and required reason/exception where applicable. |
| **Expected behavior** | Move only the authorized quantity between valid states; update resource detail and related operational records. |
| **Output** | New distribution state and reconciled quantities. |
| **State change** | Resource quantities move only along the locked lifecycle. |
| **Failure behavior** | Invalid quantity, actor, or transition is rejected with no partial state change. |
| **Related PS / scope** | PS-R02; M-02; C-03, C-06, C-09. |
| **Related story** | US-005, US-008, US-009. |
| **Priority** | **Mandatory Organizer**. |

## FR-005 — Linked Reporter Clarification

| Field | Requirement |
|---|---|
| **Requirement** | The system shall allow a Reporter to add a structured text clarification/follow-up to that Reporter’s own submitted report without overwriting the original report. |
| **Purpose** | Provide minimum two-way workflow communication for PS-R03 while preserving provenance. |
| **Actors** | Community Reporter; Agency Coordinator as viewer. |
| **Trigger** | Reporter identifies missing/corrective context or responds to a coordinator request outside/general communication scope. |
| **Preconditions** | Reporter can access the existing report; report has not been removed; user is authorized for that report. |
| **Input** | Clarification text; no file/media/chat-thread requirement. |
| **Expected behavior** | Create a linked update with actor/time; surface it to the Coordinator; retain original report unchanged. |
| **Output** | Confirmation that clarification was recorded and linked. |
| **State change** | New Coordination Update `Submitted → Visible/Linked`; report/incident state changes only through separate authorized action. |
| **Failure behavior** | Empty, unauthorized, or failed submissions are not presented as saved. |
| **Related PS / scope** | PS-R03; M-03; C-01, C-03, C-08. |
| **Related story** | US-002. |
| **Priority** | **Mandatory Organizer**. |

## FR-006 — Create Task with Structured Instructions

| Field | Requirement |
|---|---|
| **Requirement** | The system shall allow an authorized Coordinator to create and offer one response task linked to a verified incident, valid resource commitment, designated Responder, location/context, assigned quantity, and concise instructions. |
| **Purpose** | Convert an allocation decision into an accountable task under PS-R03. |
| **Actors** | Agency Coordinator; Volunteer/Responder as recipient. |
| **Trigger** | Coordinator chooses to assign work after verification and valid reservation. |
| **Preconditions** | Incident is Verified/Response Active; required resource is reserved; responder fixture exists; coordinator is authorized. |
| **Input** | Responder, assigned quantity, instructions, incident/resource references. |
| **Expected behavior** | Create exactly one task in `Offered/Pending Acknowledgement`; show it only to the designated Responder and authorized Coordinator. |
| **Output** | Task reference and pending acknowledgement state. |
| **State change** | No task → Task `Offered/Pending Acknowledgement`. |
| **Failure behavior** | Missing reservation, invalid quantity/responder, duplicate incompatible task, or unauthorized actor causes rejection without creating an active task. |
| **Related PS / scope** | PS-R03; M-03; C-03, C-05, C-08. |
| **Related story** | US-006. |
| **Priority** | **Mandatory Organizer**. |

## FR-007 — Submit Responder Progress, Exception, and Outcome

| Field | Requirement |
|---|---|
| **Requirement** | The system shall allow the assigned Responder to record dispatch, structured progress/exception text, and a full, partial, or failed outcome for an accepted task. |
| **Purpose** | Satisfy task communication/coordination and resource-distribution reporting. |
| **Actors** | Volunteer/Responder; Agency Coordinator as viewer/decision maker. |
| **Trigger** | Responder begins or updates execution. |
| **Preconditions** | Current actor is designated Responder; task is in a state permitting the requested action. |
| **Input** | Action type, applicable quantity, concise update/exception reason, optional safe evidence reference if already represented in fixtures. |
| **Expected behavior** | Validate role, state, and quantity; persist the update; surface it to Coordinator; update task/resource state only as authorized by the action. |
| **Output** | Confirmed update and current task/distribution state. |
| **State change** | Accepted → Dispatched/In Progress → Partially Completed/Completed/Failed, subject to rules. |
| **Failure behavior** | Wrong actor, impossible transition, missing partial exception, or invalid quantity is rejected without changing task/resource state. |
| **Related PS / scope** | PS-R02, PS-R03; M-02, M-03; C-03, C-06, C-08. |
| **Related story** | US-008. |
| **Priority** | **Mandatory Organizer**. |

## FR-008 — Interactive Operational Map

| Field | Requirement |
|---|---|
| **Requirement** | The system shall provide the authorized Coordinator with an interactive map supporting pan, zoom, marker selection, and at-a-glance distinction of incident and resource records. |
| **Purpose** | Satisfy PS-R04 using governed state rather than a decorative image. |
| **Actors** | Agency Coordinator. |
| **Trigger** | Coordinator accesses geographic situational awareness. |
| **Preconditions** | At least the map renderer is available; records may be empty. |
| **Input** | User map interaction and simple state/type filtering authorized by M-04. |
| **Expected behavior** | Display incident/resource markers at stored locations; marker selection reveals permitted operational summary including state and freshness/simulation context; status is not encoded by color alone. |
| **Output** | Interactive geographic view and selected record summary. |
| **State change** | None from map navigation/selection; map does not own independent operational state. |
| **Failure behavior** | Map/base failure is explicit and does not corrupt records; P1 list fallback applies only if implemented. |
| **Related PS / scope** | PS-R04; M-04; C-07, C-09. |
| **Related story** | US-004. |
| **Priority** | **Mandatory Organizer**. |

## FR-009 — Connected Map State Updates

| Field | Requirement |
|---|---|
| **Requirement** | The system shall make newly submitted incidents and relevant incident/resource state changes visible on the running interactive map without manual database editing. |
| **Purpose** | Satisfy the prototype interpretation of real-time geographic visibility and prove shared state. |
| **Actors** | System; Agency Coordinator as observer. |
| **Trigger** | Incident submission, verification, resource transition, task/outcome state relevant to marker summary. |
| **Preconditions** | Underlying action succeeded and map view can access persisted state. |
| **Input** | Persisted operational state. |
| **Expected behavior** | On connected refresh/update, map shows the current record state from the same source used by queue/resource/task views. No separate seed/edit is allowed. |
| **Output** | Updated marker/summary. |
| **State change** | No map-owned change; visual state mirrors operational state. |
| **Failure behavior** | If refresh fails, retain/identify the last visible state as not confirmed current and allow retry/reload; never fabricate success. |
| **Related PS / scope** | PS-R01, PS-R04; M-01, M-04; C-09. |
| **Related story** | US-001, US-004, US-011. |
| **Priority** | **Mandatory Organizer**. |

## FR-010 — Persist Shared Operational Records

| Field | Requirement |
|---|---|
| **Requirement** | The system shall persist source reports, incidents, resource movements, tasks, structured updates, outcomes, and critical audit events so that authorized roles observe a continuous shared workflow. |
| **Purpose** | Provide the real system-of-record behavior required by every core claim. |
| **Actors** | All interactive actors; system. |
| **Trigger** | Any successful create or state-changing action. |
| **Preconditions** | Input/business/permission validation succeeds. |
| **Input** | Valid product action and associated data. |
| **Expected behavior** | Commit the complete authorized change or none of it; records remain accessible after navigation/reload and role changes during the demo. |
| **Output** | Persisted current state and associated critical event. |
| **State change** | As defined by the action; no untracked state mutation. |
| **Failure behavior** | Report failure; do not claim success; do not leave partial cross-entity state that breaks locked invariants. |
| **Related PS / scope** | All PS requirements; C-01, C-09. |
| **Related story** | US-001–US-011. |
| **Priority** | **P0**. |

## FR-011 — Verify or Reject Incident Report

| Field | Requirement |
|---|---|
| **Requirement** | The system shall allow only an authorized Coordinator to verify or reject a report that is currently under review. |
| **Purpose** | Prevent unverified community input from automatically becoming actionable or authoritative. |
| **Actors** | Agency Coordinator. |
| **Trigger** | Coordinator completes review. |
| **Preconditions** | Report exists in `Under Review`; coordinator is authorized; decision has not already reached an incompatible final state. |
| **Input** | Verify or reject decision; rejection/decision reason where required by the prototype interaction. |
| **Expected behavior** | Verification creates/links the canonical incident in `Verified`; rejection marks the source report `Rejected`; decision actor/time is audited. |
| **Output** | Updated report/incident state and visible decision result. |
| **State change** | Report `Under Review → Linked to Incident` and Incident `Unverified → Verified`, or Report `Under Review → Rejected`. |
| **Failure behavior** | Invalid actor/state/action is rejected with no state change. A report with insufficient information may remain Under Review; the system must not force verification. |
| **Related PS / scope** | PS-R01, PS-R03; C-02, C-03, C-08. |
| **Related story** | US-003. |
| **Priority** | **P0**. |

## FR-012 — Enforce Role Authorization

| Field | Requirement |
|---|---|
| **Requirement** | The system shall authorize critical actions according to the locked Reporter, Coordinator, and Responder responsibility matrix. |
| **Purpose** | Preserve accountability and prevent UI-only role simulation. |
| **Actors** | All interactive actors. |
| **Trigger** | Any protected view or state-changing action. |
| **Preconditions** | Actor has an established prototype identity/role context. |
| **Input** | Requested capability and target record. |
| **Expected behavior** | Permit only actions and data exposure authorized in Section 6 and Section 14. Authorization must apply to the action, not only to whether a control is displayed. |
| **Output** | Authorized result or denial. |
| **State change** | Only authorized actions can change state. |
| **Failure behavior** | Deny unauthorized access/action, expose no restricted data, record critical denied attempts if included in audit policy, and leave state unchanged. |
| **Related PS / scope** | All PS requirements; C-03. |
| **Related story** | US-003–US-011. |
| **Priority** | **P0**. |

## FR-013 — Enforce Valid State Transitions

| Field | Requirement |
|---|---|
| **Requirement** | The system shall allow state changes only when the entity’s current state, actor, and required related records satisfy the locked lifecycle. |
| **Purpose** | Ensure status changes have operational meaning and cannot skip required handoffs. |
| **Actors** | Coordinator, Responder, system. |
| **Trigger** | Verification, reservation, assignment, acknowledgement, dispatch, outcome, release, confirmation, cancellation, or correction action. |
| **Preconditions** | Target entity exists and has a known current state. |
| **Input** | Requested transition and required supporting data. |
| **Expected behavior** | Evaluate the transition against Section 13; apply only valid transitions and record the resulting state. |
| **Output** | New state or explicit invalid-transition response. |
| **State change** | Exactly the permitted transition; no skipped or silent intermediate states. |
| **Failure behavior** | Reject impossible/repeated/out-of-order transitions and preserve the current state. |
| **Related PS / scope** | PS-R02, PS-R03; C-03. |
| **Related story** | US-003, US-005–US-009. |
| **Priority** | **P0**. |

## FR-014 — Atomically Reserve Available Resource

| Field | Requirement |
|---|---|
| **Requirement** | The system shall commit a requested positive integer quantity only when the current available quantity is sufficient and shall prevent concurrent commitments from exceeding availability. |
| **Purpose** | Prevent double promise and preserve the selected solution’s central differentiator. |
| **Actors** | Authorized Coordinator; system. |
| **Trigger** | Coordinator requests reservation for a Verified incident. |
| **Preconditions** | Coordinator authorized; incident Verified; resource pool exists; record not invalid/stale under any enforced P1 rule; quantity positive. |
| **Input** | Incident, resource pool, requested quantity. |
| **Expected behavior** | Evaluate against current committed state at the time of action; on success move quantity Available → Reserved and link commitment to incident/task context; on conflict reject without partial commitment. |
| **Output** | Reservation reference and updated quantities, or explicit shortage/conflict. |
| **State change** | Available decreases and Reserved increases by the same quantity. |
| **Failure behavior** | Insufficient/concurrent/invalid request fails; no negative balance; existing valid reservation remains unchanged; failure is auditable as appropriate. |
| **Related PS / scope** | PS-R02, PS-R03; C-04, C-08. |
| **Related story** | US-005. |
| **Priority** | **P0**. |

## FR-015 — Acknowledge Assignment Ownership

| Field | Requirement |
|---|---|
| **Requirement** | The system shall keep an offered task unowned/pending until the designated Responder explicitly accepts it and shall allow that Responder to decline it. |
| **Purpose** | Prevent “sent” from being interpreted as “covered.” |
| **Actors** | Designated Volunteer/Responder; Coordinator as observer. |
| **Trigger** | Responder acts on an Offered task. |
| **Preconditions** | Task is `Offered/Pending Acknowledgement`; actor is designated Responder; task not cancelled/reassigned. |
| **Input** | Accept or decline; optional concise decline reason if P1 recovery is implemented. |
| **Expected behavior** | Accept sets owner and time and enables dispatch; decline records no ownership and leaves/returns work for coordinator attention. |
| **Output** | Accepted or Declined state visible to Coordinator and Responder. |
| **State change** | Offered → Accepted or Offered → Declined. |
| **Failure behavior** | Wrong actor, repeated action, or incompatible task state is rejected with current state unchanged. |
| **Related PS / scope** | PS-R03; C-05, C-08. |
| **Related story** | US-007. |
| **Priority** | **P0**. |

## FR-016 — Record Dispatch and Outcome State

| Field | Requirement |
|---|---|
| **Requirement** | The system shall allow an accepted task to progress to dispatch/in-progress and then to full, partial, or failed outcome without treating dispatch as delivery. |
| **Purpose** | Preserve distinct operational handoffs and satisfy distribution/task tracking. |
| **Actors** | Volunteer/Responder; Coordinator as reviewer. |
| **Trigger** | Responder begins execution or reports result. |
| **Preconditions** | Actor owns task; current task/resource state permits action; associated reservation exists. |
| **Input** | Dispatch quantity; outcome type; delivered quantity; exception/reason where required. |
| **Expected behavior** | Dispatch moves quantity Reserved → In Transit; outcome moves only the reported valid quantity to Delivered or records failure/exception; task state mirrors actual result. |
| **Output** | Updated task and resource distribution state. |
| **State change** | Accepted → Dispatched/In Progress → Completed/Partially Completed/Failed. |
| **Failure behavior** | Invalid actor/state/quantity or missing required exception causes complete rejection of the attempted update. |
| **Related PS / scope** | PS-R02, PS-R03; C-06. |
| **Related story** | US-008. |
| **Priority** | **P0**. |

## FR-017 — Reconcile Full, Partial, and Failed Outcomes

| Field | Requirement |
|---|---|
| **Requirement** | The system shall reconcile delivered, unresolved, released/returned, and failed quantities so that the total committed quantity remains accounted for before the Coordinator confirms the outcome. |
| **Purpose** | Prevent false completion and preserve resource truth after exceptions. |
| **Actors** | System; Agency Coordinator; Responder provides the reported outcome. |
| **Trigger** | Responder submits outcome; Coordinator confirms or follows up. |
| **Preconditions** | Task has dispatched/in-progress quantity; reported quantities are available for reconciliation. |
| **Input** | Dispatched quantity, delivered quantity, failure/exception quantity, chosen allowed disposition/follow-up state. |
| **Expected behavior** | Require delivered quantity between zero and dispatched quantity; compute/require explicit remainder; allow full closure only when no unexplained remainder exists; show reconciled result. |
| **Output** | Confirmed outcome, incident/task status, and balanced resource quantities. |
| **State change** | Task/Incident become Completed/Resolved, Partially Completed/Partially Resolved, Failed, or remain active with explicit remainder. |
| **Failure behavior** | Over-delivery, negative quantity, inconsistent total, or attempted full closure with remainder is rejected without corrupting prior state. |
| **Related PS / scope** | PS-R02, PS-R03; C-06, C-08. |
| **Related story** | US-009. |
| **Priority** | **P0**. |

## FR-018 — Display Provenance, Freshness, and Simulation Status

| Field | Requirement |
|---|---|
| **Requirement** | The system shall expose source, relevant actor, last-updated time, verification/freshness state, and synthetic/simulated status at decision-relevant points. |
| **Purpose** | Prevent stale, unverified, or synthetic data from appearing authoritative. |
| **Actors** | Coordinator; Reporter/Responder receive only the metadata relevant to their permitted view. |
| **Trigger** | User views a report, incident, resource, task, outcome, or map marker summary. |
| **Preconditions** | Record exists. |
| **Input** | Stored metadata and state. |
| **Expected behavior** | Show available provenance/freshness/simulation context; never label synthetic opening stock or recorded samples as live operational data. |
| **Output** | Human-readable data-status context. |
| **State change** | None, except freshness state may change by time/reconfirmation rules; no silent data refresh. |
| **Failure behavior** | Missing metadata is shown as unknown/missing, not inferred. |
| **Related PS / scope** | PS-R02, PS-R04; C-07. |
| **Related story** | US-004, US-010. |
| **Priority** | **P0**. |

## FR-019 — Preserve Critical Audit Timeline

| Field | Requirement |
|---|---|
| **Requirement** | The system shall preserve an ordered timeline of critical lifecycle actions and failed/conflicting decisions required to reconstruct the demo workflow. |
| **Purpose** | Make operational accountability and the differentiator observable. |
| **Actors** | System records; authorized Coordinator views. |
| **Trigger** | Critical event listed in Section 25 occurs. |
| **Preconditions** | An actor/system action is accepted or a critical conflict/denial is eligible for audit. |
| **Input** | Event type, actor, time, affected record, before/after state or quantity, and reason/evidence reference where applicable. |
| **Expected behavior** | Append an attributable event without silently deleting/replacing earlier critical history; present a coherent incident/task timeline. |
| **Output** | Audit event and timeline. |
| **State change** | New Audit Event; operational state changes only through the originating valid action. |
| **Failure behavior** | If audit persistence fails for a state-changing critical action, the action must not be represented as fully successful; inconsistent audit/state is a critical defect. |
| **Related PS / scope** | PS-R02, PS-R03; C-08. |
| **Related story** | US-010. |
| **Priority** | **P0**. |

## FR-020 — Maintain Cross-View State Consistency

| Field | Requirement |
|---|---|
| **Requirement** | The system shall derive the coordinator queue, reporter status, responder task, resource tracker, audit timeline, and interactive map summaries from the same authoritative prototype state. |
| **Purpose** | Prevent the centralized platform from recreating fragmentation internally. |
| **Actors** | All interactive actors; system. |
| **Trigger** | Any record is created or changes state. |
| **Preconditions** | Change is successfully persisted. |
| **Input** | Current shared operational state. |
| **Expected behavior** | Each authorized view reflects the same identifiers, lifecycle status, quantities, and relevant timestamps after connected update/reload; role-based redaction may differ without semantic contradiction. |
| **Output** | Consistent authorized views. |
| **State change** | No independent view state that changes operational truth. |
| **Failure behavior** | A view that cannot confirm current state must show loading/stale/error rather than a conflicting authoritative value. |
| **Related PS / scope** | All PS requirements; C-09. |
| **Related story** | US-011. |
| **Priority** | **P0**. |

## FR-021 — Suggest and Reversibly Link Duplicate Reports

| Field | Requirement |
|---|---|
| **Requirement** | If P1 is authorized, the system shall use deterministic time, distance, and category cues to present possible duplicate source reports for Coordinator review and allow reversible linking without deleting either source. |
| **Purpose** | Reduce duplicate work while preserving evidence. |
| **Actors** | Agency Coordinator. |
| **Trigger** | New/similar report is reviewed. |
| **Preconditions** | P1 enabled; two or more reports exist. |
| **Input** | Report time, location, category, and available stable cues. |
| **Expected behavior** | Present suggestion reasons; require human link/unlink decision; preserve sources and audit decision. |
| **Output** | Linked reports under one incident or records kept separate. |
| **State change** | Source Report → Linked to Incident; reversible through audited unlink. |
| **Failure behavior** | Never auto-merge; feature may be disabled without blocking Mandatory/P0. |
| **Related PS / scope** | PS-R01; S-01. |
| **Related story** | US-012. |
| **Priority** | **P1**. |

## FR-022 — Handle Decline, Timeout, and Reassignment

| Field | Requirement |
|---|---|
| **Requirement** | If P1 is authorized, the system shall keep declined or timed-out tasks visibly unowned and allow the Coordinator to offer them to another prepared Responder while retaining history. |
| **Purpose** | Recover from failed responsibility transfer. |
| **Actors** | Coordinator, Responder, system. |
| **Trigger** | Responder declines or configured prototype timeout is reached. |
| **Preconditions** | P1 enabled; task Offered/Pending. |
| **Input** | Decline/timeout and replacement responder. |
| **Expected behavior** | Record failure to acquire owner; return task for attention; create new offer without erasing prior event. |
| **Output** | Visible unowned/reassigned state. |
| **State change** | Offered → Declined/Timed Out → Offered to replacement. |
| **Failure behavior** | No automatic hidden reassignment or duplicate active owner. |
| **Related PS / scope** | PS-R03; S-02. |
| **Related story** | US-013. |
| **Priority** | **P1**. |

## FR-023 — Reconfirm Stale Resource State

| Field | Requirement |
|---|---|
| **Requirement** | If P1 is authorized, the system shall allow the Coordinator to reconfirm or update a stale synthetic resource quantity, recording source, actor, and time. |
| **Purpose** | Reduce risk of acting on old balance. |
| **Actors** | Agency Coordinator representing custodian function. |
| **Trigger** | Resource state is marked stale. |
| **Preconditions** | P1 enabled; coordinator authorized. |
| **Input** | Confirmed quantity/source and reason/context. |
| **Expected behavior** | Create a new reconfirmation event; do not erase prior balance history. |
| **Output** | Reconfirmed resource state and updated time/source. |
| **State change** | Freshness `Stale → Reconfirmed/Fresh`. |
| **Failure behavior** | Failed reconfirmation leaves resource stale; no silent freshness update. |
| **Related PS / scope** | PS-R02; S-03. |
| **Related story** | US-014. |
| **Priority** | **P1**. |

## FR-024 — Provide Operational List Fallback

| Field | Requirement |
|---|---|
| **Requirement** | If P1 is authorized, the system shall provide a non-map operational list/detail path for reports, incidents, resources, and tasks when base-map rendering is unavailable. |
| **Purpose** | Preserve workflow continuity and demo recovery. |
| **Actors** | Agency Coordinator. |
| **Trigger** | Map/base layer unavailable or user chooses list. |
| **Preconditions** | P1 enabled; operational records remain accessible. |
| **Input** | Current shared state and optional locked filters. |
| **Expected behavior** | Show sufficient status/location text to continue the core workflow without claiming the list satisfies PS-R04 by itself. |
| **Output** | Operational list/details. |
| **State change** | None. |
| **Failure behavior** | If data store also fails, show error; do not present stale cached values as current. |
| **Related PS / scope** | PS-R04 support; S-04. |
| **Related story** | US-015. |
| **Priority** | **P1**. |

## FR-025 — Support Deterministic Demo Reset and Invariant Check

| Field | Requirement |
|---|---|
| **Requirement** | If P1 is authorized, the prototype shall provide non-production test support that restores the approved synthetic scenario and verifies key quantity/state invariants before rehearsal/demo. |
| **Purpose** | Make the core proof repeatable without manual record edits. |
| **Actors** | Demo operator/test support; not an end-user role or product dashboard. |
| **Trigger** | Authorized rehearsal/reset action. |
| **Preconditions** | P1 enabled; prototype demo environment. |
| **Input** | Reset/verify command through whatever later technical design permits. |
| **Expected behavior** | Restore known 20-kit starting state and prepared actors/records; report pass/fail for required invariants. |
| **Output** | Known scenario and verification result. |
| **State change** | Demo environment resets; this behavior is not available as production record deletion. |
| **Failure behavior** | Report reset failure and block reliance on the scenario until corrected. |
| **Related PS / scope** | All, as demo support; S-05. |
| **Related story** | US-016. |
| **Priority** | **P1**. |

## FR-026 — Record Recipient/Third-Party Confirmation

| Field | Requirement |
|---|---|
| **Requirement** | If P2 is explicitly approved, the system may record a synthetic authorized confirmer’s confirmation or dispute of a reported outcome. |
| **Purpose** | Strengthen closure evidence beyond responder self-report. |
| **Actors** | Synthetic confirmer; Coordinator. |
| **Trigger** | Outcome awaits independent confirmation. |
| **Preconditions** | P2 approved and actor/evidence rule defined without changing scope. |
| **Input** | Confirm/dispute and concise reason. |
| **Expected behavior** | Link decision to outcome; preserve responder report and confirmer event. |
| **Output** | Confirmed/disputed status. |
| **State change** | Outcome confirmation state only. |
| **Failure behavior** | Absence of this P2 capability cannot block Mandatory/P0 confirmation by Coordinator. |
| **Related PS / scope** | PS-R02/03; T-01. |
| **Related story** | US-017. |
| **Priority** | **P2**. |

## FR-027 — Provide Validated Multilingual Controlled Labels

| Field | Requirement |
|---|---|
| **Requirement** | If P2 is explicitly approved and a target language is validated, the system may present approved controlled labels for locked fields/states while preserving the same meaning. |
| **Purpose** | Improve accessibility without introducing free-text machine translation. |
| **Actors** | Any interactive actor. |
| **Trigger** | User selects an approved language. |
| **Preconditions** | P2 approved; translated controlled vocabulary reviewed. |
| **Input** | Language selection. |
| **Expected behavior** | Display approved labels consistently; stored operational meaning remains unchanged. |
| **Output** | Localized controlled labels. |
| **State change** | None. |
| **Failure behavior** | Fall back to default language; do not auto-translate operational free text. |
| **Related PS / scope** | PS-R01/03; T-02. |
| **Related story** | US-018. |
| **Priority** | **P2**. |

## FR-028 — Exchange a Documented Sample Format

| Field | Requirement |
|---|---|
| **Requirement** | If P2 is explicitly approved and a real documented format is supplied, the system may import or export a small sample while preserving source and simulation status. |
| **Purpose** | Demonstrate an integration boundary without inventing an API. |
| **Actors** | Coordinator/integration stakeholder represented in demo. |
| **Trigger** | Approved sample is provided. |
| **Preconditions** | P2 approved; format, ownership, and fields documented. |
| **Input** | Real documented sample. |
| **Expected behavior** | Validate sample; preserve source; produce disclosed prototype result. |
| **Output** | Imported/exported sample result. |
| **State change** | Only as explicitly mapped; no live integration claim. |
| **Failure behavior** | Reject malformed sample and keep core state intact. |
| **Related PS / scope** | PS-R02; T-03. |
| **Related story** | US-019. |
| **Priority** | **P2**. |

## FR-029 — Display Recorded Official-Alert Context

| Field | Requirement |
|---|---|
| **Requirement** | If P2 is explicitly approved and a licensed recorded sample is available, the system may display it as contextual map information clearly labelled recorded/simulated. |
| **Purpose** | Show future context without putting government services on the critical path. |
| **Actors** | Agency Coordinator. |
| **Trigger** | Coordinator enables optional context. |
| **Preconditions** | P2 approved; source/terms checked. |
| **Input** | Recorded sample. |
| **Expected behavior** | Display context separately from community incidents and without changing official authority/status. |
| **Output** | Labelled contextual overlay. |
| **State change** | None to operational incident/resource state. |
| **Failure behavior** | Omit overlay; core map/workflow remains unaffected. |
| **Related PS / scope** | PS-R04; T-04. |
| **Related story** | US-020. |
| **Priority** | **P2**. |

---

# 11. Functional Requirement Matrix

| FR ID | Requirement | Actor | PS requirement | Scope item | Priority |
|---|---|---|---|---|---|
| FR-001 | Submit incident report | Reporter | PS-R01 | M-01 | Mandatory Organizer |
| FR-002 | Report receipt and limited status | Reporter | PS-R01/03 | M-01/M-03 | Mandatory Organizer |
| FR-003 | View resource availability | Coordinator | PS-R02 | M-02 | Mandatory Organizer |
| FR-004 | Track resource distribution state | Coordinator/Responder | PS-R02 | M-02 | Mandatory Organizer |
| FR-005 | Linked reporter clarification | Reporter | PS-R03 | M-03 | Mandatory Organizer |
| FR-006 | Create task with instructions | Coordinator | PS-R03 | M-03 | Mandatory Organizer |
| FR-007 | Progress/exception/outcome update | Responder | PS-R02/03 | M-02/M-03 | Mandatory Organizer |
| FR-008 | Interactive operational map | Coordinator | PS-R04 | M-04 | Mandatory Organizer |
| FR-009 | Connected map state updates | System/Coordinator | PS-R01/04 | M-01/M-04 | Mandatory Organizer |
| FR-010 | Persist shared operational records | All/System | All | C-01 | P0 |
| FR-011 | Verify/reject report | Coordinator | PS-R01/03 | C-02 | P0 |
| FR-012 | Role authorization | All | All | C-03 | P0 |
| FR-013 | State-transition enforcement | Coordinator/Responder/System | PS-R02/03 | C-03 | P0 |
| FR-014 | Atomic reservation | Coordinator/System | PS-R02/03 | C-04 | P0 |
| FR-015 | Assignment acknowledgement | Responder | PS-R03 | C-05 | P0 |
| FR-016 | Dispatch/outcome state | Responder | PS-R02/03 | C-06 | P0 |
| FR-017 | Outcome reconciliation | Coordinator/System | PS-R02/03 | C-06 | P0 |
| FR-018 | Provenance/freshness/simulation | System/All | PS-R02/04 | C-07 | P0 |
| FR-019 | Critical audit timeline | System/Coordinator | PS-R02/03 | C-08 | P0 |
| FR-020 | Cross-view consistency | System/All | All | C-09 | P0 |
| FR-021 | Duplicate candidate/link | Coordinator | PS-R01 | S-01 | P1 |
| FR-022 | Decline/timeout/reassign | Coordinator/Responder | PS-R03 | S-02 | P1 |
| FR-023 | Stale resource reconfirmation | Coordinator | PS-R02 | S-03 | P1 |
| FR-024 | Operational list fallback | Coordinator | PS-R04 support | S-04 | P1 |
| FR-025 | Demo reset/invariant check | Test support | All | S-05 | P1 |
| FR-026 | Recipient confirmation | Synthetic confirmer | PS-R02/03 | T-01 | P2 |
| FR-027 | Multilingual controlled labels | All | PS-R01/03 | T-02 | P2 |
| FR-028 | Documented sample exchange | Integration stakeholder | PS-R02 | T-03 | P2 |
| FR-029 | Recorded official-alert context | Coordinator | PS-R04 | T-04 | P2 |

Every FR has an upstream organizer or locked-scope justification. No OUT capability appears as a requirement.

---

# 12. Business Rules

| ID | Rule | Reason | Applies to | Enforcement point | Failure response | Related FR |
|---|---|---|---|---|---|---|
| **BR-001** | A newly submitted community report is unverified and cannot directly authorize allocation or dispatch. | Separate observation from authority. | Report/Incident | Verification and reservation actions | Deny allocation; retain Under Review | FR-001, FR-011, FR-014 |
| **BR-002** | Only the Coordinator may verify or reject a report. | Preserve authorized human decision. | Report/Incident | Verification action | Deny; no state change | FR-011, FR-012 |
| **BR-003** | A rejected report cannot receive resource reservation or task assignment. | Prevent action on rejected input. | Report/Incident | Reservation/task creation | Reject action | FR-006, FR-013, FR-014 |
| **BR-004** | Resource quantity is a non-negative integer in one locked unit: relief kits. | Avoid unit ambiguity and invalid balances. | Resource/Reservation/Outcome | All quantity input and reconciliation | Reject invalid quantity | FR-003, FR-004, FR-014, FR-016, FR-017 |
| **BR-005** | Available quantity excludes reserved and in-transit quantity. | Prevent double promise. | Resource | Availability calculation/display | Show reconciled state; block inconsistent commit | FR-003, FR-014 |
| **BR-006** | A reservation may not exceed current available quantity. | Core allocation invariant. | Reservation | Reservation decision | Reject as insufficient/conflict | FR-014 |
| **BR-007** | Competing reservations cannot both succeed when their combined quantity exceeds availability. | Concurrency integrity. | Reservation | Commit boundary | One valid result; other rejected | FR-014 |
| **BR-008** | Resource movement preserves total accounted quantity; no state transition may create or silently lose units. | Ledger integrity. | Resource/Outcome | Distribution/outcome transition | Reject inconsistent action | FR-004, FR-016, FR-017 |
| **BR-009** | A task may be offered only for a Verified/Response Active incident with a valid resource commitment when the task includes resource delivery. | Bind work to authorized need and stock. | Task | Task creation | Reject invalid task | FR-006, FR-013 |
| **BR-010** | An offered task is Pending Acknowledgement and has no accepted owner until the designated Responder accepts. | Sent ≠ accepted. | Task | Offer/acceptance | Keep pending; do not enable dispatch | FR-006, FR-015 |
| **BR-011** | Only the designated Responder may accept, decline, dispatch, or report outcome for that task. | Prevent unauthorized execution updates. | Task | Task actions | Deny and preserve state | FR-012, FR-015, FR-016 |
| **BR-012** | Dispatch requires an accepted task and sufficient reserved quantity. | Prevent skipped handoff. | Task/Resource | Dispatch action | Reject invalid transition | FR-013, FR-016 |
| **BR-013** | Dispatched/In Transit is not Delivered/Completed. | Preserve outcome truth. | Task/Resource | Outcome display/transition | Keep in-progress until valid outcome | FR-004, FR-016 |
| **BR-014** | Delivered quantity cannot exceed dispatched quantity and cannot be negative. | Quantity integrity. | Outcome | Outcome validation | Reject outcome | FR-016, FR-017 |
| **BR-015** | A partial outcome requires an explicit remainder and concise exception/reason. | Prevent hidden loss. | Outcome | Partial submission/confirmation | Reject incomplete partial outcome | FR-007, FR-017 |
| **BR-016** | Full completion/resolution is allowed only when the demonstrated committed/dispatched quantity has no unexplained remainder. | Partial ≠ complete. | Task/Incident | Coordinator confirmation | Reject full closure | FR-017 |
| **BR-017** | A failed task does not automatically convert in-transit quantity to delivered. | Prevent false distribution state. | Task/Resource | Failure transition | Retain explicit exception/return/release state | FR-016, FR-017 |
| **BR-018** | Original source reports and critical events are not silently overwritten or deleted. | Preserve provenance/audit. | Report/Update/Audit | Clarification/correction/history | Create linked/superseding event | FR-005, FR-019 |
| **BR-019** | Reporter status exposes only that reporter’s permitted record and public-safe state. | Protect operational/privacy boundaries. | Reporter Status | Read authorization | Deny or redact | FR-002, FR-012 |
| **BR-020** | Synthetic opening stock, identities, and scenario data must be labelled synthetic; recorded integrations must be labelled simulated/recorded. | Prevent demo deception. | All views/demo data | Data presentation | Missing label is a failed requirement | FR-018 |
| **BR-021** | The map mirrors underlying records and cannot directly create a contradictory operational state. | Keep map as a governed view. | Map | Map actions/state refresh | Read/select only unless action invokes a governed FR | FR-008–009, FR-020 |
| **BR-022** | A failed state-changing operation must not be shown as successful or leave a partial cross-entity commit. | Product integrity. | All critical actions | Persistence/action boundary | Show failure; preserve prior valid state | FR-010, FR-014–017, FR-019 |
| **BR-023** | Unknown/missing freshness or provenance is displayed as unknown, not inferred as fresh or authoritative. | Honest situational awareness. | Report/Resource/Map | Read behavior | Show unknown/missing | FR-018 |
| **BR-024** | P1/P2 functionality cannot be required to complete Mandatory/P0 journeys. | Preserve scope priority. | Product | Journey/dependency review | Treat hidden dependency as defect/scope conflict | FR-001–020 |
| **BR-025** | No AI-generated output exists in the approved prototype. | Preserve AI scope lock. | Entire product | Requirement/design review | Reject AI requirement as scope conflict | All |

---

# 13. State / Lifecycle Specification

## 13.1 Source Report

**Initial state:** `Submitted / Under Review`  
**Final states:** `Linked to Incident`, `Rejected`

| Current state | Action | Actor | Next state | Condition |
|---|---|---|---|---|
| None | Submit valid report | Reporter | Submitted / Under Review | FR-001 validation passes |
| Under Review | Verify and create/link incident | Coordinator | Linked to Incident | Coordinator authorized; report eligible |
| Under Review | Reject | Coordinator | Rejected | Coordinator authorized |
| Linked to Incident | Add clarification | Reporter | Linked to Incident | Clarification becomes separate linked update; original state unchanged |
| Rejected | Add clarification | Reporter | Rejected | Clarification may be recorded if allowed, but does not reopen automatically |

**Invalid transitions:** Reporter verifies/rejects; Rejected → Verified without explicit future scope-approved reopening; deletion/overwrite of original report; assignment/resource reservation directly from Under Review/Rejected.

## 13.2 Canonical Incident

**Initial state:** `Unverified` when represented before decision, then `Verified` on authorization  
**Final states:** `Partially Resolved`, `Resolved`, `Cancelled`

| Current state | Action | Actor | Next state | Condition |
|---|---|---|---|---|
| Unverified | Verify | Coordinator | Verified | Source report reviewed |
| Verified | Create valid commitment/task | Coordinator | Response Active | Reservation/task requirements satisfied |
| Response Active | Confirm partial outcome | Coordinator | Partially Resolved | Explicit remainder exists |
| Response Active | Confirm full outcome | Coordinator | Resolved | No unexplained remainder |
| Partially Resolved | Complete remaining response | Coordinator | Resolved | Remaining quantity/outcome reconciled |
| Verified / Response Active | Cancel | Coordinator | Cancelled | Allowed reason and resource/task handling complete |

**Invalid transitions:** Unverified → Response Active/Resolved; Response Active → Resolved with unresolved quantity; Resolved → Active without a formally scoped reopening capability; Reporter/Responder verifies, cancels, or resolves incident.

## 13.3 Resource Quantity

**Initial state:** `Available`  
**Final states for a committed unit:** `Delivered`, `Released`, `Returned/Exception Resolved`

| Current state | Action | Actor | Next state | Condition |
|---|---|---|---|---|
| Available | Reserve | Coordinator | Reserved | Quantity positive and available; incident Verified |
| Reserved | Release/cancel | Coordinator | Available/Released | Commitment no longer needed; reason recorded |
| Reserved | Dispatch | Responder | In Transit | Task Accepted; assigned quantity valid |
| In Transit | Record delivered portion | Responder | Delivered for reported portion | Quantity ≤ in-transit |
| In Transit | Record exception/return | Responder/Coordinator confirms | Exception/Returned | Explicit remainder/reason |
| Exception/Returned | Release or follow-up handling | Coordinator | Available/Released or remains explicit exception | Locked prototype path chosen consistently |

**Invalid transitions:** Available → Delivered; Reserved → Delivered without dispatch; In Transit → Available without return/release; any transition causing negative, duplicate, or unaccounted quantity.

## 13.4 Task

**Initial state:** `Offered / Pending Acknowledgement`  
**Final states:** `Partially Completed`, `Completed`, `Failed`, `Cancelled`, `Declined` (P1 recovery may re-offer)

| Current state | Action | Actor | Next state | Condition |
|---|---|---|---|---|
| None | Create/offer | Coordinator | Offered / Pending | Verified incident and valid commitment |
| Offered / Pending | Accept | Designated Responder | Accepted | Task still offered to actor |
| Offered / Pending | Decline | Designated Responder | Declined | Valid actor; P1 handles reassignment if built |
| Accepted | Dispatch/start | Designated Responder | Dispatched / In Progress | Reservation valid |
| Dispatched / In Progress | Submit full outcome | Designated Responder | Completed pending/with Coordinator confirmation | Delivered quantity equals required reconciled amount |
| Dispatched / In Progress | Submit partial outcome | Designated Responder | Partially Completed | Delivered < dispatched; exception/remainder supplied |
| Dispatched / In Progress | Submit failure | Designated Responder | Failed | Reason supplied; resource not marked delivered |
| Offered/Accepted | Cancel | Coordinator | Cancelled | Associated reservation handled; no completed delivery |

**Invalid transitions:** Offered → Dispatched without acceptance; Accepted → Completed without dispatch/outcome; wrong responder accepts/updates; Completed → Pending; concurrent accepted owners; partial outcome → full closure with unexplained remainder.

## 13.5 Coordination Update

**Initial state:** `Submitted`  
**Final states:** `Visible/Linked`, `Superseded`

| Current state | Action | Actor | Next state | Condition |
|---|---|---|---|---|
| None | Submit permitted update | Reporter/Coordinator/Responder | Submitted → Visible/Linked | Actor authorized for report/task and input valid |
| Visible/Linked | Correct | Same/authorized actor | Superseded + new Visible/Linked update | Original retained; correction attributable |

**Invalid transitions:** Silent overwrite/delete; update attached to unrelated unauthorized record; free-floating general chat thread.

## 13.6 Freshness and Map Feature

Freshness: `Fresh → Stale → Reconfirmed/Fresh` if P1 FR-023 is implemented. Stale may remain visible and is not itself an error.  
Map feature: has no independent lifecycle; it mirrors incident/resource state. Any map-only state contradicting the underlying record is invalid.

---

# 14. Permission Requirements

| Capability | Role | Allowed? | Conditions |
|---|---|:---:|---|
| Submit new report | Reporter | Yes | Required inputs valid |
| View own receipt/status | Reporter | Yes | Own valid prototype reference/context only |
| Add clarification | Reporter | Yes | Own report; valid non-empty input |
| View other reports or operational stock | Reporter | No | No exception in prototype |
| Review source reports | Coordinator | Yes | Authorized coordinator context |
| Verify/reject incident | Coordinator | Yes | Report Under Review |
| Reserve/release resource | Coordinator | Yes | Verified incident; valid quantity/state |
| Create/offer task | Coordinator | Yes | Valid incident/commitment/responder |
| Accept/decline task | Coordinator | No | Coordinator cannot impersonate acknowledgement |
| Accept/decline assigned task | Designated Responder | Yes | Task Offered to that actor |
| View full resource pool | Responder | No | May view only assigned quantity/context |
| Dispatch/update assigned task | Designated Responder | Yes | Task accepted and transition valid |
| Update another responder’s task | Responder | No | Always denied |
| Confirm/reconcile outcome | Coordinator | Yes | Outcome exists and quantities consistent |
| Mark own submitted outcome as independently confirmed | Responder | No | Coordinator confirmation is locked prototype decision |
| View full audit timeline | Coordinator | Yes | Authorized operational record |
| Delete critical audit/history | Any role | No | No product capability |
| Interact with full operational map | Coordinator | Yes | Restricted operational view |
| View assigned location context | Responder | Yes | Only for assigned task if included |
| Reset demo scenario | End-user roles | No | P1 test support only, outside normal product role actions |

Authorization denial must occur even if a user directly attempts an action not exposed by their interface.

---

# 15. Input Requirements

| Input | Source | Required? | Format / constraint | Validation | Failure response |
|---|---|:---:|---|---|---|
| Incident location | Reporter | Yes | Stored geographic point or approved manual/seeded location; must be within prototype’s representable map context | Present and interpretable; reject missing/invalid coordinate | Explain and request correction; no committed report |
| Incident type | Reporter | Yes | One value from locked controlled incident-family list | Must be recognized value | Reject and retain entered context where safe for correction |
| Reporter severity | Reporter | Yes | One value from prototype controlled severity scale; explicitly reporter-supplied, not authoritative priority | Must be recognized value | Reject invalid value |
| Incident description | Reporter | Yes | Concise non-empty text within prototype-supported limit | Non-empty; safe basic validation | Reject empty/invalid; no report |
| Contact/reference | Reporter | Yes at minimum defined by prototype | Synthetic safe text; no real victim PII | Required format defined without collecting unnecessary data | Reject invalid; explain synthetic/demo expectation |
| Clarification | Reporter | Required when action used | Non-empty text linked to own report | Ownership and non-empty | Deny/retain no false success |
| Verification decision | Coordinator | Yes | Verify or Reject | Role and current state | Deny invalid decision |
| Decision/rejection reason | Coordinator | Required where interaction calls for rejection/correction | Concise text | Non-empty when required | Block action until supplied |
| Reservation quantity | Coordinator | Yes | Positive integer in relief kits | ≤ current available; incident Verified | Reject with shortage/conflict/current balance context |
| Assigned responder | Coordinator | Yes | One prepared responder identity | Exists and eligible within synthetic fixture | Reject invalid selection |
| Task instructions | Coordinator | Yes | Concise non-empty structured text | Non-empty | Reject task creation |
| Dispatch quantity | Responder | Yes | Positive integer; not greater than reserved/assigned quantity | Task Accepted; quantity consistent | Reject without movement |
| Outcome type | Responder | Yes | Full, Partial, or Failed | Compatible with task state and quantities | Reject invalid action |
| Delivered quantity | Responder | Yes for full/partial | Integer from 0 through dispatched quantity | Cross-check dispatched/remainder | Reject inconsistent outcome |
| Exception/reason | Responder | Required for partial/failed | Concise non-empty text | Present when outcome not full | Reject incomplete outcome |
| Coordinator outcome decision | Coordinator | Yes | Confirm partial/full/failure/follow-up according to state | Quantities reconcile | Reject false closure |
| Map interaction/filter | Coordinator | Optional | Pan/zoom/select and locked simple state/type filter values | Recognized operation/value | Ignore/reject invalid filter without changing records |
| P1 duplicate link decision | Coordinator | If P1 used | Link, keep separate, unlink | Human decision; reports exist | Deny invalid relationship |
| P1 reconfirmed quantity/source | Coordinator | If P1 used | Non-negative integer + source/time/reason | Authorized and internally consistent | Leave stale on failure |

No media upload, voice input, external message address, payment data, free-text AI prompt, route request, or GPS stream is an authorized input.

---

# 16. Validation Rules

| Classification | Rule | Trigger | Valid condition | Invalid behavior |
|---|---|---|---|---|
| Required field | Location/type/severity/description/reference present | Report submission | All required values supplied | Reject; create no report |
| Format | Location interpretable by map context | Report submission/edit attempt | Valid supported point/location | Reject with correction guidance |
| Controlled value | Type/severity/outcome/action is in approved list | Relevant input | Recognized value | Reject unknown value |
| Range | Quantities are whole numbers within permitted balance | Reserve/dispatch/outcome/reconfirm | Non-negative/positive as context requires; within current state | Reject without partial change |
| Cross-field | Full outcome quantity equals reconciled committed/dispatched amount | Full outcome/confirmation | No unexplained remainder | Reject full completion |
| Cross-field | Partial outcome includes delivered quantity and exception/remainder | Partial outcome | Delivered < dispatched and explicit remainder/reason | Reject incomplete partial |
| Business | Reservation only for Verified incident | Reservation | Incident Verified/Response Active | Deny |
| Business | Task only after valid commitment | Task creation | Valid reservation linked | Deny |
| State | Dispatch only after acceptance | Dispatch | Task Accepted | Deny |
| State | Outcome only after dispatch/in-progress | Outcome submission | Task Dispatched/In Progress | Deny |
| Permission | Role and record ownership permit action | Every protected action | Section 14 allows actor/action/record | Deny; no restricted data leakage |
| Duplicate | Repeated acceptance/outcome does not create duplicate transitions | Repeated request | Action is idempotent or rejected based on current state | Show current state; no duplicate movement |
| Concurrency | Current availability checked at commitment time | Reservation | Quantity still available | Reject losing/conflicting request |
| Provenance | Required source/time/actor metadata present | Persist critical record/event | Metadata available | Do not present incomplete critical action as fully successful |
| Map consistency | Map record corresponds to underlying incident/resource ID and current state | Map refresh/select | Shared state resolves | Show unavailable/stale/error, not invented marker state |
| P1 duplicate | Human decides link/unlink; no auto-merge | Duplicate review | Coordinator confirms | Keep separate by default |

---

# 17. Error and Failure Behavior

| Failure | System behavior | User feedback | Data/state impact | Recovery |
|---|---|---|---|---|
| Invalid required input | Reject before successful submission | Identify invalid/missing information | No committed record/change | Correct and retry |
| Unsupported controlled value | Reject | State allowed values without technical detail | No change | Choose valid value |
| Unauthorized action/access | Deny; expose no restricted data | Explain action not permitted | No state change; critical attempt may be audited | Use authorized role/action |
| Record not found | Return no false data | Explain record unavailable/not found | No change | Check reference or return to authorized list |
| Stale resource | Show stale/unknown status; do not imply freshness | Show source/time and caution | No automatic update | P1 reconfirm if available; otherwise acknowledge limitation |
| Insufficient stock | Reject reservation | Show requested versus currently available as permitted | No reservation/negative balance | Reduce quantity or wait/release existing commitment |
| Concurrent reservation conflict | Commit one valid request; reject other | Explain stock changed/conflict | Existing valid reservation preserved | Refresh and choose valid next action |
| Duplicate state action | Reject or show already-applied current state without repeating movement | Explain current state | No duplicate audit/quantity movement beyond appropriate record of attempt | Continue from current state |
| Impossible transition | Reject | Explain required preceding state | No change | Complete valid prerequisite |
| Wrong task actor | Deny | Explain task is not assigned to actor | No change | Use designated responder/coordinator |
| Persistence failure | Treat action as failed | Explain save did not complete | No partial cross-record success | Retry after system recovers; verify current state first |
| Map/base failure | Preserve operational data; map indicates unavailable | Explain geographic view unavailable | No operational state change | Retry; P1 list fallback if built/local map backup for demo |
| Connected update delay/failure | Do not show conflicting state as current | Show loading/stale/retry state | Persisted truth remains authoritative | Reload/refetch; if still failing, stop critical decision |
| Partial outcome missing remainder | Reject | Explain quantities do not reconcile | No outcome change | Correct delivered/remainder/reason |
| Outcome exceeds dispatch | Reject | Explain allowed maximum/current dispatch | No change | Correct quantity |
| Audit write failure for critical action | Do not present action as fully complete; product should preserve consistency | Explain action failed or status uncertain | No accepted un-audited critical state | Retry/restore known state; treat as critical defect |
| External base-map/service failure | Decouple from core workflow | Show external context unavailable | No state loss | Local/prepared context or P1 list fallback |
| AI failure | Not applicable; no AI exists | No AI message | No impact | Deterministic/human workflow |
| Demo reset failure (P1) | Abort reset/verification | Show scenario not ready | Do not proceed assuming clean state | Repair and rerun invariant check |

---

# 18. Empty, Loading, Success, Error, and Retry States

| Workflow / surface | Empty meaning | Loading behavior | Success evidence | Error understanding | Retry |
|---|---|---|---|---|---|
| Reporter intake | No draft/input yet | Submission is being validated/saved; duplicate submission action prevented while unresolved | Reference and Submitted/Under Review state | Which required/valid data failed or save failed | Yes after correction/confirmed failure |
| Reporter status | No accessible report for current reference/context | Fetching current permitted state | Reference, status, last visible update | Not found, unauthorized, or temporarily unavailable distinguished without leaking data | Yes for temporary failure |
| Coordinator report queue | No submitted reports means no items awaiting review | Loading current shared state | Current reports and states visible | Data unavailable/stale, not “zero reports” | Yes |
| Incident review | Report exists but no decision yet | Applying verify/reject | Updated state and audit event | Invalid role/state or save failure | Yes after resolving cause |
| Resource tracker | No resource record means unavailable data, not zero stock | Loading quantities/events | Reconciled state + metadata | Missing, stale, conflict, or system failure | Refresh; P1 reconfirm if applicable |
| Reservation | No reservation yet | Commitment pending; repeated action prevented | Reservation reference and updated balance | Insufficient stock/conflict/invalid state | Refresh, adjust, retry |
| Responder task queue | No offered/active tasks for responder | Loading assigned tasks | Current task with status/instructions | Retrieval failure distinct from no tasks | Yes |
| Task acknowledgement | Task pending before action | Saving accept/decline | Accepted/Declined with time | Wrong actor/state/save failure | Retry only if task still Offered |
| Task execution/outcome | No updates means accepted/active task has not progressed | Saving dispatch/outcome | New task/resource state and linked update | Invalid quantity/state or failure to save | Correct/retry after checking current state |
| Interactive map | No records means empty map context/legend, not error | Loading renderer/markers | Selectable incident/resource markers with current summaries | Map/base unavailable or marker data failed | Retry; P1 list/local fallback |
| Audit timeline | No events for an impossible new context; submitted record should have at least creation event | Loading events | Ordered attributable events | Audit unavailable/incomplete is critical | Retry; do not claim traceability |
| P1 duplicate review | No candidates means none found, not proof no duplicate exists | Evaluating deterministic cues | Candidate reasons shown | Feature unavailable | Skip without blocking core |
| P1 reset/invariant | Scenario not initialized | Reset/check running | Known start state and pass result | Failure blocks reliable demo | Repair/rerun |

This section defines behavior only; UI/UX determines visual treatment.

---

# 19. Data Requirements — Product Level

| Conceptual entity | Purpose | Key information | Created by | Modified by | Used by |
|---|---|---|---|---|---|
| **Prototype User/Role Context** | Identify permitted actor | Fictional identity, role, display label, active status | Demo fixture | Test support only | Authorization and audit |
| **Source Report** | Preserve original community observation | Reference, reporter source, location, type, reporter severity, description, time, status | Reporter | Original not overwritten; linked clarifications separate | Coordinator review, reporter status, map |
| **Coordination Update** | Carry scoped clarification/instructions/progress/exception | Linked report/incident/task, actor, time, update type, concise text | Reporter/Coordinator/Responder | Superseded by new event, not overwritten | Relevant role views, audit |
| **Canonical Incident** | Govern verified operational need | Identifier, linked reports, verified location/type/severity/priority if explicitly human-decided, verification actor/time, state | Coordinator/system after verification | Coordinator through valid lifecycle | Map, reservation, task, status, audit |
| **Resource Pool** | Represent one countable relief-kit source | Resource name/unit, location, synthetic source, last-updated/freshness, quantity state | Demo fixture/Coordinator P1 reconfirm | Coordinator through permitted actions/system events | Coordinator, task, map, audit |
| **Resource Commitment/Movement** | Account for quantity changes | Incident/task link, quantity, from/to state, actor, time, reason | Coordinator/Responder/System | Corrective event only | Resource tracker, reconciliation, audit |
| **Task** | Transfer and track responsibility | Incident/resource link, responder, instructions, assigned quantity, state, offer/accept/dispatch/outcome times | Coordinator | Designated Responder and Coordinator within permissions | Responder, Coordinator, reporter limited status, audit |
| **Outcome** | Record execution result | Task, outcome type, delivered quantity, remainder/exception, responder report, coordinator decision | Responder | Coordinator confirms/follows up through separate event | Reconciliation, incident state, audit |
| **Audit Event** | Reconstruct critical decisions | Event type, actor, time, target, before/after state or quantity, reason/reference | System from actions | Not silently modified/deleted | Coordinator/judge demo |
| **Map Feature Projection** | Display incident/resource geography | Underlying record ID, geometry, permitted summary/state | System from Incident/Resource | Only via underlying record | Coordinator map |
| **P1 Duplicate Link** | Relate source reports without deleting them | Report IDs, canonical incident, reasons, decision actor/time, active/reversed state | Coordinator/System | Coordinator reverses through audit | Coordinator review |

No chat room, notification delivery record, AI recommendation, route, vehicle, payment, donation, analytics aggregate, or production organization entity is required.

---

# 20. Source-of-Truth Rules

| Information | Prototype source of truth | Who can change it | When / uncertainty |
|---|---|---|---|
| User role/context | Prepared local identity/role fixture | Demo/test setup, not normal users | Production IAM owner unknown |
| Original report | Persisted Source Report | No actor silently changes original; reporter adds clarification | Truth of real-world claim remains unverified |
| Incident verification/state | Canonical Incident after Coordinator action | Coordinator through valid transitions | Real authority/SOP is an assumption |
| Incident operational location | Verified/corrected incident record with preserved source | Coordinator if correction is authorized by workflow; prototype may use reporter location | Real location accuracy not proven |
| Resource type/unit | Synthetic Resource Pool | Demo fixture; P1 reconfirm may update quantity/source | Only relief kits in scope |
| Physical opening/current inventory | Synthetic fixture | Coordinator represents custodian for prototype | Not authoritative outside demo |
| Reservation/commitment | Prototype ledger | Authorized Coordinator via FR-014/release | Production owner must be decided before integration |
| Task offer/acknowledgement | Prototype Task | Coordinator offers; designated Responder accepts/declines | Real command protocol unvalidated |
| Dispatch/outcome report | Prototype Task/Outcome | Designated Responder reports | It is an actor report, not GPS/physical proof |
| Confirmed/reconciled outcome | Coordinator decision plus ledger | Authorized Coordinator | Real confirmer/evidence policy unvalidated |
| Audit history | Generated Audit Events | No user may delete; corrections append events | Production tamper/retention policy not claimed |
| Map marker state | Projection of Incident/Resource | Changed only by underlying governed records | Map never overrides source record |
| Official warning/context | External authority if ever shown | Not changed by prototype | P2 sample is recorded and non-authoritative for current events |

---

# 21. AI / ML Product Requirements

**Not applicable. Scope Lock authorizes no AI capability.**

- No AI requirement ID is created.
- No model output may classify, prioritize, verify, merge, allocate, dispatch, translate, summarize, forecast, or close an incident.
- Deterministic duplicate cues in P1 FR-021 are not AI and require human decision.
- Any downstream proposal for AI must raise a `SCOPE CONFLICT` and may not be implemented from this PRD.

---

# 22. AI Trust Boundary

## AI MAY

Nothing. No AI component exists in the approved prototype.

## AI MAY RECOMMEND

Nothing. Human decisions and deterministic product rules cover the complete workflow.

## AI MUST NOT

- Treat a report as verified.
- Select severity/priority.
- Merge reports.
- Reserve resources.
- Choose or assign responders.
- Mark dispatch/delivery/closure.
- Translate or summarize operational content.
- Generate a user-facing chatbot answer.

## When AI fails

Not applicable. The locked deterministic/manual workflow is the primary and only path, not a fallback.

---

# 23. External System Behavior

| External system / context | Real / Simulated | Information in | Information out | Failure behavior |
|---|---|---|---|---|
| Permitted/prepared base-map context | Real external data or prepared local context | Geographic background | None | Show map-context failure; preserve operational records; use local prepared context or P1 list fallback |
| Agency inventory/ERP | **SIMULATED IN PROTOTYPE** | Synthetic opening relief-kit balance/source metadata | No real writeback | No external call occurs; disclose simulation |
| Volunteer/identity directory | **SIMULATED IN PROTOTYPE** | Prepared fictional responder identity/role | No real directory update | Prepared accounts remain local; disclose simulation |
| Production identity provider | **SIMULATED/DEFERRED** | Prepared local role contexts substitute | None | No federation claim |
| Official alert/CAP source | **DEFERRED; P2 recorded sample only** | Licensed recorded context if approved | None | Omit without impact; label recorded/not live |
| Government GIS/satellite layer | **DEFERRED** | None | None | Omit |
| SMS/email/push/WhatsApp | **NOT INTEGRATED** | None | None | In-app task/status behavior is authoritative prototype path |
| GPS/vehicle telemetry | **NOT INTEGRATED** | None | None | Human-entered dispatch/outcome; no live-location claim |
| Routing/road closure | **NOT INTEGRATED** | None | None | Show location only; no route recommendation |
| AI/model provider | **REMOVED** | None | None | No dependency or fallback required |

No external programmatic contract or API endpoint is specified in this PRD.

---

# 24. Notification Requirements

Only in-application workflow awareness is authorized.

| Trigger | Recipient | Information | Required? |
|---|---|---|:---:|
| Successful incident submission | Reporter | Reference and Submitted/Under Review status | Yes |
| Report verification/rejection/status change | Reporter | Public-safe limited status when reporter checks their report | Yes; no external delivery requirement |
| Reporter clarification added | Coordinator | Linked update visible in incident context | Yes |
| Task offered | Designated Responder | Incident/task context, assigned quantity, instructions, Pending Acknowledgement | Yes, in application |
| Task accepted/declined | Coordinator | Ownership result and time | Yes, in application |
| Progress/exception/outcome submitted | Coordinator | Structured update and resulting state | Yes, in application |
| Reservation conflict/insufficient stock | Acting Coordinator | Failure and current permitted balance/context | Yes, immediate operation result |
| Coordinator outcome confirmation | Reporter/Responder | Their permitted current status on next view/update | Yes, in application |

Email, SMS, push, WhatsApp, voice, and external delivery receipts are explicitly not requirements.

---

# 25. Auditability

| Event | Actor | What must be recorded | Why |
|---|---|---|---|
| Report submitted | Reporter | Report reference, actor/source, time, initial state | Establish origin and receipt |
| Clarification added | Reporter | Linked report, actor, time, update text/type | Preserve correction without overwriting source |
| Report verified | Coordinator | Report/incident, actor, time, before/after state | Establish authority gate |
| Report rejected | Coordinator | Report, actor, time, reason, state | Explain non-action |
| Resource reserved | Coordinator | Incident/resource, quantity, actor, time, before/after balance | Prove commitment |
| Reservation failed/conflicted | Coordinator/System | Requested quantity, time, outcome/reason, affected pool | Demonstrate overcommitment protection |
| Reservation released/cancelled | Coordinator | Quantity, actor, time, reason, before/after state | Explain returned availability |
| Task offered | Coordinator | Task, responder, quantity/context, instructions reference, time | Establish responsibility offer |
| Task accepted/declined | Responder | Task, actor, time, result | Prove ownership transfer or lack of it |
| Dispatch recorded | Responder | Task/resource, quantity, actor, time, state change | Distinguish movement from delivery |
| Progress/exception added | Responder | Task, actor, time, update/exception type and text | Preserve field context |
| Outcome submitted | Responder | Full/partial/failed, delivered quantity, remainder/reason, time | Record reported execution |
| Outcome confirmed/follow-up | Coordinator | Decision, actor, time, reconciled quantities, resulting states | Establish accountable closure/continuation |
| Invalid critical transition/permission denial | System/actor | Actor, time, action type, reason where safe | Demonstrate protection; avoid sensitive leakage |
| P1 duplicate link/unlink | Coordinator | Report IDs, decision, cues/reason, actor/time | Preserve source relationship history |
| P1 resource reconfirmation | Coordinator | Old/new quantity/source/freshness, actor/time | Explain freshness change |

The audit requirement is product-level. Storage mechanism, immutability technology, and retention policy belong to later technical/production design.

---

# 26. Non-Functional Requirements

| ID | Category | Requirement | Rationale | Prototype expectation | Production expectation |
|---|---|---|---|---|---|
| **NFR-001** | Reliability | The critical demo path shall run repeatedly from a known state without corrupting quantities or transitions. | Demo credibility | Rehearsed local run; P1 reset/check preferred | Availability/support objectives, failover, DR |
| **NFR-002** | Persistence | Mandatory/P0 records shall remain available across navigation, reload, and role changes in the demo. | Prove full-stack shared state | Local durable persistence | Managed durable storage, backups, migrations, retention |
| **NFR-003** | Data integrity | Resource balances and task/incident relationships shall remain reconciled after success and rejected operations. | Core differentiator | Negative/overcommitted/unaccounted quantities prohibited | Cross-system reconciliation and stronger integrity controls |
| **NFR-004** | Connected update behavior | Successful submissions/state changes shall become visible in relevant views during the connected running prototype without manual database edits. | “Real-time” prototype interpretation | Update or safe refresh/reload from shared state; no arbitrary latency claim | Measured latency/freshness targets and monitoring |
| **NFR-005** | Failure visibility | The product shall distinguish empty, loading, stale, failed, and successful states. | Prevent false confidence | Required behavior in Section 18 | Operational observability and service health |
| **NFR-006** | Security | Protected actions shall enforce real product-level role authorization and transition rules. | Accountability | Prepared local identities; authorization not UI-only | IAM/MFA, lifecycle, security review, monitoring |
| **NFR-007** | Privacy | The prototype shall use synthetic identities/contact/location details and expose only role-permitted information. | Avoid real-person harm | No real victim/responder PII | Legal basis, classification, retention/deletion, privacy operations |
| **NFR-008** | Accessibility | Core actions shall be keyboard-reachable, labelled, readable, and not communicate status by color alone. | Community/emergency usability | Basic manual verification | Chosen WCAG target and assistive-technology audit |
| **NFR-009** | Responsiveness | Reporter and Responder core actions shall remain usable at a mobile-width browser; Coordinator shall work on the prepared demo device. | Target roles may use different devices | Functional responsive behavior, not native app | Representative device/performance testing |
| **NFR-010** | Browser support | The prototype shall work in the prepared current browser; one additional current browser check is desirable only if it does not block core. | Demo reliability | Prepared browser is authoritative demo environment | Supported-browser matrix/regression |
| **NFR-011** | Degraded behavior | External map/base failure shall not corrupt operational state or falsely complete actions. | Dependency safety | Visible map error; local/prepared context; P1 list fallback if built | Validated offline/degraded SOP and conflict handling |
| **NFR-012** | Auditability | Critical actions shall generate attributable events sufficient to reconstruct the locked scenario. | Judge and operational trust | Section 25 events present | Protected logs, retention, review/export policy |
| **NFR-013** | Recoverability | A failed operation shall preserve the last valid state and allow safe retry after current state is checked. | Avoid compounded errors | No partial commit; clear retry path | Recovery procedures, backup/restore, incident response |
| **NFR-014** | Dependency isolation | Critical demo completion shall not require internet, cloud-only service, SMS, GPS, government API, or AI. | Prevent live-demo fragility | Local critical path | Approved, monitored dependencies with fallbacks |

No unsupported throughput, uptime, or response-time number is specified because the organizer supplied no evidence-based threshold.

---

# 27. Security and Privacy Requirements

| Requirement | Why needed | Prototype | Production |
|---|---|---|---|
| Actor identification | Attribute critical decisions | Prepared fictional accounts/role context | Real identity proofing and lifecycle |
| Role authorization | Prevent reporter/responder from allocating or closing | Enforce Section 14 on protected actions | Least-privilege policy, organization scope, periodic review |
| State authorization | Prevent valid role from taking invalid action | Enforce lifecycle prerequisites | Policy-managed workflows and exception governance |
| Input validation | Prevent invalid/corrupt operational state | Enforce Section 15/16 | Hardened validation, abuse protection, security testing |
| Synthetic PII | Avoid exposing victims/responders | Only fictional contact/location/identity data | Data minimization, lawful basis, consent where applicable |
| Restricted operational information | Protect stock/responder/internal details | Reporter sees only own limited status; responder sees assigned context | Fine-grained access, sensitive-location policy, access logging |
| Audit history | Preserve accountability | Critical events with actor/time/change; no user delete | Tamper resistance, retention, audit review |
| Session behavior | Avoid role confusion during demo | Active role clearly attributable; role change must not retain unauthorized view/action | Secure sessions, timeout, revocation, MFA, account recovery |
| Secret handling | Avoid exposing credentials | No secrets in user-visible content/client configuration where avoidable | Managed secret/key rotation and access controls |
| Failure privacy | Avoid leaking whether another person/record exists | Unauthorized/not-found responses reveal no protected details | Formal secure-error policy |
| Data retention/deletion | Crisis data should not persist accidentally | Synthetic demo data; reset is test-only | Jurisdiction/operator-approved retention, correction, deletion, legal hold |
| Public map safety | Prevent exposure of exact sensitive sites | No real sensitive locations; operational map restricted to Coordinator | Precision tiers, aggregation/redaction, threat review |

The prototype does not claim production-grade security or regulatory compliance.

---

# 28. Acceptance Criteria

Every Mandatory Organizer and P0 FR has testable acceptance criteria below.

## FR-001 — Submit Incident Report

- **AC-FR001-01:** Given a Reporter provides valid location, type, severity, description, and synthetic reference data, when the report is submitted, then exactly one report is persisted in `Submitted/Under Review` and a unique reference is returned.
- **AC-FR001-02:** Given a required field is missing or invalid, when submission is attempted, then the system identifies the invalid input, creates no committed report, and allows correction.
- **AC-FR001-03:** Given submission persistence fails, when the Reporter submits, then no success/reference is shown and the Reporter can retry after the failure is resolved.

## FR-002 — Report Receipt and Limited Reporter Status

- **AC-FR002-01:** Given a successfully submitted report, when its Reporter opens the status, then the reference, permitted current state, and last visible update are shown.
- **AC-FR002-02:** Given another Reporter or invalid context attempts to access the report, when status is requested, then restricted details are not disclosed and access is denied/not found safely.
- **AC-FR002-03:** Given resource/responder/internal audit data exist, when the Reporter views status, then those restricted details are absent while the public-safe state remains accurate.

## FR-003 — View Resource Availability

- **AC-FR003-01:** Given the seeded pool begins with 20 available kits and no commitment, when the Coordinator views it, then available = 20 and reserved/in-transit/delivered reflect the seeded zero state with synthetic source and update metadata.
- **AC-FR003-02:** Given a valid reservation/distribution event occurs, when the resource is viewed again, then all state quantities reflect the persisted event and remain reconciled.
- **AC-FR003-03:** Given the resource record cannot be loaded, when the view is requested, then the product shows unavailable/error rather than displaying zero or a fabricated fresh count.

## FR-004 — Track Resource Distribution State

- **AC-FR004-01:** Given 20 kits are Reserved, when the accepted task dispatches 20, then Reserved decreases by 20 and In Transit increases by 20 without changing the accounted total.
- **AC-FR004-02:** Given 20 are In Transit, when 12 are validly recorded Delivered and 8 as an exception/remainder, then Delivered increases by 12 and exactly 8 remain explicitly accounted outside Delivered.
- **AC-FR004-03:** Given an action attempts to move more quantity than exists in the current state, when submitted, then it is rejected and every quantity remains at its prior valid value.

## FR-005 — Linked Reporter Clarification

- **AC-FR005-01:** Given the Reporter owns an existing report and enters non-empty clarification, when submitted, then a separate linked update with actor/time is persisted and visible to the Coordinator.
- **AC-FR005-02:** Given a clarification is added, when the original report is reviewed, then its original text remains unchanged.
- **AC-FR005-03:** Given an unauthorized Reporter or empty clarification, when submission is attempted, then it is rejected and no linked update is created.

## FR-006 — Create Task with Structured Instructions

- **AC-FR006-01:** Given a Verified incident, valid reservation, prepared Responder, assigned quantity, and instructions, when the Coordinator offers a task, then exactly one task is created as `Offered/Pending Acknowledgement` and linked to the incident/resource.
- **AC-FR006-02:** Given the incident is unverified or no valid commitment exists, when task creation is attempted, then no task is created and the unmet prerequisite is reported.
- **AC-FR006-03:** Given a task is offered, when viewed by a non-designated Responder, then the task cannot be accepted or modified.

## FR-007 — Submit Responder Progress, Exception, and Outcome

- **AC-FR007-01:** Given the designated Responder owns an Accepted task, when dispatch/progress is submitted with valid data, then the update is persisted, visible to the Coordinator, and the allowed state changes occur.
- **AC-FR007-02:** Given a partial outcome, when the Responder supplies delivered quantity and a non-empty exception/remainder reason, then the update is accepted and marked partial rather than complete.
- **AC-FR007-03:** Given the wrong actor, invalid task state, or invalid quantity, when an update is attempted, then it is rejected with no task/resource movement.

## FR-008 — Interactive Operational Map

- **AC-FR008-01:** Given incident and resource records with locations exist, when the Coordinator opens the map, then both record types are visible as selectable markers in their stored locations.
- **AC-FR008-02:** Given the Coordinator pans, zooms, selects, or applies the locked simple filter, when the interaction occurs, then the map responds without modifying operational state.
- **AC-FR008-03:** Given a marker is selected, when its summary is shown, then it includes the permitted current state and freshness/simulation context and does not rely on color alone.
- **AC-FR008-04:** Given the map/base context fails, when the map is requested, then the failure is explicit and no incident/resource record is lost or changed.

## FR-009 — Connected Map State Updates

- **AC-FR009-01:** Given the map is running and a Reporter successfully submits a new incident, when the Coordinator’s connected state refreshes, then the incident marker appears without manual database editing.
- **AC-FR009-02:** Given an incident/resource state changes, when the map state refreshes, then the marker/summary reflects the same persisted state as the queue/ledger.
- **AC-FR009-03:** Given a refresh/update fails, when the map cannot confirm current data, then it indicates loading/stale/error and does not display a contradictory value as current.

## FR-010 — Persist Shared Operational Records

- **AC-FR010-01:** Given a successful Mandatory/P0 action, when the user navigates away, reloads, or changes to another prepared role, then the authorized view reads the persisted current state.
- **AC-FR010-02:** Given a state-changing operation fails before completion, when the system reports failure, then no partial cross-entity change is presented as committed.
- **AC-FR010-03:** Given report, incident, resource, task, outcome, and audit records form the core journey, when reloaded, then their identifiers/relationships remain intact.

## FR-011 — Verify or Reject Incident Report

- **AC-FR011-01:** Given an Under Review report and authorized Coordinator, when Verify is selected, then the report links to a Verified canonical incident and actor/time are audited.
- **AC-FR011-02:** Given an Under Review report and authorized Coordinator, when Reject with required reason is selected, then the report becomes Rejected and cannot be reserved/assigned.
- **AC-FR011-03:** Given a Reporter/Responder or incompatible current state, when verification/rejection is attempted, then the action is denied and state remains unchanged.

## FR-012 — Enforce Role Authorization

- **AC-FR012-01:** Given a Reporter, when reservation, verification, task assignment, or full audit access is attempted, then the action/access is denied and restricted data is not exposed.
- **AC-FR012-02:** Given a Responder, when opening inventory or another responder’s task is modified, then the action is denied with no state change.
- **AC-FR012-03:** Given an authorized Coordinator, when a permitted action’s business/state prerequisites are satisfied, then role authorization does not prevent the action.
- **AC-FR012-04:** Given a protected action is attempted directly rather than through a visible control, when authorization is evaluated, then the same denial rules apply.

## FR-013 — Enforce Valid State Transitions

- **AC-FR013-01:** Given a task is Offered but not Accepted, when dispatch is attempted, then the system rejects the transition and resource remains Reserved.
- **AC-FR013-02:** Given an incident is Unverified, when reservation/task creation is attempted, then the system rejects the transition.
- **AC-FR013-03:** Given an operation is repeated after the entity moved to an incompatible state, when repeated, then no duplicate transition or quantity movement occurs.
- **AC-FR013-04:** Given all lifecycle prerequisites are satisfied, when a valid transition is requested by the correct actor, then exactly that next state is persisted.

## FR-014 — Atomically Reserve Available Resource

- **AC-FR014-01:** Given 20 kits Available and a Verified incident, when an authorized Coordinator reserves 20, then Available becomes 0 and Reserved becomes 20 in one accepted operation.
- **AC-FR014-02:** Given 20 kits total and two competing requests whose combined quantity exceeds 20, when both attempt commitment, then no more than 20 is reserved, at least one conflicting request is rejected, and the balance never becomes negative.
- **AC-FR014-03:** Given requested quantity is zero, negative, non-integer, or greater than current availability, when reservation is attempted, then it is rejected with no balance change.
- **AC-FR014-04:** Given an existing valid reservation, when a competing request fails, then the valid reservation remains intact and the failed result is observable/auditable.

## FR-015 — Acknowledge Assignment Ownership

- **AC-FR015-01:** Given a task is Offered to Responder A, when A accepts, then state becomes Accepted, A is the acknowledged owner, actor/time are recorded, and dispatch becomes eligible.
- **AC-FR015-02:** Given the same Offered task, when A declines, then state becomes Declined/unowned and Coordinator sees the result; no dispatch is allowed.
- **AC-FR015-03:** Given Responder B or the Coordinator attempts to accept for A, when the action is submitted, then it is denied and task remains Offered.
- **AC-FR015-04:** Given the task is already Accepted/Cancelled/Completed, when acceptance is repeated, then no second ownership event is created.

## FR-016 — Record Dispatch and Outcome State

- **AC-FR016-01:** Given an Accepted task with 20 Reserved kits, when the designated Responder dispatches 20, then task becomes Dispatched/In Progress and 20 move Reserved → In Transit.
- **AC-FR016-02:** Given a task is only Offered, when dispatch is attempted, then it is rejected and resource state does not move.
- **AC-FR016-03:** Given 20 In Transit, when a valid full/partial/failed outcome is submitted, then task moves to the matching outcome state without automatically treating all in-transit quantity as delivered.
- **AC-FR016-04:** Given the wrong actor or outcome quantity exceeds In Transit, when submitted, then the action is rejected and prior state remains valid.

## FR-017 — Reconcile Full, Partial, and Failed Outcomes

- **AC-FR017-01:** Given 20 kits were dispatched and 12 delivered, when the Responder submits Partial with an 8-kit exception and the Coordinator confirms it, then Delivered = 12 and exactly 8 remain explicitly unresolved/released/follow-up; task/incident are partial, not complete/resolved.
- **AC-FR017-02:** Given 20 dispatched and 20 validly delivered with no remainder, when the Coordinator confirms full outcome, then task becomes Completed and incident may become Resolved.
- **AC-FR017-03:** Given 12 of 20 delivered and 8 unexplained, when full completion is attempted, then it is rejected.
- **AC-FR017-04:** Given delivered quantity is negative or greater than dispatched, when outcome is submitted, then it is rejected with no reconciliation change.

## FR-018 — Display Provenance, Freshness, and Simulation Status

- **AC-FR018-01:** Given the synthetic resource pool is viewed, then it is explicitly identified as synthetic with its source and last-updated/freshness information.
- **AC-FR018-02:** Given an unverified report is viewed, then it is visibly identified as unverified and not presented as an official alert.
- **AC-FR018-03:** Given provenance or freshness is missing, then the product shows unknown/missing rather than assuming fresh/verified.
- **AC-FR018-04:** Given a P2 recorded external sample is shown, then it is labelled recorded/simulated and not live.

## FR-019 — Preserve Critical Audit Timeline

- **AC-FR019-01:** Given the critical scenario completes, when the Coordinator opens its timeline, then submission, verification, reservation, conflict result, task offer, acceptance, dispatch, partial outcome, confirmation/follow-up, actors, times, and relevant quantities are reconstructable.
- **AC-FR019-02:** Given a clarification or correction occurs, when history is inspected, then original and later event remain distinguishable; no silent overwrite occurred.
- **AC-FR019-03:** Given a user attempts to delete critical history, when requested, then the product offers no allowed action and history remains.
- **AC-FR019-04:** Given audit persistence fails for a critical state-changing action, when the action is attempted, then the product does not present a fully successful un-audited change.

## FR-020 — Maintain Cross-View State Consistency

- **AC-FR020-01:** Given 20 kits are Reserved, when Coordinator resource, task, audit, and map/detail views are checked, then each authorized view reflects the same commitment and identifier context.
- **AC-FR020-02:** Given the Responder records 12 delivered and 8 exception, when Reporter limited status, Coordinator views, and Responder task are refreshed, then permitted descriptions differ only by access level and do not contradict the partial state.
- **AC-FR020-03:** Given one view cannot load current state, when displayed, then it shows loading/stale/error rather than an authoritative value inconsistent with persisted truth.
- **AC-FR020-04:** Given the map is selected, when record detail is opened, then it resolves to the same underlying incident/resource state rather than a separately editable copy.

---

# 29. Organizer Requirement Acceptance

| PS ID | Requirement | Related FRs | Acceptance evidence | Demo evidence |
|---|---|---|---|---|
| **PS-R01** | Real-time incident reporting with location, type, severity | FR-001, FR-002, FR-009–012, FR-018, FR-020 | AC-FR001-01/02; AC-FR002-01/02; AC-FR009-01; AC-FR010-01; AC-FR011-01; AC-FR012-01; AC-FR018-02; AC-FR020-02 | Reporter submits live; reference appears; coordinator queue/map receive unverified report |
| **PS-R02** | Resource availability and distribution tracking | FR-003, FR-004, FR-014, FR-016–020 | AC-FR003-01/02; AC-FR004-01/02/03; AC-FR014-01/02/03; AC-FR016-01/03; AC-FR017-01/02/03; AC-FR018-01; AC-FR019-01; AC-FR020-01 | Reserve 20; competing request fails; dispatch 20; deliver 12; 8 remain explicit |
| **PS-R03** | Communication and task coordination among community, volunteers, agencies | FR-002, FR-005–007, FR-011–017, FR-019–020 | AC-FR002-01; AC-FR005-01/02; AC-FR006-01/02; AC-FR007-01/02; AC-FR011-01; AC-FR012; AC-FR013; AC-FR015; AC-FR016; AC-FR017; AC-FR019; AC-FR020 | Reporter status/clarification; Coordinator instructions; Responder acceptance/progress/exception/outcome; Coordinator confirmation |
| **PS-R04** | Interactive real-time geographic visibility | FR-008, FR-009, FR-018, FR-020 | AC-FR008-01/02/03/04; AC-FR009-01/02/03; AC-FR018; AC-FR020-04 | Selectable incident/resource markers update from shared state during lifecycle |

**Organizer requirements:** 4  
**Covered by PRD:** 4  
**Missing:** 0  
**Ambiguous:** 2

Ambiguities carried forward without silent invention:

1. “Real time” has no organizer latency threshold; this PRD requires connected in-session propagation without manual data edits.
2. “Communication” has no channel definition; this PRD implements structured workflow updates, not general chat.

---

# 30. Requirement Traceability Matrix

| Upstream reason | Scope item | User story | Functional requirement | Acceptance criteria |
|---|---|---|---|---|
| PS-R01 | M-01 | US-001 | FR-001 | AC-FR001-01–03 |
| PS-R01/03 | M-01/M-03 | US-002 | FR-002, FR-005 | AC-FR002-01–03; AC-FR005-01–03 |
| PS-R02 | M-02 | US-005 | FR-003, FR-004 | AC-FR003-01–03; AC-FR004-01–03 |
| PS-R03 | M-03 | US-006 | FR-006 | AC-FR006-01–03 |
| PS-R02/03 | M-02/M-03 | US-008 | FR-007 | AC-FR007-01–03 |
| PS-R04 | M-04 | US-004 | FR-008, FR-009 | AC-FR008-01–04; AC-FR009-01–03 |
| Shared governed record required | C-01 | US-001–011 | FR-010 | AC-FR010-01–03 |
| Unverified input must not become authority | C-02 | US-003 | FR-011 | AC-FR011-01–03 |
| Role and lifecycle integrity | C-03 | US-003–009 | FR-012, FR-013 | AC-FR012-01–04; AC-FR013-01–04 |
| Prevent double promise | C-04 | US-005 | FR-014 | AC-FR014-01–04 |
| Sent ≠ accepted | C-05 | US-007 | FR-015 | AC-FR015-01–04 |
| Dispatch/partial outcome truth | C-06 | US-008/009 | FR-016, FR-017 | AC-FR016-01–04; AC-FR017-01–04 |
| Trust/freshness/simulation honesty | C-07 | US-004/010 | FR-018 | AC-FR018-01–04 |
| Accountability and judge evidence | C-08 | US-010 | FR-019 | AC-FR019-01–04 |
| Prevent internal view fragmentation | C-09 | US-011 | FR-020 | AC-FR020-01–04 |
| Duplicate-report risk | S-01 | US-012 | FR-021 | P1 criteria to be written only if promoted by approved implementation decision; not a P0 dependency |
| Failed ownership transfer | S-02 | US-013 | FR-022 | P1, non-blocking |
| Stale stock risk | S-03 | US-014 | FR-023 | P1, non-blocking |
| Map dependency risk | S-04 | US-015 | FR-024 | P1, non-blocking |
| Demo repeatability | S-05 | US-016 | FR-025 | P1, non-blocking |
| Stronger delivery evidence | T-01 | US-017 | FR-026 | P2, deferred |
| Validated localization | T-02 | US-018 | FR-027 | P2, deferred |
| Future integration boundary | T-03 | US-019 | FR-028 | P2, deferred |
| Optional alert context | T-04 | US-020 | FR-029 | P2, deferred |

All Mandatory/P0 FRs have upstream traceability and acceptance criteria.

---

# 31. Priority Matrix

| Requirement | Priority | Must work for demo? | Can fail gracefully? |
|---|---|:---:|:---:|
| FR-001 Incident submission | Mandatory Organizer | Yes | No; invalid input may be handled gracefully, valid submission must work |
| FR-002 Receipt/status | Mandatory Organizer | Yes | Temporary read failure may retry; primary proof must work |
| FR-003 Resource availability | Mandatory Organizer | Yes | Missing data must fail visibly, but demo seed must work |
| FR-004 Distribution tracking | Mandatory Organizer | Yes | Invalid transitions fail gracefully; valid flow must work |
| FR-005 Reporter clarification | Mandatory Organizer | Yes for PS-R03 minimum communication | Invalid/unauthorized input may fail gracefully |
| FR-006 Task/instructions | Mandatory Organizer | Yes | Invalid prerequisites fail gracefully |
| FR-007 Responder updates/outcome | Mandatory Organizer | Yes | Invalid actions fail gracefully |
| FR-008 Interactive map | Mandatory Organizer | Yes | Online base may fail; real local/prepared interactive map must remain demonstrable |
| FR-009 Connected map updates | Mandatory Organizer | Yes | Refresh failure visible/retry; proof must work in demo |
| FR-010 Persistence | P0 | Yes | No for core records |
| FR-011 Verify/reject | P0 | Yes | Invalid action fails gracefully |
| FR-012 Authorization | P0 | Yes | Denial is expected graceful behavior |
| FR-013 Transition enforcement | P0 | Yes | Denial is expected graceful behavior |
| FR-014 Atomic reservation | P0 | Yes | Conflict must fail gracefully and correctly |
| FR-015 Acknowledgement | P0 | Yes | Invalid/wrong actor denied gracefully |
| FR-016 Dispatch/outcome | P0 | Yes | Invalid action denied gracefully |
| FR-017 Reconciliation | P0 | Yes | Inconsistent result denied gracefully |
| FR-018 Trust labels | P0 | Yes | Missing metadata shown unknown; required synthetic labels cannot be absent |
| FR-019 Audit timeline | P0 | Yes | No un-audited critical success |
| FR-020 Cross-view consistency | P0 | Yes | Failed view may show stale/error, never contradiction |
| FR-021 Duplicate linking | P1 | No | Yes; omit entirely |
| FR-022 Decline/timeout/reassign | P1 | No | Yes; core acceptance happy path remains |
| FR-023 Stale reconfirmation | P1 | No | Yes; P0 still labels freshness |
| FR-024 List fallback | P1 | No | Yes; prepared map path required separately |
| FR-025 Demo reset/check | P1 | Strongly preferred | Yes only before final demo; must not become product dependency |
| FR-026 Recipient confirmation | P2 | No | Omit |
| FR-027 Multilingual labels | P2 | No | Omit |
| FR-028 Sample exchange | P2 | No | Omit |
| FR-029 Recorded alert overlay | P2 | No | Omit |

---

# 32. Critical Demo Path Requirements

## Requirement chain

**FR-001 → FR-010 → FR-009 → FR-011 → FR-003 → FR-014 → FR-006 → FR-015 → FR-016 → FR-017 → FR-019 → FR-020 → Outcome**

FR-012, FR-013, and FR-018 constrain every relevant step; FR-002, FR-004, FR-005, FR-007, and FR-008 visibly satisfy organizer requirements around the chain.

| Demo step | FR | Expected observable behavior |
|---:|---|---|
| 1 | FR-001/010 | Reporter submits valid incident; reference returned and record persists |
| 2 | FR-002/005 | Reporter sees limited status; linked clarification path is real |
| 3 | FR-008/009/020 | New unverified marker appears and matches queue state |
| 4 | FR-011–013/018/019 | Coordinator verifies; role/state/provenance/audit are visible |
| 5 | FR-003/014 | Coordinator reserves 20 from 20 available; balance becomes 0 available/20 reserved |
| 6 | FR-014/019 | Competing reservation fails without negative or duplicate commitment |
| 7 | FR-006 | Coordinator offers task with responder, quantity, and instructions |
| 8 | FR-015 | Task remains pending until designated responder accepts |
| 9 | FR-004/007/016 | Responder dispatches 20; resource becomes in transit and progress is visible |
| 10 | FR-007/016/017 | Responder reports 12 delivered and 8 access exception; Coordinator confirms partial outcome |
| 11 | FR-017–020 | Ledger, incident/task states, reporter status, map summary, and audit reconcile |

These requirements receive the highest implementation and testing attention. P1/P2 may not interrupt this chain.

---

# 33. Edge Cases

| Edge case | Relevant FR | Expected product behavior |
|---|---|---|
| Missing location/type/severity | FR-001 | Reject submission; no report/reference committed |
| Poor/invalid coordinate | FR-001, FR-008 | Reject or request correction; never place a confident false marker |
| Reporter severity differs from Coordinator view | FR-001, FR-011, FR-018 | Preserve reporter-supplied severity provenance; Coordinator verification remains separate; no AI override |
| Reporter submits same report twice | FR-001; FR-021 if P1 | Two reports may exist; do not silently merge; P1 may suggest human linking |
| Reporter attempts another person’s status | FR-002, FR-012 | Deny without leaking record existence/details |
| Clarification arrives after verification | FR-005, FR-019 | Link as later update; do not overwrite original/verification silently |
| Rejected report receives reservation attempt | FR-011, FR-013, FR-014 | Reject reservation |
| Two Coordinators target last 20 kits | FR-014 | Maximum valid commitment is 20; losing request receives conflict |
| Reservation quantity 0, negative, decimal, or 21 | FR-014 | Reject without state change |
| Task offered without reservation | FR-006, FR-013 | Reject creation |
| Wrong responder accepts | FR-012, FR-015 | Deny; task remains pending |
| Accepted task is accepted again | FR-013, FR-015 | No second ownership transition |
| Dispatch attempted before acceptance | FR-013, FR-016 | Reject; quantity stays Reserved |
| Dispatch quantity exceeds reservation | FR-004, FR-016 | Reject; no movement |
| Partial outcome has no exception | FR-007, FR-017 | Reject until remainder/reason supplied |
| Delivered exceeds dispatched | FR-016, FR-017 | Reject; prior state remains |
| Coordinator tries to close 12/20 as full | FR-017 | Reject full resolution; preserve 8 remainder |
| Task fails after dispatch | FR-016, FR-017 | Mark Failed/Exception; do not mark quantity Delivered |
| Map loads but records fail | FR-008–009, FR-020 | Show operational-data error/empty distinction; do not show misleading stale markers as current |
| Map tiles fail | FR-008 | Operational state persists; use prepared local context/P1 list if available |
| State save succeeds but audit fails | FR-010, FR-019 | Do not present a fully successful inconsistent critical operation; treat as critical failure |
| User double-submits an action during loading | FR-010, FR-013–017 | Prevent/reject duplicate movement; current state remains singular |
| Synthetic label missing | FR-018 | Requirement fails; data must not be presented as live |
| One view is behind another | FR-020 | Behind view shows loading/stale/error and refreshes; no contradictory authoritative claim |

---

# 34. Assumptions

| Assumption | Affects | Current evidence | What happens if wrong |
|---|---|---|---|
| A Coordinator/Dispatcher is the primary operational owner | FR-011–020 | Strong inference; no named operator | Role/workflow may be invalid and requires Scope Conflict/reselection |
| One organization can operate the prototype/pilot | All roles/permissions | Scope recommendation only | Multi-agency governance becomes immediate and exceeds lock |
| Reservation is compatible with real practice | FR-014 | Operational reasoning; no SOP observed | Main differentiator may not fit deployment; prototype remains mechanism proof only |
| Opening resource balance can be obtained/maintained in production | FR-003/014/017 | PS assumes tracking; no source | Production resource claim fails despite correct mechanics |
| Responders explicitly acknowledge or can confirm receipt/ownership | FR-015 | Inference; varies by command model | Accept/decline may need command-receipt semantics via formal change |
| Human verification has sufficient evidence | FR-011 | No target SOP/evidence source | Verify button becomes theatre; production use unsafe |
| Coordinator confirmation is acceptable prototype closure | FR-017 | Scope decision, not validated SOP | Real confirmation may require recipient/custodian; P2 or redesign later |
| Web interaction is suitable | All interactive FRs | Organizer asks for web platform | Native/assisted channel may be needed in field; out of prototype |
| Synthetic data are permitted by event rules | Demo/FR-018 | No rubric supplied | Prototype may not meet event evidence expectation |
| Connected in-session propagation satisfies “real time” for prototype | FR-009/NFR-004 | Organizer gives no threshold | Organizer may require stronger live-update behavior |
| One incident family/resource pool is adequate for judging | Entire scope | Scope discipline reasoning | Rubric may expect breadth; requires explicit organizer evidence to expand |
| A permitted map/base source can be used | FR-008 | Options exist; final provider not selected here | Use prepared/local permitted context; if none, PS-R04 is blocked |

---

# 35. Open Product Questions

## Blocking before implementation/demo commitment

| Question | Why blocking |
|---|---|
| Does the organizer accept clearly labelled synthetic operational data? | All resource/actor/demo evidence depends on it. |
| Does connected in-session update or safe refresh satisfy “real time,” or is push-style automatic update explicitly required? | Changes the required behavior depth of FR-009 without changing product capability. |
| Which permitted base-map/local context will be available for the offline-independent demo path? | PS-R04 must be demonstrably functional without fragile dependency. |

## Non-blocking for implementation

| Question | Why non-blocking |
|---|---|
| What exact controlled labels define the single incident type and severity scale? | Can be selected as synthetic scenario vocabulary without changing scope; must preserve reporter severity vs verified state. |
| What concise public-safe statuses should the Reporter see? | Can map locked lifecycle to fewer safe labels without adding capability. |
| Which `8-kit` remainder disposition is used in the demo: unresolved follow-up, exception, returned, or released? | One locked, consistent path can be chosen for the scenario; capability remains C-06. |
| Is P1 duplicate review included in the final demo? | It is optional and must not affect core. |
| Is P1 timeout automated or represented by an explicit test action if built? | P1 only; omission does not block product. |

## Production-only

| Question | Why production-only |
|---|---|
| Who is the actual operator/custodian and what SOP applies? | Necessary for deployment, not synthetic mechanism proof. |
| What legal jurisdiction, privacy policy, and retention period apply? | Real data are not used in prototype. |
| What inventory, identity, notification, and official GIS systems require integration? | All are mocked/deferred. |
| What devices, networks, languages, accessibility levels, scale, and uptime are required? | Require field/pilot evidence. |
| Who independently confirms delivery and resolves disputes? | Coordinator confirmation is the locked prototype simplification. |

---

# 36. Out-of-Scope Enforcement

| Out-of-scope item | Reason | Related temptation |
|---|---|---|
| General chat/calls/video | Structured updates satisfy communication with less complexity | “Every platform needs chat” |
| AI chatbot | No root-cause contribution or trusted knowledge source | “Judges expect AI” |
| AI severity/priority/dispatch | No data, authority, or safety case | “Automate decisions” |
| AI translation/summarization/vision/forecasting | Not authorized; data/evaluation absent | “Easy intelligence enhancement” |
| Blockchain | Does not establish truth at entry | “Tamper-proof innovation” |
| Donations/payments/beneficiary entitlement | Unrelated financial/compliance domain | “Complete disaster platform” |
| Gamification/volunteer points | Safety-sensitive behavior and no validated need | “Improve engagement” |
| Live GPS/vehicle/drone tracking | Hardware/privacy/connectivity absent | “Animated real-time map” |
| Custom routing/road optimization | Trusted dynamic access data absent | “Optimize dispatch” |
| Social-media ingestion | API/misinformation/moderation scope | “More incident coverage” |
| Full offline synchronization/offline maps | Conflict policy/devices unvalidated; scope dominant | “Emergency apps must be offline-first” |
| External SMS/email/push/WhatsApp | Fragile provider dependency; in-app path sufficient | “Production-ready notifications” |
| Live government/satellite integration | No mandatory endpoint/permission | “Official credibility” |
| Multiple hazards/resources/agencies/national scale | Invalid semantics and scope explosion | “Show scalability” |
| Enterprise SSO/admin/tenancy | No operator/governance need | “Industry standard” |
| Analytics/heat maps/KPI dashboard | Synthetic metrics cannot prove impact | “Better judge visuals” |
| Native mobile application | Web is organizer requirement and locked prototype surface | “Better responder UX” |
| Microservices/event bus | Technical complexity without product need | “Modern architecture” |
| Advanced exports/reports | No requested real format | “Enterprise completeness” |

**No requirement, user story, acceptance criterion, UI requirement, or technical design may implement these items unless Scope Lock is formally changed.**

---

# 37. P1 / P2 Guardrail

## P1

P1 work may begin only after:

- PS-R01 through PS-R04 behavior works;
- FR-001 through FR-020 pass their critical happy-path acceptance criteria;
- the critical demo path is stable;
- no unresolved integrity, authorization, reconciliation, or map-compliance defect remains.

P1 is non-blocking. FR-021–025 may be omitted, and Mandatory/P0 must not call them as prerequisites.

## P2

P2 work may begin only after:

- Mandatory and P0 are complete;
- critical defects are resolved;
- an explicit implementation decision selects a P2 item;
- any required real evidence (validated language, real documented format, licensed recorded alert) exists.

P2 FR-026–029 must never enter the critical demo path or be presented as core differentiation.

---

# 38. Product Definition of Done

## Organizer

- [ ] PS-R01 through PS-R04 each have working, demonstrable coverage.

## Core workflow

- [ ] Reporter → Coordinator → Responder → Coordinator journey completes without manual database edits.
- [ ] Interactive map and structured updates participate in the journey.

## Functional

- [ ] All acceptance criteria for FR-001 through FR-020 pass.
- [ ] P1/P2 are not required for completion.

## State and permissions

- [ ] Required states/transitions behave as Section 13 specifies.
- [ ] Reporter, Coordinator, and Responder restrictions in Section 14 work even for direct action attempts.

## Data and integrity

- [ ] Core records persist and relationships remain intact.
- [ ] Reservation cannot overcommit or make quantity negative.
- [ ] 20 dispatched / 12 delivered / 8 remainder reconciles exactly.
- [ ] All relevant views agree or visibly identify unavailable/stale state.

## AI

- [ ] No AI capability or dependency exists.

## Failure

- [ ] Invalid input, permission denial, invalid transition, insufficient stock, reservation conflict, map failure, and inconsistent outcome behave as specified.
- [ ] Failed actions do not masquerade as success or corrupt state.

## Integrity and disclosure

- [ ] Synthetic/simulated/recorded data are clearly labelled.
- [ ] No external system or production impact is falsely claimed.

## Demo

- [ ] Critical demo path runs reliably using the local/controlled dependency boundary.
- [ ] External internet, SMS, GPS, government API, or AI is not required.
- [ ] Audit timeline reconstructs the demonstration.

---

# 39. PRD Self-Audit

| Audit | Result | Finding |
|---|---|---|
| Scope Audit | **Pass** | FR-001–029 map only to M/C/S/T items in Scope Lock. |
| Organizer Audit | **Pass** | All 4 organizer requirements have FR and acceptance coverage. |
| Traceability Audit | **Pass** | Every Mandatory/P0 FR maps upstream to PS/scope and downstream to AC. |
| Completeness Audit | **Pass** | Core actions define preconditions, success, failure, and state. |
| Testability Audit | **Pass** | FR-001–020 have Given/When/Then acceptance criteria. |
| AI Audit | **Pass** | No AI behavior added; explicit prohibition retained. |
| UI Audit | **Pass** | Product states and required interactions are defined without layouts/components/navigation design. |
| Technical Audit | **Pass** | No framework, database, endpoint, schema, cloud, microservice, or implementation task is chosen. |
| Scope-Creep Audit | **Pass** | P1/P2 remain non-blocking; OUT items do not re-enter. |
| Real-vs-Simulated Audit | **Pass** | Real mechanics and simulated data/dependencies remain distinct. |

No `SCOPE CONFLICT` is required at this stage.

---

# 40. Final PRD Summary

| Item | Final requirement summary |
|---|---|
| **Product** | Verified Response Ledger |
| **Problem** | Fragmented and weakly governed reports, stock, assignments, communication, and outcomes create false availability, false ownership, and false completion. |
| **Primary users** | Community Reporter, Agency Coordinator/Dispatcher, Volunteer/Responder. |
| **Core job** | Convert a report into a verified, resource-backed, explicitly owned, and reconciled response. |
| **Core workflow** | Submit → verify → reserve → offer → accept → dispatch → full/partial/failed outcome → reconcile → audit/map/status update. |
| **Mandatory organizer requirements** | Incident reporting; resource availability/distribution; structured communication/task coordination; interactive geographic visibility. |
| **P0 behaviors** | Persistence, human verification, role/state enforcement, atomic reservation, acknowledgement, outcome reconciliation, trust labels, audit, cross-view consistency. |
| **Main differentiator** | The product enforces operational truth rather than displaying cosmetic status: reported ≠ verified, available ≠ uncommitted, sent ≠ accepted, dispatched ≠ delivered, partial ≠ complete. |
| **Critical business rules** | No allocation before verification; no overcommitment; no dispatch before acceptance; no delivery beyond dispatch; no full closure with remainder; no unauthorized state change; no silent overwrite. |
| **Key states** | Report Under Review/Linked/Rejected; Incident Verified/Active/Partial/Resolved; Resource Available/Reserved/In Transit/Delivered/Exception; Task Offered/Accepted/In Progress/Partial/Complete/Failed. |
| **AI boundary** | No AI exists or is allowed without formal Scope Conflict. |
| **External dependency boundary** | Only local persistence and real map interaction are critical; all agency data, messaging, GPS, official feeds, identity federation, AI, and production infrastructure are mocked/deferred/removed. |
| **Prototype Definition of Done** | All FR-001–020 acceptance criteria pass and the 20-reserved/12-delivered/8-remainder scenario completes reliably with consistent map, status, ledger, task, and audit state. |
| **Explicit non-goals** | Chat, AI, blockchain, live tracking/routing, external notifications/integrations, offline sync, multi-hazard/resource/agency scale, enterprise admin/analytics, native app, production claims. |

---

# 41. Inputs for `06-UIUX.md`

## Actors / roles

- Community Reporter.
- Agency Coordinator/Dispatcher.
- Volunteer/Responder.
- Custodian/Supervisor/Recipient are indirect; no additional Mandatory/P0 interface.

## User goals

- Reporter: submit a need, receive reference, see limited status, clarify.
- Coordinator: verify, inspect geography/resource state, reserve, assign, reconcile, audit.
- Responder: understand offer, acknowledge, execute, report progress/exception/outcome.

## Core journey

Report → reference/queue/map → verify → reserve → offer/instructions → accept → dispatch → partial/full/failed outcome → confirm/follow-up → consistent status/map/ledger/audit.

## Supporting journeys

- Verification/rejection.
- Reporter clarification.
- Reservation conflict.
- Structured task coordination.
- Partial outcome reconciliation.
- Geographic awareness.
- P1 only: duplicate link, decline/timeout/reassign, stale reconfirmation, list fallback.

## Functional requirements by role

- Reporter: FR-001, FR-002, FR-005; subject to FR-010, FR-012, FR-018, FR-020.
- Coordinator: FR-003, FR-006, FR-008, FR-011, FR-014, FR-017–020; P1 FR-021–024 if authorized.
- Responder: FR-007, FR-015, FR-016; subject to FR-010, FR-012–013, FR-018–020.
- System: FR-009–010, FR-012–014, FR-017–020.

## Required user actions

Submit; view status; add clarification; review; verify/reject; inspect map/resource; reserve/release; offer task; accept/decline; dispatch; post progress/exception/outcome; confirm/follow up; inspect audit.

## Required information

Report reference/source/time/location/type/severity/state; resource unit/quantity states/source/freshness; task responder/instructions/quantity/state/times; outcome delivered/remainder/reason; audit actor/time/change; simulation labels.

## Required states

Use Section 13 exactly. UI/UX may group states for presentation only if semantic distinctions and actions remain intact.

## Permissions

Use Sections 6 and 14. Hidden controls do not replace action authorization.

## Input requirements

Use Section 15; do not add file upload, voice, chat recipient, route, payment, or AI prompt inputs.

## Validation rules

Use Section 16, especially quantity, state, permission, concurrency, and cross-field reconciliation.

## Error behaviors

Use Section 17; failures must be visible and must preserve prior valid state.

## Empty / loading / success states

Use Section 18 for every locked surface/workflow; visual treatment is for UI/UX to decide.

## AI review requirements

None. UI/UX must not create AI controls, confidence indicators, chatbot, or recommendation review.

## Required audit/evidence information

Use Section 25; Coordinator must be able to inspect actor, time, transition, quantity, and reason/reference for critical actions.

## Mandatory organizer requirements

PS-R01 through PS-R04 must remain visibly demonstrable.

## Critical demo path

Use Section 32 exactly; design must make the reservation race, acknowledgement boundary, and 12/20 partial result understandable.

## P0

FR-010 through FR-020 plus Mandatory FR-001 through FR-009.

## P1

FR-021 through FR-025; may not be assumed present unless implementation decision confirms them.

## P2

FR-026 through FR-029; do not design as core or include by default.

## Explicit OUT

Use Section 36. UI/UX may not introduce chat, AI, analytics dashboards, live tracking, routes, donations, admin, extra stakeholder dashboards, or new interaction modes.

The UI/UX stage may determine screens, navigation, layout, information hierarchy, components, interaction patterns, responsive behavior, visual states, and accessibility behavior. It may not introduce product functionality.

---

# 42. Product Constraints for Technical Design

Technical Design must consume the following product contracts without expanding scope.

## Functional requirements

- Mandatory: FR-001 through FR-009.
- P0: FR-010 through FR-020.
- P1: FR-021 through FR-025 only after priority gate.
- P2: FR-026 through FR-029 only after explicit approval/evidence.

## Business rules

BR-001 through BR-025, especially verification before allocation, non-negative/accounted quantities, atomic overcommitment protection, acknowledgement before dispatch, and no full closure with unexplained remainder.

## State transitions

Section 13 is authoritative. Technical Design must support valid transitions and reject listed invalid transitions without inventing additional product states unless a `SCOPE CONFLICT` is raised.

## Permission rules

Sections 6 and 14 are authoritative. Authorization must be enforced at the protected action/data boundary, not only through UI visibility.

## Data requirements

Conceptual entities and source-of-truth rules are in Sections 19–20. Technical Design may define storage structures later but must preserve original reports, linked updates, quantities, relationships, and critical audit history.

## AI product contract

No AI component, provider, model, vector store, prompt, confidence workflow, or AI fallback is allowed.

## External system contracts

Section 23: map context may be real/prepared; agency inventory/directory are simulated; messaging/GPS/routing/AI/live government integrations are absent. No API contract is implied.

## Audit requirements

Section 25 events must be attributable and reconstruct the locked scenario. Critical state and audit must not silently diverge.

## NFRs

NFR-001 through NFR-014 define prototype behavior without unsupported numeric SLAs.

## Failure requirements

Sections 16–18 and 33 define validation, failure, recovery, and critical edge cases. Invalid/conflicting actions preserve the last valid state.

## Must-be-real components

Submission/persistence, authorization, verification, resource states, atomic reservation, task acknowledgement, structured updates, dispatch/outcome, reconciliation, audit, interactive map, and shared-state consistency.

## Simulated components

Physical opening stock, identities/events, agency systems/directories, external notifications, official feeds, GPS/routes, production identity, and scale infrastructure.

## Critical demo path

Section 32 is the implementation/testing priority. It must complete locally without manual database edits or external service dependency.

Technical Design may decide implementation mechanisms, data structures, internal interfaces, and deployment approach. It may not add capabilities, change priorities, or reopen scope without the formal conflict process.

---

## Completion Gate Result

- [x] Every mandatory organizer requirement maps to PRD behavior.
- [x] Every Mandatory/P0 FR has acceptance criteria.
- [x] Every Mandatory/P0 FR has upstream traceability.
- [x] Core workflow is fully specified.
- [x] Important business rules are explicit.
- [x] Required states and transitions are explicit.
- [x] Role permissions are explicit.
- [x] Important validation behavior is explicit.
- [x] Critical failure behavior is explicit.
- [x] AI boundary is explicit: no AI authorized.
- [x] Real versus simulated behavior remains clear.
- [x] Critical demo path is identifiable.
- [x] OUT-of-scope functionality has not re-entered.
- [x] No UI layout has been designed.
- [x] No API, database schema, framework, cloud provider, or detailed architecture has been designed.
- [x] No new feature has been silently introduced.

