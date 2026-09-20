# Crisis Response Platform — Scope Lock

**Stage:** Step 4 — after PS Analysis, SWOT, and Solution Design  
**Selected direction:** Verified Response Ledger  
**Purpose:** Authoritative implementation boundary for the hackathon prototype  
**Lock date:** 20 September 2026  
**Status:** Scope frozen subject only to the change-control rule in this document

---

## Authority and Evidence Labels

| Label | Meaning |
|---|---|
| **[ORG]** | Exact or directly parsed organizer/Problem Statement requirement. Highest authority. |
| **[PSA]** | Finding from `docs/01-PS_Analysis.md`. |
| **[SWOT]** | Guardrail or risk finding from `docs/02-SWOT.md`. |
| **[SD]** | Selected decision from `docs/03-Solution_Design.md`. |
| **[LOCK]** | Binding scope decision made in this document. |
| **[ASSUMPTION—VALIDATE]** | Unverified condition retained as a declared risk. |

Authority order: organizer requirements → PS Analysis → SWOT → Solution Design → this Scope Lock. After reconciliation, this document is authoritative for implementation scope. Downstream work may clarify it but may not silently expand it.

---

# 1. Extracted Organizer Requirements

All four pasted requirements are treated as **mandatory unless the organizer clarifies otherwise**. No requirement is marked optional.

| ID | Organizer requirement | Mandatory / Optional | Locked interpretation | Source wording |
|---|---|---|---|---|
| **PS-R01** | Incident Reporting | Mandatory unless clarified | A user can submit an incident during the running prototype with location, type, and severity; it is persisted, acknowledged, and becomes visible to the coordinator without manual database intervention. “Real time” is interpreted as connected near-real-time propagation within the demo, not a production latency SLA. | “Allow users to report incidents in real time with relevant details (location, type, severity).” |
| **PS-R02** | Resource Tracking | Mandatory unless clarified | The prototype maintains one countable emergency-resource pool and visibly tracks quantity through available, reserved, in-transit, delivered, and released/exception states. The opening balance is synthetic; state changes are real. | “Monitor the availability and distribution of emergency resources.” |
| **PS-R03** | Coordinated Response | Mandatory unless clarified | Community reporter, agency coordinator, and volunteer/responder participate in one shared workflow. Communication is implemented as structured, incident/task-scoped status and follow-up updates; task coordination includes assignment, acknowledgement, execution updates, and outcome. This does not authorize a general chat product. | “Enable communication and task coordination between community members, volunteers, and response agencies.” |
| **PS-R04** | Real-Time Geographic Visibility | Mandatory unless clarified | An interactive map displays incident and resource locations from the same persisted operational state, updates during the demo, and supports at-a-glance distinction by state. Map interaction must work; production-scale live feeds and real-world GPS are not implied. | “Present incidents and resources on an interactive map for at-a-glance situational awareness.” |

---

# 2. Requirement Traceability Check

| PS requirement | Covered in PS Analysis? | Covered by selected solution? | Status | Gap / smallest legitimate correction |
|---|---:|---:|---|---|
| PS-R01 Incident Reporting | Yes; fields, verification, location quality, receipt, and abuse risks analyzed | Yes; structured geolocated report begins the core workflow | **Fully covered** | No scope correction required. |
| PS-R02 Resource Tracking | Yes; availability, reservation, distribution, freshness, and reconciliation analyzed | Yes; one-resource commitment ledger is central | **Fully covered** | Opening stock remains synthetic and must be disclosed. |
| PS-R03 Coordinated Response | Yes; assignment, acceptance, status, and communication ambiguity analyzed | **Partially:** task coordination is deep; general communication was intentionally avoided | **Partially covered → resolved by minimum addition** | Add structured incident/task-scoped updates: reporter receives status and may submit one follow-up/clarification; coordinator sends task instructions; responder acknowledges and submits progress/exception/outcome. No free-form general chat. |
| PS-R04 Real-Time Geographic Visibility | Yes; map, freshness, provenance, failure, licensing, and list fallback analyzed | Yes; GIS/list view of governed records is selected | **Fully covered, implementation depth clarified** | Interactive map renderer and marker state must be real. External live feeds, routing, and GPS remain unnecessary. |

**Compliance reconciliation:** No mandatory requirement is missing. PS-R03 required a narrow scope clarification, not a redesign. The communication requirement is satisfied through structured workflow communication that directly moves or explains operational state.

---

# 3. Restated Selected Solution

| Item | Locked extraction from Solution Design |
|---|---|
| **Selected solution** | Verified Response Ledger |
| **One-line definition** | A workflow coordination system that helps an accountable local emergency coordinator convert an uncertain report into a verified, resource-backed, explicitly owned, and reconciled response through human-authorized state transitions and an auditable commitment ledger. |
| **Primary users** | Coordinator/dispatcher; supporting reporter/community member and responder/volunteer. Agency is represented by the authorized coordinator. Custodian responsibility is represented within the coordinator role for the prototype. |
| **Core user job** | Verify a reported need, commit genuinely available resources, transfer responsibility explicitly, and know whether the intended outcome was fully, partially, or not achieved. |
| **Root cause addressed** | Incident, resource, assignment, communication, and outcome state are fragmented and weakly governed. |
| **Core workflow** | Report → validate/review → verify → reserve → assign → acknowledge → dispatch → full/partial outcome → reconcile/close → audit. |
| **Strongest differentiator** | Operational truth: resource commitment is transaction-safe, responsibility is explicit, and partial outcomes cannot be hidden by cosmetic status changes. |
| **What must actually work** | Persistence; role and transition enforcement; reservation/concurrency; acknowledgement; distribution/outcome states; quantity reconciliation; audit; interactive map driven by shared state; structured coordination updates. |
| **What may be simulated** | Opening stock, real identities, agency inventory/API, volunteer registry, official alerts, SMS/push, GPS, routing, government GIS layers, and production infrastructure. |

---

# 4. Core Proof and Critical Demo Journey

If only one journey can be demonstrated, it will be this:

| Stage | Critical demo behavior |
|---|---|
| **Trigger** | A community reporter observes a localized flood-relief need. |
| **User input** | Reporter submits location, incident type, severity, short description, and safe contact/reference information. |
| **Validation** | System validates required fields; coordinator sees source, time, location, and unverified state, then verifies the incident. |
| **Core processing** | System shows one synthetic relief-kit pool and atomically reserves an authorized quantity for the verified incident. A competing over-reservation fails. |
| **Decision** | Coordinator selects a responder, sends structured instructions, and assigns the task. |
| **Action** | Responder explicitly accepts, marks dispatch, and later reports 12 of 20 delivered plus an 8-kit access exception. |
| **State change** | Incident, resource quantities, task ownership, distribution state, reporter-visible status, map markers, and timeline update from the same persisted record. |
| **Outcome** | Coordinator confirms the partial outcome; 12 are delivered and 8 remain unresolved/released/follow-up according to the locked transition. The incident is not falsely shown as fully complete. |
| **Evidence / audit** | Timeline shows reporter submission, verification, reservation, failed competing reservation, assignment, acceptance, dispatch, partial result, confirmation, quantities, actors, and times. |

This is the **Critical Demo Path**. Every Mandatory and P0 capability must either participate directly or protect it from a critical failure.

---

# 5. Scope Categories

Every capability is assigned to exactly one category.

## 🔴 Mandatory — Organizer

Explicit PS requirements. These cannot be removed: incident reporting; resource availability/distribution tracking; structured communication and task coordination; interactive geographic visibility.

## 🟠 P0 — Core

Team-defined mechanisms without which the selected solution cannot complete its workflow, prove its differentiator, or survive a critical integrity failure.

## 🟡 P1 — Supporting

Capabilities that improve usability, exception handling, reliability, or judge clarity but are not required for the central proof. Mandatory + P0 completion must never wait for P1.

## 🟢 P2 — Stretch

Capabilities allowed only after all Mandatory and P0 behavior works end-to-end, critical bugs are resolved, and the demo is repeatable.

## ⚫ Out of Scope

Capabilities prohibited from consuming core build effort. They may return only through the formal change process.

---

# 6. Organizer Requirement Implementation Depth

| ID | Requirement | Depth | Why | What must work | What may be simplified |
|---|---|---|---|---|---|
| PS-R01 | Incident Reporting | **STANDARD** | Mandatory and starts the workflow, but differentiation lies in what happens after intake | Connected submission with location, type, severity; validation; persistence; reference/receipt; coordinator visibility; map appearance | One incident family; controlled categories/severity scale; synthetic people/evidence; no anonymous abuse-scale handling |
| PS-R02 | Resource Tracking | **DEEP** | Resource truth and commitment are central to the selected differentiator | One countable resource; available/reserved/in-transit/delivered/released-or-exception quantities; atomic reservation; live state updates; reconciliation | One synthetic depot/resource; manual opening balance; no ERP, vehicles, medicines, expiry, procurement, or multiple units |
| PS-R03 | Coordinated Response | **DEEP for task coordination; MINIMAL for communication** | Explicit ownership and outcome are core; general chat is unnecessary | Coordinator assigns with instructions; responder accepts/declines and sends structured progress/exception/outcome; reporter sees status and can add a clarification/follow-up; all updates attach to incident/task | No chat rooms, calls, external messaging, typing indicators, read receipts, file sharing, or organization-wide channels |
| PS-R04 | Real-Time Geographic Visibility | **STANDARD** | Mandatory and important for judge visibility, but map breadth is not the differentiator | Interactive map with incident and resource markers; marker state reflects persisted workflow; selection/details; simple legend/filter; updates in the connected demo | Small synthetic area; permitted/local/static base context; no live GPS, hazard overlays, routing, clustering at scale, or offline map packs |

