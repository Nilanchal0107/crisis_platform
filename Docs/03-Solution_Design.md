# Crisis Response Platform — Solution Design and Selection

**Stage:** Step 3 — after `docs/01-PS_Analysis.md` and `docs/02-SWOT.md`  
**Purpose:** Generate, compare, stress-test, and select a solution direction for Scope Lock  
**Analysis date:** 20 September 2026  
**Status:** Solution direction selected; not a PRD, detailed architecture, technical design, UI specification, or implementation plan

---

## Evidence Discipline

| Label | Meaning |
|---|---|
| **[PS]** | Directly supported by the supplied Problem Statement. |
| **[PSA]** | Finding carried from `01-PS_Analysis.md`. |
| **[SWOT]** | Strategic conclusion or guardrail carried from `02-SWOT.md`. |
| **[EXT]** | Supported by an external primary/official source already cited in the earlier analysis. |
| **[DESIGN REASONING]** | Design conclusion derived from the evidence. |
| **[ASSUMPTION—VALIDATE]** | Necessary but unverified condition. |
| **[UNKNOWN]** | The supplied material does not resolve it. |

No new field research, operator interview, SOP, production dataset, or integration access was supplied for this stage. The selected direction is therefore a **prototype hypothesis**, not a claim of deployability.

---

# 1. Design Baseline

| Design input | Finding |
|---|---|
| **Problem to solve** | Emergency-response actors lack one trusted workflow that converts uncertain reports into verified needs, valid resource commitments, acknowledged responsibility, and confirmed outcomes. **[PSA]** |
| **Root causes** | Fragmented incident/resource/task/outcome records; hidden verification and freshness; availability disconnected from reservation; assignments without acknowledgement; dispatch conflated with delivery; stale/conflicting state after connectivity loss. **[PSA]** |
| **Primary users** | Central hypothesis: accountable coordinator/dispatcher. Supporting users: reporter, verifier/operator, resource custodian, responder/volunteer, confirming actor, supervisor. Exact authority remains unvalidated. **[PSA][ASSUMPTION—VALIDATE]** |
| **Critical existing workflow** | Report → manual transcription/verification → separate stock check → informal allocation/assignment → fragmented status updates → ambiguous closure → manual reconciliation. **[PSA]** |
| **Highest-value opportunities** | Governed report-to-outcome chain; transactional commitment; explicit responsibility transfer; partial-outcome reconciliation; provenance/freshness; audit history; degraded-mode honesty. **[SWOT]** |
| **Existing-solution gaps** | The market already contains alerting, GIS, crowdsourcing, offline collection, and broad command platforms. The unvalidated gap is a small local layer that makes operational handoffs and resource truth explicit without replacing authoritative systems. **[PSA][SWOT]** |
| **Strongest differentiation opportunities** | Concurrent reservation integrity; sent ≠ accepted; dispatched ≠ delivered; partial fulfilment; provenance/freshness; auditable state changes; visible degraded state. **[SWOT]** |
| **Hard constraints** | Unknown operator, jurisdiction, SOP, hazard scope, and authority; no live inventory or responder directory; sensitive location/identity; unreliable connectivity; different resource semantics; external-service uncertainty. **[SWOT]** |
| **Data available** | PS requirements, earlier research, synthetic incidents/resources/roles/events, and legally usable base-map context subject to licence. **[SWOT]** |
| **Data missing** | Real incident logs, authoritative taxonomy, accountable live inventory, responder eligibility/availability, verification and closure policies, dynamic access data, integration documents. **[SWOT]** |
| **Dangerous dependencies** | Agency inventory, government APIs, live maps/geocoding/routing, identity systems, notification providers, connectivity, GPS, and optional model providers. None should be critical to the demo. **[SWOT]** |
| **Critical risks** | Fictional workflow; wrong/stale inventory; concurrency and offline conflicts; privacy/safety harm; parallel WhatsApp/sheets; generic-dashboard positioning; demo dependency failure. **[SWOT]** |
| **Most dangerous assumption** | Reliable, current resource data can be obtained and maintained. **[SWOT]** |
| **Solution-design guardrail** | Prove one locally controlled, human-authorized report-to-outcome workflow; keep external systems and AI outside the critical path; label synthetic and simulated elements; do not claim field impact. **[SWOT]** |

---

# 2. Design Principles

| Principle | Derived from | Design consequence |
|---|---|---|
| **1. Operational truth before visual breadth** | A map without provenance can create false confidence. **[PSA]** | GIS must reflect governed state; it cannot be the authoritative record by itself. |
| **2. One complete handoff chain before platform breadth** | The strongest proof is one incident/resource lifecycle. **[SWOT]** | Every candidate must complete report → outcome; unrelated modules are rejected. |
| **3. Human authority for high-impact decisions** | Authority, evidence, and training data are unknown. **[PSA][SWOT]** | Verification, allocation, assignment, and closure remain human decisions in the prototype. |
| **4. Deterministic core before probabilistic assistance** | AI is unnecessary for core requirements and lacks validated data. **[PSA]** | Rules and explicit state transitions drive the core; AI may only assist outside it. |
| **5. State changes must have operational consequences** | Cosmetic status labels do not prevent double promise or false completion. **[SWOT]** | Reservation changes availability; acceptance changes ownership; partial delivery changes remaining quantity. |
| **6. Freshness and provenance are part of the data** | Stale/unverified records are a major safety risk. **[PSA]** | Source, updater, timestamp, verification, and stale/pending state accompany decision-relevant records. |
| **7. Fail visibly and recoverably** | Emergency connectivity and external services are unreliable. **[PSA][EXT]** | Missing, stale, failed, pending, and conflicting states are exposed; external failures cannot silently imply success. |
| **8. Integrate conceptually; do not claim replacement** | SACHET, NDEM/Bhuvan, Ushahidi, Sahana, ArcGIS Mission, and ODK cover adjacent capabilities. **[PSA]** | Define import/export boundaries, while keeping unavailable integrations simulated and non-critical. |
| **9. Minimize duplicate work for adopters** | Users may keep chat and sheets if a new system adds entry. **[SWOT]** | Each role must receive direct value; the design should not require general chat or double recording for the proof. |
| **10. Narrow resource semantics** | Kits, beds, people, vehicles, and medicines behave differently. **[PSA]** | Prototype one countable consumable resource; do not imply a universal inventory model. |

---

# 3. Jobs to Be Done

## 3.1 Coordinator / Dispatcher

> **When** a possibly valid incident is reported during a fast-changing response, **I need to** verify the need, commit a genuinely available resource, and know who has accepted responsibility **so that** I can act without double-promising resources or falsely assuming the work is complete.

| Job type | Required outcome |
|---|---|
| Functional job | Convert a report into an authorized, resourced, owned, and closed response. |
| Information job | Know source, location, verification state, stock freshness, commitments, task owner, exceptions, and outcome. |
| Decision job | Decide whether to verify, which quantity to reserve, whom to assign, and whether evidence is enough to close. |
| Coordination job | Coordinate with reporter/verifier, custodian, responder, and confirming actor. |
| Trust requirement | Believe the displayed state is current, attributable, permission-controlled, and reconciled. |

## 3.2 Reporter / Intake Operator

> **When** I observe or receive a crisis-related need, **I need to** submit enough location and incident context and receive a reference **so that** the report enters an accountable process without being mistaken for verified fact.

| Job type | Required outcome |
|---|---|
| Functional job | Capture a locatable report with minimum required context. |
| Information job | Know that the report was received and its current non-authoritative status. |
| Decision job | Correct or supplement the report when requested. |
| Coordination job | Support follow-up by an authorized verifier. |
| Trust requirement | Believe sensitive information is limited and the report will not disappear into an untracked channel. |

## 3.3 Responder / Volunteer

> **When** a response task is offered or assigned, **I need to** understand its scope, explicitly acknowledge responsibility, and report progress or exceptions **so that** the coordinator does not assume coverage that does not exist.

| Job type | Required outcome |
|---|---|
| Functional job | Accept/decline, execute, and report full, partial, or failed outcome. |
| Information job | Know location, resource quantity, contact/context, restrictions, and current task state. |
| Decision job | Accept only when feasible; report an exception rather than falsely completing. |
| Coordination job | Synchronize with coordinator and any confirming actor. |
| Trust requirement | Believe the assignment is authoritative, current, and within approved role/eligibility. |

## 3.4 Resource Custodian

> **When** scarce stock is requested, **I need to** know what is physically present, already committed, released, dispatched, and reconciled **so that** the same units are not promised twice.

| Job type | Required outcome |
|---|---|
| Functional job | Maintain and reconcile one resource pool. |
| Information job | See quantity by controlled operational state and last verification time. |
| Decision job | Confirm or correct availability and authorize handoff according to SOP. |
| Coordination job | Coordinate the reservation and dispatch handoff with the dispatcher/responder. |
| Trust requirement | Believe balances and movements are transactionally consistent and auditable. |

---

# 4. Core Transformation

| Stage | Current / intended state |
|---|---|
| **Before** | Reports, stock checks, assignments, and outcome updates live in separate calls, messages, spreadsheets, and maps. |
| **Failure** | The coordinator cannot tell whether a report is verified, stock is genuinely uncommitted, responsibility is accepted, or delivery is complete. |
| **Intervention** | Introduce a governed operational record that binds verification, reservation, acknowledgement, execution, outcome, and audit events. |
| **After** | One incident has a traceable source, one valid commitment, one accountable owner, explicit exceptions, and a reconciled outcome. |

**Transformation:** Fragmented, ambiguous promises → **governed commitment and handoff workflow** → attributable, reconciled response state.

**Smallest meaningful transformation:** Prevent a coordinator from treating stale stock and a sent message as a fulfilled response by enforcing one valid reservation, one acknowledged owner, and one full/partial outcome record.

---

# 5. Solution Hypotheses

## Approach A — Verified Response Ledger

### Core idea

A workflow-centric coordination ledger for one operating organization. It turns a community/field report into a human-verified incident, reserves one countable resource transactionally, transfers responsibility through explicit acknowledgement, and reconciles full or partial outcome. The map is a synchronized view of that ledger, not the product’s source of truth.

### Problem mechanism

Attacks the dominant root cause: incident, resource, assignment, and outcome states are separated, so promises and handoffs are not authoritative or auditable.

### Primary user

Coordinator/dispatcher, with necessary supporting actions by reporter, responder, and resource custodian.

### Core workflow

**Structured report → human verification → canonical incident → atomic reservation → assignment acknowledgement → dispatch → full/partial outcome → human closure → reconciled audit record**

### Essential capabilities

- Persistent incident and source-report state.
- Human verification/rejection and deterministic duplicate suggestion/linking.
- One resource pool with available/reserved/in-transit/delivered or released quantities.
- Transaction-safe reservation and invalid-transition rejection.
- Explicit assignment acceptance/decline/timeout.
- Full, partial, failed, and cancelled outcomes.
- Freshness/provenance and critical-event audit timeline.
- Operational list plus GIS view of the same records.

### What makes it different

It proves operational invariants that commodity crisis dashboards usually imply but do not demonstrate: stock cannot be committed twice; notification is not ownership; dispatch is not delivery; partial fulfilment cannot disappear.

### Data required

Synthetic incident, depot stock, users/roles, task events, timestamps, and geospatial coordinates. Production requires a named inventory owner, operational taxonomy, roster, verification evidence, and closure policy.

### Dependencies

Prototype: none beyond locally controlled storage and a permitted map/list context. Production: inventory source, identity/roles, notification path, and organizational SOP.

### AI requirement

**None.** Deterministic geotemporal duplicate suggestions are sufficient for the prototype; any future semantic ranking remains assistive.

### What must actually work

Persistence, authorization, controlled transitions, concurrent reservation, assignment acknowledgement, partial quantity reconciliation, and audit history.

### What could be simulated

Real agency inventory feed, volunteer directory, SMS/push, official alerts, vehicle GPS, road closure feed, and recipient identity.

### Assessment

| Dimension | Assessment |
|---|---|
| Key advantages | Highest root-cause coverage; deterministic; strong end-to-end demo; meaningful technical depth; low dependency risk. |
| Key weaknesses | Still assumes a valid reservation/acceptance SOP; manual updates are only as truthful as their actors. |
| Biggest risk | Underlying inventory count is wrong or no operator owns it. |
| Adoption friction | Medium: multiple roles must use the shared record, though each receives a direct status/receipt benefit. |
| Demo potential | High: race condition, acceptance, and partial fulfilment make value visible. |
| Production potential | Medium–High after operator, data ownership, permissions, and integrations are validated. |

## Approach B — Crisis Interoperability and Reconciliation Hub

### Core idea

An integration-centric layer that ingests incident, inventory, and task exports or feeds from existing tools, normalizes them into a shared vocabulary, identifies conflicting/duplicate records, and returns a reconciled common view. It aims to connect systems instead of asking every actor to adopt a new workflow.

### Problem mechanism

Attacks cross-system fragmentation and duplicate entry, especially where organizations already use portals, spreadsheets, inventory tools, or GIS products.

### Primary user

Agency integration/operations lead and coordinator consuming the reconciled operational picture.

### Core workflow

**Source feeds/files → schema validation → normalization and entity linking → conflict review → reconciled record → export/notification to source owners → shared view**

### Essential capabilities

- Clearly bounded import formats.
- Source/provenance preservation.
- Deterministic identity/linking and conflict queue.
- Human reconciliation decision.
- Export or adapter boundary back to source systems.
- Freshness and failed-import visibility.

### What makes it different

It tackles the institutional reason central dashboards become stale: multiple systems remain authoritative. Deeper value comes from reconciliation rather than another intake form.

### Data required

Real or representative schemas, stable identifiers, update semantics, conflict examples, and permission to access target systems. These are not currently available.

### Dependencies

Named agency systems, documented exports/APIs, data-sharing permission, and agreement on ownership.

### AI requirement

**Optional.** Semantic matching could rank uncertain entity links, but deterministic identifiers, time, distance, and source rules should remain primary.

### What must actually work

At least two genuinely different source formats, provenance-preserving normalization, conflict detection, human resolution, and round-trip/export behavior.

### What could be simulated

Live APIs may be represented by documented sample files only if clearly labelled; however, fabricated schemas would weaken the approach’s central claim.

### Assessment

| Dimension | Assessment |
|---|---|
| Key advantages | Reduces replacement/adoption pressure; directly addresses silos; plausible enterprise path. |
| Key weaknesses | Cannot be credibly designed without target systems, identifiers, ownership, and access. |
| Biggest risk | The integration problem is hypothetical and the demo becomes two fabricated CSVs. |
| Adoption friction | Medium organizationally; potentially lower for end users if existing tools remain. |
| Demo potential | Medium: reconciliation can be clear, but value depends on believable sources. |
| Production potential | Potentially high only after a named operator and systems are confirmed; currently low-confidence. |

## Approach C — Offline Field Relay and Synchronization Workflow

### Core idea

A field-first workflow that lets responders receive assignments, capture structured updates, and queue evidence while disconnected, then synchronizes with visible conflicts and human reconciliation when connectivity returns.

### Problem mechanism

Attacks the stale-state and field-update failure caused by disrupted networks.

### Primary user

Responder/volunteer in low-connectivity conditions, with coordinator as conflict reviewer.

### Core workflow

**Cached assignment → offline acceptance/update → local validation → queued event → reconnection → conflict detection → human resolution → authoritative updated state**

### Essential capabilities

- Cached minimum assignment context.
- Offline event queue with local timestamps and actor identity.
- Pending-sync visibility.
- Idempotent replay and version/conflict detection.
- Coordinator reconciliation of incompatible updates.
- List-based operation without external map tiles.

### What makes it different

Most hackathon teams will mention offline support; this approach makes delayed and conflicting updates the primary design problem rather than a checkbox.

### Data required

Synthetic tasks/events are enough to test mechanics. Production requires representative devices, network conditions, security policy, and actual field update patterns.

### Dependencies

Device storage/browser capability and later network access. Offline map packs, GPS, and notification services are optional and should not be assumed.

### AI requirement

**None.** Conflict handling requires explicit policy and human judgment, not prediction.

### What must actually work

Disconnected update capture, durable queueing, reconnect/replay, duplicate suppression, and at least one visible conflict resolution.

### What could be simulated

Network changes can be controlled locally. Offline base maps and production device management can be deferred.

### Assessment

| Dimension | Assessment |
|---|---|
| Key advantages | Strong domain realism; locally testable; technically defensible; low external-data dependency. |
| Key weaknesses | Solves only one failure mode and does not by itself establish correct inventory or authority. |
| Biggest risk | Synchronization dominates scope while the main report-to-outcome chain remains incomplete. |
| Adoption friction | Medium–High: field installation/device behavior and training matter. |
| Demo potential | Medium–High if network loss and conflict are reproducible; higher live-demo risk than Approach A. |
| Production potential | Medium; depends strongly on devices, security, network, and field SOP. |

## Approach D — Provenance-Aware Situational Decision Board

### Core idea

A coordinator-facing decision-support surface that unifies incidents and resources on a map/list while making source, age, verification status, confidence, and unresolved contradictions unavoidable. It improves decisions without attempting to own every downstream dispatch action.

### Problem mechanism

Attacks the misleading common operating picture created when stale, unverified, and authoritative data look equivalent.

### Primary user

Coordinator/incident lead responsible for triage and prioritization.

### Core workflow

**Reports/resources → quality and freshness checks → human verification/priority review → filtered common picture → coordinator decision → decision rationale/audit note**

### Essential capabilities

- Structured intake/import with provenance.
- Verified/unverified and fresh/stale separation.
- Deterministic duplicate and contradiction cues.
- Map/list filters tied to operational meaning.
- Human decision record and audit trail.

### What makes it different

It treats uncertainty and source quality as first-class, rather than presenting every pin as truth.

### Data required

Incident/resource records with source and time. Synthetic data can show UI and rule behavior but cannot establish real decision quality.

### Dependencies

Base map or list fallback; production data feeds and operator taxonomy.

### AI requirement

**Optional.** Source-linked summarization or semantic duplicate ranking could assist, but deterministic checks and human review are sufficient.

### What must actually work

Provenance/freshness logic, verification state, duplicate linking, role permissions, and decision audit.

### What could be simulated

All upstream feeds and hazard overlays; external map tiles may have a local/static fallback.

### Assessment

| Dimension | Assessment |
|---|---|
| Key advantages | Lower workflow disruption; clear map-focused alignment with the PS; strong trust framing. |
| Key weaknesses | Risks remaining a read-heavy dashboard; does not ensure resource commitment or execution. |
| Biggest risk | The solution improves visibility while leaving the dominant handoff failures untouched. |
| Adoption friction | Low–Medium for coordinators; value for custodians/responders is indirect. |
| Demo potential | High visual clarity but weaker action-loop proof. |
| Production potential | Medium as an augmentation layer; limited as the complete PS response. |

---

# 6. Root-Cause Coverage

| Root cause | Approach A | Approach B | Approach C | Approach D |
|---|---|---|---|---|
| Fragmented incident/resource/task/outcome state | **Yes:** one governed lifecycle | **Partial–Yes:** normalizes across sources, but does not necessarily own transactions | **Partial:** synchronizes field events only | **Partial:** unifies visibility, not full execution |
| Verification/provenance/freshness hidden | **Yes:** embedded in workflow | **Yes:** source-preserving reconciliation | **Partial:** pending-sync/event provenance | **Yes:** primary focus |
| Availability disconnected from reservation | **Yes:** atomic reservation changes balance | **Partial:** can expose conflicts, but source system must commit | **No:** may carry updates, not prevent initial overcommitment | **No–Partial:** can warn, not enforce |
| Assignment does not transfer responsibility | **Yes:** explicit acknowledgement | **Partial:** only if source tools expose acknowledgement | **Yes for field acceptance:** but broader assignment authority remains elsewhere | **No:** decision board may record recommendation only |
| Dispatch conflated with outcome | **Yes:** distinct full/partial states | **Partial:** depends on source semantics | **Yes:** field events can distinguish states | **Partial:** can display distinction if supplied |
| Connectivity creates stale/conflicting state | **Partial:** visible degraded/pending state; full sync deferred | **Partial:** detects failed/stale imports | **Yes:** primary focus | **Partial:** exposes staleness but may not recover writes |

**Coverage conclusion:** Approach A is the only candidate that directly covers the dominant report-to-outcome root cause. Approach B could be strategically powerful but lacks the real source-system evidence necessary to validate its mechanism. Approach C is a valuable production capability, not a sufficient standalone answer. Approach D addresses trust in the picture but risks solving the symptom—visibility—rather than accountable action.

---

# 7. User-Value Test

## 7.1 Per-approach value

| Approach | Easier / faster | Safer / more reliable | Manual work removed | New work introduced | Why switch? | Why refuse? |
|---|---|---|---|---|---|---|
| **A. Verified Response Ledger** | One place to verify, reserve, assign, and reconcile | Prevents invalid overcommitment and false ownership/completion | Repeated stock calls, status chasing, manual ledger reconciliation | Structured transitions and updates by each actor | Directly reduces ambiguity and provides receipts/audit | Conflicts with SOP; duplicates current tools; source inventory remains unreliable |
| **B. Interoperability Hub** | Less re-entry across tools; faster conflict review | Preserves provenance and exposes contradictions | Manual copying and cross-sheet matching | Mapping schemas and resolving conflicts | Users can keep familiar systems | Organizations may not permit access or agree on identifiers/ownership |
| **C. Offline Field Relay** | Field updates captured once and sent later | Prevents silent loss and distinguishes pending from synchronized | Paper/phone re-entry after reconnection | Device queue/conflict handling | Works when network does not | Device/security burden; benefit low in well-connected settings |
| **D. Decision Board** | Faster triage of fresh/verified records | Less chance of acting on stale/unverified pins | Manual source/time comparison | Users must maintain provenance and verification | Improves coordinator awareness with modest workflow change | Does not complete the work; another dashboard may add little value |

## 7.2 Summary classification

| Approach | User value | Added friction | Adoption risk |
|---|---:|---:|---:|
| A | High | Medium | Medium–High |
| B | High if real systems exist; otherwise Low | High organizational / Low end-user | High |
| C | High only in low-connectivity field use | Medium–High | Medium–High |
| D | Medium | Low–Medium | Medium |

---

# 8. “Why Not Just…?” Test