No mandatory requirement is classified OUT or reduced to a fake UI. External source data may be synthetic, but the behavior that changes and displays state must be real.

---

# 7. Requirement Satisfaction Criteria

| ID | Requirement | Observable proof | Real / Simulated | Demo step |
|---|---|---|---|---|
| PS-R01 | Incident Reporting | A newly entered incident with valid location, type, and severity persists, receives a reference, appears in the coordinator queue, and becomes selectable on the map without manual database edits | Behavior real; scenario/person data synthetic | Reporter submits the Riverside flood-relief report |
| PS-R02 | Resource Tracking | Reserving 20 kits changes available/reserved quantities; a second conflicting reservation is rejected; dispatch and partial delivery move quantities while totals reconcile | Logic/state real; opening inventory synthetic | Coordinator reserves; race is shown; responder dispatches and delivers 12/20 |
| PS-R03 | Coordinated Response | Coordinator sends a task with instructions; responder must acknowledge; responder posts structured progress/exception/outcome; reporter sees status and may submit a linked clarification; timeline keeps all actors | Workflow real; actors/messages synthetic; external notifications absent | Assignment → acceptance → dispatch → access exception → partial outcome; reporter status update visible |
| PS-R04 | Real-Time Geographic Visibility | Interactive map displays the submitted incident and resource depot from persisted state; state/legend changes after verification, reservation, assignment, and outcome; marker selection opens operational details | Renderer and state binding real; geography/base context may be synthetic or locally prepared | Show map before report, after report, and after partial completion |

---

# 8. Capability Inventory

| ID | Capability | Source | Requirement supported | Root cause supported | Core workflow role |
|---|---|---|---|---|---|
| M-01 | Connected incident submission with location, type, severity, receipt | Organizer | PS-R01 | Fragmented intake | Creates source report |
| M-02 | Resource availability and distribution tracker for one resource | Organizer | PS-R02 | Inventory detached from allocation/outcome | Shows quantity state |
| M-03 | Structured reporter–coordinator–responder coordination | Organizer | PS-R03 | Communication without governed handoff | Carries instructions, acknowledgement, updates, exception, status |
| M-04 | Interactive operational map for incidents/resources | Organizer | PS-R04 | Fragmented geographic visibility | Shared situational view |
| C-01 | Persistent shared operational state | Technical necessity | All | Records separated across tools | Makes lifecycle coherent |
| C-02 | Authorized human verification/rejection | Solution Design | PS-R01, PS-R03 | Unverified reports treated as facts | Promotes report to actionable incident |
| C-03 | Role-based authorization and transition enforcement | Technical necessity | All | Undefined authority and cosmetic statuses | Protects critical actions |
| C-04 | Atomic reservation and overcommitment prevention | Solution Design | PS-R02, PS-R03 | Double promise/concurrency | Valid resource commitment |
| C-05 | Explicit assignment acknowledgement | Solution Design | PS-R03 | Sent message mistaken for ownership | Transfers responsibility |
| C-06 | Full/partial/failed outcome with quantity reconciliation | Solution Design | PS-R02, PS-R03 | Dispatch mistaken for delivery | Closes or preserves remainder honestly |
| C-07 | Provenance, freshness, and simulated-state labelling | Risk mitigation | PS-R02, PS-R04 | Stale/uncertain data appears authoritative | Gives decision context |
| C-08 | Critical-event audit timeline | Solution Design | PS-R02, PS-R03 | No accountable history | Proves actors, times, quantities, corrections |
| C-09 | Shared state binding across map, queue, task, and ledger | Technical necessity | All | Separate views drift | Keeps visible state consistent |
| S-01 | Deterministic duplicate candidate and reversible link | Solution Design | PS-R01 | Duplicate reports create duplicate work | Supports review before action |
| S-02 | Decline, timeout, and reassignment handling | Solution Design | PS-R03 | Task remains unowned | Recovers failed ownership transfer |
| S-03 | Resource reconfirmation when stale | Risk mitigation | PS-R02 | Wrong opening/current balance | Protects commitment decision |
| S-04 | Operational list fallback when map/base layer fails | Risk mitigation | PS-R04 support | Map dependency | Maintains workflow, not map compliance itself |
| S-05 | Demo reset/seed and invariant verification | Risk mitigation | All | Dirty state/demo inconsistency | Makes proof repeatable |
| T-01 | Recipient/third-party confirmation | Solution Design | PS-R02, PS-R03 | Self-reported delivery | Strengthens closure evidence |
| T-02 | Multilingual controlled labels | Solution Design | PS-R01, PS-R03 | Language exclusion | Improves access after target language validation |
| T-03 | Documented sample import/export | Solution Design | PS-R02 | Future integration silos | Shows adapter boundary if real format arrives |
| T-04 | Recorded official-alert context overlay | Solution Design | PS-R04 | Hazard context fragmentation | Optional context only |

No capability outside this inventory may enter implementation without scope change approval.

---

# 9. Feature Justification Test

Legend: ✓ passes; — does not independently pass.

| Capability | Organizer | Core workflow | Differentiator | Critical/high risk | User value | Decision |
|---|:---:|:---:|:---:|:---:|:---:|---|
| Connected incident submission | ✓ | ✓ | — | — | ✓ | **Mandatory M-01** |
| Resource availability/distribution tracker | ✓ | ✓ | ✓ | ✓ | ✓ | **Mandatory M-02** |
| Structured cross-role coordination | ✓ | ✓ | ✓ | ✓ | ✓ | **Mandatory M-03** |
| Interactive operational map | ✓ | — | — | — | ✓ | **Mandatory M-04** |
| Persistent shared state | — | ✓ | ✓ | ✓ | ✓ | **P0 C-01** |
| Human verification/rejection | — | ✓ | ✓ | ✓ | ✓ | **P0 C-02** |
| Authorization/transition enforcement | — | ✓ | ✓ | ✓ | ✓ | **P0 C-03** |
| Atomic reservation | — | ✓ | ✓ | ✓ | ✓ | **P0 C-04** |
| Explicit acknowledgement | — | ✓ | ✓ | ✓ | ✓ | **P0 C-05** |
| Partial outcome reconciliation | — | ✓ | ✓ | ✓ | ✓ | **P0 C-06** |
| Provenance/freshness/simulation labels | — | ✓ | ✓ | ✓ | ✓ | **P0 C-07** |
| Critical-event audit | — | ✓ | ✓ | ✓ | ✓ | **P0 C-08** |
| Cross-view shared-state binding | — | ✓ | ✓ | ✓ | ✓ | **P0 C-09** |
| Deterministic duplicate linking | — | — | — | ✓ | ✓ | **P1 S-01**; useful but removable from central proof |
| Decline/timeout/reassignment | — | — | — | ✓ | ✓ | **P1 S-02**; happy-path ownership proof works without full recovery |
| Stale resource reconfirmation | — | — | — | ✓ | ✓ | **P1 S-03**; P0 still displays freshness |
| List fallback | — | — | — | ✓ | ✓ | **P1 S-04**; demo reliability, not organizer-map replacement |
| Demo seed/reset/invariant check | — | — | — | ✓ | — | **P1 S-05**; operational test support |
| Recipient confirmation | — | — | — | — | ✓ | **P2 T-01** |
| Multilingual labels | — | — | — | — | ✓ | **P2 T-02** |
| Sample import/export | — | — | — | — | ✓ | **P2 T-03**, only with real format |
| Official-alert overlay | — | — | — | — | ✓ | **P2 T-04** |
| General chat | — | — | — | — | — | **OUT** |
| AI severity/dispatch/chatbot | — | — | — | — | — | **OUT** |
| Live GPS/routing | — | — | — | — | — | **OUT** |

---

# 10. Mandatory Organizer Scope

| ID | Requirement | Locked implementation | Depth | Demo proof | Dependency |
|---|---|---|---|---|---|
| PS-R01 / M-01 | Incident Reporting | Submit, validate, persist, acknowledge, queue, and map one incident containing location, type, and severity | Standard | New report appears in coordinator state and map from user submission | Local application and persistent storage; locally available map context |
| PS-R02 / M-02 | Resource Tracking | Track one synthetic kit pool across available, reserved, in-transit, delivered, and released/exception quantities | Deep | Competing reservation rejected; 20 dispatched, 12 delivered, 8 unresolved/reconciled | Persistent transactional state; synthetic opening balance |
| PS-R03 / M-03 | Coordinated Response | Structured task instructions, acceptance/decline, progress/exception/outcome updates, reporter status and clarification | Deep coordination / minimal communication | No owner before acceptance; responder update changes state; reporter sees linked status | Local role sessions and shared state; no external messaging |
| PS-R04 / M-04 | Real-Time Geographic Visibility | Interactive incident/resource map driven by persisted state with marker selection and simple state legend/filter | Standard | Submitted incident and depot appear; marker state changes through lifecycle | Real map component; local/permitted base context or prepared fallback |

**Mandatory requirements accounted for: 4 / 4.**

---

# 11. P0 — Core Scope

| ID | Capability | Why P0 | Dependency | Definition of Done |
|---|---|---|---|---|
| **C-01** | Persistent shared operational state | Without persistence, the prototype is a set of disconnected screens and cannot prove cross-role workflow | Local data store | Report, incident, resource movement, task, outcome, and audit state survive navigation/session changes and are read by every relevant view |
| **C-02** | Authorized human verification/rejection | An unverified public report must not automatically trigger resource commitment | C-01, coordinator role | Coordinator can verify or reject; state, actor, and time persist; only verified incidents can enter allocation |
| **C-03** | Role-based authorization and state-transition enforcement | The core claim requires accountable actions rather than cosmetic buttons | C-01, role sessions | Reporter cannot verify/reserve; responder cannot alter opening stock; invalid transitions are rejected; coordinator actions follow locked lifecycle |
| **C-04** | Atomic reservation and overcommitment prevention | Primary differentiator fails if two users can promise the same units | M-02, C-01, C-03 | Two competing requests exceeding availability cannot both succeed; balance remains reconciled and failed attempt is visible/audited |
| **C-05** | Explicit assignment acknowledgement | “Sent” must not equal “owned” | M-03, C-01, C-03 | Assigned task remains pending until responder accepts; acceptance identifies actor/time and enables dispatch |
| **C-06** | Full/partial/failed outcome and quantity reconciliation | “Dispatched” must not equal “delivered”; partial results must preserve remainder | M-02, M-03, C-01 | Full, partial, or failed outcome updates task and resource quantities consistently; 12/20 cannot appear as 20 delivered |
| **C-07** | Provenance, freshness, and simulation labelling | Synthetic/stale data must not look authoritative | C-01 | Operational items show source, update time, verification/freshness or simulation status at decision points |
| **C-08** | Critical-event audit timeline | Judges must be able to verify the chain; corrections cannot silently overwrite history | C-01–C-07 | Critical transitions show actor, time, state/quantity change, and reason/evidence reference where applicable |
| **C-09** | Shared-state binding across map, queue, task, and ledger | Separate views must not contradict each other | C-01, M-01–M-04 | A single action produces consistent visible state in coordinator queue, responder task, resource tracker, reporter status, timeline, and map where relevant |

### P0 deletion test

Each item fails the deletion test: removing any one either breaks the end-to-end workflow, removes the selected differentiator, permits a critical integrity failure, or makes organizer-facing state inconsistent. No additional team-created capability qualifies as P0.

---

# 12. P1 — Supporting Scope

| ID | Capability | Value | Why not P0 | When to build |
|---|---|---|---|---|
| **S-01** | Deterministic duplicate candidate and reversible linking | Reduces duplicate work and improves judge story | Core reservation/ownership/outcome proof works with one report; duplicate frequency is unvalidated | After Mandatory + P0 happy path is stable |
| **S-02** | Decline, timeout, and reassignment | Makes failed ownership transfer recoverable | Core can prove explicit acceptance with accept/decline only; automated timeout/reassignment is not essential | After acceptance and happy-path dispatch work |
| **S-03** | Stale-resource reconfirmation action | Protects against acting on old balance | P0 already shows source/time/staleness; interactive reconfirm/block rules need real SOP | After freshness display and reservation work |
| **S-04** | Operational list fallback for map/base failure | Preserves workflow and demo continuity | PS-R04 still requires the real interactive map; fallback is reliability support | After map and core workflow work; before final demo rehearsal |
| **S-05** | Demo reset, deterministic seed, and invariant verification | Enables repeatable race/partial-delivery demonstration | Not a user capability and does not create value by itself | After core persistence and state rules exist; before integration/polish |

P1 may be omitted without invalidating the selected solution, except S-05 should be strongly preferred for demo reliability once the core works.

---

# 13. P2 — Stretch Scope

| ID | Capability | Potential value | Why deferred |
|---|---|---|---|
| **T-01** | Recipient/third-party outcome confirmation | Strengthens trust beyond responder self-report | Authorized confirmer and evidence policy are unknown; coordinator confirmation is sufficient for prototype proof |
| **T-02** | Multilingual controlled labels | Improves inclusion | Target languages and terminology have not been validated; translation quality creates risk |
| **T-03** | Documented sample import/export | Shows future integration boundary | No real agency schema or format is supplied; invented integration would be misleading |
| **T-04** | Recorded official-alert context overlay | Adds situational context | Does not contribute to the selected commitment/ownership/outcome proof and may distract from local workflow |

P2 work is prohibited until all Mandatory and P0 behavior passes the final Definition of Done and critical bugs are resolved.

---

# 14. Explicit Out-of-Scope List

| Excluded capability | Why it is tempting | Why it is OUT | Reconsider when |
|---|---|---|---|
| General-purpose chat, channels, calls, or video | “Communication” sounds like chat | Structured workflow updates satisfy the requirement; chat adds moderation, retention, search, and distraction | A real operator proves task-scoped updates are insufficient |
| Generic AI chatbot | Appears innovative and conversational | Does not fix verification, resource commitment, ownership, or outcome | A validated user job and trusted knowledge source exist |
| AI severity/priority scoring | Looks intelligent and scalable | No labeled data, authority, safety case, or evaluation; errors are high consequence | Real cases, approved rubric, evaluation, and human-governance policy exist |
| AI dispatch/resource recommendation | Promises optimization | Current stock, eligibility, road, and priority data are unavailable | Required data and safe decision policy are validated |
| Computer-vision damage assessment | Visually impressive | No validated local dataset; privacy and false-confidence risk | Separate research/evaluation project with data and expert oversight |
| Predictive demand forecasting | Suggests preparedness value | Historical data are absent and it is outside the core response proof | Pilot generates sufficient historical data and planning need |
| Blockchain ledger | Sounds tamper-proof | Does not make source data true and adds complexity without a multi-party trust requirement | A validated governance problem requires distributed consensus |
| Donation, payment, or beneficiary-entitlement flows | Common crisis-platform feature | Financial/fraud/compliance scope is unrelated to this PS proof | Organizer explicitly adds it or separate product scope is approved |
| Live vehicle/volunteer GPS tracking | Strong map demo | Hardware, privacy, connectivity, and telemetry are unavailable; simulated movement would be theatre | Devices, consent, purpose, retention, and reliable telemetry are secured |
| Custom routing/road optimization | Makes allocation look smart | Disaster-aware road data are unavailable; wrong routes are unsafe | Authoritative dynamic access data and routing requirement exist |
| Social-media ingestion | Broadens incident awareness | API, misinformation, consent, moderation, and duplicate load expand scope | Named source/API and verified operational need are supplied |
| Full offline bidirectional synchronization | Domain-relevant resilience | Conflict policy, devices, and requirement are unvalidated; scope could dominate build | Field tests prove it mandatory and SOP defines conflict authority |
| Offline map packs | Supports field navigation | Licensing, storage, updates, and device support are unnecessary for core | Offline field operation is validated |
| External SMS/push/email integration | Feels production-ready | Credentials, delivery, cost, registration, and network create demo risk | Organizer mandates it or stable provider access and receipts exist |
| Official government API integration | Adds credibility | No documented mandatory endpoint or permission is supplied | Real documentation, access, and operator need exist |
| Satellite/hazard overlays | Visually impressive GIS | Context is not the selected mechanism and may mislead | Authorized source and specific decision use are validated |
| Multiple hazard types | Looks comprehensive | Different taxonomies, severity, evidence, and agencies dilute proof | First scenario is validated and expansion is separately scoped |
| Multiple incompatible resource families | Looks realistic | Kits, medicines, vehicles, beds, and people require different semantics | One resource model is proven and another is validated independently |
| Multi-agency federation/SSO/tenancy | Sounds deployable | No pilot organization, identity owner, or data-sharing agreement exists | Pilot is explicitly multi-agency and governance is resolved |
| Advanced admin console | Seems necessary for management | Prepared accounts/data are enough; enterprise account/reference management is not core | Production onboarding/operations requirements are known |
| Analytics dashboards, heat maps, KPIs | Improve presentation | Synthetic metrics cannot prove impact; dashboard breadth invites generic comparison | Real pilot data and decision question exist |
| National/all-hazard scale | Sounds ambitious | No jurisdiction, operator, data, load test, or integration supports it | Evidence and mandate fundamentally change |
| Native mobile application | May improve field usability | Web platform is organizer wording and sufficient for prototype; native doubles delivery surface | Device research proves web inadequate |
| Microservices/event-bus architecture | Signals technical sophistication | Unnecessary operational complexity for one prototype | Scale/team/operational requirements justify it in technical design |
| Advanced exports/reports | Looks enterprise-ready | Does not prove the core workflow; no requested format | Organizer or named operator supplies a required format |
| Gamification or volunteer points | May encourage engagement | Can distort safety-sensitive behavior and is unrelated to command/accountability | Formal volunteer program validates incentives and safeguarding |

---

# 15. Anti-Scope-Creep Rule

After Scope Lock, no new capability may enter Mandatory or P0 unless at least one condition is met:

1. It is discovered to be an explicit organizer requirement.
2. Without it, the locked core workflow cannot complete.
3. Without it, the main differentiator cannot function.
4. It mitigates a newly discovered **Critical** risk.
5. New evidence invalidates an earlier scope decision.