| Approach | Simplest alternative | When the alternative is adequate | Necessary capability beyond it | Verdict |
|---|---|---|---|---|
| **A** | Shared spreadsheet + messaging | Small team, one coordinator, low concurrency, disciplined manual reconciliation | Transactional reservation, enforced ownership acknowledgement, controlled transitions, quantity-aware partial outcome, attributable audit | **Retain.** The added mechanism is specific and defensible. |
| **B** | Scheduled spreadsheet imports into a BI dashboard | Few stable files, no writeback, low conflict, one owner | Provenance-preserving reconciliation and conflict resolution across authoritative systems | **Downgrade pending evidence.** Without real schemas/access, the stronger capability is unproven. |
| **C** | ODK/offline form plus later manual re-entry | One-way field data collection with no conflicting assignments/state | Durable event replay, version conflict detection, and authoritative reconciliation | **Retain as future capability, reject standalone.** Existing offline collection handles simpler cases. |
| **D** | Normal CRUD dashboard with timestamps and filters | Trusted source data and no need for enforced downstream actions | Quality gates and provenance-aware decisions | **Reject standalone.** It still lacks the action loop that justifies a new operational system. |

The selected direction must be more than a CRUD interface: its necessity rests on **enforced cross-object invariants** and explicit transfer of responsibility.

---

# 9. AI Decision

No AI capability is required for the selected core workflow.

| AI capability considered | Input | Output | Why AI? | Non-AI alternative | Failure consequence | Human verification | Classification |
|---|---|---|---|---|---|---|---|
| Semantic duplicate ranking | Report text, time, coordinates, category | Ranked possible matches | Finds linguistic similarity beyond exact rules | Distance + time + category + contact/landmark rules | False merge hides a distinct incident | Mandatory coordinator confirmation and reversible link | **Optional AI**; exclude from core |
| Translation | Original report text | Suggested translation | Supports unstructured multilingual intake | Multilingual controlled fields and human interpretation | Severity/need meaning changes | Preserve original; human correction | **Assistive AI** after language validation |
| Incident-thread summary | Event history/comments | Source-linked summary | Reduces review time | Structured event timeline | Critical exception omitted | User opens source events and confirms | **Optional AI** |
| Severity/priority prediction | Report/evidence/context | Priority score | Could rank large queues | Explicit triage rules + authorized human judgment | Life-safety delay or misallocation | Human review is insufficient if automation creates bias/anchoring | **Remove AI** |
| Resource/dispatch recommendation | Incident, stock, team, routes | Suggested allocation | Could reduce search time | Deterministic constraints/distance + human selection | Unsafe or invalid commitment | Mandatory approval | **Deterministic approach preferred** |
| Image damage assessment | Photos | Damage/severity class | Automates evidence interpretation | Human review | False confidence/privacy harm | Human review | **Remove AI / insufficient data** |

**Decision:** The prototype will use deterministic duplicate cues and human decisions. It remains complete and differentiated with every AI component absent.

---

# 10. Data Reality Test

| Approach | Data needed | Available? | Source | Real / synthetic | Critical? | Fallback |
|---|---|---|---|---|---:|---|
| A | Incident, one resource ledger, roles, tasks, events, coordinates | Yes for mechanism proof; no for field validity | Synthetic scenario + permitted base map | Synthetic operational / real or static base context | Yes | Locally seeded, visibly synthetic dataset |
| A | Live accountable opening balance and refresh | No | Future custodian/system | Production-only unknown | Yes for deployment | Manual custodian confirmation during pilot; no “live” claim |
| B | Two or more real source schemas/identifiers/change semantics | No | Unnamed agency systems | Would be synthetic/fabricated | Yes | None that preserves the central integration claim |
| C | Offline task/update event patterns and representative devices | Partly | Synthetic events; future field test | Synthetic now / real later | Yes | Controlled browser/network simulation for mechanics |
| D | Incident/resource records with provenance and timestamps | Yes synthetically | Scenario fixtures | Synthetic | Yes | Local list if map is unavailable |

### Data conclusions

- **Approach least dependent on unavailable data:** Approach A for mechanism proof; its production value still depends on real opening balances and update ownership.
- **Approach most dependent on assumptions:** Approach B, because integration is the product and no target systems or access exist.
- **Claims demonstrable:** reservation invariant, role enforcement, acceptance semantics, partial reconciliation, audit completeness, deterministic duplicate cues, freshness display, and external-service independence.
- **Claims not demonstrable with synthetic data:** response-time reduction in the field, real duplicate rate, data accuracy, user adoption, inventory freshness, legal approval, safety outcome, or disaster-scale reliability.

---

# 11. Dependency Test

| Approach | Dependency | Critical? | Failure effect | Prototype fallback |
|---|---|:---:|---|---|
| A | Locally controlled persistence/state engine | Yes | Core workflow cannot prove continuity or invariants | No honest fallback; this must work |
| A | Map/base layer | No | Geographic context unavailable | Operational list and seeded coordinates/static permitted layer |
| A | Agency inventory system | No for prototype; Yes for deployment | Production balance cannot be trusted | Synthetic internal ledger with explicit disclosure |
| A | Volunteer/identity directory | No for prototype | Eligibility cannot be asserted | Synthetic approved responders; no real safeguarding claim |
| A | SMS/push/email | No | External notification not delivered | In-app assignment queue and explicit acceptance |
| B | Named source systems and schemas | Yes | No credible normalization or reconciliation problem | None; reject/delay approach |
| B | API/export permission | Yes | Cannot access or return state | Use only documented samples if supplied later |
| B | Shared identifiers/ownership rules | Yes | Duplicate/conflict decisions remain arbitrary | Human mapping workshop; not available now |
| C | Durable client storage | Yes | Offline updates are lost | No honest fallback; local durability must work |
| C | Reconnection | Eventually | Updates never reach shared state | Alternative communication/SOP outside the system |
| C | Offline map tiles | No | Map unavailable offline | Cached textual location/list |
| D | Source feeds | No for synthetic demo; Yes for production | Board is stale or empty | Seeded records; cannot claim real situational awareness |
| D | Online map/geocoder | No | Visual layer fails | List/manual coordinates/static context |

**Dependencies excluded from the critical demo path:** government feeds, live agency APIs, external identity, SMS/push, routing, live GPS, satellite layers, LLMs, and online-only tiles.

---

# 12. Differentiation Test

| Approach | Commodity | Expected | Differentiated | Defensible | Gimmick risk |
|---|---|---|---|---|---|
| **A** | Incident form, map, stock cards, task screen | Roles, persistence, filters, statuses | Atomic commitment, explicit ownership transfer, quantity-reconciled partial outcome | The invariant spans incident, inventory, task, and audit state; copying the UI would not reproduce it | Low if scope stays narrow; rises if decorated with generic AI/analytics |
| **B** | File import and unified dashboard | Provenance, mapping, error logs | Cross-source conflict resolution and round-trip reconciliation | Requires real schemas, identifiers, and governance knowledge | High now because sample integrations could be invented |
| **C** | Offline form and sync icon | Pending state and retry | Conflict-aware event replay tied to response ownership | Deep synchronization behavior survives UI copying | Medium: “offline-first” can be claimed without conflict proof |
| **D** | Colored map, filters, cards | Timestamps and verification badge | Uncertainty/freshness-aware decision record | Domain semantics and audit make it deeper than pin visualization | High if it remains read-only or uses synthetic heat maps |

**If another team copied the UI tomorrow, what would remain?** For Approach A, the hard-to-copy substance is the cross-object state discipline: the same units cannot be reserved twice, the task has no owner until acknowledged, a partial outcome cannot consume the full commitment, and every correction remains attributable. That is the strongest defensible layer.

---

# 13. End-to-End Workflow Test

## 13.1 Approach A — Verified Response Ledger

| Step | Type | Action |
|---|---|---|
| Trigger | Human | Reporter observes a localized relief need. |
| Input | Human | Reporter submits location, category, urgency narrative, and contact/reference details. |
| Validation | System + Human | Required fields and location quality are checked; coordinator reviews source/evidence and possible duplicates. |
| Processing | System | Verified report becomes a canonical incident; current resource state and freshness are retrieved. |
| Decision | Human | Authorized coordinator selects a quantity and responder. |
| Action | System + Human | System atomically reserves stock; responder accepts or declines the task. |
| Status change | System | Reservation, assignment, dispatch, and quantity states change under controlled transitions. |
| Outcome | Human + System | Responder records full/partial/failed result; coordinator confirms or creates follow-up. |
| Audit / feedback | System | Actor, time, reason, quantities, and source reports remain in the incident timeline. |

**Result:** complete action loop; not a dashboard.

## 13.2 Approach B — Interoperability Hub

| Step | Type | Action |
|---|---|---|
| Trigger | External dependency | Source systems export or emit changed records. |
| Input | External dependency | Incident, stock, and task payloads arrive. |
| Validation | System | Schema, source, version, and required fields are checked. |
| Processing | System | Records are normalized; possible duplicates/conflicts are flagged. |
| Decision | Human | Data steward resolves ambiguous identity or authority conflict. |
| Action | System + External dependency | Reconciled state is exported or written back. |
| Status change | External dependency | Source system accepts, rejects, or diverges from the proposed update. |
| Outcome | Human | Coordinator consumes a less fragmented common picture. |
| Audit / feedback | System | Import, resolution, export, and rejection are logged. |

**Result:** potentially complete, but the critical trigger, data, and action are externally controlled and currently unavailable.

## 13.3 Approach C — Offline Field Relay

| Step | Type | Action |
|---|---|---|
| Trigger | Human | Responder loses connectivity while assigned. |
| Input | Human | Acceptance, dispatch, progress, or exception is recorded locally. |
| Validation | System | Local form and allowed transition are checked against cached version. |
| Processing | System | Event is durably queued with local time, actor, and base version. |
| Decision | System | On reconnect, replay succeeds or a conflict is detected. |
| Action | Human | Coordinator resolves incompatible events if necessary. |
| Status change | System | Authoritative state advances or remains visibly unresolved. |
| Outcome | Human | Responder/coordinator sees synchronized or rejected state. |
| Audit / feedback | System | Both attempted and accepted events remain visible. |

**Result:** a valid loop, but it improves a supporting failure mode rather than the whole PS workflow.

## 13.4 Approach D — Decision Board

| Step | Type | Action |
|---|---|---|
| Trigger | Human / External dependency | New report or resource update arrives. |
| Input | Human / External dependency | Record with source, time, and location enters the board. |
| Validation | System + Human | Freshness/required-field rules run; coordinator verifies or flags. |
| Processing | System | Map/list groups records and highlights conflicts/duplicates. |
| Decision | Human | Coordinator records priority or action rationale. |
| Action | External / Human | Actual assignment or dispatch occurs elsewhere. |
| Status change | External dependency | Board relies on later manual/source update. |
| Outcome | Human | Improved awareness may support a better decision. |
| Audit / feedback | System | Decision rationale is retained. |

**Result:** fails the action-loop threshold because execution is not governed. Standalone selection is rejected.

---

# 14. Human-in-the-Loop Design