“Would be cool,” “judges may like it,” “competitors might have it,” “it is easy,” and “AI can do it” are not sufficient reasons.

Every change requires: **New Evidence → Scope Conflict → Explicit Decision → Change Log.** A new feature entering P0 should normally force a comparable reduction elsewhere unless it is an unavoidable organizer requirement.

---

# 16. Scope Change Log

| Change ID | Proposed change | Reason | Evidence | Impact | Approved / Rejected |
|---|---|---|---|---|---|
| — | No post-lock changes recorded | — | — | — | — |

When used, IDs must follow `SC-001`, `SC-002`, and so on. Rejected changes remain in the log to prevent repeated reintroduction.

---

# 17. User / Role Lock

| User / role | Required? | Why | Core actions |
|---|:---:|---|---|
| **Community Reporter** | Yes | Explicit organizer stakeholder and PS-R01/PS-R03 participant | Submit incident; receive reference; view limited status; add one linked clarification/follow-up |
| **Agency Coordinator** | Yes | Primary operational user and authorized decision-maker hypothesis | Review/verify; view map/resources; reserve; assign; send instructions; confirm outcome; inspect audit |
| **Volunteer / Responder** | Yes | Explicit organizer stakeholder and responsibility owner | View offered task; accept/decline; mark dispatch; submit progress/exception/full-or-partial outcome |
| **Resource Custodian** | Represented indirectly | Inventory accountability matters, but a separate fourth interface is not needed for one synthetic pool | Custodian responsibility is represented by coordinator-seeded/reconfirmed resource state |
| **Affected Recipient / Community Lead** | Deferred or synthetic | Could confirm outcome, but identity/evidence policy is unknown | No separate login; may be represented in scenario/evidence only |
| **Supervisor / Auditor** | Represented indirectly | Audit is required, but separate dashboard is unnecessary | Coordinator can open the audit timeline during prototype |
| **System Administrator** | Deferred | Prepared accounts and data are sufficient | No standalone admin workflow |
| **Government warning authority / GIS analyst** | External | Official warnings/layers are outside the system boundary | No prototype user interface |

### Users included

Community Reporter, Agency Coordinator, Volunteer/Responder.

### Users represented only indirectly

Resource Custodian, Supervisor/Auditor, affected recipient.

### Users deferred

System administrator, multi-agency manager, donor, public analyst, fleet operator, warehouse specialist, official alert issuer.

No separate dashboard may be created for an indirect/deferred role without approved scope change.

---

# 18. Workflow Lock

| Workflow | Actors | Trigger | End state | Priority |
|---|---|---|---|---|
| **Report-to-reconciled-outcome** | Reporter, Coordinator, Responder | Community need observed | Full/partial/failed result recorded, quantity reconciled, decision auditable | **Core workflow — Mandatory + P0** |
| **Connected incident reporting** | Reporter, Coordinator | Reporter submits required fields | Persisted report with reference appears in coordinator queue/map | **Mandatory supporting — PS-R01** |
| **Resource availability/distribution tracking** | Coordinator, Responder | Verified incident requires resource | Quantity moves through locked states and remains reconciled | **Mandatory supporting — PS-R02** |
| **Structured coordination** | Reporter, Coordinator, Responder | Clarification or task action is needed | Linked status/instruction/acknowledgement/update is visible and auditable | **Mandatory supporting — PS-R03** |
| **Interactive geographic awareness** | Coordinator; limited reporter view if retained | Incident/resource state exists | User can inspect current mapped state and marker details | **Mandatory supporting — PS-R04** |
| **Verification/rejection** | Coordinator | Unverified report arrives | Verified actionable incident or rejected report | **P0 supporting** |
| **Reservation conflict handling** | Coordinator/System | Competing commitment attempted | One valid reservation; other request gets explicit shortage/conflict | **P0 supporting** |
| **Partial outcome reconciliation** | Responder, Coordinator | Delivered quantity differs from dispatched | Delivered and unresolved/released quantities are explicit | **P0 supporting** |
| Duplicate link/unlink | Coordinator | Similar reports exist | One canonical incident with preserved sources or separate records | **P1 supporting** |
| Decline/timeout/reassign | Responder, Coordinator | Responder cannot own task | Task returns to unowned/next responder | **P1 supporting** |
| Recipient confirmation | Recipient, Coordinator | Responder reports delivery | Independent confirmation/dispute | **P2/deferred** |
| Full offline sync | Responder, Coordinator | Connectivity is lost | Conflicts reconciled after reconnect | **Deferred / OUT** |
| Multi-agency handoff | Multiple agencies | Jurisdiction/ownership changes | Formal external handover | **Deferred / OUT** |

Only workflows listed as Core, Mandatory Supporting, or P0 Supporting may block prototype completion.

---

# 19. State / Lifecycle Lock

These are high-level product states, not a database design.

| Entity | Required states | Valid final state(s) |
|---|---|---|
| **Source report** | Submitted → Under Review → Linked to Incident / Rejected | Linked; Rejected |
| **Canonical incident** | Unverified → Verified → Response Active → Partially Resolved / Resolved / Cancelled | Partially Resolved; Resolved; Cancelled |
| **Resource quantity** | Available → Reserved → In Transit → Delivered; or Reserved → Released; or In Transit → Exception/Returned | Delivered; Released; Returned/Exception resolved |
| **Task** | Offered/Pending Acknowledgement → Accepted / Declined → Dispatched/In Progress → Partially Completed / Completed / Failed / Cancelled | Partially Completed; Completed; Failed; Cancelled |
| **Structured coordination update** | Submitted → Visible/Linked; correction may create a superseding update | Visible/Linked; Superseded |
| **Freshness** | Fresh → Stale → Reconfirmed | Fresh/Reconfirmed; Stale is valid but must remain visibly non-authoritative |
| **Incident/resource map feature** | Reflects underlying record state; no independent lifecycle | Same as source incident/resource state |

### Locked semantic rules

- Submitted report is not verified incident.
- Reserved quantity is not available.
- Offered/sent task is not accepted responsibility.
- Accepted task is not dispatched work.
- Dispatched/in-transit resource is not delivered.
- Partial completion is not full completion.
- Map state cannot be edited independently of the underlying record.

---

# 20. Data Scope Lock

| Data | Source | Classification | Required for | Limitation |
|---|---|---|---|---|
| Organizer requirements | Supplied PS | **Real** | Compliance | Operational details remain unspecified |
| Base-map/location context | Selected permitted source or prepared local context | **Real external or prepared** | PS-R04 | Licensing, completeness, and online availability vary |
| Incident scenario content | Authored demo fixtures | **Synthetic** | All workflows | Cannot establish real incident frequency, language, or complexity |
| New incident submitted during demo | Presenter/user action | **User-generated synthetic** | PS-R01 and core path | Behavior is real; underlying event is not |
| Opening relief-kit balance | Seeded dataset | **Synthetic** | PS-R02, reservation test | Does not prove agency inventory access or freshness |
| Reservation/distribution events | Generated by prototype actions | **User/system-generated real prototype state** | Core proof | Valid only inside the prototype ledger |
| Reporter/coordinator/responder identities | Prepared fictional accounts | **Synthetic** | Role workflow | Does not prove identity, eligibility, or safeguarding |
| Task instructions/status/exception | Entered during demo | **User-generated synthetic** | PS-R03 | Does not prove real notification delivery or field truth |
| Audit events | Generated by the application | **Real prototype state** | Accountability proof | Production immutability/records policy is not proven |
| Official alert/hazard input | Recorded sample, only if P2 built | **Simulated external** | Optional context | Must never be described as a live feed |
| Agency inventory/volunteer directory | Absent; may be represented by fixture | **Simulated external** | Production concept only | No API/access/permission claim |
| GPS/road closure/vehicle data | None | **Deferred** | Not required | No live tracking/routing claim |

### Claims synthetic data cannot validate

- Real response-time reduction or lives/resources saved.
- Actual inventory accuracy, freshness, or agency interoperability.
- Field adoption, user satisfaction, or reduction in parallel messaging/sheets.
- Duplicate-detection accuracy on real reports.
- Disaster-scale throughput, network resilience, or geographic coverage.
- Legal compliance, volunteer safety, or authority correctness.

---

# 21. Integration Scope Lock

| Integration | Decision | Reason | Critical path? | Fallback |
|---|---|---|:---:|---|
| Local application persistence | **REAL** | Core state and multi-role workflow require it | Yes | None; must work |
| Interactive map renderer | **REAL** | Explicit organizer requirement | Yes for compliance/demo | Local/permitted base context; prepared static/local fallback while preserving real marker interaction |
| Online base-map tiles | **REAL if stable, otherwise local/prepared** | Useful context but external network must not control the demo | No | Prepared permitted map context and operational list |
| Geocoding/address search | **DEFERRED** | Manual pin/seeded location satisfies reporting and map requirements | No | Manual map selection or known location |
| Agency inventory/ERP/WMS | **MOCKED / SIMULATED** | No organization, schema, API, or permission exists | No | Synthetic one-resource ledger |
| Volunteer/identity directory | **MOCKED / SIMULATED** | Real identities/eligibility are unavailable and sensitive | No | Prepared fictional role accounts |
| SMS/push/email | **DEFERRED** | In-app assignment and status are sufficient; external delivery adds fragility | No | In-app task queue and explicit acknowledgement |
| Government alert/CAP feed | **DEFERRED; P2 recorded sample only** | Not required for selected workflow and access is unconfirmed | No | Omit entirely |
| Government GIS/satellite layer | **DEFERRED** | External terms/access and relevance are unconfirmed | No | Base map plus synthetic operational features |
| Routing/road closure service | **DEFERRED** | No disaster-aware trusted source | No | Location context only; no route claim |
| Live GPS/vehicle telemetry | **DEFERRED** | Hardware/privacy/connectivity absent | No | User-entered dispatch/outcome state |
| External identity/SSO | **DEFERRED** | Local role separation is sufficient for prototype | No | Prepared local accounts/role switch with real authorization |
| LLM/model provider | **REMOVE ENTIRELY** | No AI is in locked scope | No | Deterministic logic and human decisions |
| Cloud-only hosting/service | **AVOID ON CRITICAL PATH** | Outage/configuration risk adds no core value | No | Locally runnable instance |

No external integration is permitted merely for impressiveness.

---

# 22. AI Scope Lock

## AI we WILL build

**None.** AI is not required by the organizer, selected solution, critical workflow, or differentiator.

## AI we WILL NOT build

- Chatbot or conversational assistant.
- Incident classification or automatic severity/priority.
- Autonomous verification, allocation, assignment, dispatch, or closure.
- Semantic duplicate merging.
- Translation, summarization, computer vision, anomaly detection, or forecasting.

## Deterministic logic instead

- Required-field and controlled-value validation.
- Role and state-transition rules.
- Transactional quantity checks.
- Time/distance/category duplicate cue only if P1 S-01 is reached.
- Freshness calculation from timestamps.
- Quantity reconciliation and invariant checks.

## AI failure fallback

Not applicable because no AI capability exists. No downstream document may add AI without a Scope Conflict and approved change-log entry.

| AI capability | Input | Output | Mandatory? | Core? | Human verification | Fallback |
|---|---|---|:---:|:---:|---|---|
| None approved | — | — | No | No | — | Deterministic/human workflow is the product |

---

# 23. Real vs Simulated

## 23.1 Must actually work

| Item | Why it must be real |
|---|---|
| Incident form validation, submission, persistence, and receipt | PS-R01 cannot be satisfied by a static form or pre-seeded pin |
| Connected propagation to coordinator and map | “Real-time” reporting/visibility requires the new record to move through the running system |
| Interactive map and marker-state binding | PS-R04 requires geographic interaction, not an image or recorded animation |
| Role authorization | Reporter, coordinator, and responder have different powers; fake role views would undermine accountability |
| Verification/rejection gate | Unverified public input cannot automatically become actionable truth |
| Resource quantity state | PS-R02 requires availability and distribution monitoring, not a static stock card |
| Atomic reservation and competing-request rejection | This is the strongest proof that scarce resources cannot be double-promised |
| Assignment offer and responder acknowledgement | This proves responsibility transfer rather than notification theatre |
| Structured coordination updates | PS-R03 requires real communication linked to the operational workflow |
| Dispatch and full/partial/failed outcome transitions | Distribution and completion must be distinguishable |
| Quantity reconciliation | Partial delivery must leave a mathematically and visibly consistent remainder |
| Audit event generation | Judge must reconstruct actors, times, changes, and failed/conflicting actions |
| Shared-state consistency | Queue, task, ledger, reporter status, timeline, and map may not use separate fake data |
| Local critical path | Demo must complete without manual database edits or unavailable external services |

## 23.2 May be simulated

| Simulated component | Why real integration is unavailable/unnecessary | Representation | Why simulation does not invalidate proof |
|---|---|---|---|
| Physical opening inventory | No agency/custodian/data source named | Clearly labelled synthetic depot with count and last-verified metadata | Core claim is correct commitment mechanics, not physical stock accuracy |
| Agency inventory system | No API/schema/permission | “Synthetic source” metadata; no fake live adapter | Internal transaction behavior remains testable |
| Real responders/volunteer registry | Sensitive and organization-specific | Fictional approved responders and role accounts | Authorization/acknowledgement mechanics remain real; safeguarding claim is excluded |
| Reporter/victim data | Real crisis data would create privacy/ethical risk | Fictional scenario and contact/reference | Workflow proof does not require real victims |
| External notifications | Provider credentials and delivery are unnecessary | In-app task/status updates | Responsibility is proven by explicit in-app acknowledgement |
| Official alerts/government GIS | Not part of core and access uncertain | Omitted or clearly recorded sample only at P2 | Local workflow proof is independent of official hazard feeds |
| Vehicle GPS and road status | Hardware/data absent | Human-entered dispatch/outcome; static locations | Prototype does not claim live tracking or safe routing |
| Large-scale infrastructure/load | No production scale supplied | Small deterministic dataset | Logic can be proven without claiming scale |
| Production identity provider | No operator directory | Local prepared accounts with real role enforcement | Role boundaries are testable without federation |

Every simulation must be visible in the interface or demo disclosure. A recorded sample must never be described as a live integration.

---

# 24. Critical Path

**Minimum technical chain:**

**Role session → incident input → validation → persistence → coordinator verification → resource query → atomic reservation → task creation → responder acknowledgement → dispatch/outcome update → quantity reconciliation → audit generation → shared UI/map refresh**

| Step | Required component | Failure effect | Fallback |
|---|---|---|---|
| 1. Enter reporter role | Local authentication/role context | Cannot prove role separation | Prepared local account/session; no external SSO |
| 2. Submit incident | M-01 validation and input flow | PS-R01 fails; demo cannot start | Pre-seeded alternate report is backup only, not primary proof |
| 3. Persist and surface report | C-01/C-09 | New report disappears or views diverge | No acceptable feature fallback; restore/reset instance |
| 4. Show on interactive map | M-04/C-09 | PS-R04 demonstration fails | Local/prepared base context; marker interaction remains real |
| 5. Verify incident | C-02/C-03 | Untrusted report drives action | No acceptable fallback; must work |
| 6. Reserve kits | M-02/C-04 | Primary differentiator and resource tracking fail | No acceptable fallback; deterministic reset and rerun |
| 7. Send task/instructions | M-03/C-03 | Coordination proof fails | In-app queue; no external message required |
| 8. Accept task | C-05 | Ownership proof fails | No acceptable fallback; prepared responder session |
| 9. Dispatch and report partial outcome | M-02/M-03/C-06 | Distribution/outcome proof fails | Known fixture/reset; no manual data edits |
| 10. Reconcile and audit | C-06/C-08 | Core integrity cannot be verified | No acceptable fallback; invariant check/reset |
| 11. Reflect reporter/map status | M-03/M-04/C-09 | Cross-role and shared-picture claim weakens | Refresh/reload allowed; state must come from same persistence |

Mandatory and P0 work on this chain always outrank P1/P2 and visual polish.

---

# 25. Dependency Lock

| Dependency | Needed by | External? | Risk | Demo fallback | Classification |
|---|---|:---:|---|---|---|
| Local runtime/application | All | No | Medium | Reproducible local start and prepared backup environment | **Allowed on critical path** |
| Local persistent data store | C-01–C-09 | No | Medium | Resettable seed/backup; no static mock substitute | **Allowed on critical path** |
| Browser | All interactions | No/standard | Low | Supported prepared browser | **Allowed on critical path** |
| Map rendering library | PS-R04 | Usually bundled | Low–Medium | Bundled/local assets | **Allowed on critical path** |
| Online map tiles | Visual context | Yes | Medium–High | Prepared permitted local/static context plus list | **Avoid on critical path** |
| Internet | External assets/services | Yes | High during demo | Local critical path | **Avoid on critical path** |
| Cloud hosting | Shared remote access | Yes | Medium–High | Local instance | **Avoid on critical path** |
| Government/agency API | None in locked core | Yes | High | Omit | **Remove entirely** |
| SMS/push/email provider | None in locked core | Yes | High | In-app updates | **Remove entirely** |
| Geocoder/router | None in locked core | Yes | High | Manual/seeded coordinate | **Remove entirely** |
| LLM/AI provider | None | Yes | High | Deterministic workflow | **Remove entirely** |
| Live GPS/hardware | None | Yes | High | User-entered status | **Remove entirely** |

---

# 26. Screen Budget

This is an interaction-surface budget, not UI design.

| Interaction surface | User | Required workflow | Mandatory? |
|---|---|---|:---:|
| **Reporter intake and status surface** | Community Reporter | Submit incident; receive reference; view limited status; add clarification | Yes — PS-R01 and PS-R03 |
| **Coordinator operations workspace** | Agency Coordinator | Review/verify; inspect map/resources; reserve; assign; reconcile; inspect audit | Yes — all four requirements plus P0 |
| **Responder task surface** | Volunteer/Responder | View offer/instructions; accept/decline; dispatch; update exception/outcome | Yes — PS-R03 and PS-R02 |
| **Interactive map region/view** | Primarily Coordinator; optional limited reporter context | View incident/resource locations and state | Yes — PS-R04; should be part of coordinator surface, not necessarily a separate page |
| **Audit/timeline detail** | Coordinator | Verify end-to-end evidence | P0; should be embedded/detail view, not a new dashboard |
| **Admin surface** | Administrator | Account/data administration | No — OUT |
| **Analytics dashboard** | Supervisor/Analyst | Trends and KPIs | No — OUT |