| Operation | System may do automatically | System should recommend / surface | Requires human approval | Evidence shown | Correctable and recorded? |
|---|---|---|---|---|---|
| Intake validation | Check required fields, coordinate format, rate/duplicate rules | Missing information and location uncertainty | Reporter/operator confirms correction | Original input and validation messages | Yes; revisions retain source/time |
| Duplicate handling | Generate deterministic candidates | Proximity, time, category, matching identifiers | Coordinator links/unlinks or keeps separate | Both reports and match reasons | Yes; reversible with audit |
| Incident verification | Never infer authority | Source, age, evidence, contradictions | Authorized verifier verifies/rejects/escalates | Original report, evidence, provenance | Yes; correction reason recorded |
| Severity/priority | Apply only approved deterministic checks later | Relevant facts and missing evidence | Authorized coordinator decides | Report facts, verification, policy reference if validated | Yes; changes audited |
| Resource reservation | Validate quantity, freshness rule, and atomic availability | Eligible pools and shortage warning | Authorized coordinator/custodian commits | Opening balance, existing holds, timestamp/source | Yes via release/cancel, never silent edit |
| Assignment | Check role/eligibility flags available in prototype | Candidate responders; no claim of safety suitability | Coordinator assigns; responder acknowledges per chosen SOP | Task scope, actor, timing, synthetic eligibility flag | Yes; decline/timeout/reassign retained |
| Dispatch | Validate accepted assignment and reserved quantity | Missing prerequisite warning | Responder/custodian confirms handoff | Reservation/task state and quantity | Yes through exception/correction event |
| Delivery/outcome | Reconcile entered quantities | Remaining commitment and inconsistency warning | Responder reports; coordinator/authorized confirmer closes | Quantities, evidence reference, exceptions | Yes; correction is append-only |
| Stale data use | Calculate age and block/warn per prototype rule | Reconfirmation request | Human reconfirms or proceeds only under explicit policy | Last updater, time, source, stale threshold | Yes; reconfirmation event recorded |

The prototype models authority but cannot prove the real organization’s authority structure. That remains a validation requirement.

---

# 15. Trust and Explainability

Explainability is required for automated constraints and recommendations, not as a decorative feature.

| Decision or automated behavior | Trust mechanism |
|---|---|
| Duplicate suggestion | Display distance, time gap, shared category/contact/landmark indicators and both original reports; do not auto-merge. |
| Verification state | Show who verified, when, based on which evidence/reference, and whether later correction occurred. |
| Resource availability | Show source/custodian, last verified time, available/reserved/in-transit/delivered quantities, and stale warning. |
| Reservation success/failure | Show requested quantity, pre/post balance, competing commitment, and invariant result without exposing unrelated sensitive details. |
| Assignment ownership | Show offered/sent time separately from accepted/declined/timeout time and actor. |
| Outcome/closure | Show dispatched, delivered, remaining, returned/released, exception, confirmer, and closure reason. |
| Map marker | Show whether location is reporter-supplied or verified, accuracy/precision when known, source, age, and operational state. |
| Correction | Retain previous event and identify correcting actor, time, and reason; never silently rewrite critical history. |

The system does not ask users to trust an opaque score. It asks them to trust inspectable inputs, enforced rules, authorized human decisions, and an audit trail.

---

# 16. Failure and Recovery Design

| Failure | User impact | Detection | Recovery |
|---|---|---|---|
| Missing or vague location | Cannot safely dispatch or deduplicate | Required-field check; location-quality flag | Save unverified draft/report; request landmark/manual pin; avoid false precision |
| Invalid incident fields | Intake unusable | Schema/controlled-value validation | Explain correction; preserve original if operator transcribes |
| Duplicate report | Duplicate work or demand inflation | Deterministic time-distance-category candidate | Human links to canonical incident; sources remain intact |
| False positive duplicate | Separate incidents could be hidden | Human comparison and reversible link | Unlink with reason; restore separate incident state |
| Stale stock | False availability | Age threshold and last-verifier metadata | Require reconfirmation or visibly block/warn; do not silently use |
| Concurrent reservation | Double promise | Transaction/constraint conflict | One valid commitment; losing user receives current shortage and alternatives/next action |
| Abandoned reservation | Artificial shortage | Expiry/assignment rule and inactivity | Authorized release/cancel with reason; audit retained |
| Assignment not accepted | Coverage falsely assumed | Pending state and timeout | Return to queue/escalate/reassign according to provisional rule |
| Responder declines | Work remains unowned | Explicit decline event | Coordinator reassigns; preserve decline reason/history |
| Partial delivery | False closure or quantity loss | Delivered quantity below dispatched quantity | Keep remainder in exception/in-transit/returned state; create follow-up if authorized |
| Incorrect completion | Outcome falsely trusted | Quantity inconsistency or verifier dispute | Reopen/correct via event; never erase original claim |
| External map fails | GIS unavailable | Load/service error | Continue via operational list and stored coordinates/static context |
| Internet fails | Updates cannot reach shared state | Connectivity indicator | Prototype shows visible pending/degraded state; full conflict-free sync is not claimed |
| Out-of-order update | Newer state overwritten | Version check and event time/receipt time | Reject or flag for human reconciliation; retain attempted update |
| Unauthorized action | Unsafe change | Role/transition authorization | Deny, log, and show non-sensitive error; privileged review later |
| Admin mistake | Incorrect state | Audit review and invariant check | Append corrective event; use reversible/soft administrative actions |
| Partial workflow abandonment | Incident or task remains stuck | State-age/owner checks | Surface exception queue; authorized cancel/reassign/close with reason |

---

# 17. Prototype Feasibility

## 17.1 Approach A component classification

| Classification | Components |
|---|---|
| **P0 mechanism** | Persistent canonical incident; authorized verification; one-resource ledger; atomic reservation; assignment acknowledgement; controlled dispatch/outcome transitions; partial quantity reconciliation; actor/time audit. |
| **Supporting mechanism** | Structured intake; deterministic duplicate cues; freshness/provenance display; GIS/list parity; exception handling; resettable synthetic scenario. |
| **Enhancement** | Public status view, source-linked comments, optional translation, richer map layers, recipient confirmation evidence, adapter import/export sample. |
| **Production-only concern** | Real IAM/federation, legal retention, inventory integration, robust offline sync, notification SLAs, scale/DR/monitoring, device security, multi-organization tenancy. |

## 17.2 Approach B component classification

| Classification | Components |
|---|---|
| **P0 mechanism** | Real source schemas, normalization, provenance, entity/conflict resolution, export/writeback. |
| **Supporting mechanism** | Mapping rules, failed-import queue, source freshness, audit. |
| **Enhancement** | Semantic matching, CAP/OGC adapters, transformation authoring. |
| **Production-only concern** | API credentials, SLAs, schema evolution, data-sharing agreements, cross-agency governance. |

Because the P0 mechanism lacks real source inputs, Approach B is not currently prototype-feasible as a credible primary direction.

## 17.3 Approach C component classification

| Classification | Components |
|---|---|
| **P0 mechanism** | Local durable queue, offline update, idempotent replay, version/conflict detection, reconciliation. |
| **Supporting mechanism** | Connectivity indicator, cached assignment, retry/error view. |
| **Enhancement** | Offline maps, media compression, peer/radio bridge. |
| **Production-only concern** | Device management, encryption, remote wipe, extended offline operation, field testing, sync-scale hardening. |

## 17.4 Approach D component classification

| Classification | Components |
|---|---|
| **P0 mechanism** | Provenance/freshness checks, verification, operational map/list, decision record. |
| **Supporting mechanism** | Duplicate cues, filters, audit, data-quality warnings. |
| **Enhancement** | Optional summaries, hazard overlays, analytics. |
| **Production-only concern** | Live feed integrations, shared taxonomy, scale, public/restricted dissemination policy. |

---

# 18. Demoability Test

## 18.1 Approach A — 4-minute story

**Initial state:** One fresh depot has 20 synthetic relief kits; no active commitment.  
**User action:** A reporter submits a flood-relief need; a coordinator links a similar report and verifies the incident.  
**System processing:** Coordinator reserves 20; a competing reservation for 10 is rejected because availability is now zero.  
**Decision/coordination:** Responder must accept before the task becomes owned and dispatchable.  
**Visible state change:** Responder records 12 delivered and an 8-kit access exception. Ledger and map/list show the unresolved remainder.  
**Final outcome:** Coordinator confirms 12, creates/retains follow-up for 8, and opens the attributable audit timeline.

## 18.2 Approach B — 4-minute story

**Initial state:** An incident CSV and inventory JSON disagree about location identifiers and stock status.  
**User action:** Operator imports both.  
**System processing:** Normalization creates a conflict and possible duplicate.  
**Decision/coordination:** Data steward selects the authoritative mapping.  
**Visible state change:** Reconciled record is exported.  
**Final outcome:** Common view no longer double-counts the incident/resource.

The story is comprehensible, but without real source schemas it proves a generic data-transformation demo, not the target deployment problem.

## 18.3 Approach C — 4-minute story

**Initial state:** Responder has a cached assignment.  
**User action:** Network is disabled; responder accepts and records a partial delivery.  
**System processing:** Events remain pending locally.  
**Decision/coordination:** Network returns; a conflicting coordinator cancellation is detected.  
**Visible state change:** Conflict queue shows both events; coordinator resolves it.  
**Final outcome:** Accepted event history and authoritative state are clear.

## 18.4 Approach D — 3-minute story

**Initial state:** Map mixes fresh verified incidents, stale stock, and unverified duplicate reports.  
**User action:** Coordinator opens freshness/provenance filters and reviews a duplicate.  
**System processing:** Board flags unsafe inputs.  
**Decision/coordination:** Coordinator verifies one incident and records priority rationale.  
**Visible state change:** Common picture becomes more trustworthy.  
**Final outcome:** Decision is audited, but assignment/outcome occurs outside the system.

| Approach | Easy to understand | End-to-end | Visible value | Live demo risk |
|---|---:|---:|---:|---:|
| A | High | High | High | Low–Medium |
| B | Medium | Medium | Medium | Medium–High |
| C | Medium–High | Medium | High | High |
| D | High | Low–Medium | Medium–High | Low–Medium |

---

# 19. Production Reality Test

| Approach | Prototype → pilot path | Deployment and governance reality | Production plausibility |
|---|---|---|---|
| **A** | Validate with one operator and one resource pool; run in shadow mode against current sheet/chat; reconcile balances and task outcomes; then integrate or import | Requires real authority model, identity, data classification, inventory ownership, notifications, monitoring, backup, training, and support | **Plausible but conditional.** Clear narrow pilot exists if an operator and custodian are found. |
| **B** | Select two real systems; obtain schemas/access; prototype read-only reconciliation; agree ownership; add safe writeback later | Requires agreements, schema governance, API reliability, identifiers, security reviews, and organizational conflict resolution | **Potentially strong but currently speculative.** Cannot advance without external evidence. |
| **C** | Field-test one responder workflow on representative devices/networks; measure lost/duplicate/conflicting events; harden sync/security | Requires device management, encryption, offline data policy, conflict SOP, support, and extensive testing | **Plausible as a later capability**, not a standalone platform direction. |
| **D** | Shadow a coordinator’s current dashboard and measure stale/unverified decisions; connect one trusted feed | Requires reliable feeds, taxonomy, access control, public/restricted policy, and sustained data stewardship | **Plausible augmentation**, but weak as the full response workflow. |

No approach is production-ready. Approach A has the clearest incremental path because it can begin inside one organization, with one resource and a manual-but-accountable opening balance, then replace manual inputs only when evidence supports integration.

---

# 20. Approach Comparison

Qualitative judgments are relative to the evidence available now.

| Criterion | A. Verified Response Ledger | B. Interoperability Hub | C. Offline Field Relay | D. Decision Board |
|---|---:|---:|---:|---:|
| Root-cause coverage | **High** | Medium–High | Medium | Medium |
| User value | **High** | High if systems exist | Medium–High in target conditions | Medium |
| Workflow improvement | **High** | Medium–High | Medium | Medium |
| Differentiation | **High** | High in production / Low with fabricated inputs | High technically | Medium |
| Data feasibility | **High for prototype / Low–Medium for production** | Low | High for mechanics | High for prototype |
| Technical feasibility | **High** | Medium–Low | Medium | High |
| Dependency risk | **Low–Medium** | High | Medium | Medium |
| Adoption feasibility | Medium | Medium if governance exists | Medium | Medium–High |
| Demo clarity | **High** | Medium | Medium–High | High |
| Demo reliability | **High** | Medium | Medium–Low | High |
| Production plausibility | **Medium–High, conditional** | Medium, highly conditional | Medium as capability | Medium as augmentation |
| Scope discipline | **High** | Medium | Medium–Low | High |