**Maximum budget:** three role-oriented surfaces. Map, resource, task, and audit interactions should live within those surfaces rather than spawning separate dashboards for every entity.

---

# 27. Security Scope

| Classification | Locked behavior |
|---|---|
| **Must implement** | Distinct prepared identities/role contexts; server-side authorization for critical actions; allowed-transition checks; input validation; protection against negative quantities/over-reservation; synthetic PII only; audit of critical actions; secrets kept out of client-visible source; no reporter access to restricted operational details. |
| **Prototype simplification** | Local prepared accounts; simplified sign-in/session flow; one organization/area; synthetic contacts/locations; coordinator represents custodian; no password reset, federation, MFA, tenant administration, or fine-grained agency hierarchy. Simplification may not remove actual authorization checks. |
| **Production requirement** | Real IAM/MFA/account recovery, personnel lifecycle, least-privilege policy review, encryption/key/secret management, access logging, retention/deletion, threat modeling, abuse/rate limiting, monitoring, security testing, backup/restore, incident response, legal/privacy review, and volunteer/victim safeguarding. |

Authentication presentation may be simplified; authorization must not be faked because role separation is part of the core claim.

---

# 28. Non-Functional Scope

| NFR | Prototype requirement | Production expectation |
|---|---|---|
| Reliability | Critical demo path runs repeatedly from a known state; failed actions show an error and do not corrupt quantities | Defined availability, recovery objectives, backup, failover, operational support |
| Data persistence | Critical records survive navigation/reload and role changes during the demo | Durable managed storage, backup/restore, migration, retention policy |
| Consistency | Reservation and quantity transitions preserve non-negative/reconciled balances | Concurrency across integrated systems and distributed/offline clients |
| Connected update behavior | New reports and state changes become visible during the running demo without manual database edits; no unsupported SLA number | Measured latency/freshness classes and service objectives |
| Responsiveness | Usable on the prepared laptop and a mobile-width browser for reporter/responder actions | Representative devices, networks, accessibility and performance testing |
| Accessibility | Keyboard-reachable core actions, labels for controls, readable contrast, text status not color-only | WCAG target selected with formal audit and assistive-technology testing |
| Browser support | One prepared current browser plus basic verification in one additional current browser if time permits | Supported-browser matrix and regression testing |
| Degraded behavior | Map/base failure must not corrupt core state; P1 list fallback preferred; external failure is visible | Validated offline/degraded SOP, queues, conflict resolution, cached assets |
| Security | Real role authorization and validated inputs using synthetic PII | Hardened IAM, encryption, monitoring, incident response, security review |
| Privacy | Collect only scenario-minimum fields; no real victim/volunteer PII; operational details restricted by role | Jurisdiction-specific data classification, lawful basis, retention, access and deletion processes |
| Observability | User-visible errors and sufficient local logs for demo diagnosis without exposing secrets | Metrics, traces, alerts, audit protection, operational dashboards |

No unsupported throughput, uptime, or latency number is locked because the organizer supplied none.

---

# 29. Definition of Done — Organizer Requirements

## PS-R01 — Incident Reporting

DONE when:

- [ ] Reporter can enter location, type, and severity plus a concise description.
- [ ] Required/invalid input is rejected visibly.
- [ ] Valid submission persists and receives a reference/receipt.
- [ ] The new report appears in the coordinator queue and interactive map during the running demo.
- [ ] It begins as unverified and participates in the core workflow.
- [ ] No manual database edit is needed.
- [ ] Synthetic scenario status is disclosed.

## PS-R02 — Resource Tracking

DONE when:

- [ ] One emergency resource has an opening available quantity, source, and last-updated indicator.
- [ ] Reservation decreases available and increases reserved quantity.
- [ ] A conflicting over-reservation is rejected without corrupting totals.
- [ ] Dispatch moves the correct quantity to in-transit.
- [ ] Full/partial/failed outcome changes delivered and unresolved/released state correctly.
- [ ] Quantities reconcile in every demonstrated state.
- [ ] State appears in the coordinator workspace and map/resource detail.
- [ ] Synthetic opening balance is explicitly disclosed.

## PS-R03 — Coordinated Response

DONE when:

- [ ] Reporter receives a reference and can view limited status.
- [ ] Reporter can submit one linked clarification/follow-up or the coordinator can request/record it.
- [ ] Coordinator sends a task with incident/resource context and instructions.
- [ ] Responder can accept or decline; offered is visibly different from accepted.
- [ ] Responder can record dispatch, progress/exception, and full/partial/failed outcome.
- [ ] Coordinator can review and confirm/follow up.
- [ ] Structured updates remain linked to the incident/task with actor/time.
- [ ] No external messaging service is falsely presented as implemented.

## PS-R04 — Real-Time Geographic Visibility

DONE when:

- [ ] Interactive map can pan/zoom/select operational markers.
- [ ] Submitted incident appears at its entered/selected location.
- [ ] Resource location is visible.
- [ ] Marker styling/legend/text distinguishes relevant incident/resource state without relying only on color.
- [ ] Marker detail reflects verification, freshness, quantity or task/outcome state as applicable.
- [ ] State changes during the demo update the map from shared persisted state.
- [ ] Any synthetic geography or prepared base context is disclosed.
- [ ] No live GPS, routing, or external feed is implied.

---

# 30. Definition of Done — Core Prototype

The prototype is complete only when:

- [ ] All four organizer requirements meet their requirement-specific Definition of Done.
- [ ] The core report-to-reconciled-outcome journey completes end-to-end.
- [ ] Every P0 capability C-01 through C-09 works.
- [ ] Incident, resource, task, coordination, outcome, and audit state persist consistently.
- [ ] Reporter, Coordinator, and Responder can perform only their locked actions.
- [ ] An unverified report cannot be allocated resources.
- [ ] Competing reservations cannot overcommit the resource pool.
- [ ] Offered/sent assignment does not become owned before acknowledgement.
- [ ] Dispatch does not appear as delivery.
- [ ] A 12-of-20 partial outcome leaves exactly 8 explicitly unresolved/released/follow-up; it never appears as 20 delivered.
- [ ] Critical state changes produce attributable audit events.
- [ ] Map, queue, task view, resource tracker, reporter status, and timeline agree.
- [ ] Errors are visible and do not silently corrupt state.
- [ ] Synthetic and simulated elements are clearly identified.
- [ ] The main differentiator is observable without explanation-only claims.
- [ ] The demo runs from start to finish without manual database edits, live APIs, SMS, GPS, AI, or cloud-only dependencies.
- [ ] No OUT-of-scope capability is required to complete or explain the core journey.
- [ ] P1/P2 incompleteness does not block completion.

Pages, buttons, route stubs, polished mockups, or a single scripted success do not constitute completion.

---

# 31. Demo Scope Lock

## Locked demo narrative

| Demo element | Locked content |
|---|---|
| **Demo starting state** | Synthetic Riverside Ward area; Depot A has 20 fresh, available relief kits; no active commitment; prepared Reporter, Coordinator, and Responder roles. |
| **Actor 1 action** | Reporter submits a flood-relief incident with location, type, severity, and description, then receives a reference and sees “submitted/unverified.” |
| **System response** | Report persists, appears in coordinator queue and interactive map, and is visibly marked unverified with source/time. |
| **Actor 2 action** | Coordinator reviews and verifies the incident, sees the kit pool, reserves 20, and sends a structured task with instructions. |
| **Core mechanism** | A competing request for 10 kits is rejected because availability is zero; assignment remains pending until responder accepts. |
| **State change** | Responder accepts, marks 20 in transit, records that 12 were delivered and 8 are blocked by access. Resource, task, incident, reporter status, map, and timeline update consistently. |
| **Final outcome** | Coordinator confirms the partial result and leaves/creates the explicit 8-kit follow-up or exception. The incident is partially resolved, not falsely complete. |
| **Differentiator moment** | One of two competing reservations wins; “sent” remains distinct from “accepted”; “20 dispatched” becomes “12 delivered + 8 unresolved.” |
| **Organizer requirements demonstrated** | PS-R01 submission; PS-R02 availability/distribution; PS-R03 cross-role updates and task coordination; PS-R04 interactive stateful map. |

## Demo-step traceability

| Demo step | Capability proven | PS requirement proven |
|---|---|---|
| 1. Reporter submits incident | M-01, C-01, C-03 | PS-R01 |
| 2. Reference/status appears | M-01, M-03, C-09 | PS-R01, PS-R03 |
| 3. Incident appears on map | M-04, C-09 | PS-R04 |
| 4. Coordinator verifies | C-02, C-03, C-07, C-08 | Supports PS-R01/PS-R03 |
| 5. Coordinator reserves 20 | M-02, C-04 | PS-R02 |
| 6. Competing reservation fails | C-04, C-08 | PS-R02; differentiator proof |
| 7. Coordinator sends task/instructions | M-03, C-03 | PS-R03 |
| 8. Responder accepts | C-05, C-08 | PS-R03 |
| 9. Responder dispatches and reports exception | M-02, M-03, C-06 | PS-R02, PS-R03 |
| 10. Coordinator confirms 12/20 and follow-up | C-06, C-08 | PS-R02, PS-R03 |
| 11. Map/status/timeline reconcile | M-04, C-09 | PS-R04 and full workflow proof |