### Important trade-offs

- Approach A introduces more workflow change than D, but it is the only candidate that directly closes the loop from uncertain report to reconciled outcome.
- Approach B may ultimately reduce adoption friction, but integration is impossible to validate credibly without named systems and access.
- Approach C demonstrates sophisticated engineering and real domain awareness, yet full synchronization could consume the hackathon while leaving the core allocation workflow incomplete.
- Approach D is visually strong and easy to explain, but a judge can correctly ask what action it governs that an ordinary dashboard cannot.

**Top candidates:** Approach A and Approach C. Approach B is strategically promising but evidence-blocked; Approach D is valuable as a supporting presentation/decision layer rather than the primary system.

---

# 21. Adversarial Review of Top Candidates

## 21.1 Candidate A — Verified Response Ledger

| Panel role | Attack | Disposition |
|---|---|---|
| Hackathon Judge | “Is this just CRUD with fancy status names?” | **Requires modification/proof.** Demonstrate concurrent reservation failure, invalid transition rejection, acknowledgement, and quantity reconciliation live. |
| Domain Expert | “You invented the verification, reservation, acceptance, and closure SOP.” | **Production-critical; acceptable only as explicit prototype assumption.** Do not claim workflow fit; validate before pilot. |
| Solution Architect | “Correct concurrency is feasible locally, but delayed/offline events can still break the ledger.” | **Can be mitigated for prototype.** Keep core connected/local; show stale/pending state; do not claim full offline synchronization. |
| Product Strategist | “Every role now performs structured updates; why will they not stay in WhatsApp?” | **Requires validation.** Each role must receive a direct receipt/status benefit, and a pilot must compare duplicate work. |
| Rival Team | “I will show more hazards, AI prioritization, live tracking, and a prettier map.” | **Acceptable.** Counter with repeatable integrity proof and honest scope; avoid competing on breadth. |
| End User | “Calling the depot and volunteer is faster than learning this.” | **May invalidate deployment at very small scale.** The solution is justified only when concurrency, volume, or audit needs exceed the simple workflow. |

**Conclusion:** Criticisms do not invalidate Approach A as the prototype direction, but they narrow its claim. It proves workflow integrity, not that a particular agency should adopt it.

## 21.2 Candidate C — Offline Field Relay

| Panel role | Attack | Disposition |
|---|---|---|
| Hackathon Judge | “Offline sync is impressive, but how does it solve fragmented allocation and resource truth?” | **Invalidates it as the primary solution.** It only protects field updates. |
| Domain Expert | “Connectivity failure matters, but field teams may use radio and later operator entry under SOP.” | **Requires validation.** Software sync may be the wrong recovery mechanism. |
| Solution Architect | “Conflict rules for dispatch, cancellation, and quantity changes are domain decisions, not generic last-write-wins.” | **High-risk modification.** Needs real SOP and extensive tests. |
| Product Strategist | “Users will not install/use an offline client unless disconnected work is frequent and painful.” | **Requires field evidence.** Current target devices and network conditions are unknown. |
| Rival Team | “I can claim offline forms using established tooling while spending my effort on the full platform.” | **Valid competitive threat.** ODK already demonstrates offline collection as a commodity class. |
| End User | “If I cannot trust that cached assignment is still current, I will call/radio instead.” | **Fundamental trust issue.** Needs a validated fallback and authority rule. |

**Conclusion:** Approach C is not selected as the primary direction. Its strongest element—visible pending/degraded state—should constrain Approach A, while full bidirectional offline synchronization remains outside the prototype unless new evidence makes it mandatory.

---

# 22. Hybridization Check

The strongest ideas are only partly complementary.

| Possible combination | Assessment | Decision |
|---|---|---|
| A + D (ledger plus provenance-aware map/list) | **Meaningful synergy.** D becomes a view of A’s governed state, reinforcing the same workflow rather than creating a separate module. | **Include conceptually.** The map/list must expose source, age, and status. |
| A + C (ledger plus full offline sync) | **Feature-soup risk.** Offline conflict handling materially expands the hardest technical boundary. | **Do not hybridize fully.** Include visible degraded/pending state and list fallback only; defer conflict-capable sync. |
| A + B (ledger plus integration hub) | **Premature complexity.** Production adapter boundaries are useful, but no target integration exists. | **Define boundary, do not implement as core.** A sample import/export may return later with evidence. |
| A + optional AI | **No necessary synergy.** Core is already complete and differentiated. | **Exclude AI from selected prototype direction.** |

The resulting selection is a **refined Approach A**, not a broad hybrid: a Verified Response Ledger with a provenance-aware GIS/list view and visible degraded-state semantics. It retains one core workflow.

---

# 23. Selected Solution Direction

## Selected solution

**Verified Response Ledger**

## One-line definition

> A workflow coordination system that helps an accountable emergency coordinator turn an uncertain incident report into a verified, resource-backed, explicitly owned, and reconciled response by enforcing human-authorized state transitions and an auditable commitment ledger, resulting in less ambiguous allocation and handoff state.

## Why this direction

| Selection factor | Reason |
|---|---|
| Root-cause coverage | It directly binds incident, resource, assignment, and outcome instead of improving only intake, visibility, or connectivity. |
| User value | It reduces the coordinator’s most consequential ambiguity: whether need is valid, stock is actually committed, responsibility is accepted, and outcome is complete. |
| Differentiation | Transaction-safe commitment, explicit acknowledgement, and partial reconciliation are harder and more meaningful than a generic GIS dashboard. |
| Feasibility | The mechanism can be built and tested locally with synthetic data, without government APIs, AI, live GPS, or external notifications. |
| Data reality | Synthetic data can legitimately prove the state and concurrency mechanism. The document explicitly does not claim real inventory accuracy or field impact. |
| Risk | It contains scope to one area, one incident family, one countable resource, and a small role set. Full offline sync and integrations remain outside the critical path. |
| Demoability | One synthetic incident creates visible before/after changes across verification, stock, task ownership, partial outcome, map/list, and audit. |
| Production plausibility | A shadow-mode pilot with one organization and custodian is conceivable; integration and stronger controls can follow after validation. |

**Selection is conditional:** if a real operator confirms that resources cannot be reserved, responders do not acknowledge responsibility, or a shared ledger would duplicate a sufficiently effective existing system, this direction must be revised rather than defended by inertia.

---

# 24. Rejected Alternatives

| Approach | Why it was attractive | Why it was not selected | Could it return later? |
|---|---|---|---|
| Crisis Interoperability and Reconciliation Hub | Reduces replacement pressure and directly addresses cross-system fragmentation | No named systems, schemas, identifiers, permissions, or owner; a synthetic integration would fake the core claim | **Yes.** After a pilot operator supplies two real systems/exports and a reconciliation need |
| Offline Field Relay and Synchronization Workflow | Strong domain realism and technical differentiation under disrupted connectivity | Does not solve the full report/resource/ownership/outcome problem; sync complexity threatens scope; device/network/SOP evidence absent | **Yes.** If target users confirm offline work is mandatory; add incrementally after core ledger validation |
| Provenance-Aware Situational Decision Board | Visually clear, low-friction, aligned with GIS requirement, improves trust | Risks another dashboard; downstream commitment and execution remain outside the system | **As a view, yes.** Its provenance/freshness principles are incorporated into the selected ledger’s GIS/list surface |
| Autonomous AI triage/dispatch variant | Superficially novel and could appear scalable | No validated data, authority, safety case, or necessity; high consequence of error | **Not without new evidence.** Would require real data, evaluation, policy, and human-oversight design |

---

# 25. Selected Solution — Core Workflow

| Stage | Actor / mechanism | Required behavior |
|---|---|---|
| **Actor** | Reporter → Coordinator → Responder, with custodian function and optional confirmer | Each actor has bounded actions; real authority remains to be validated. |
| **Trigger** | Reporter observes or operator receives a localized relief need | The event begins as a report, not an official or verified incident. |
| **Input** | Reporter/Operator | Location, category, narrative, reporter urgency, minimum contact/reference, optional safe evidence. |
| **Validation** | System + Coordinator | Required fields/location quality; deterministic duplicate candidates; human verification/rejection/escalation. |
| **Core processing** | System | Create/link canonical incident; retrieve one resource pool with source/freshness; atomically reserve approved quantity. |
| **Decision** | Coordinator | Authorize verification, quantity commitment, and responder assignment based on displayed evidence. |
| **Action** | Responder/Custodian function | Responder accepts/declines; accepted task can be dispatched with reserved quantity. |
| **State change** | System | Reported → verified/rejected; available → reserved → in transit → delivered/released/exception; offered → accepted/declined/timed out → dispatched → full/partial/failed. |
| **Outcome** | Responder + Coordinator/Confirmer | Record full, partial, failed, or cancelled outcome; reconcile remaining quantity and decide follow-up/closure. |
| **Audit / feedback** | System | Preserve source reports, actor, server time, relevant quantities, reason/evidence references, and corrections. Reporter-facing status remains limited and privacy-safe. |

This workflow is the backbone for later Scope Lock, PRD, and interface design. Status terminology is provisional until validated with a real operator.

---

# 26. Secondary Workflows

Only workflows required to support the core are retained.

| Actor | Trigger | Goal | Relationship to core workflow |
|---|---|---|---|
| Coordinator | Two reports are plausibly the same | Link/unlink source reports without deleting evidence | Prevents duplicate incidents/tasks before reservation |
| Coordinator/Custodian | Resource record is stale | Reconfirm opening/current balance or mark unusable | Protects the reservation decision from false freshness |
| Responder | Cannot accept or complete the task | Decline, time out, or record an exception | Keeps ownership and coverage truthful |
| Coordinator | Reservation is no longer needed | Release/cancel quantity with reason | Returns stock without erasing commitment history |
| Coordinator/Confirmer | Outcome evidence is disputed or incomplete | Reopen/correct/follow up | Prevents false closure and preserves audit |
| Operational user | Map/base service fails | Continue from list/timeline and stored location text | Keeps the core workflow demonstrable and usable in degraded mode |
| Supervisor/Auditor | Decision is challenged or reviewed | Reconstruct transitions and quantities | Supports accountability and after-action review |

General chat, donation management, public social feeds, fleet telemetry, and forecasting are not supporting workflows for this proof.

---

# 27. Solution Capability Map

| Capability | Root cause addressed | User | Role in workflow | Priority rationale |
|---|---|---|---|---|
| Structured geolocated report with receipt | Fragmented intake and missing identity | Reporter/Operator | Creates source report | Required by PS and enables traceability |
| Human verification/rejection | Uncertain information treated as fact | Coordinator/Verifier | Authorizes incident state | Safety- and authority-critical |
| Canonical incident and source linking | Duplicate reports create duplicate work | Coordinator | Consolidates need without deleting evidence | Supports accurate downstream action |
| Freshness/provenance display | Stale/unknown data appears authoritative | All operational users | Decision context | Necessary for trust and honest “real-time” behavior |
| One-resource commitment ledger | Availability detached from commitments | Coordinator/Custodian | Maintains controlled quantity state | Central root-cause mechanism |
| Atomic reservation | Concurrent double promise | Coordinator | Commits stock | Strongest technical proof |
| Assignment offer and acknowledgement | Message mistaken for ownership | Coordinator/Responder | Transfers responsibility | Central workflow differentiation |
| Controlled dispatch/outcome states | Dispatch mistaken for completion | Responder/Coordinator | Tracks execution | Prevents false closure |
| Partial/failed outcome reconciliation | Exceptions disappear | Responder/Coordinator/Custodian | Reconciles delivered and remaining quantity | Central operational truth |
| Role/state-transition enforcement | Unauthorized/cosmetic updates | All roles | Protects decisions | Must be real for credibility |
| Critical-event audit timeline | No accountable history | Supervisor/Coordinator | Reconstructs decisions | Proves integrity and enables correction |
| GIS and list parity | Map becomes decorative/single point of failure | Coordinator/Responder | Locates governed records | Meets PS while preserving degraded usability |
| Visible stale/pending/degraded status | Connectivity failures create false freshness | Field/Coordinator | Exposes uncertainty | Incorporates key insight from offline approach without full sync scope |

---

# 28. System Boundary

## Inside the system

- Capture and persist synthetic/prototype incident reports and their provenance.
- Enforce prototype role permissions and allowed state transitions.
- Link multiple source reports to one canonical incident through a human decision.
- Maintain one prototype resource pool and its reservation/movement/outcome events.
- Offer/assign a task and record acceptance, decline, timeout, dispatch, and outcome.
- Reconcile full/partial/failed quantities.
- Expose freshness, verification, simulated/live/pending labels.
- Display governed records in both operational list/timeline and GIS context.
- Preserve an attributable audit history of critical actions.

## Outside the system

- Official warning issuance and public authority.
- Emergency command authority, legal mandates, and SOP creation.
- Physical inventory truth and warehouse operations.
- Volunteer recruitment, credentialing, background checks, training, insurance, and duty of care.
- Emergency call handling, medical advice, and life-safety dispatch unless a real operator explicitly integrates them.
- Telecom/SMS guarantees, live vehicle telemetry, disaster-aware routing, and network restoration.
- National hazard monitoring, satellite analysis, and authoritative GIS stewardship.
- Legal interpretation, records policy, and data-sharing approval.
- Physical delivery and independent verification of real-world outcomes.

## Inputs

- User-entered report and location.
- Human verification/decision events.
- Prototype resource opening balance and freshness metadata.
- Responder acknowledgement and execution updates.
- Optional simulated external context, explicitly labelled.

## Outputs

- Governed incident and task status.
- Valid reservation or explicit shortage/conflict result.
- Assignment ownership state.
- Reconciled full/partial/failed outcome.
- Operational map/list state and audit timeline.
- Prototype proof metrics and clearly bounded export concept.

---

# 29. Source of Truth

| Information | Authoritative owner/system in prototype | Production ownership | Confidence / note |
|---|---|---|---|
| User identity and role | Local prototype accounts/fixtures | Organization identity provider and role owner | **Unknown**; prototype only models separation |
| Original report content | Immutable source-report record | Intake/operator system or platform under approved policy | Platform can preserve what it received, not guarantee truth |
| Incident verification/status | Verified Response Ledger after authorized human action | Authorized incident-management role/system | **ASSUMPTION—VALIDATE** authority |
| Incident location | Source report plus verified/corrected operational location | Authorized verifier/field assessment | Must retain origin and uncertainty |
| Resource master/unit | Seeded prototype dataset | Resource custodian/warehouse system | **Unknown** in production |
| Physical opening/current inventory | Synthetic seeded balance | Custodian/warehouse/physical count | Prototype is not authoritative outside scenario |
| Reservation/commitment | Verified Response Ledger for prototype | Either this ledger or integrated inventory system, to be decided | Cannot have two independent authorities |
| Assignment offer/acceptance | Verified Response Ledger | Dispatch/task system or this ledger | **ASSUMPTION—VALIDATE** acknowledgement model |
| Dispatch status | Responder/custodian event stored in ledger | Operational dispatch owner | Actor report, not physical telemetry |
| Delivery/outcome | Responder report plus coordinator/authorized confirmation | Organization’s defined confirming actor/system | Confirmation policy is **UNKNOWN** |
| Audit history | Verified Response Ledger | Approved records/audit system | Must be protected from silent edits |
| Official alerts | External authorized alerting source | Government/authorized warning agency | Platform may display/import, never originate by implication |
| AI recommendation | None in core | Advisory system only if later validated | Never authoritative |
| Final operational decision | Named human decision maker | Authority defined by SOP | Software records, does not create authority |

---

# 30. High-Level Information Flow

| Flow stage | Conceptual behavior |
|---|---|
| **Source** | Reporter observation, operator-transcribed call, human stock confirmation, responder update, optional external context. |
| **Capture** | Structured report or controlled operational event enters with actor, time, and source type. |
| **Validation** | Required fields, role, allowed transition, quantity invariant, version/freshness, and deterministic duplicate cues are evaluated. |
| **Processing** | Human verification creates/updates canonical incident; reservation binds stock to incident/task; acknowledgement establishes owner; outcome changes quantity state. |
| **Storage / state** | Current operational state is derived from persistent records and protected critical-event history. |
| **Decision** | Authorized human sees source, age, balance, task state, and exceptions before acting. |
| **Output** | Updated queue, list/map, assignment, resource balance, outcome, and audit timeline. |
| **Feedback** | Corrections, declines, timeouts, partial delivery, disputes, release, and follow-up re-enter as explicit events. |

This is intentionally conceptual. No database schema, API endpoint, service decomposition, deployment model, or final technology stack is selected here.

---

# 31. Prototype vs Production

| Capability / concern | Prototype | Production |
|---|---|---|
| Operating scope | One synthetic district/ward/campus-sized area; one localized relief scenario | Defined jurisdiction, organization, hazard scope, and incident-command alignment |
| Incident data | Synthetic but deliberately includes duplicates, stale input, and exceptions | Approved real intake sources, taxonomy, evidence, abuse controls, and retention policy |
| Resource data | One synthetic countable consumable with seeded balance and freshness | Custodian-owned master/balance, physical reconciliation, integration/manual update SOP, multiple validated resource models |
| Users/roles | Prepared reporter, coordinator, and responder accounts; custodian function may be represented | Real IAM, MFA, account lifecycle, organizational scope, separation of duties, roster/eligibility |
| Verification | Human action under clearly labelled provisional rule | Authorized role, evidence standard, escalation path, SLA, audit policy |
| Duplicate handling | Deterministic proximity/time/category suggestion; human link/unlink | Tuned rules or assistive model evaluated on real data; dispute/reversal process |
| Reservation | Real persistent transaction/invariant within prototype | Integration with authoritative inventory or formally adopted ledger; expiry, substitution, approval, reconciliation |
| Assignment | Real offer/accept/decline/timeout mechanics using synthetic responders | Validated command/volunteer protocol, delivery receipts, escalation, safeguarding, shift/availability |
| Outcome | Real full/partial/failed quantity transition and audit using synthetic scenario | Authorized confirmation/evidence/dispute policy and physical reconciliation |
| GIS | Real map/list behavior using permitted context or static fallback; data synthetic | Licensed/scaled provider, safe precision, authoritative layers, clustering/performance, offline policy |
| External integrations | Mocked/recorded sample only if shown; never described as live | Documented, authorized adapters with contracts, monitoring, retries, schema change handling |
| Notifications | In-app queue and acknowledgement | Approved SMS/push/email/radio integration with receipts and fallback |
| Offline | Visible connectivity/degraded/pending semantics and list fallback; no full sync claim | Validated device strategy, durable encrypted queue, idempotency, conflict policy, field testing |
| AI | None required or on critical path | Optional assistive use only after data/evaluation/privacy review |
| Security | Role enforcement, synthetic PII, negative authorization tests, basic audit | Threat model, hardened authentication, encryption/key management, monitoring, incident response, vulnerability management |
| Privacy | Data minimization and public/restricted conceptual separation with synthetic data | Jurisdiction-specific lawful basis, classification, retention/deletion, access logging, rights/processes |
| Scale/resilience | Controlled local scenario and deterministic test cases | Capacity targets, load/surge testing, high availability, backup/restore, disaster recovery, observability |
| Impact evidence | Mechanism correctness and controlled task timings only | Pilot baseline, adoption, reconciliation error, double-allocation near misses, response workflow outcomes |

---

# 32. What Must Be Real

| Capability | Why faking it would undermine the core claim |
|---|---|
| Persistence of incident, reservation, assignment, outcome, and audit state | Otherwise the demo is disconnected screens with no shared operational record. |
| Role and action authorization for demonstrated roles | A system that lets any actor verify, allocate, or close does not model accountable coordination. |
| Allowed state-transition enforcement | Status labels without constraints do not prevent invalid handoffs. |
| Transaction-safe reservation | This is the central proof that the same scarce units cannot be promised twice. |
| Quantity reconciliation | Without it, partial delivery is storytelling; the ledger must account for delivered and unresolved/released quantities. |
| Assignment acknowledgement | If acceptance is pre-scripted or cosmetic, the system has not solved “sent means covered.” |
| Full/partial/failed outcome handling | A single “complete” toggle recreates the failure the solution claims to solve. |
| Critical-event audit history | Accountability and correction cannot be claimed from a mutable final-state record. |
| Deterministic duplicate candidate and human link/unlink, if shown | It must operate on submitted records and preserve sources; a pre-labelled duplicate proves nothing. |
| Map/list parity for governed records | The GIS must reflect actual workflow state, not a separate demo dataset. |
| Stale/simulated/degraded labels | Honest uncertainty is a core trust claim; hiding it would contradict the design. |
| Core flow without internet/external services | Dependency resilience is part of credibility and demo safety. |

---

# 33. What May Be Simulated

| Simulated element | Why simulation does not invalidate the core proof |
|---|---|
| Agency warehouse/API integration | The prototype proves commitment mechanics against a controlled ledger, not access to an unnamed agency system. |
| Opening inventory and physical stock | Synthetic stock is sufficient to test concurrency/reconciliation if clearly labelled; it cannot support a production freshness claim. |
| Responder directory and eligibility | Synthetic role fixtures can prove authorization and acknowledgement mechanics; they do not prove real safeguarding. |
| Reporter/victim identity and evidence | Synthetic data avoids privacy harm while exercising the workflow. |
| Official alerts/CAP input | Official context is not required to prove local report-to-outcome handling. A recorded sample must not be described as live. |
| Government GIS/satellite layer | Contextual overlays do not drive the selected core mechanism. |
| SMS/push/email | In-app acknowledgement proves ownership semantics; external delivery reliability is a later integration concern. |
| Vehicle GPS and route/road-closure data | Physical movement is outside the core claim; responder-entered dispatch/outcome is sufficient for workflow proof. |
| Large-scale dataset/load | One controlled area proves logic, not scale. Production-scale claims remain prohibited. |
| Offline network transition | Controlled disconnection can show degraded/pending behavior; full synchronization is not claimed. |
| Public map | A restricted/safe synthetic demonstration can show access separation conceptually without publishing real locations. |

Simulation is acceptable because the prototype’s claim is narrowly stated: **the workflow mechanism preserves valid commitment, ownership, outcome, and audit state under controlled cases.**

---

# 34. Differentiation Stack

## 34.1 Problem understanding

Generic solutions interpret fragmentation as “data is on different screens.” This design interprets the deeper failure as **operational promises that are not bound to authoritative state**: a report is not verified need, a displayed count is not uncommitted stock, a sent message is not accepted responsibility, and dispatch is not outcome.