No P2 feature may appear in the critical demo. P1 S-01 may appear only if stable and must not lengthen or confuse the central story.

---

# 32. Demo Backup Boundary

| Element | Failure risk | Backup | Does backup still prove core claim? |
|---|---|---|---|
| Online map tiles | Internet/key/rate failure | Bundled/local permitted base context or prepared static context with real interactive markers; P1 list fallback for workflow | **Yes for workflow; map compliance requires interactive markers to remain real** |
| Local application start | Environment/configuration error | Rehearsed packaged/local backup instance; captured video only as last evidence | **Backup instance yes; video is evidence but weaker than live proof** |
| Dirty demo database | Previous run consumes stock or leaves task active | One-command/button deterministic reset or restored seed | **Yes** |
| Role session confusion | Wrong account/session state | Prepared role accounts and clear role switch/login flow | **Yes** |
| Reservation race nondeterminism | Both actions not initiated as expected | Repeatable controlled competing-request test and automated assertion | **Yes** |
| Map marker refresh delay | Marker looks stale | Safe refresh/reload that reads persisted state; show resource/task view first | **Yes**, if data source remains shared and no manual edit occurs |
| External messaging | Not used | In-app task queue/status | **Yes** |
| Cloud/internet outage | Remote instance unavailable | Fully local critical path | **Yes** |
| P1 duplicate feature fails | Secondary story breaks | Skip it entirely | **Yes** |
| Partial-outcome fixture inconsistency | Totals do not reconcile | Automated/preflight invariant test, deterministic reset, rerun | **Yes after correct rerun; never narrate around wrong totals** |

The backup must preserve the claim. A screenshot of a reservation result is not a substitute for a functioning reservation invariant.

---

# 33. Scope Stress Test

| P0 capability | What happens if removed? | Classification | Simplification allowed |
|---|---|---|---|
| C-01 Persistent shared state | Roles/views cannot share or prove a lifecycle | **Cannot Remove** | Use one local store; no production HA/migration tooling |
| C-02 Human verification | Public report becomes actionable without authority | **Cannot Remove** | One coordinator action and provisional evidence rule only |
| C-03 Authorization/transitions | Any role can change critical state; statuses become cosmetic | **Cannot Remove** | Three roles; no complex organization hierarchy |
| C-04 Atomic reservation | Primary double-promise differentiator fails | **Cannot Remove** | One resource/depot; one clear invariant |
| C-05 Acknowledgement | Sent task can appear owned; responsibility-transfer proof fails | **Cannot Remove** | Accept/decline essential; automated timeout/reassign stays P1 |
| C-06 Partial outcome/reconciliation | Dispatch can masquerade as completion; distribution tracking weakens | **Cannot Remove** | Full, partial, failed only; no complex returns/substitution model |
| C-07 Provenance/freshness/simulation labels | Synthetic/stale data looks authoritative | **Cannot Remove** | Basic source/time/state labels; reconfirm workflow stays P1 |
| C-08 Audit timeline | Judge cannot verify handoffs or corrections | **Cannot Remove** | Critical events only; no enterprise reporting/export |
| C-09 Cross-view shared-state binding | Map/dashboard/task can contradict each other | **Cannot Remove** | Eventual UI refresh is acceptable; no production real-time SLA |

### Aggressive cut result

- **Could simplify:** every P0 is constrained to one area, incident family, resource, and happy-path-plus-one-failure scenario.
- **Should downgrade:** deterministic duplicate linking, timeout/reassignment, stale reconfirmation, list fallback, and demo utilities remain P1.
- **Should remove:** no additional P0 item can be removed without invalidating the core proof or mandatory behavior.

---

# 34. Organizer Compliance Audit

| PS ID | Requirement | Included? | Implementation depth | Where implemented | Demo proof |
|---|---|:---:|---|---|---|
| PS-R01 | Incident Reporting | Yes | Standard | M-01, C-01–C-03, C-09; Reporter surface | Live report with location/type/severity persists, receives reference, enters queue/map |
| PS-R02 | Resource Tracking | Yes | Deep | M-02, C-04, C-06–C-09; Coordinator/Responder surfaces | Reserve 20, reject overcommitment, move 20 in transit, record 12 delivered + 8 unresolved |
| PS-R03 | Coordinated Response | Yes | Deep coordination / minimal communication | M-03, C-03, C-05, C-06, C-08, C-09; all three surfaces | Reporter status/follow-up, task instructions, acceptance, progress/exception, outcome, confirmation |
| PS-R04 | Real-Time Geographic Visibility | Yes | Standard | M-04, C-07, C-09; interactive map in coordinator workspace | New incident/resource visible and markers reflect lifecycle state |

**Mandatory PS Requirements:** 4  
**Accounted For:** 4  
**Missing:** 0  
**Ambiguous:** 2

Ambiguities retained:

1. “Real time” has no latency threshold; prototype commitment is connected in-session propagation without manual data edits.
2. “Communication” has no channel/depth definition; prototype uses structured, workflow-scoped updates across all named actor groups rather than general chat.

Scope is finalized despite these ambiguities because the chosen interpretations satisfy the wording without inventing unsupported infrastructure. Organizer clarification supersedes them and must be logged.

---

# 35. Final Locked Scope

## 🔒 Locked Prototype Scope

### 🔴 Mandatory Organizer Requirements

- **M-01 / PS-R01:** Connected incident submission with location, type, severity, receipt, persistence, coordinator visibility, and map appearance.
- **M-02 / PS-R02:** One emergency-resource pool tracked across available, reserved, in-transit, delivered, and released/exception quantities.
- **M-03 / PS-R03:** Structured cross-role communication and task coordination: reporter status/follow-up, coordinator instructions, responder acknowledgement/progress/exception/outcome.
- **M-04 / PS-R04:** Interactive map of incident and resource locations bound to current persisted state.

### 🟠 P0 — Core

- C-01 Persistent shared operational state.
- C-02 Human verification/rejection.
- C-03 Role authorization and state-transition enforcement.
- C-04 Atomic reservation and overcommitment prevention.
- C-05 Explicit assignment acknowledgement.
- C-06 Full/partial/failed outcome with quantity reconciliation.
- C-07 Provenance, freshness, and simulation labelling.
- C-08 Critical-event audit timeline.
- C-09 Shared-state binding across map, queue, task, ledger, status, and timeline.

### 🟡 P1 — Supporting

- S-01 Deterministic duplicate candidate and reversible linking.
- S-02 Decline, timeout, and reassignment recovery.
- S-03 Stale-resource reconfirmation action.
- S-04 Operational list fallback for map/base failure.
- S-05 Demo reset, deterministic seed, and invariant verification.

### 🟢 P2 — Stretch

- T-01 Recipient/third-party outcome confirmation.
- T-02 Multilingual controlled labels.
- T-03 Documented sample import/export after a real format is supplied.
- T-04 Recorded official-alert context overlay.

### ⚫ OUT

- General chat/calls/video and social features.
- All AI/ML, chatbot, computer vision, forecasting, or recommendation features.
- Blockchain.
- Donations/payments/gamification.
- Live GPS/vehicles/drones, custom routing, or road optimization.
- Full offline synchronization and offline map packs.
- External SMS/push/email.
- Live government APIs, satellite layers, social-media ingestion.
- Multi-hazard, multi-resource-family, national, or multi-agency expansion.
- Federation/SSO, advanced admin, analytics dashboards, heat maps, advanced exports.
- Native mobile application and microservices architecture.

---

# 36. Implementation Order Guardrail

This is a priority rule, not a detailed implementation plan.

| Priority | Work class | Rule |
|---:|---|---|
| **1** | Critical infrastructure | Establish local role context, persistent shared state, transition/invariant foundation, and a locally runnable path. |
| **2** | Mandatory + P0 end-to-end skeleton | Make report → verify → reserve → assign → accept → dispatch → outcome → audit complete with minimal interactions. |
| **3** | Main differentiator | Prove competing reservation rejection, explicit acknowledgement, and 12/20 partial reconciliation. |
| **4** | Required reliability/error handling | Add invalid-action errors, reset/preflight, synthetic labels, and map/external fallback needed for demo integrity. |
| **5** | P1 | Build only after the complete core passes the Definition of Done. |
| **6** | P2 | Build only after critical bugs are resolved and demo is repeatable. |

UI polish, animations, branding, and additional dashboards may not conceal or delay incomplete core behavior.

---

# 37. Downstream Document Rules

## PRD

- May elaborate locked requirements, actors, behavior, edge cases, and acceptance criteria.
- May not add capabilities, roles, workflows, integrations, or AI.
- Must preserve category IDs and priority.

## UI/UX

- May design interaction for the three locked surfaces and required states.
- May not invent dashboards, social/chat modules, admin systems, analytics, or new actor journeys.
- Must not collapse locked state distinctions for visual simplicity.

## Technical Design

- May choose implementation mechanisms, data structures, interfaces, and deployment approach.
- May not expand product scope or introduce infrastructure that implies unsupported capabilities.
- Must make C-04 reservation and C-06 reconciliation enforceable, not client-only conventions.

## Implementation Plan