## 34.2 Workflow differentiation

The workflow makes each trust boundary explicit:

- uncertain report → authorized verification;
- displayed stock → transactionally reserved quantity;
- task offer → acknowledged owner;
- dispatched quantity → full/partial/failed outcome;
- correction → attributable event rather than silent overwrite.

## 34.3 Technical mechanism

The differentiating mechanism is a constrained operational ledger: role-controlled state transitions, atomic commitment, quantity reconciliation, provenance/freshness metadata, and append-oriented critical history. It is not AI-dependent.

## 34.4 Demonstration

The demo makes the mechanism visible by:

1. linking two source reports to one incident;
2. allowing only one of two competing reservations to succeed;
3. keeping a task unowned until acknowledgement;
4. recording 12 delivered and 8 unresolved rather than falsely completing 20;
5. showing the same truth in ledger, timeline, list, and map;
6. continuing the core story when external map/network services are unavailable.

---

# 35. Value Proposition

> **For** an accountable local emergency coordinator  
> **who currently struggles with** fragmented reports, stale resource counts, informal assignments, and ambiguous completion,  
> **our solution** is a verified response ledger  
> **that enables** one report-to-outcome workflow with valid resource commitment and explicit responsibility  
> **by** combining human-authorized verification, transaction-safe reservation, acknowledgement, quantity-aware outcome, freshness, and audit history,  
> **unlike** a shared spreadsheet, chat thread, or generic crisis dashboard,  
> **because** operational state changes are enforced and reconciled rather than merely displayed.

This proposition remains a hypothesis until a real coordinator and custodian confirm that the workflow fits their SOP and creates more value than disciplined use of existing tools.

---

# 36. Success Hypotheses

## 36.1 Primary hypothesis

> We believe an accountable coordinator will achieve a more reliable view of whether an incident is resourced, owned, and completed because the system binds verification, atomic commitment, acknowledgement, and quantity-reconciled outcome in one audit trail.

## 36.2 Supporting hypotheses

| Hypothesis | Prototype evidence | Production evidence required |
|---|---|---|
| The same scarce units will not be double-promised inside the system | Repeated competing reservation test yields one valid commitment and reconciled balance | Pilot logs and physical/system reconciliation; near-miss/override analysis |
| A task will not appear covered before responsibility is acknowledged | Offered task remains pending; decline/timeout returns it to action | Assignment acceptance time/rate and comparison with current workflow |
| Partial delivery will not disappear behind “complete” | Quantity-aware partial outcome leaves visible remainder/exception | Real delivery discrepancies and reconciliation error before/after pilot |
| Users can reconstruct who decided what and when | Audit timeline contains all critical transitions in scenario | Audit completeness, supervisor usefulness, and correction/dispute outcomes |
| Stale/unverified information will be less likely to appear authoritative | Controlled records visibly change behavior when stale/unverified | Decision reviews showing whether users notice and act appropriately |
| The system will reduce coordination delay/manual reconciliation | Only number of prototype steps and controlled completion time can be shown | Real baseline versus shadow/pilot timings and manual re-entry counts |
| Users will adopt the shared record | Cannot be proven in a staged demo | Observed use, completeness, parallel-channel frequency, qualitative interviews |

Prototype correctness is not evidence of real emergency performance, safety improvement, or adoption.

---

# 37. Remaining Assumptions

| Assumption | Importance | Current evidence | Validation needed | What happens if wrong |
|---|---:|---|---|---|
| A coordinator/dispatcher owns the lifecycle | Critical | Strong inference from coordination requirement; no operator named | Sponsor/operator interview and role map | No legitimate primary user; redesign around actual authority |
| One organization can pilot the workflow | Critical | Scope recommendation only | Identify pilot owner and boundaries | Multi-agency identity/governance becomes immediate; prototype scope may be invalid |
| Resource reservation matches real practice | Critical | Operational reasoning, not observed SOP | Walk a historical allocation with coordinator/custodian | Central differentiation conflicts with workflow; select another mechanism |
| A current opening balance can be obtained and maintained | Critical | PS assumes tracking; no source | Inspect ledger/API and name accountable updater | Production resource tracking is unsafe or valueless |
| Reporter, coordinator, and responder can use one web workflow | High | PS asks for web platform | Device/channel/accessibility/user research | Need assisted intake, native client, or integration-first design |
| Responders acknowledge or can explicitly assume responsibility | High | Inference; process varies | Observe dispatch/command protocol | Replace accept/decline with command receipt/acknowledgement semantics |
| Distinct resource/outcome states fit local language | High | Strong general reasoning | Terminology workshop using real cases | Users misunderstand or bypass transitions |
| Human verification can access sufficient evidence | Critical | No verification SOP supplied | Define sources, authority, escalation, and time constraints | Verification button becomes theatre; intake/triage approach must change |
| Completion/partial outcome can be confirmed | High | No confirmer/evidence policy supplied | Review current delivery/sign-off practice | Chain closes only on self-report; reduce claim or add reconciliation actor |
| Synthetic data are allowed in judging | Critical for hackathon | No event rule supplied | Check official rubric/organizer | Demo may not satisfy evidence expectations |
| One narrow scenario satisfies the rubric | High | Strong hackathon reasoning; rubric absent | Rubric review/judge proxy | Must broaden requirement coverage without weakening the core |
| Connectivity is unreliable enough to require degraded-state design | Medium | General ICRC evidence, no target field data | Device/network field test | Full offline work should remain deferred; visible freshness still useful |
| A legally usable base map is available | High | OSM/open options exist subject to terms | Select provider and review licence/use | Use static/locally permitted context and operational list |
| Public/restricted views are necessary | High for safety; exact boundary unknown | Humanitarian privacy reasoning | Data classification/threat workshop | Either overexposure or excessive restriction; redesign disclosure |

**Carry into Scope Lock as explicit go/no-go risks:** operator ownership, reservation compatibility, accountable inventory source, synthetic-data permission, web/device suitability, and narrow-scenario rubric fit.

---

# 38. Scope-Lock Input

This classification prepares—not performs—the next stage.

## Core candidates

- Structured geolocated report and receipt/reference.
- Human verification/rejection under explicit prototype authority.
- Canonical incident with preserved source reports.
- One countable resource pool with freshness/provenance.
- Transaction-safe reservation and release/cancellation.
- Task offer/assignment and explicit acknowledgement.
- Dispatch separated from full/partial/failed outcome.
- Quantity reconciliation and visible exception/remainder.
- Role/state-transition enforcement.
- Critical-event audit timeline.
- GIS and operational list using the same governed records.

## Supporting candidates

- Deterministic duplicate suggestion and reversible linking.
- Stale-data warning/reconfirmation.
- Decline/timeout/reassignment.
- Degraded/map-failure list continuity.
- Synthetic/simulated data labelling.
- Resettable demo fixture and invariant checks.

## Optional candidates

- Restricted reporter-facing status view.
- Recipient/third-party confirmation.
- Controlled comments/evidence references.
- Small documented import/export sample after a real format is supplied.
- Multilingual controlled labels after target languages are validated.

## Explicitly avoid

- Autonomous AI severity, priority, allocation, dispatch, or closure.
- Generic chatbot, blockchain, synthetic heat map, predictive forecasting.
- Full general-purpose chat.
- Donations/payments.
- Live vehicle/drone tracking.
- Custom route optimization.
- National/all-hazard/multi-agency claim.
- Universal resource model.
- Full offline bidirectional sync without evidence.
- Mandatory government API, SMS, LLM, GPS, or satellite dependency.

---

# 39. Judge Defensibility Check

| Hard question | Strong evidence available | Evidence still missing |
|---|---|---|
| 1. Why not WhatsApp and a shared sheet? | Enforced reservation, acknowledgement, quantity reconciliation, permissions, and audit can be demonstrated | Evidence that these failures occur often enough in a target organization to justify change |
| 2. How is this different from Ushahidi, Sahana, ArcGIS Mission, or government GIS? | Earlier analysis documents their adjacent capabilities; selected proof is narrow workflow integrity, not platform breadth | Target-specific gap and procurement/adoption evidence |
| 3. Who actually operates it? | Coordinator/dispatcher is the strongest evidence-based hypothesis | Named organization, role, SOP, and sponsor confirmation |
| 4. Where does the stock count come from? | Prototype uses clearly labelled synthetic balance and proves transaction mechanics | Real custodian, source, freshness process, reconciliation, and integration |
| 5. What actually works? | Persistence, role/state enforcement, reservation, acknowledgement, partial reconciliation, audit, and map/list parity must be real | Final implementation/test evidence, not available at design stage |
| 6. What is simulated? | Explicit simulation boundary is defined in Sections 31 and 33 | Organizer acceptance of synthetic data and exact presentation disclosure |
| 7. Why is AI absent? | PS does not require it; core decisions lack data/safety case; deterministic mechanism directly addresses root cause | Hackathon rubric confirmation that AI is not implicitly scored |
| 8. What happens when the network or map fails? | Selected design requires local critical path, list continuity, and visible degraded state | Production offline policy, device tests, and conflict-resolution SOP |
| 9. How do you know delivery is real? | Prototype distinguishes responder report from coordinator/authorized confirmation and preserves evidence reference | Real confirmer, acceptable evidence, fraud/dispute policy |
| 10. What would production deployment require? | Conditional pilot path and missing capabilities are explicitly documented | Jurisdiction, legal review, security requirements, operator ownership, integration access, budgets/support |

---

# 40. Final Solution Synthesis

| Item | Selected conclusion |
|---|---|
| **Problem** | Crisis actors cannot reliably tell whether an uncertain report has become a valid, resourced, owned, and completed response. |
| **Root cause** | Incident, inventory, task, and outcome state are fragmented and weakly governed. |
| **Primary user** | Accountable local coordinator/dispatcher, subject to operator validation. |
| **Selected solution** | Verified Response Ledger. |
| **Core mechanism** | Human-authorized state transitions binding verification, atomic resource commitment, acknowledgement, outcome reconciliation, freshness/provenance, and audit. |
| **Core workflow** | Report → verify/link → reserve → offer/accept → dispatch → full/partial outcome → confirm/follow up → audit. |
| **Key capabilities** | Canonical incident, one-resource ledger, atomic reservation, task acknowledgement, partial reconciliation, role enforcement, audit, GIS/list parity. |
| **Strongest differentiator** | Operational truth: the prototype proves commitment and handoff invariants rather than merely displaying pins and status labels. |
| **Why simpler alternatives are insufficient** | They are adequate at small scale, but do not reliably enforce concurrent commitment, acknowledged ownership, reconciled partial outcomes, and attributable transitions. |
| **Data required** | Synthetic scenario data for prototype; real operator taxonomy, stock source, roster, verification and closure policy for deployment. |
| **Real in prototype** | Persistence, role/state rules, reservation, acknowledgement, outcome quantities, audit, map/list reflection, deterministic duplicate cues if included. |
| **Simulated** | Opening stock, real actors/evidence, agency APIs, official alerts, notifications, GPS/routes, government layers, production infrastructure. |
| **Biggest risk** | A correct ledger built on wrong/stale inventory or an invented SOP creates false confidence. |
| **Most dangerous remaining assumption** | A real operator can supply and maintain accountable resource state under a compatible reservation workflow. |
| **Prototype proof** | One controlled incident cannot overcommit stock, cannot appear owned without acknowledgement, and cannot hide a partial outcome. |
| **Production path** | Validate one operator/SOP → shadow one current workflow → pilot one resource pool → reconcile physical/system state → add only necessary integrations and hardened controls. |

---

# 41. Decision Log

| Decision | Chosen | Rejected alternative | Reason | Evidence source |
|---|---|---|---|---|
| Primary direction | Verified Response Ledger | Generic GIS dashboard / decision board alone | Directly covers report, resource, ownership, and outcome root causes | **[PSA][SWOT][DESIGN REASONING]** |
| Scope strategy | One area, incident family, countable resource, lifecycle | All-hazard/all-resource platform | Preserves coherent proof and avoids invalid generic semantics | **[PSA][SWOT]** |
| Workflow strategy | Governed state and handoffs | Communication/chat as coordination core | Messages do not enforce authoritative operational state | **[PSA]** |
| Resource strategy | Transactional reservation tied to incident/task | Display-only inventory | Prevents double commitment and creates technical proof | **[PSA][SWOT]** |
| Assignment strategy | Explicit acknowledgement before ownership | Notification sent = assigned | Directly fixes unobservable responsibility transfer | **[PSA][SWOT]** |
| Outcome strategy | Full/partial/failed quantity reconciliation | Single completed status | Prevents false closure and preserves remainder | **[PSA][SWOT]** |
| Verification strategy | Authorized human gate with provenance | Automated classification/verification | Authority/data are unvalidated; errors are high consequence | **[PSA][SWOT]** |
| AI | None in core | AI triage, dispatch, vision, forecasting | Unnecessary, unvalidated, and risky; deterministic core is sufficient | **[PSA][SWOT]** |
| Duplicate handling | Deterministic cues + human reversible link | Automatic AI merge | Synthetic/no labeled data; false merge can hide incidents | **[PSA][SWOT]** |
| GIS role | View of governed records with list fallback | Map as source/product core | Operational truth must not depend on visualization | **[PSA][SWOT]** |
| Offline strategy | Visible degraded/pending state; no full sync promise | Full offline-first synchronization now | Important but scope-dominating and target requirement unknown | **[SWOT][DESIGN REASONING]** |
| Integration strategy | Define boundary; simulate unavailable systems | Integration hub as primary approach | No named systems, schemas, access, or governance evidence | **[SWOT][DESIGN REASONING]** |
| Demo dependency | Locally controlled critical path | Live APIs, SMS, GPS, LLM, routing | Removes avoidable failure and overclaim risk | **[SWOT]** |
| Data strategy | Clearly synthetic operational dataset | Present sample data as live/representative | Synthetic data can prove mechanisms but not field impact | **[PSA][SWOT]** |
| Production positioning | Conditional local pilot/augmentation | Replacement of national/official systems | Existing systems cover adjacent authoritative functions; target gap unvalidated | **[PSA][SWOT]** |

Decisions should not be reopened in later stages without new operator evidence, hackathon rules, real data/integration access, or a demonstrated contradiction.

---

# 42. Inputs for `04-Scope_Lock.md`

## Selected solution

**Verified Response Ledger**

## One-line definition

A workflow coordination system that helps an accountable local emergency coordinator convert an uncertain report into a verified, resource-backed, explicitly owned, and reconciled response through human-authorized state transitions and an auditable commitment ledger.

## Primary users

- Central: coordinator/dispatcher.
- Supporting: reporter/intake operator, verifier, responder/volunteer, resource custodian function, confirming actor, supervisor/auditor.
- Exact roles and authority remain subject to operator/SOP validation.

## Core user job

Verify a reported need, commit genuinely available resources, transfer responsibility explicitly, and know whether the intended outcome was fully, partially, or not achieved.

## Core workflow

Report → required-field/location validation → duplicate review → human verification → canonical incident → freshness-aware resource review → atomic reservation → assignment offer → acknowledgement → dispatch → full/partial/failed outcome → confirmation/follow-up → reconciled audit timeline.

## Required outcome

For one synthetic scenario, the system must make it impossible to silently double-commit demonstrated stock, treat an unacknowledged task as owned, or hide an unresolved quantity behind “complete.”

## Candidate core capabilities

- Persistent structured incident report and reference.
- Human verification/rejection with provenance.
- Canonical incident and preserved source reports.
- One countable resource pool with source/freshness.
- Atomic reservation and authorized release/cancel.
- Task offer and explicit acknowledgement.
- Controlled dispatch and full/partial/failed outcome states.
- Quantity reconciliation and exception/remainder.
- Role and state-transition enforcement.
- Actor/time/reason audit history.
- GIS/list views driven by the same state.

## Supporting capabilities

- Deterministic duplicate cues and reversible linking.
- Stale-data reconfirmation/warning.
- Decline/timeout/reassignment.
- Map-failure/list continuity and visible degraded state.
- Synthetic/simulated labels and demo reset/test fixtures.

## Optional capabilities

- Limited reporter status.
- Recipient/third-party confirmation.
- Evidence references/operational comments.
- Validated multilingual controlled labels.
- Real-format import/export sample after access is supplied.

## Explicitly rejected capabilities

- Autonomous AI severity, priority, allocation, dispatch, or closure.
- Generic chatbot, blockchain, computer vision, predictive forecasting.
- General-purpose chat, donation/payment flow, fleet telemetry, custom routing.
- Universal resource model and all-hazard/national platform scope.
- Full offline bidirectional synchronization without a validated requirement.
- Mandatory live government feeds, SMS, GPS, satellite, LLM, or internet dependency.

## System boundary

The prototype owns the governed digital workflow and synthetic state. It does not own official warning authority, physical inventory truth, volunteer credentialing, real emergency dispatch authority, telecommunications, routing, national GIS/hazard systems, legal policy, or physical delivery.

## Available data

- Original PS and prior analysis.
- Synthetic reports, roles, resource quantities, assignments, outcomes, and audit events.
- Legally permitted base-map/static location context after provider selection.

## Simulated data

- Real incidents and identities.
- Opening stock and custodian feed.
- Responder registry/eligibility.
- Official alerts/hazard layers.
- SMS/push, GPS, routes/closures, agency integrations, and production load.

## External dependencies

None may be required for the critical demo. Production dependencies include operator identity/SOP, inventory source, IAM, notification channels, map/data licensing, connectivity strategy, and any approved integration.

## What must actually work

Persistence; permission and state enforcement; reservation concurrency; acknowledgement; full/partial/failed outcome; quantity reconciliation; critical audit; map/list parity; honest data/degraded labels; offline-independent demo path.

## What may be simulated

All unnamed external organizations, systems, feeds, people, physical assets, notifications, telemetry, and large-scale infrastructure, provided simulation is unmistakably disclosed.

## Differentiators to preserve

- Reported ≠ verified.
- Displayed available ≠ transactionally uncommitted.
- Sent ≠ accepted.
- Dispatched ≠ delivered.
- Partial outcome leaves a visible remainder.
- Freshness, provenance, actor, and time remain inspectable.
- The map reflects operational truth rather than manufacturing it.

## Risks to control

- Fictional operator/SOP.
- Wrong/stale opening inventory.
- Authorization gaps or cosmetic state transitions.
- Concurrent commitment errors.
- Privacy exposure and unsafe location precision.
- Parallel off-system work and duplicate entry.
- Scope expansion and live-demo dependencies.
- Synthetic data overclaims.

## Remaining assumptions

- One operator and one-organization pilot exist.
- Reservation and acknowledgement fit the real SOP.
- A custodian can maintain accountable resource state.
- A web workflow fits target devices/users.
- Synthetic data and a narrow scenario satisfy hackathon rules.
- Verification and outcome evidence can be defined.

## Demo proof required

1. Submit and trace one synthetic geolocated report.
2. Human-review a duplicate candidate and verify the canonical incident.
3. Reserve limited stock and reject a competing overcommitment.
4. Show task pending until acknowledgement.
5. Dispatch and record a partial result.
6. Reconcile delivered and unresolved quantities.
7. Show role enforcement and complete audit history.
8. Continue via local/list path without critical external services.
9. Display a clear real/synthetic/simulated disclosure.

## Decisions not to reopen without new evidence

- Do not replace the selected workflow with a generic map dashboard.
- Do not add AI to the core for differentiation.
- Do not broaden beyond one validated resource/lifecycle before proof.
- Do not make external integrations or full offline sync critical without access/requirements.
- Do not collapse acknowledgement, dispatch, and outcome into one status.
- Do not present synthetic stock, people, or feeds as operational reality.

The next stage must decide exactly what is **IN** and **OUT** of the prototype while preserving the end-to-end invariant and the distinction between real mechanisms and simulated context.

---

# Quality Gate Result

| Test | Result | Reason |
|---|---|---|
| Problem fit | **Yes** | Selected mechanism directly joins the fragmented report, resource, ownership, and outcome states. |
| User fit | **Conditional Yes** | Strong coordinator value hypothesis; real user/SOP validation is still missing. |
| Simplicity | **Yes** | Narrower than an all-in-one platform; software is justified by cross-object invariants that simple tools do not reliably enforce. |
| Differentiation | **Yes** | Comes from workflow integrity and exception handling, not AI or presentation. |
| Data reality | **Yes for prototype; conditional for production** | Synthetic data proves mechanics; real inventory ownership remains the go/no-go dependency. |
| Technical reality | **Yes** | Local persistence, roles, transactions, state rules, audit, and GIS/list parity have a plausible implementation path. |
| Demo reality | **Yes** | One deterministic scenario exposes visible state and quantity consequences. |
| Integrity | **Yes** | Real, simulated, unknown, and production-only elements are explicitly separated. |
| Production reality | **Conditional Yes** | A one-organization shadow/pilot path exists, but authority, data, security, and operations must be validated. |
| Scope discipline | **Yes** | Scope Lock can reduce this to one coherent lifecycle without reopening rejected platform breadth. |

---

# Sources Carried Forward

This document relies on the research and direct links already evaluated in `docs/01-PS_Analysis.md` and carried into `docs/02-SWOT.md`, especially:

1. [GDACS — Global Disaster Awareness and Coordination System overview](https://www.gdacs.org/About/overview.aspx)
2. [NDMA SACHET — National Disaster Alert Portal](https://sachet.ndma.gov.in/)
3. [ISRO/NRSC — Disaster Management Support](https://www.nrsc.gov.in/nrscnew/)
4. [OASIS — Common Alerting Protocol 1.2](https://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html)
5. [OGC — OGC API Features](https://www.ogc.org/standards/ogcapi-features/)
6. [ICRC — Handbook on Data Protection in Humanitarian Action](https://www.icrc.org/en/data-protection-humanitarian-action-handbook)
7. [OpenStreetMap — Copyright and licence](https://www.openstreetmap.org/copyright)
8. [Ushahidi — Platform overview](https://www.ushahidi.com/)
9. [Sahana Foundation — Eden legacy archive](https://sahanafoundation.org/products/eden/)
10. [Esri — ArcGIS Mission](https://www.esri.com/en-us/arcgis/products/arcgis-mission/overview)
11. [ODK — ODK Collect documentation](https://docs.getodk.org/collect-intro/)

## Limitations

- No target operator, field interview, SOP, real inventory sample, integration specification, jurisdiction, team constraints, or hackathon rubric was supplied.
- Approach selection is therefore based on root-cause coverage, data honesty, dependency control, and demonstrability—not validated product-market fit.
- Status names, authority boundaries, freshness thresholds, evidence requirements, and resource semantics are provisional.
- The document does not claim legal compliance, field effectiveness, production readiness, or superiority to existing platforms.