- May sequence, assign, and estimate locked work.
- May not promote P1/P2 or reopen rejected ideas without scope change approval.

## Demo / PPT

- May communicate only functionality that works or is explicitly labelled simulated/planned.
- May not claim live agency data, AI, GPS, external messaging, scale, impact, or production readiness.
- Must distinguish prototype mechanics from pilot evidence.

---

# 38. Conflict Rule

If a downstream agent finds that this Scope Lock prevents a necessary implementation, it must output exactly this structure before changing anything:

```text
SCOPE CONFLICT

Affected scope item:
Reason:
Evidence:
Proposed change:
Impact:
Alternative without changing scope:
```

The agent must not silently modify priority, add capability, create a new role/workflow, or reclassify an OUT item.

---

# 39. Final Scope Statement

This prototype exists to prove that one community incident can become a verified, resource-backed, explicitly owned, and honestly reconciled emergency response without double-promising scarce supplies or confusing dispatch with delivery. It will satisfy the organizer’s mandatory requirements through connected incident reporting, one real resource/distribution ledger, structured cross-role coordination, and an interactive map driven by the same persisted state. Its deepest implementation will focus on atomic reservation, acknowledgement of responsibility, partial-outcome reconciliation, provenance, and auditability. It will intentionally not attempt AI, general chat, live external integrations, GPS/routing, full offline synchronization, multiple hazard/resource models, or production-scale infrastructure. The prototype will be considered complete when all four organizer requirements and C-01 through C-09 work end-to-end, the 20-kit reservation race and 12-delivered/8-unresolved scenario reconcile correctly, the demo requires no manual database edit or fragile external service, and all synthetic or simulated elements are unmistakably disclosed.

---

# 40. Inputs for `05-PRD.md`

## Product definition

Verified Response Ledger: a narrow full-stack GIS coordination prototype that binds incident verification, resource commitment, responsibility acknowledgement, distribution/outcome state, structured updates, and audit history.

## Primary users

- Community Reporter.
- Agency Coordinator/Dispatcher.
- Volunteer/Responder.

Resource Custodian and Supervisor are represented through coordinator actions; no separate interface is authorized.

## Organizer requirement IDs

- PS-R01 Incident Reporting.
- PS-R02 Resource Tracking.
- PS-R03 Coordinated Response.
- PS-R04 Real-Time Geographic Visibility.

## Mandatory capabilities

- M-01 Connected incident submission, receipt, persistence, queue/map visibility.
- M-02 One-resource availability/distribution tracking.
- M-03 Structured reporter/coordinator/responder communication and task coordination.
- M-04 Interactive operational map bound to shared state.

## P0 capabilities

- C-01 Persistent shared operational state.
- C-02 Human verification/rejection.
- C-03 Role authorization and transition enforcement.
- C-04 Atomic reservation/overcommitment prevention.
- C-05 Explicit assignment acknowledgement.
- C-06 Full/partial/failed outcome and quantity reconciliation.
- C-07 Provenance/freshness/simulation labelling.
- C-08 Critical-event audit timeline.
- C-09 Cross-view shared-state binding.

## P1 capabilities

- S-01 Deterministic duplicate cue and reversible link.
- S-02 Decline/timeout/reassignment.
- S-03 Stale-resource reconfirmation.
- S-04 Operational list fallback.
- S-05 Demo seed/reset/invariant check.

## P2 capabilities

- T-01 Recipient confirmation.
- T-02 Multilingual controlled labels.
- T-03 Real-format sample import/export if supplied.
- T-04 Recorded official-alert overlay.

## Explicit OUT list

General chat/calls/video; all AI/ML; blockchain; donations/payments; live GPS; custom routing; social ingestion; full offline sync/map packs; external messaging; government/satellite live integration; multi-hazard/resource/agency/national expansion; enterprise IAM/admin; analytics/heat maps; native app; microservices; advanced exports.

## Core workflow

Report → validate → verify → inspect resource → atomically reserve → send task/instructions → acknowledge → dispatch → full/partial/failed outcome → reconcile/confirm/follow up → audit and shared map/status update.

## Supporting workflows

- Reporter status and clarification.
- Verification/rejection.
- Reservation conflict handling.
- Structured progress/exception update.
- Partial outcome reconciliation.
- P1 duplicate linking, decline/timeout/reassignment, stale reconfirmation, list fallback, demo reset.

## Required states

- Report: Submitted → Under Review → Linked / Rejected.
- Incident: Unverified → Verified → Response Active → Partially Resolved / Resolved / Cancelled.
- Resource: Available → Reserved → In Transit → Delivered; with Released/Returned/Exception paths.
- Task: Offered → Accepted/Declined → Dispatched/In Progress → Partially Completed/Completed/Failed/Cancelled.
- Freshness: Fresh → Stale → Reconfirmed.

## System boundary

Inside: prototype capture, roles, verification, one-resource commitment/distribution, task acknowledgement/outcome, structured updates, map/list state, audit. Outside: official authority, physical inventory truth, volunteer credentialing, real emergency dispatch, telecom, routing/GPS, official hazard systems, legal policy, and physical delivery.

## Data boundary

- Real: organizer requirements; permitted base-map context if selected.
- Synthetic: incidents, identities, opening stock, depot, evidence, scenario.
- User/system-generated prototype state: submissions, reservations, assignments, updates, outcomes, audit.
- Simulated external: agency inventory/directory and optional recorded alert context.
- Deferred: real victims, operational stock, GPS, roads, facility capacity, live agency feeds.

## Integration decisions

- Real: local persistence and interactive map renderer.
- Optional real with fallback: online map tiles.
- Mocked: agency inventory and volunteer directory.
- Deferred/removed: all other external integrations.

## AI decisions

No AI is authorized. Deterministic rules and human decisions are the locked approach.

## Must-be-real components

Incident submission/persistence; cross-role authorization; verification; resource state; atomic reservation; acknowledgement; structured updates; dispatch/outcome; partial reconciliation; audit; map/state binding; connected UI updates.

## Simulated components

Physical stock, real people/events, agency APIs/directory, notifications, official feeds, GPS/routes, production identity and infrastructure.

## Critical dependencies

Local runtime, local persistent store, prepared browser, bundled map renderer, and permitted/local map context. Internet/cloud/third-party services are prohibited from being necessary for the critical path.

## Security boundary

Real role authorization, transition checks, input validation, synthetic PII, critical audit, and secret hygiene. Enterprise IAM, MFA, retention, encryption operations, monitoring, and legal compliance are production requirements.

## Prototype NFRs

Repeatable local demo; persistent and reconciled state; visible errors; connected in-session updates; keyboard/readability basics; prepared browser support; no silent external failure; no unsupported performance SLA.

## Definition of Done

All PS-R01–PS-R04 criteria pass; all C-01–C-09 work; core demo completes without manual data edits or external dependency; quantities reconcile; roles and state distinctions are enforced; map/views agree; simulations are disclosed.

## Critical demo path

Reporter submits → coordinator verifies → reserves 20 → competing reservation fails → assigns → responder accepts → dispatches 20 → delivers 12 with 8 exception → coordinator confirms/follows up → map/status/ledger/audit reconcile.

## Differentiator to preserve

Reported ≠ verified; displayed available ≠ uncommitted; sent ≠ accepted; dispatched ≠ delivered; partial ≠ complete.

## Remaining assumptions

- A real coordinator/operator and one-organization pilot exist.
- Reservation and acknowledgement match the actual SOP.
- A custodian can maintain accountable stock.
- Web interaction fits target users/devices.
- Synthetic data and a narrow scenario satisfy organizer/judge expectations.
- Verification and closure evidence can be defined.
- Connected in-session updates are a legitimate prototype interpretation of “real time.”

## Scope change rules

Only new organizer evidence, a broken core workflow/differentiator, a newly discovered Critical risk, or evidence invalidating a prior decision can trigger change. Every change requires a `SCOPE CONFLICT`, explicit decision, and Scope Change Log entry.

The PRD must convert these locked decisions into detailed product requirements and acceptance criteria. It must not reopen solution selection or add functionality.

---

# Final Quality Check

| Test | Result | Evidence |
|---|---|---|
| Organizer compliance | **Pass** | 4/4 requirements included with observable proof |
| Root-cause fit | **Pass** | Reservation, acknowledgement, outcome, freshness, and audit remain central |
| Workflow completeness | **Pass** | Reporter → Coordinator → Responder → Coordinator closes/reconciles |
| Differentiation | **Pass** | Atomic commitment and explicit handoffs are Mandatory/P0, not stretch |
| Scope discipline | **Pass** | One area, incident family, resource pool, and three surfaces; aggressive OUT list |
| Data reality | **Pass** | Real, synthetic, user-generated, external, and simulated data are separated |
| Implementation integrity | **Pass** | Must-be-real list forbids static/mock core behavior |
| Demo integrity | **Pass** | Locked live journey and fallback boundary defined |
| Dependency safety | **Pass** | No unreliable external dependency is necessary for the critical path |
| Downstream safety | **Pass** | IDs, categories, workflows, states, boundaries, conflict rule, and PRD handoff are explicit |

---

## 🔐 Freeze Rule

**Scope is frozen.** No downstream agent may introduce new functionality because it appears useful or impressive.

**New Evidence → Scope Conflict → Explicit Decision → Change Log. Never silent expansion.**

