# Crisis Response Platform — Problem Statement Deep Analysis

**Document purpose:** Research and problem understanding for later SWOT, scope lock, SPEC, and PRD work  
**Source problem statement:** “Crisis Response Platform” / “FULL-STACK GIS”  
**Research date:** 20 September 2026  
**Status:** Pre-implementation analysis; not a PRD or architecture document

---

## Evidence Discipline

This document uses the following labels throughout:

| Label | Meaning |
|---|---|
| **[PS-CONFIRMED]** | Directly stated in the supplied problem statement. |
| **[RESEARCH-CONFIRMED]** | Supported by a cited authoritative or primary source. |
| **[INFERENCE]** | Reasonable conclusion from the PS and domain evidence, but not directly stated. |
| **[ASSUMPTION—VALIDATE]** | Needed to shape a build, but must be tested with users or the problem owner. |
| **[UNKNOWN]** | The PS and available research do not answer it. |

### Scope of external research

The PS does not name a country, disaster type, sponsoring agency, or operating scale. The domain analysis is therefore global, with an **India-oriented reference layer** because the named official systems provide a realistic public-sector benchmark. **This is contextual research, not proof that the intended deployment is in India.** Geography and authority must be validated before implementation.

No reliable statistic is used to justify the product. The analysis relies on workflow evidence and capability comparisons instead.

---

# 1. Problem Statement Deconstruction

## 1.1 The PS in simple language

The PS asks for one web-based place where people can report an emergency, responders can see what is happening and where, coordinators can see and allocate resources, and volunteers or agencies can receive and carry out tasks. The map is meant to create shared situational awareness, but the system must also connect the operational steps behind the map.

In plain terms: today, a report may arrive by phone or message, stock may be recorded somewhere else, and assignments may be sent in another channel. The PS wants those disconnected pieces connected so that response is faster and resources are not used inefficiently.

The PS is **not explicit** about whether the platform is for one campus, city, district, state, country, NGO, or multi-agency network. It also does not define which emergency types, what qualifies as “real time,” who verifies reports, who owns inventory, or which actor has legal authority to assign work.

## 1.2 What the PS is literally asking for

- **[PS-CONFIRMED]** A centralized web platform.
- **[PS-CONFIRMED]** Connection among communities, volunteers, and agencies.
- **[PS-CONFIRMED]** Real-time incident reporting with location, type, and severity.
- **[PS-CONFIRMED]** Tracking of emergency-resource availability and distribution.
- **[PS-CONFIRMED]** Communication and task coordination.
- **[PS-CONFIRMED]** An interactive map showing incidents and resources.
- **[PS-CONFIRMED]** A full-stack GIS implementation.
- **[INFERENCE]** The evaluator expects a working end-to-end data flow, not a static dashboard, because “full-stack,” “tracking,” and “coordinated response” imply persisted state changes and role-based actions.

## 1.3 Requirement extraction table

| Requirement | Explicit / Implicit | Evidence from PS | Importance | Notes |
|---|---|---|---|---|
| Centralized web platform | Explicit | “Develop a centralized web platform” | Critical | Centralized should mean a shared operational record, not merely one homepage linking separate tools. |
| Community participation | Explicit | “connects communities” | High | The PS does not say whether community users are authenticated, anonymous, or verified. |
| Volunteer participation | Explicit | “connects … volunteers” | Critical | Volunteer identity, skill, availability, acceptance, and safeguarding are unspecified. |
| Agency participation | Explicit | “connects … agencies” | Critical | Agency authority and cross-agency data-sharing rules are unknown. |
| Real-time incident reporting | Explicit | “report incidents in real time” | Critical | “Real time” has no latency target. Offline capture may conflict with immediate synchronization. |
| Incident location | Explicit | “location” | Critical | Coordinate accuracy, manual pinning, address search, and privacy are unspecified. |
| Incident type | Explicit | “type” | High | No incident taxonomy is supplied. |
| Incident severity | Explicit | “severity” | Critical | No severity scale or authorized assessor is supplied; citizen self-rating may be unsafe. |
| Resource availability tracking | Explicit | “Monitor the availability” | Critical | The unit of inventory, owner, refresh method, and reservation semantics are unspecified. |
| Resource distribution tracking | Explicit | “and distribution” | Critical | Requires state transitions and accountable handoffs, not a single “dispatched” flag. |
| Communication | Explicit | “Enable communication” | High | Channel, retention, moderation, and reliability requirements are unknown. |
| Task coordination | Explicit | “task coordination” | Critical | Implies assignment, acceptance, status, ownership, and completion evidence. |
| Interactive map | Explicit | “incidents and resources on an interactive map” | Critical | A list/table fallback is implicitly necessary for accessibility and degraded map service. |
| Situational awareness | Explicit outcome | “at-a-glance situational awareness” | Critical | Requires freshness, provenance, legend clarity, filtering, and uncertainty—not just markers. |
| Persistent shared record | Implicit | Needed to track availability, distribution, and task progress | Critical | The main operational value depends on an auditable state history. |
| Verification/moderation | Implicit | Public/user reports can be wrong or malicious | Critical | Unverified reports must not automatically trigger high-impact action. |
| Role-based authorization | Implicit | Communities, volunteers, and agencies have different powers | Critical | A reporter should not be able to allocate agency stock or close another team’s task. |
| Data freshness | Implicit | Real-time awareness and availability claims | Critical | Every operational object needs “updated at,” source, and stale-state handling. |
| Duplicate/concurrent handling | Implicit | Multiple reports and responders may concern the same event | High | Duplicate reports must not create duplicate resource commitments. |
| Connectivity resilience | Implicit | Emergency environments commonly experience connectivity disruption | Critical | ICRC notes that telecommunications frequently stop working after disasters; exact offline scope remains a product decision. |
| Auditability | Implicit | Resource allocation and status changes affect safety and accountability | Critical | Who changed what, when, and why must be reconstructable. |
| Accessibility and multilingual use | Implicit | Community-facing emergency service | High | Languages, literacy levels, and disability needs are not specified. |
| Interoperability | Implicit | Agencies and GIS data are normally heterogeneous | High | CAP and OGC standards are relevant candidates, but integrations are not required by the PS. |
| Security and privacy | Implicit | Identity, location, messages, and possibly vulnerability/health data | Critical | Exact legal regime depends on deployment geography and operator. |

## 1.4 Expected outputs, constraints, users, technologies, data, and success expectations

| Category | Extracted understanding |
|---|---|
| Expected output | A working full-stack web application with incident intake, resource tracking, coordination workflow, and a live/near-live GIS view. |
| Mentioned users | Community members, volunteers, response agencies. |
| Missing but implied users | Coordinator/dispatcher, inventory custodian, administrator, incident verifier, agency supervisor. |
| Mentioned technology | Web platform, GIS, interactive map. |
| Mentioned data | Incident location/type/severity; resource availability/distribution; communication/task information. |
| Explicit constraints | None beyond the requested full-stack GIS form. |
| Operational constraints | **[INFERENCE]** Unreliable connectivity, rapidly changing information, multiple actors, uncertain reports, and stressful use conditions. |
| Success expectation | Reduced delay and improved resource allocation through shared, current information and coordination. |
| Unknown success threshold | No target response-time reduction, geographic scale, throughput, uptime, accuracy, or adoption requirement is provided. |

---

# 2. Domain Understanding

## 2.1 What this domain is

Emergency and disaster response is not simply “viewing incidents on a map.” It is a time-sensitive, authority-sensitive process for turning incomplete reports into verified needs, matching those needs to available people and supplies, assigning accountable work, tracking execution, and maintaining a common operational picture.

The UN Office for Disaster Risk Reduction defines a disaster as serious disruption caused by hazardous events interacting with exposure, vulnerability, and capacity—not merely the hazard itself. This matters because two locations experiencing the same flood depth may need different responses depending on population, access, and local capacity ([UNDRR disaster definition](https://www.undrr.org/terminology/disaster)).

## 2.2 Important terminology

| Term | Practical meaning for this PS |
|---|---|
| Incident | A reported event requiring assessment or action. It may be unverified, verified, merged, rejected, escalated, or closed. |
| Hazard | Potential source of harm, such as flood, fire, landslide, chemical release, or infrastructure failure. |
| Severity | Magnitude or seriousness of the incident. A defensible scale must be defined; self-reported urgency is not automatically authoritative. |
| Priority | Response order after considering severity, people at risk, time sensitivity, accessibility, confidence, and available capacity. Priority is not identical to severity. |
| Situational awareness | Shared understanding of what has happened, where, when, with what confidence, and what is being done. |
| Common operating picture | A synchronized operational view used by multiple roles. It must expose freshness and provenance, not merely show the same map. |
| Resource | A consumable supply (kits, water), durable asset (vehicle, generator), facility (shelter), or person/team with skills. These have different tracking semantics. |
| Available | Ready for allocation at a known place and time. It should exclude quantities already reserved, unusable, or stale. |
| Reserved | Committed to a task but not yet handed over or dispatched. This state prevents double promising. |
| In transit / dispatched | Departed or handed to a delivery actor; not equivalent to delivered. |
| Delivered / completed | Reached the intended recipient/location and passed the defined completion check. |
| Task | An accountable unit of work with owner, status, timestamps, and outcome/evidence. |
| Dispatch | Operational assignment and movement of personnel/resources. |
| Provenance | Source of a data item and its chain of changes. |
| Freshness | Age of an observation or stock count relative to now. |
| CAP | Common Alerting Protocol, an OASIS standard for exchanging all-hazard public warnings. It is relevant to alerts, but not a complete task/inventory workflow ([OASIS CAP 1.2](https://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html)). |
| GIS feature | A real-world object with geometry and attributes, such as an incident point, affected polygon, route, depot, or shelter. |

## 2.3 How the domain normally operates

**[INFERENCE based on established incident-management practice]** A typical response has six broad functions:

1. **Detection and intake:** calls, messages, sensors, official alerts, or field reports indicate a possible incident.
2. **Triage and verification:** a control room or coordinator checks location, source, severity, duplication, and immediate risk.
3. **Planning and prioritization:** needs are compared with active incidents, access constraints, resources, and authority.
4. **Allocation and assignment:** resources are reserved; a team or volunteer is assigned and acknowledges the task.
5. **Execution and tracking:** dispatch, arrival, delivery/action, exceptions, and updates are recorded.
6. **Closure and review:** completion is verified, inventory reconciled, and the operational history retained.

This is often split across emergency operations centres/control rooms, field responders, local authorities, police/fire/health services, NGOs, depots/warehouses, community leaders, and volunteers. The exact command structure is jurisdiction-specific.

## 2.4 Where software already fits

- Official alert dissemination: India’s NDMA SACHET portal describes a CAP-based, pan-India integrated alert system with geo-targeted, multilingual dissemination through SMS, apps, browser notifications, and RSS ([SACHET](https://sachet.ndma.gov.in/)).
- Hazard and satellite situational data: ISRO/NRSC’s Bhuvan Disaster Management Support provides near-real-time and historical geospatial information for monitoring, assessment, preparedness, and response; NDEM is presented as a national emergency-management GIS/decision-support resource ([NRSC disaster support](https://www.nrsc.gov.in/nrscnew/), [Bhuvan](https://bhuvan.nrsc.gov.in/home/index.php)).
- Crowdsourced reporting and mapping: Ushahidi collects, manages, analyzes, and maps citizen-generated information ([Ushahidi](https://www.ushahidi.com/)).
- Humanitarian operations: Sahana Eden historically provided organization, volunteer, inventory, asset, request, shelter, messaging, and mapping modules ([Sahana Eden](https://sahanafoundation.org/products/eden/)).
- Tactical command-and-control: ArcGIS Mission integrates authoritative GIS, field updates, team locations, tasks, reports, chat, and post-incident review ([ArcGIS Mission](https://www.esri.com/en-us/arcgis/products/arcgis-mission/overview)).
- Offline field collection: ODK Collect supports offline Android forms with location, media, constraints, and later submission ([ODK Collect](https://docs.getodk.org/collect-intro/)).

The existence of these tools proves that the categories are real, but it also raises the judge’s hardest question: **what workflow gap is this new platform proving rather than merely recreating?**

## 2.5 Regulatory and operational constraints

| Constraint | Status | Implication |
|---|---|---|
| Statutory authority and incident command | [INFERENCE]; jurisdiction-specific | Software must support authorized decisions rather than invent a new command chain. |
| Data protection | [RESEARCH-CONFIRMED as a general humanitarian concern] | ICRC treats personal-data protection as part of protecting life, integrity, and dignity. Exact national obligations require legal review ([ICRC handbook](https://www.icrc.org/en/data-protection-humanitarian-action-handbook)). |
| India privacy regime | [ASSUMPTION—VALIDATE geography] | If deployed in India, review current Digital Personal Data Protection law/rules and any public-sector exemptions or directions; do not rely on this document as legal advice ([MeitY data-protection framework](https://www.meity.gov.in/data-protection-framework)). |
| Map/data licensing | [RESEARCH-CONFIRMED] | OpenStreetMap data require attribution and ODbL compliance; public tile servers are not an unlimited free backend ([OSM copyright and licence](https://www.openstreetmap.org/copyright)). Bhuvan content also has use restrictions that must be checked before integration. |
| Warning authority | [RESEARCH-CONFIRMED] | CAP standardizes alert exchange, but public warnings should originate from authorized sources. A community report must not be presented as an official alert. |
| Connectivity failure | [RESEARCH-CONFIRMED] | ICRC notes telecommunications networks frequently stop working after disasters. Offline/degraded-mode design is an operational requirement, not a polish feature. |
| Human safety and safeguarding | [INFERENCE] | Volunteer identity, capability, duty of care, restricted locations, and vulnerable-person data require controlled handling. |
| Audit and accountability | [INFERENCE] | Allocation and delivery claims need immutable timestamps/change history sufficient for reconciliation and after-action review. |

---

# 3. Current Workflow — AS-IS

Because the PS supplies no organization, the following is a **reconstructed generic workflow**. Each non-PS detail is an inference or validation item.

## 3.1 AS-IS workflow chain

**Trigger** → resident/field worker observes need → reports by call/message/form → operator manually interprets and records it → coordinator checks or phones contacts → stock owner confirms quantity in a separate list/call → coordinator assigns a responder via call/chat → responder travels and sends status updates → coordinator manually updates dashboard/spreadsheet → recipient/delivery is confirmed, disputed, or left ambiguous.

## 3.2 Stage analysis

| Stage | Person responsible | Input | Action | Current tool/system | Output | Likely delay/manual work | Failure possibilities |
|---|---|---|---|---|---|---|---|
| 1. Observe/report | Community member, field worker | Real-world observation | Describe event and location | [ASSUMPTION] Phone, messaging app, social post, paper, web form | Raw report | Location explanation; repeated follow-up | Vague location, exaggeration, duplicate, malicious report, inaccessible language |
| 2. Receive/log | Call taker/control-room operator | Raw report | Transcribe or copy details | [ASSUMPTION] Notebook, spreadsheet, ticketing tool | Incident record | Re-keying; queue delay | Typo, dropped context, no source link, duplicate identifier |
| 3. Verify/triage | Coordinator/agency officer | Incident record, calls, field information | Validate existence, severity, affected people, jurisdiction | [ASSUMPTION] Calls, group chat, separate dashboards | Verified/rejected/escalated incident | Waiting for responder or local contact | False confirmation, severity inconsistency, stale report |
| 4. Assess resources | Coordinator + depot/agency owner | Need estimate, inventory count | Ask what is available and where | [ASSUMPTION] Spreadsheet, phone, warehouse list | Candidate resource plan | Manual cross-check | Stock count stale; reserved stock appears available; unit mismatch |
| 5. Approve/reserve | Authorized coordinator | Candidate plan | Select quantity/team and commit it | [ASSUMPTION] Call/message plus manual edit | Allocation/reservation | Multiple approvals | Same stock promised twice; no clear owner; unauthorized allocation |
| 6. Assign | Coordinator/dispatcher | Incident and allocation | Send task to volunteer/team | [ASSUMPTION] Phone/WhatsApp/SMS/radio | Assignment | Confirmation chasing | Assignment not received; volunteer unavailable/unqualified; two teams sent |
| 7. Dispatch/execute | Responder/volunteer | Accepted task, resource | Travel, act, deliver, report exception | [ASSUMPTION] Mobile phone, radio, paper | Progress updates | Connectivity gaps; manual status | “Dispatched” mistaken for “delivered”; route blocked; partial delivery; resource lost |
| 8. Confirm/close | Coordinator/recipient/supervisor | Completion update/evidence | Verify outcome and reconcile stock | [ASSUMPTION] Message/photo/sign-off/spreadsheet | Closed task, adjusted inventory | Manual reconciliation | No recipient confirmation; wrong site; partial work closed as complete |
| 9. Review/report | Incident lead/management | Logs, messages, sheets | Compile summary and lessons | [ASSUMPTION] Spreadsheet/documents | Situation report/after-action report | Data reconstruction | Missing timestamps; conflicting versions; no audit trail |

## 3.3 What external evidence says about the AS-IS problem

The PS’s fragmentation claim is plausible beyond this specific challenge. GDACS, a UN–European Commission cooperation framework, states that during the first days after major sudden-onset disasters, actors collect and analyse information simultaneously through different channels and procedures; weak exchange can produce duplication, gaps, overlap, and inappropriate response ([GDACS overview](https://www.gdacs.org/About/overview.aspx)). This validates the **class of coordination problem**, not the exact workflow or frequency in the unnamed target organization.

---

# 4. Stakeholder Analysis

## 4.1 Stakeholder groups

### Primary users

- Community reporter / affected resident
- Control-room operator or incident verifier
- Coordinator / dispatcher
- Volunteer or field responder
- Resource/depot custodian

### Secondary users

- Incident commander or agency supervisor
- Community leaders and relief coordinators
- Recipients/affected households
- Analysts producing situation reports or after-action reviews
- Donor/oversight personnel where relevant

### Decision makers

- Government disaster-management authority or emergency-service leadership
- District/local authority or emergency operations centre
- NGO/agency programme and operations leaders
- IT/security/data-protection owners
- Procurement/funding authorities

### System stakeholders

- Mapping/data providers
- SMS/telecom/notification providers
- Identity providers
- Warehouse and transport operators
- External government/agency information systems
- System administrators and support team

## 4.2 Stakeholder table

| Stakeholder | Goal | Current workflow | Pain | Frequency | Severity | What success means |
|---|---|---|---|---|---|---|
| Affected resident/reporter | Get the need acknowledged and acted upon | Reports via available channel and repeatedly follows up | No receipt, no status, difficulty describing location, repeated explanations | Incident-dependent; potentially frequent during crisis | High | Receives a reference, sees meaningful status, is not required to expose unnecessary personal data |
| Control-room operator | Convert incoming reports into actionable records | Transcribes calls/messages and chases missing details | Volume, ambiguity, duplicate reports, emotional/stressful interactions | High during event | High | Fast structured capture with source, map position, duplicate warning, and clear verification state |
| Coordinator/dispatcher | Prioritize and assign work without conflicts | Cross-checks calls, chats, sheets, and staff knowledge | No single current picture; double allocation; unclear ownership; status chasing | Continuous | Critical | One trusted queue; reservation before dispatch; accountable assignment; exception visibility |
| Volunteer/field responder | Receive clear, safe, feasible tasks | Gets scattered calls/messages and reports back manually | Missing directions/context; duplicate instructions; no acceptance boundary; poor connectivity | Per assignment | High | One assignment with contact, route/context, acceptance, status, and offline-safe update |
| Resource/depot custodian | Keep reliable counts and handoffs | Maintains local ledger/spreadsheet and answers calls | Stale counts, undocumented reservations, reconciliation burden | Continuous | Critical | Available/reserved/in-transit/delivered quantities reconcile with an audit trail |
| Agency supervisor/incident lead | Maintain command, safety, and coverage | Receives summaries from multiple teams | Cannot distinguish verified from unverified; blind spots; lagging reports | Frequent during incident | Critical | Common operational picture with freshness, confidence, workload, exceptions, and decision history |
| Recipient/community lead | Receive appropriate aid at correct place/time | Coordinates informally with responders | Partial/duplicate/misdirected delivery; no ability to confirm | Per delivery | High | Confirmed handoff/outcome and a channel to report a mismatch |
| IT/security administrator | Keep platform available and controlled | Manages accounts/infrastructure | Crisis-time traffic, cyber abuse, access churn, sensitive data | Continuous | High | Resilient service, least privilege, recoverability, logs, tested incident response |

## 4.3 Greatest pain versus greatest value

- **Who experiences the greatest operational pain?** **[INFERENCE]** The coordinator/dispatcher and resource custodian, because they must reconcile conflicting information and are accountable for avoiding duplicate commitments.
- **Who experiences the gravest consequence?** The affected person/community, because delay or misallocation can translate into unmet safety needs.
- **Who receives the greatest value?** The entire response chain benefits, but an accountable coordinator receives the highest direct workflow value from one current record; residents receive the highest outcome value from faster, clearer fulfilment.

These are not automatically the same stakeholder. A reporter-friendly map that does not fix coordinator workflow may improve visibility without improving response.

---

# 5. Pain-Point Analysis

| Pain point | What happens / when | Who experiences it | Frequency | Consequence | Current workaround | Why insufficient | Classification |
|---|---|---|---|---|---|---|---|
| Fragmented intake | Reports arrive in different channels/formats | Operator, coordinator | High during crisis | Missed or delayed cases; repeated transcription | Shared phone, group chat, spreadsheet | No common identifier, structured fields, or provenance | Data, coordination, time |
| Unverified information mixed with verified facts | Rumours and first-hand reports look similar | Coordinator, supervisor, public | Recurrent | Unsafe prioritization, loss of trust | Phone callbacks, local contacts | Slow and inconsistent; verification state may not be visible | Decision, safety, data |
| Duplicate incidents | Several people report the same event | Operator, coordinator | Likely high for visible incidents | Inflated demand; duplicate tasks; map clutter | Manual visual comparison | Names/locations vary; no merge history | Data, coordination |
| Stale inventory | Last recorded count is treated as current | Coordinator, custodian | Continuous | Resource promised but unavailable | Call depot before every decision | Slow, not scalable, and still misses concurrent reservations | Operational, data, time |
| Double allocation | Two coordinators commit the same stock/team | Coordinator, depot, recipient | Possible under concurrency | One incident is left unsupported; trust damage | Chat/call to “hold” stock | Informal holds have no atomicity, expiry, or audit trail | Operational, technical, coordination |
| Status ambiguity | “Sent” or “dispatched” is treated as “delivered” | Coordinator, recipient, manager | Common semantic risk | False completion; missing recipients ignored | Follow-up call/photo | Evidence is scattered and partial delivery is hard to represent | Data, decision, UX |
| Unacknowledged assignment | Task is sent but not accepted | Volunteer, dispatcher | Recurrent | Dispatcher assumes coverage that does not exist | Repeated calling | No explicit ownership transition | Coordination, time |
| Poor location quality | GPS is inaccurate or reporter describes a landmark | Reporter, responder | Context-dependent | Wrong route/site; delay; privacy exposure | Call for directions; share live location | Connectivity and literacy dependent; coordinates lack confidence | Technical, UX, privacy |
| Connectivity loss | Field updates cannot sync | Responder, coordinator | Hazard-dependent | Stale common picture; duplicate action | Radio/SMS/paper and later entry | Causes version conflict and missing timestamps | Technical, operational |
| No accountable history | Decisions and changes live in messages | Supervisors, auditors, coordinators | Continuous | Difficult reconciliation and after-action learning | Compile report manually | Omissions and hindsight bias | Compliance, decision, data |
| Too much public detail | Sensitive locations/identities appear on shared map | Affected persons, agencies | Possible | Targeting, stigma, exploitation, privacy harm | Ad hoc redaction | Inconsistent and often too late | Privacy, ethics, security |
| Accessibility/language mismatch | Users cannot understand forms/status | Community, volunteers | Context-dependent | Exclusion and bad data | Human interpreter or assistance | Slow; not always available | UX, equity |

---

# 6. Root-Cause Analysis

## 6.1 Five Whys — delayed response

**Observed problem:** A legitimate incident waits too long for action.  
↓ Why? The coordinator lacks a complete, trusted incident record and must call people for missing facts.  
↓ Why? Reports arrive through heterogeneous channels without a shared schema, identifier, or verification state.  
↓ Why? Intake tools are optimized for communication, not operational handoff.  
↓ Why? Incident, resource, assignment, and outcome records are owned in separate tools or by separate actors.  
↓ **Root cause:** There is no shared, governed workflow that turns uncertain observations into accountable action.

## 6.2 Five Whys — inefficient resource allocation

**Observed problem:** Stock is double-promised or unavailable at dispatch.  
↓ Why? A displayed count does not reflect reservations and concurrent decisions.  
↓ Why? “Available,” “reserved,” “in transit,” and “delivered” are not separate controlled states.  
↓ Why? Inventory and task assignment are updated independently or manually.  
↓ Why? There is no atomic allocation transaction or accountable handoff.  
↓ **Root cause:** Resource state is not bound to the response workflow and lacks a single authoritative ledger.

## 6.3 Five Whys — misleading situational awareness

**Observed problem:** The map looks current but decisions are based on stale or uncertain data.  
↓ Why? Markers do not clearly show source, confidence, update time, or operational state.  
↓ Why? The system treats visualization as the product rather than as a view of governed records.  
↓ Why? Data quality and workflow semantics were not defined before building the GIS.  
↓ Why? Success was measured by visible pins/features instead of correct handoffs and outcomes.  
↓ **Root cause:** The common operating picture is not anchored to data provenance, freshness, and accountable state transitions.

## 6.4 Five Whys — tasks fall through gaps

**Observed problem:** An assignment is assumed to be covered but no responder acts.  
↓ Why? Sending a message is mistaken for task acceptance.  
↓ Why? There is no explicit accept/decline/timeout workflow.  
↓ Why? Communication and task state are separate.  
↓ Why? Ownership transfer is informal and not observable to the dispatcher.  
↓ **Root cause:** Responsibility is communicated but not formally transferred and acknowledged.

## 6.5 Root-cause summary

| Symptom | Immediate cause | Deeper cause | Root cause | Evidence / assumption |
|---|---|---|---|---|
| Slow response | Missing/ambiguous information | Heterogeneous channels and re-entry | No governed report-to-action workflow | PS fragmentation; GDACS confirms this problem class; target workflow assumed |
| Resource inefficiency | Stale counts and duplicated commitments | Inventory detached from allocation | No authoritative resource ledger with reservation semantics | PS resource inefficiency; detailed mechanism inferred |
| Duplicate work | Reports and assignments not linked | No canonical incident/task identity | No reconciliation across intake and execution | Inference; validate with users |
| False “completion” | Dispatch status interpreted as delivery | Status meanings and evidence are undefined | No explicit chain of custody/outcome model | Inference; high-priority validation |
| Weak trust | Mixed verified/unverified data | Provenance and confidence hidden | Visualization lacks data-governance context | Inference supported by GDACS warning on patchy/inaccurate sources |
| Volunteer confusion | Assignment sent through chat | No acknowledgement or single task record | No accountable transfer of responsibility | Inference; validate |

### Core Problem

**Emergency response actors lack one trusted, current, and accountable workflow that converts uncertain incident reports into verified needs, reserved resources, accepted assignments, and confirmed outcomes.**

### Why Existing Workflows Fail

1. Communication channels move messages, but do not enforce operational states or ownership.
2. Incident, resource, and task records are separated, so changes do not reconcile automatically.
3. Verification, freshness, and provenance are implicit rather than visible.
4. “Available,” “assigned,” “dispatched,” and “delivered” are often collapsed into ambiguous status.
5. Connectivity failure and manual fallback create version conflicts that the workflow does not resolve.

---

# 7. Problem Chains

### Chain A — fragmented reporting

Disconnected intake → duplicated/incomplete records → operator rework and slow verification → delayed prioritization → slower or missed assistance.

### Chain B — ungoverned resource state

Separate stock lists + no reservation → apparent availability exceeds real availability → double promise or failed dispatch → loss of trust and unmet need → avoidable operational harm.

### Chain C — informal assignment

Message sent without acceptance → ownership assumed but not transferred → no responder acts or two responders act → gap/duplication → reduced coverage and wasted capacity.

### Chain D — map without provenance

Mixed fresh/stale and verified/unverified markers → false common picture → poor command decision → resources sent to wrong/low-priority need → higher-impact incident receives less support.

### Chain E — connectivity failure

Network loss → delayed field updates → coordinator acts on old state → conflicting dispatch or stock decisions → reconciliation burden and unreliable after-action record.

---

# 8. Data and Information Flow

## 8.1 Likely data inventory

| Data source | Format | Owner | Availability | Reliability | MVP usability |
|---|---|---|---|---|---|
| Community incident report | Web form, phone transcription, text, photo, coordinates | Reporter/platform operator | Can be generated for MVP | Low–medium until verified | High; use synthetic reports with explicit verification state |
| Official/field incident assessment | Structured form, message, call note, photo | Agency/field team | Unknown | Medium–high depending on process | Simulate verified update unless partner data exists |
| Resource inventory | Spreadsheet, warehouse system, paper ledger, database | Agency/depot/NGO | Unknown and likely siloed | Medium; freshness-dependent | Use synthetic depot stock and expose timestamp/source |
| Allocation/reservation | Tasking system, message, manual note | Coordinator | Often generated during workflow | Reliability depends on transaction control | Core MVP data; must be real within prototype |
| Volunteer roster/availability | Spreadsheet, contact list, volunteer platform | Agency/NGO | Unknown; sensitive | Medium and rapidly changing | Use synthetic responders; avoid real PII |
| Task status and evidence | App update, call, chat, photo, signature | Responder/coordinator/recipient | Generated during response | Medium; may be delayed/offline | Core MVP data; timestamps and actor required |
| Official alerts | CAP/RSS/web/app | Authorized warning agencies | Country/jurisdiction dependent | High for official warning purpose | Optional context, not core; SACHET publishes CAP-based alerts/RSS in India |
| Hazard/weather feeds | API, CAP, bulletin, raster | Meteorological/hazard agencies | API access and terms unknown | Source-dependent | Can simulate; do not promise live integration without documented API |
| Base map/roads/places | Vector/raster tiles, OSM data | Mapping provider/community | Available with terms/limits | Variable completeness | High; use licensed provider and attribution |
| Administrative boundaries | GeoJSON/Shapefile/WMS/WFS | Government/OSM/other | Often available, licensing varies | Medium–high | High if source and licence verified |
| Satellite/impact layers | Raster/vector/web map services | ISRO/NRSC or other providers | Event/product dependent | Useful but not field confirmation | Optional overlay; integration/redistribution terms must be checked |
| Shelters/hospitals/depots | CSV, GIS layer, directory | Government/agencies | Unknown; may be stale/restricted | Variable | Synthetic or small curated dataset for MVP |
| Historical incidents | CSV/database/reports | Agency/operator | Unknown | Variable | Not required for core workflow; useful later for planning |
| Audit trail | Database events | Platform operator | Created by system | High if append-only and actor-linked | Core MVP data |

## 8.2 Structured versus unstructured information

- **Structured:** incident ID, category, coordinates, severity, verification state, resource SKU/type, quantity, unit, depot, task owner, timestamps, status.
- **Unstructured:** caller narrative, chat messages, photos, voice notes, field observations, exception descriptions.
- **Real-time/near-real-time:** new reports, assignment acceptance, resource reservations, dispatch and completion updates, official alerts.
- **Historical:** incident timelines, stock movements, task outcomes, map snapshots, audit logs, after-action notes.
- **User-generated:** reports, photos, location, comments, confirmations.

## 8.3 Standards and interchange opportunities

- CAP is suitable for interoperable official warnings; it is not an inventory/task protocol ([OASIS CAP](https://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html)).
- OGC API Features defines consistent web API building blocks for querying and interacting with geospatial features ([OGC API Features](https://www.ogc.org/standards/ogcapi-features/)).
- GeoJSON is a practical prototype exchange format for points, lines, and polygons; production interoperability requirements should be confirmed with target agencies.

## 8.4 Data the PS appears to assume but may be difficult to obtain

1. **Current resource availability:** no agency, source, API, or update responsibility is named.
2. **Resource distribution location/status:** vehicle/GPS telemetry is not promised; “tracking” may need human status updates.
3. **Verified volunteer identity, skills, and availability:** sensitive and operationally maintained data may not exist in reusable form.
4. **Authoritative incident severity:** severity cannot safely be inferred from a citizen-selected label alone.
5. **Cross-agency data access:** technical APIs do not imply permission, data-sharing agreements, or common identifiers.
6. **Live hazard feeds:** official portals may publish alerts without offering an integration API suitable for the prototype.
7. **Reliable routing:** road closures, flood depth, bridge condition, and vehicle constraints are dynamic and may not be available.

**Critical conclusion:** For a hackathon, the team should be honest that operational inventory, volunteer, and agency feeds are synthetic unless a documented source and permission are secured.

---

# 9. Existing Solutions

The following are included because they address the underlying workflow—not simply because they display maps.

| Solution | What it does | Target user | Strength | Limitation relative to this PS | Relation to this PS |
|---|---|---|---|---|---|
| **NDMA SACHET (India)** | CAP-based, geo-targeted, multilingual official warning dissemination through multiple channels, including RSS | Public and official warning ecosystem | Authoritative alert dissemination and broad reach | Its public description is about alerts, not a community report → reserve → assign → deliver workflow | Shows that “send alerts on a map” is not a novel core; potential official context feed if access/terms permit |
| **ISRO/NRSC NDEM and Bhuvan Disaster Management Support** | National GIS repository/decision-support and satellite-based disaster monitoring/assessment | Government disaster managers and analysts | Authoritative geospatial/hazard context and national-scale GIS capability | Does not, from public descriptions, replace local incident verification, depot reservation, volunteer acceptance, or delivery confirmation | Relevant layer/integration benchmark; avoid claiming replacement or open API without verification |
| **Ushahidi** | Collects, manages, analyses, and maps crowdsourced information | Communities, NGOs, governments, civil-society organizations | Strong citizen-generated reporting and crisis mapping | Crowdsourced visibility alone does not guarantee authoritative resource allocation or chain of custody | Direct competitor for incident intake/mapping; a new solution needs a stronger operational workflow |
| **Sahana Eden** | Configurable humanitarian platform with organization, volunteer, inventory, asset, assessment, shelter, messaging, request, and mapping modules | Emergency-management and humanitarian organizations | Broad end-to-end humanitarian feature coverage; open-source history | Broad scope and configuration complexity; the public page is now a legacy archive | Demonstrates that a feature-complete “everything platform” is not new; narrow usability/workflow proof matters |
| **ArcGIS Mission** | Enterprise command-and-control combining GIS, field updates, team locations, tasks, chat, reports, and after-action review | Public-safety/tactical organizations using ArcGIS Enterprise | Mature integrated common operating picture and field coordination | Commercial enterprise ecosystem, licensing/deployment complexity, and may be disproportionate for small/community organizations | Strong benchmark for command workflow; a hackathon prototype cannot credibly compete on breadth |
| **ODK Collect / ODK Central** | Offline-capable Android forms with location/media and centralized submissions | Field data-collection teams | Proven offline structured collection; form logic and audit options | Data collection is not itself incident command, inventory reservation, or dispatch | Useful benchmark/component class for field intake; not a complete answer to the PS |
| **GDACS / Virtual OSOCC** | Global disaster alerts, estimates, maps, and restricted coordination for the first phase of major sudden-onset disasters | Governments and international responders | Multi-organization information exchange and coordination | Global/major-disaster orientation; not local depot/volunteer fulfilment workflow | Confirms the coordination problem class and demonstrates existing high-level coordination systems |

## 9.1 Previous hackathon solutions

**[UNKNOWN]** No specific competition, sponsor archive, or prior-year repository was provided. A reliable previous-hackathon comparison cannot be made without the event name and problem-statement history. Random GitHub demos are not treated as competitors.

## 9.2 Open-source repository relevance

- Sahana Eden links its codebase publicly from its official archive.
- Ushahidi and ODK have publicly documented platforms/ecosystems.
- Their existence makes it risky to claim novelty based on “open source,” “crowdsourced reporting,” “offline forms,” or “map dashboard” alone.

---

# 10. Competitor Gap Analysis

## 10.1 Why the problem can still exist even when tools exist

| Gap | Status | Analysis |
|---|---|---|
| Fragmentation across tools | **[RESEARCH-CONFIRMED as a general response problem]** | GDACS explicitly describes early-response information collected through multiple channels with poor exchange, duplication, and gaps. Availability of software does not guarantee shared use. |
| Deployment/adoption mismatch | **[HYPOTHESIS]** | Enterprise tools may be too costly or complex; broad humanitarian platforms may require customization and training. Target organization evidence is absent. |
| Local workflow mismatch | **[HYPOTHESIS]** | Existing tools may not match a particular authority’s approval, inventory, or volunteer process. This must be shown through interviews, not assumed. |
| Weak last-mile status semantics | **[HYPOTHESIS]** | A local workflow may still collapse reserved/dispatched/delivered states. Validate with actual records or users. |
| Cross-agency interoperability | **[HYPOTHESIS with standards evidence]** | CAP/OGC standards exist, yet adoption and identifiers may differ. A standard can reduce technical friction but not settle governance. |
| Offline/local-language needs | **[HYPOTHESIS]** | ODK proves offline collection is achievable, but the target users’ devices, languages, and connectivity are unknown. |
| Trust and verification | **[INFERENCE]** | Crowdsourcing makes intake easier but increases the need for verification, provenance, and confidence display. |
| Data availability | **[PS GAP / UNKNOWN]** | No live stock, responder, facility, or task source is identified. This may be the dominant deployment blocker. |

## 10.2 The meaningful unresolved gap

The best-supported gap is not “there is no disaster map.” Official alert portals, GIS systems, crowdsourcing tools, offline form systems, and command platforms already exist. The unresolved opportunity is a **small, deployable coordination layer that gives one local response team an auditable report-to-outcome workflow without pretending to replace official warning or national GIS systems.** This remains a recommendation until a target operator confirms the workflow.

---

# 11. Why This Problem Is Hard

| Hidden difficulty | Why it matters | Prototype risk | Real-world risk |
|---|---|---|---|
| Defining authority | Different actors can report, verify, prioritize, allocate, and close | Demo may let every role do everything | Unauthorized dispatch, unsafe action, liability |
| Verification under urgency | Waiting for perfect information delays action; accepting everything invites abuse | “Approve” button hides real verification | False/duplicate reports consume scarce capacity |
| Resource semantics | People, vehicles, beds, kits, and medicines behave differently | One generic quantity model appears to work | Invalid allocations, unit mistakes, expired/unserviceable stock |
| Concurrency | Multiple coordinators may act at once | Single-user demo never exposes race | Double reservations and conflicting assignment |
| Freshness | Location and stock become obsolete quickly | Seed data looks current | Stale map creates confident but wrong decisions |
| Offline conflict resolution | Field updates may be delayed and out of order | Local cache demo may not reconcile | Later sync overwrites newer decisions or duplicates movement |
| Geospatial accuracy | GPS, address geocoding, landmarks, and polygons have uncertainty | Perfect pins hide error | Responders travel to wrong site; exact locations expose vulnerable people |
| Routing assumptions | Fastest road may be flooded, blocked, or vehicle-incompatible | Consumer routing appears convincing | Unsafe or impossible dispatch |
| Interoperability | Agencies use different taxonomies and systems | Hard-coded import works on sample | Integration breaks; governance and permission remain unsolved |
| Notification reliability | Push/SMS/chat can fail or be delayed | UI toast substitutes for delivery | Task assumed received when it was not |
| Identity and volunteer safety | Skill, training, background, and availability matter | Synthetic users bypass onboarding | Unqualified volunteers enter hazardous situations |
| Security under public attention | Crisis portals attract misinformation, scraping, and denial-of-service | No adversarial testing | Operational disruption and exposure of sensitive locations |
| Human factors | Users work under stress, noise, gloves, poor light, and time pressure | Polished desktop flow performs well | High error rate and abandonment in field |
| Multi-language communication | Translation changes meaning of severity and needs | Machine-translated labels look complete | Misclassification and inequitable service |
| Adoption and command fit | A technically good app fails if it contradicts SOPs | Judges accept fictional process | Parallel unofficial workflow creates more fragmentation |

### Technically easy but operationally difficult

- Showing markers on a map.
- Creating a status dropdown.
- Sending an in-app notification.
- Displaying an inventory number.
- Creating role names.

Each is easy to code but difficult to make authoritative, current, safe, and adopted.

### Technically difficult

- Correct concurrent reservation and cancellation.
- Offline-first synchronization with ordered event history.
- Reliable notifications across degraded networks.
- Scalable spatial queries and dense-marker handling.
- Secure cross-agency identity and permissions.
- Real-time integration with proprietary or undocumented systems.

---

# 12. AI / ML Necessity Check

The PS does **not** mention AI/ML. A strong solution does not need AI to satisfy the core requirements.

| Potential AI use | Exact function | Could deterministic logic solve it? | Data required / realistic availability | Error consequence / human review | Classification |
|---|---|---|---|---|---|
| Incident categorization from free text | Suggest incident type | Yes, controlled form or keyword rules for MVP | Labeled multilingual crisis reports; not supplied | Misrouting; coordinator should confirm | **AI optional / risky without data** |
| Severity prediction | Predict urgency/priority | Rule-based triage is safer for MVP | High-quality outcome-labeled cases and contextual data; unlikely available | Severe: low score can delay life-safety response | **AI risky without sufficient data** |
| Duplicate report detection | Rank possibly matching reports by text/time/distance | Yes, geospatial radius + time window + fields can provide strong baseline | Report pairs labeled duplicate/not duplicate | False merge hides separate incident; human review required | **AI optional; deterministic first** |
| Translation | Translate report/status | Human or controlled multilingual forms can avoid some translation | Language pairs/domain vocabulary; service dependency | Changed meaning; show original and allow correction | **AI genuinely useful but human-verifiable** |
| Image damage assessment | Estimate type/severity from photo | Not reliably with simple rules | Large labeled local hazard imagery; not supplied | False confidence and privacy risk | **AI risky / out of MVP** |
| Resource recommendation | Rank suitable depot/team | Deterministic constraints and distance work | Current stock, road access, skill, capacity, priorities | Bad recommendation wastes time; human approval required | **AI unnecessary for MVP** |
| Route prediction | Suggest travel route | Use established routing, not custom ML | Live road/closure data not supplied | Unsafe route | **AI unnecessary; external data problem** |
| Demand forecasting | Forecast future supplies | Not for core response proof | Historical incidents and consumption data; not supplied | Overstock/shortage | **AI risky without data / later** |
| Summarization | Summarize long incident thread | Manual structured timeline can solve prototype | Thread history | Omitted critical detail; source-linked review needed | **AI optional** |

## AI conclusion

The prototype should prove deterministic workflow integrity first. If any AI is included, the most defensible use is **assistive, reversible, and confidence-labelled**—for example, suggesting possible duplicates while a coordinator decides. Do not make autonomous severity, dispatch, or closure decisions.

---

# 13. Technical Feasibility

This is a component assessment, not a final architecture.

| Component implied by PS | Difficulty | Data dependency | External dependency | Prototype feasibility | Production challenge |
|---|---|---|---|---|---|
| Incident form with map location | Low–medium | User input, base map | Map/geocoding provider | High | Accessibility, abuse, location accuracy, offline capture |
| Incident verification queue | Medium | Reports and user roles | Possibly communication channels | High | SOP alignment, evidence, staffing, surge handling |
| Interactive incident/resource map | Medium | Coordinates and current state | Map tiles/base data | High | Licensing, tile capacity, clustering, access control, stale data |
| Resource ledger | Medium | Resource master and transactions | Existing inventory system if any | High with synthetic/small data | Item semantics, reconciliation, provenance, integrations |
| Atomic reservation | Medium–high | Current balance/state | Database transaction support | High | Concurrency across systems, expiry/cancellation, partial allocation |
| Task assignment/acceptance | Medium | Users, roles, availability | Notification service optional | High | Reliable delivery, escalation, identity, safety |
| Status/chain-of-custody timeline | Medium | Actor/time/state events | None for prototype | High | Offline ordering, edits/corrections, evidentiary policy |
| Live communication/chat | Medium–high | Identity and task context | Realtime service/push | Feasible but scope-heavy | Moderation, retention, encryption, reliability |
| Offline mode | High | Cached forms/tasks/map | Device storage/service worker or native app | Partial offline queue feasible | Conflict resolution, offline maps, security, testing |
| Official alert integration | Medium | CAP/RSS/feed | Agency access and terms | Can consume public RSS/sample CAP | Availability, authorization, schema changes, SLA |
| Hazard/satellite layer | Medium | GIS service/raster | NRSC/other provider access/terms | Static sample or public layer | Licensing, timeliness, bandwidth, interpretation |
| Notification by SMS | Medium | Phone numbers and templates | Paid telecom gateway | Simulatable | Cost, sender registration, delivery receipts, outage |
| Identity and role management | Medium | User directory | Optional identity provider | High for small prototype | Federation, account recovery, least privilege, volunteer churn |
| Analytics/after-action review | Low–medium | Complete audit/event data | None | High for basic metrics | Interpretation, retention, cross-event consistency |

## 13.1 External dependencies and likely simulation

| Dependency | Why it may be unavailable | Honest hackathon treatment |
|---|---|---|
| Agency inventory API | No agency/system is named | Use labeled synthetic depot inventory; prove reservation logic against it |
| Volunteer registry | Sensitive and organization-specific | Use synthetic trained volunteers and explicit eligibility flags |
| Live vehicle GPS | Hardware/permissions absent | Simulate status updates; do not animate fake “live tracking” without disclosure |
| Official alert feed/API | Public portal does not guarantee integration contract | Use recorded CAP/RSS sample or optional feed with fallback |
| Real SMS/push | Cost, credentials, regulation, network | Demonstrate in-app delivery/receipt and show adapter boundary conceptually |
| Dynamic road closure/routing | Reliable local feed not identified | Use normal route only as visual aid; show a manually marked blocked segment if needed |
| Real emergency records | Privacy and permission | Use synthetic scenarios, visibly labelled |

---

# 14. Edge Cases and Failure Modes

| Edge case | Consequence | Detection | Possible handling |
|---|---|---|---|
| Missing location | Cannot route or deduplicate safely | Required-field/quality check | Save as draft; ask for landmark/contact; do not present precise pin |
| GPS accuracy is poor | Wrong incident point | Capture accuracy radius; compare manual pin/address | Show uncertainty circle; require confirmation before dispatch |
| Wrong severity selected | Misprioritization | Verification review; rule conflicts; follow-up | Keep reporter urgency separate from verified priority |
| Same incident reported many times | Duplicate tasks and inflated demand | Time-distance-category matching; coordinator review | Link reports to one canonical incident; retain all source records |
| Two distinct incidents are close together | False merge | Compare narratives, timestamps, affected entities | Suggest, never auto-merge high-impact cases; reversible merge |
| Malicious report | Wasted resources or targeted harm | Rate limits, identity signals, anomaly flags, verification | Quarantine/unverified state; retain audit; block abusive accounts |
| Two coordinators reserve last stock simultaneously | Double promise | Transaction conflict/constraint | Atomic reservation; one succeeds, other gets current shortage |
| Reservation is never used | Artificial shortage | Expiry and assignment status | Time-bound hold; authorized release with reason |
| Partial dispatch/delivery | Incorrect closure and count | Quantity-level status | Support partial fulfilment and remaining balance |
| Wrong item/unit | Harm or unusable supplies | Unit/category validation | Controlled units; custodian confirmation; substitution rules later |
| Volunteer declines or times out | Task unowned | Acceptance deadline | Return to queue/escalate; preserve declined history |
| Volunteer loses network | Stale status | Last-seen/sync timestamp | Offline queue; show “pending sync”; alternate contact procedure |
| Out-of-order offline updates | Timeline corruption | Client event time + server receipt time + sequence/version | Conflict review; do not silently overwrite newer state |
| Map provider fails | Situational view unavailable | Health check/load error | List/table fallback; cached minimal map if supported |
| Notification provider fails | Assignment assumed received | Delivery/acknowledgement status | Never equate sent with accepted; retry/escalate channel |
| Stale resource count | Failed dispatch | Age threshold/last verified by | Mark stale; require custodian reconfirmation before critical allocation |
| Reporter reveals sensitive person/location | Privacy/safety risk | Field classification/redaction review | Separate public and restricted views; minimize collection |
| Admin edits/deletes record incorrectly | Lost accountability | Audit/event log, soft-delete | Reversible correction with reason; restrict destructive actions |
| Agency leaves incident | Orphaned tasks/resources | Ownership checks | Explicit handover; block closure until responsibility transferred |
| Incident crosses jurisdiction | Conflicting authority | Boundary lookup and escalation rule | Flag for supervisor; do not auto-reassign without policy |
| Shelter/hospital at capacity | Users routed to unavailable site | Capacity freshness and facility update | Mark stale/full; require confirmation; avoid public guarantee |
| Mass surge | Queue overload and degraded UI | Rate/queue/latency metrics | Triage queue, backpressure, bulk review, read-only public view |
| Clock/timezone mismatch | Incorrect ordering/SLA | Server timestamps and UTC storage | Store canonical time plus source/device time; display locale explicitly |

---

# 15. Security, Privacy, and Ethics

## 15.1 Relevant data and threats

| Concern | Why relevant | Minimum position before production |
|---|---|---|
| Identity/contact information | Needed for follow-up and accountability but exposes affected people/volunteers | Collect minimum necessary; define purpose, access, retention, correction, and deletion rules |
| Precise location | Can reveal homes, shelters, vulnerable groups, responder routes, and asset locations | Role-based precision; public aggregation/redaction; avoid broadcasting sensitive live locations |
| Health/vulnerability notes | May be needed for rescue/aid and are highly sensitive | Strict need-to-know access; avoid free-text overcollection; legal review |
| Authentication | Public intake and operational actions have different trust needs | Separate reporter intake from authenticated operational roles; strong admin authentication |
| Authorization/role separation | Allocation and closure are high-impact | Least privilege; agency/incident scope; deny by default |
| Audit logs | Needed for accountability and incident review | Actor, action, object, timestamp, before/after or event; tamper resistance and protected access |
| Data retention | Crisis data should not persist indefinitely by accident | Document retention by data class and legal/operational purpose |
| Encryption | Sensitive data moves over public networks and sits in databases/devices | TLS in transit; appropriate at-rest/device protection; secret management |
| Abuse and misinformation | Open reporting can be spammed or weaponized | Rate limiting, moderation, verification, abuse reporting, provenance |
| Account compromise | A coordinator account could redirect resources | MFA for privileged roles; session control; rapid revocation; alert on abnormal actions |
| Public transparency versus operational secrecy | Public map helps awareness but can expose tactics/stock | Separate public, partner, and command views with deliberate fields |
| AI bias/automation | Any triage model can disadvantage languages/communities | Avoid autonomous high-impact decisions; test across groups; retain human authority |
| Volunteer safeguarding | Tasks may expose volunteers or affected people to risk | Eligibility, training, assignment bounds, emergency contact/escalation, minimal PII |

The ICRC’s humanitarian data-protection guidance emphasizes that protecting personal data is part of protecting life, integrity, and dignity, and notes specific risks around social media, connectivity, digital identity, and AI ([ICRC handbook](https://www.icrc.org/en/data-protection-humanitarian-action-handbook)).

## 15.2 Ethical product rules

1. Do not label a community report as an official alert.
2. Do not equate algorithmic score with authority.
3. Do not expose precise affected-person or responder location by default.
4. Do not show “available” without source and freshness.
5. Do not close a task merely because it was dispatched.
6. Do not hide simulated data in the demo.
7. Do not use real disaster victims’ personal data without lawful authority and strong need.

---

# 16. Success Metrics

## 16.1 Prototype metrics

These can be demonstrated with controlled synthetic scenarios.

| Metric | What it proves | Suggested demonstration method |
|---|---|---|
| End-to-end completion | Workflow is real, not disconnected screens | One report progresses through review, reservation, accepted assignment, dispatch, delivery, and verified closure |
| Reservation conflict prevention | Core allocation integrity | Two simultaneous attempts against insufficient stock; exactly one valid commitment |
| State reconciliation | Status semantics are enforced | Inventory totals reconcile across available + reserved + in-transit + delivered/consumed according to defined rules |
| Assignment acknowledgement | Ownership is explicit | Sent task remains unowned until responder accepts; timeout returns/escalates it |
| Duplicate handling | Intake does not multiply work | Two similar reports link to one incident without deleting source evidence |
| Audit completeness | Decisions are reconstructable | Every critical transition shows actor and timestamp |
| Freshness visibility | Map does not misrepresent old data | Old stock/location visibly marked stale and blocked/warned for allocation |
| Degraded-mode continuity | Map/network failure does not erase workflow | List fallback and/or queued field update demonstrated |
| Role enforcement | Users cannot perform unauthorized actions | Reporter cannot allocate stock; volunteer cannot edit depot balance; coordinator cannot erase audit history |
| Partial fulfilment correctness | Real delivery exceptions are modeled | 20 dispatched, 12 delivered, 8 remain in transit/pending—not “complete” |

Avoid vanity metrics such as number of pins, number of dashboard cards, “AI accuracy” on a tiny synthetic set, or page-load animations.

## 16.2 Real-world metrics

These require deployment, baseline data, and agreed definitions.

| Metric | Why it matters | Measurement caveat |
|---|---|---|
| Report-to-acknowledgement time | User trust and intake capacity | Separate automated receipt from human review |
| Report-to-verification time | Operational triage speed | Stratify by incident type/severity |
| Verification-to-assignment time | Coordination efficiency | Exclude tasks waiting on external authority |
| Assignment acceptance rate/time | Reliability of responder mobilization | Account for shifts/availability |
| Failed dispatch rate | Resource-data quality | Define failure reasons consistently |
| Double-allocation incidents | Core ledger integrity | Needs audit and near-miss reporting |
| Resource reconciliation error | Inventory trustworthiness | Compare system ledger with physical count |
| On-time completion/delivery | Service outcome | Requires target time appropriate to task |
| Human correction/merge rate | Data quality and automation burden | High rate may show bad intake or healthy verification; interpret carefully |
| Stale-record proportion | Common-picture reliability | Set freshness threshold per data type |
| Duplicate task/resource commitment rate | Coordination effectiveness | Needs canonical incident/task definitions |
| User adoption/completeness | Whether parallel channels persist | Track both system use and off-system work |
| Safety/security incidents | Harm avoidance | Must include privacy, volunteer safety, and unauthorized access |

---

# 17. Solution Opportunity Areas

These are directions, not a PRD.

| Opportunity | Root cause addressed | User benefited | Potential value | Complexity |
|---|---|---|---|---|
| Shared incident ledger | Fragmented intake and no canonical identity | Operator, coordinator, supervisor | One traceable record with linked source reports | Medium |
| Verification and provenance gate | Uncertain information mixed with fact | Coordinator, public, agency lead | Safer decisions and clearer trust | Medium |
| Reservation-based resource ledger | Stale/double-promised stock | Coordinator, custodian, recipient | Prevents double commitment and exposes shortage | Medium–high |
| Explicit task acceptance | Informal responsibility transfer | Dispatcher, responder | Eliminates “sent means owned” ambiguity | Medium |
| Chain-of-custody status | Dispatched conflated with delivered | Coordinator, recipient, management | Honest outcome tracking and reconciliation | Medium |
| Freshness-aware GIS | Map hides uncertainty and age | All operational users | Common picture with source/time/confidence | Medium |
| Offline/degraded workflow | Connectivity failure | Field responder, operator | Continuity without pretending data is live | High |
| Interoperable import/export | Data silos | Agencies, analysts | Lower switching/integration friction | Medium–high |
| Audit and after-action timeline | Missing accountability/history | Supervisor, auditor, planner | Reconstruct decisions and improve future response | Medium |
| Public/restricted view separation | Transparency versus privacy conflict | Community and agencies | Useful public awareness without exposing sensitive operations | Medium |
| Assistive duplicate ranking | Repeated reports | Operator/coordinator | Less manual comparison while retaining human control | Low–medium |

### Highest-value opportunity

The strongest opportunity is the combined **incident → reservation → assignment acceptance → handoff/outcome** chain. It directly attacks fragmentation and inefficient allocation while remaining demonstrable with synthetic data.

---

# 18. Differentiation Opportunities

## 18.1 Core differentiation

| Differentiator | Why it is meaningful | Proof required |
|---|---|---|
| **Reservation before assignment** | Converts “inventory display” into allocation integrity and prevents double promising | Concurrent allocation test and reconciled ledger |
| **Sent ≠ accepted ≠ dispatched ≠ delivered** | Removes the most dangerous status ambiguity | Enforced transitions, timestamps, partial completion |
| **Provenance/freshness on every operational item** | Makes the map trustworthy rather than merely attractive | Source, last-updated, verifier, stale-state behavior |
| **Canonical incident with linked source reports** | Reduces duplication without erasing evidence | Reversible merge/link and preserved reports |
| **Human verification gate** | Keeps community participation without granting unverified reports official authority | Visible unverified/verified states and role permissions |
| **Graceful degraded mode** | Acknowledges that the network may fail during the event | Offline queue or at minimum list fallback/pending-sync state |
| **Audit-first workflow** | Supports accountability and after-action learning | Actor/timestamp/reason history for high-impact changes |

## 18.2 Demo differentiation

- Show a race condition: two coordinators attempt to reserve the last kits; only one succeeds.
- Take the map temporarily unavailable and continue from a list/queue.
- Show an unverified duplicate report being linked to an existing incident while retaining its source.
- Demonstrate a partial delivery where remaining items do not vanish from the ledger.
- Switch roles to show that a reporter cannot allocate and a volunteer cannot declare depot stock.
- Show the same incident’s operational timeline rather than navigating many unrelated screens.

## 18.3 Gimmicks or weak differentiation

| Idea | Why it is weak or dangerous |
|---|---|
| Generic chatbot | Does not repair authority, inventory, or handoff integrity. |
| AI severity score with no real training/evaluation data | Creates false confidence in a safety-critical decision. |
| Heat map from a few synthetic points | Visually impressive but operationally meaningless. |
| Drone/live satellite claims without integration | Depends on external hardware/data and distracts from the workflow. |
| Blockchain for an internal ledger | Adds complexity without solving data truth at entry; ICRC also notes practical and data-protection challenges. |
| Animated vehicle tracking using simulated coordinates | Risks presenting fiction as working infrastructure. |
| “Real-time” label without freshness/latency definition | Marketing claim, not a verified capability. |
| Many incident types/resources/roles | Expands breadth while weakening proof of the core chain. |

---

# 19. MVP Boundary Recommendation

## 19.1 Core hypothesis to prove

**When one incident and one resource pool are coordinated through an explicit, shared state machine, a coordinator can avoid duplicate commitment and know whether assistance was merely promised, actually accepted, dispatched, and confirmed.**

## 19.2 Must demonstrate

1. A community reporter submits a geolocated incident and receives a reference.
2. A coordinator sees it as unverified, reviews evidence, and verifies or rejects it.
3. A possible duplicate is surfaced and linked/merged by a human.
4. The coordinator views one resource pool with source and freshness.
5. A quantity is reserved transactionally, reducing available stock.
6. A task is assigned to one eligible responder and remains pending until accepted.
7. The responder accepts, dispatches, and records a full or partial delivery/action.
8. The coordinator verifies the outcome and closes the task/incident as appropriate.
9. The ledger and timeline reconcile; each critical action has actor and time.
10. The map and list both reflect the same governed records.

## 19.3 Recommended narrow frame

- **One operational area:** a small district/ward/campus-sized synthetic map.
- **One incident family:** localized flood/relief request or another sponsor-approved scenario.
- **One resource family:** standard relief kits (countable units).
- **Three visible roles:** Reporter, Coordinator, Responder/Volunteer.
- **One accountable custodian function:** represented by the coordinator or a seeded depot for the MVP; separate later if required.

This is a boundary recommendation, not a decision. The incident type and operating scale are still open questions.

## 19.4 Can simulate

- Official alerts and hazard feeds.
- Agency/warehouse system integration.
- Volunteer identity/training registry.
- SMS/push provider.
- Vehicle GPS and dynamic route data.
- Satellite/hazard overlay.
- Real public or victim data.

Every simulation must be labelled in the UI and presentation.

## 19.5 Should not build yet

- Autonomous AI triage or dispatch.
- Custom computer vision damage assessment.
- Multi-agency federation/SSO.
- General-purpose chat replacing operational comments.
- Donation/payment management.
- Fleet telemetry.
- Predictive demand forecasting.
- Nationwide scalability claims.
- Many resource types with incompatible semantics.
- Complex routing optimization.
- Public social feed.
- Full offline map packs and conflict-free synchronization unless the event specifically scores offline capability.

---

# 20. Demo Story

**Scenario status:** Entirely synthetic. Names, locations, people, inventory, and numbers are demonstration data.

### Before

A community volunteer would normally send a message saying that families in “Riverside Ward near the old bridge” need relief kits. A coordinator would copy it into a sheet, call a depot, and post an assignment in a group chat. Another coordinator might promise the same stock, and “dispatched” could be mistaken for “delivered.”

### Trigger

A reporter submits: “Floodwater entered 12 homes near Old Bridge, Riverside Ward; families moved to the school shelter.” The reporter places a map pin and provides a contact number. The system records the report as **Unverified**, with time, source, and location accuracy.

### User action

The coordinator opens the report. A second similar report appears as a possible duplicate based on category, proximity, and time. The coordinator links it to the same incident instead of creating a second response.

### System action

The verified incident shows Depot A with 20 fresh relief kits available. The coordinator reserves 20. At the same moment, a second attempted reservation for 10 kits fails because the available balance is now zero. The system retains both events.

### Human decision

The coordinator assigns the delivery to a responder. The task is **Pending acceptance**, not active. The responder reviews the location and scope, accepts it, and the state becomes **Assigned**. At dispatch it becomes **In transit**.

### Outcome

At the shelter, 12 kits are handed over and confirmed; road access prevents the remaining 8 from reaching a second location. The responder records a partial delivery. The system shows **12 delivered, 8 still in transit/exception**, not “20 delivered.” The coordinator reviews the evidence, creates a follow-up for the remaining quantity, and the audit timeline shows exactly who made each decision.

### What this story proves

- Reporting is connected to action.
- Duplicate reports do not automatically duplicate work.
- Reservation prevents double promise.
- Task ownership requires acceptance.
- Dispatch is not delivery.
- Partial outcomes and exceptions remain visible.
- The map is a view of accountable workflow state.

---

# 21. Judge Perspective

| Hard judge question | What the judge is really testing | Evidence the team should provide / current status |
|---|---|---|
| 1. Why is this needed when Sahana, Ushahidi, ArcGIS Mission, NDEM, and SACHET exist? | Competitor awareness and real differentiation | Show that official alerts/GIS and existing platforms cover adjacent needs; prove the narrow reservation-to-outcome workflow. Target-organization gap is still unvalidated. |
| 2. Who is the actual first customer/operator? | Deployment realism and ownership | **Unknown.** Must identify a district authority, NGO, campus EOC, or other operator before claiming adoption. |
| 3. Who has authority to verify an incident and allocate resources? | Safety, governance, role design | **Unknown.** The prototype can model a coordinator, but real authority must come from SOPs. |
| 4. Where does your live inventory come from? | Data feasibility | No source is named. Use clearly synthetic inventory for the demo and state that production needs custodian updates or system integration. |
| 5. What exactly is “real time”? | Precision and honesty | Define measurable latency for connected operation and distinguish pending offline updates. No PS threshold exists. |
| 6. How do you stop fake or duplicate reports? | Trust model | Demonstrate verification state, rate limiting concept, provenance, and human-reviewed duplicate linking; do not claim perfect prevention. |
| 7. What happens if two coordinators reserve the same last item? | Backend integrity versus UI mock | Live concurrent reservation test with database-enforced result. |
| 8. What happens when the network fails? | Field realism | Demonstrate degraded behavior; at minimum show pending sync/list fallback and last-updated warnings. Full offline capability may be simulated or deferred honestly. |
| 9. Why do you need AI? | Whether the team is adding hype | Core MVP does not need AI. If duplicate suggestions are added, compare against deterministic rules and keep human confirmation. |
| 10. How do you protect victims’ and responders’ locations? | Privacy/security maturity | Show restricted/public field separation, least privilege, data minimization, and retention position. Exact legal review remains pending. |
| 11. Is “delivered” independently verified? | Outcome truth and chain of custody | Demonstrate confirmation policy and partial delivery. The real required evidence is organization-specific and unknown. |
| 12. What is actually implemented versus simulated? | Technical honesty | Maintain a demo disclosure table: real workflow/database/GIS versus synthetic data and simulated external services. |
| 13. How does this integrate with official alerts or agency systems? | Interoperability and deployment path | Cite CAP/OGC options; show import/export boundary if built. Do not claim an integration without access and permission. |
| 14. What prevents people from continuing to use WhatsApp and spreadsheets? | Adoption and change management | The system must reduce reconciliation work and provide receipts/audit/availability that chat cannot. User validation is still required. |
| 15. What happens after the hackathon? | Sustainability and validation plan | Identify pilot operator, run workflow shadow test, validate data ownership/SOPs, conduct security/privacy review, and measure baseline versus pilot. No operator is yet confirmed. |

---

# 22. Assumption Register

| ID | Assumption | Why we need it | Evidence | Confidence | How to validate |
|---|---|---|---|---|---|
| A01 | The intended setting includes a coordinator/dispatcher role | Someone must verify, prioritize, reserve, and assign | Implied by coordinated response; not named | Medium | Interview sponsor; obtain SOP/role chart |
| A02 | Community members may submit reports directly | Defines public intake and abuse/privacy needs | PS names communities and incident reporting | Medium | Clarify intended reporter population |
| A03 | A shared platform is permitted to store operational data | Required for central ledger | PS requests centralized platform | Medium | Confirm operator, hosting, data policy |
| A04 | Resource counts can be made available and updated | Required for resource tracking | PS assumes monitoring; no source | Low | Inventory-owner interview; inspect current ledger/API |
| A05 | Resources can be reserved before dispatch | Core prevention of double promise | Process inference | Medium | Map real approval/allocation SOP |
| A06 | “Reserved,” “in transit,” and “delivered” are meaningful separate states | Required for truthful tracking | Operational reasoning; Sahana/ArcGIS show mature tracking categories generally | High | Validate terminology with coordinator/custodian |
| A07 | Volunteers/responders can accept or decline tasks | Required for ownership handoff | Human coordination inference | Medium | Interview volunteer manager/responders |
| A08 | Report duplication is common enough to matter | Justifies duplicate workflow | General crisis-mapping risk; no target frequency | Medium | Sample real intake logs; manually label duplicates |
| A09 | Precise public locations would create privacy/safety risk | Determines map access | ICRC guidance supports humanitarian data risk | High | Threat model and policy review |
| A10 | Connectivity may be unreliable | Determines degraded/offline behavior | ICRC notes post-disaster telecom outages | High generally; event-specific unknown | Ask target users; test networks/devices |
| A11 | One narrow scenario can demonstrate the core value | Keeps hackathon scope feasible | Product inference | High | Rehearse end-to-end demo; judge feedback |
| A12 | Synthetic data is acceptable for judging if clearly labelled | Needed because operational data absent | No event rule supplied | Medium | Check hackathon rules/mentor confirmation |
| A13 | India is a relevant deployment reference | Determines regulatory/official-system examples | User context, not PS | Low for this PS | Ask problem owner for geography |
| A14 | Existing official GIS/alert systems are not intended to be replaced | Prevents false positioning | Their public capabilities are adjacent/authoritative | High | Confirm with sponsor; position as complementary layer |
| A15 | A web app is sufficient for the prototype | PS explicitly says web platform | PS-confirmed | High | Confirm mobile browser/device expectations |
| A16 | A map provider and base data can be legally used | Needed for GIS | OSM available under ODbL; other terms vary | High for basic prototype | Select provider; review attribution/rate limits |
| A17 | The coordinator can verify reports with available evidence | Required for human gate | Process inference | Low–medium | Define verification SOP and escalation |
| A18 | Delivery confirmation can be captured | Needed to prove outcome | Process inference | Medium | Define who confirms and acceptable evidence |
| A19 | One organization can operate the initial pilot | Avoids multi-agency governance in MVP | Scope recommendation | Low | Identify pilot owner and boundaries |
| A20 | No AI is required for eligibility or scoring | Prevents unnecessary risk | AI absent from PS | High | Check event rubric and sponsor expectations |

---

# 23. Open Questions

Questions marked **[SOLUTION-CHANGING]** can fundamentally alter scope or design.

## 23.1 Domain

- **[SOLUTION-CHANGING]** Which emergency types are in scope: natural hazards, fires, medical emergencies, public-order events, infrastructure failure, or all-hazard?
- Is the platform for preparedness, active response, relief distribution, recovery, or all phases?
- What current SOP or incident-command framework must the system follow?
- What constitutes a verified incident and who may verify it?
- What evidence is required to close an incident or task?

## 23.2 User

- **[SOLUTION-CHANGING]** Who is the first operational owner and daily primary user?
- Can the public report anonymously, by phone-assisted entry, or only through accounts?
- Are volunteers registered/trained by an organization or open community volunteers?
- What devices, languages, literacy levels, and accessibility needs apply?
- Can a volunteer decline a task, and what happens next?
- Does a depot custodian need a separate role from the coordinator?

## 23.3 Data

- **[SOLUTION-CHANGING]** Where does current resource availability come from, and who is accountable for refreshing it?
- What resource types/units/conditions/expiry rules matter first?
- Are real incident logs or anonymized samples available for workflow validation?
- What location precision is operationally needed and safe to display?
- Which facility, boundary, shelter, road, and hazard datasets are authorized?
- What makes a record stale for each data type?
- Is historical data available for analytics, or should analytics remain out of scope?

## 23.4 Technical

- **[SOLUTION-CHANGING]** Is offline capture/sync mandatory or only a desired capability?
- What does “real time” mean in seconds/minutes and under which connectivity assumptions?
- What maximum concurrent users/reports/active incidents should be supported?
- Is a mobile web app acceptable in the field, or is an Android/native client required?
- Are map tiles allowed to be cached/offline under the chosen provider’s terms?
- What notification delivery and acknowledgement channels are required?

## 23.5 Integration

- **[SOLUTION-CHANGING]** Must the prototype integrate with a named agency system, or is standalone acceptable?
- Is SACHET/CAP consumption relevant to the target geography and use case?
- Are NDEM/Bhuvan layers available for the intended use, and do terms permit integration/redistribution?
- Is there an inventory/warehouse API, or only spreadsheet/manual updates?
- What identifiers are shared across agencies, if any?

## 23.6 Deployment

- **[SOLUTION-CHANGING]** Is the operating scale campus, city, district, state, national, or multi-country?
- Who hosts and supports the system during an emergency?
- What uptime, disaster recovery, backup, and support expectations apply?
- Is cloud hosting allowed, and where may data be stored?
- Who trains users and maintains reference data outside emergencies?
- What is the fallback when the system itself is unavailable?

## 23.7 Policy / compliance

- **[SOLUTION-CHANGING]** Which country/jurisdiction and legal regime apply?
- Which data classes are personal, sensitive, operationally restricted, or public?
- What retention/deletion obligations apply to reports, chat, locations, and evidence?
- Are minors, medical cases, shelters, or protected/vulnerable groups in scope?
- What public information can legally and safely appear on a map?
- What audit, records-management, or evidence requirements apply?
- What liability and duty-of-care rules govern volunteer assignments?

---

# 24. Final Synthesis

| Strategic item | Conclusion |
|---|---|
| **Problem in one sentence** | Response actors lack one trusted workflow connecting uncertain reports to verified needs, reserved resources, accepted assignments, and confirmed outcomes. |
| **Root cause** | Incident, resource, communication, and task state are fragmented across tools and owners, with weak provenance, freshness, and handoff rules. |
| **Primary user** | The accountable coordinator/dispatcher, supported by reporter, resource custodian, and responder workflows. |
| **Most painful existing failure** | A resource or task appears available/covered when it is actually already committed, unaccepted, stale, or only dispatched—not delivered. |
| **Why existing solutions do not fully solve it** | Many capable tools already exist, but the target operator, workflow fit, integration, adoption, and local data ownership remain unresolved. The gap is deployment/workflow-specific, not absence of software. |
| **Most important data dependency** | Current, accountable resource availability and reservation state. |
| **Biggest technical risk** | Maintaining correct state under concurrency, connectivity loss, and delayed/out-of-order updates. |
| **Biggest non-technical risk** | No confirmed operational owner/SOP, causing the team to encode a fictional command workflow that users bypass. |
| **Strongest solution opportunity** | A narrow audit-first incident → reservation → assignment acceptance → dispatch → confirmed/partial outcome chain. |
| **Smallest valuable end-to-end workflow** | One geolocated report, human verification, one resource reservation, one accepted task, one delivery/exception, and a reconciled audit timeline. |
| **Most dangerous assumption** | That reliable live resource and volunteer data will be available and permitted for use. |
| **What must be validated before building** | Deployment geography, first operator, authority model, initial incident/resource type, current inventory workflow/data source, closure evidence, and offline requirement. |

---

# 25. Inputs for SWOT / Scope Lock / PRD

## Validated problem

- **[PS-CONFIRMED]** Crisis-response information is fragmented, contributing to delay and inefficient allocation.
- **[RESEARCH-CONFIRMED]** GDACS independently describes multi-channel early-response information, poor exchange, duplication, gaps, and overlap as a real disaster-coordination problem class.
- **[ANALYTICAL CONCLUSION]** The most valuable interpretation is not “build a map,” but “connect report, verification, resource commitment, assignment, and outcome.”

## Root causes to carry forward

1. No canonical operational record across incident, resource, task, and outcome.
2. No explicit verification/provenance/freshness model.
3. Resource availability is separated from reservation and dispatch.
4. Responsibility is communicated without explicit acceptance.
5. Status words are ambiguous, especially dispatched versus delivered.
6. Connectivity failure produces stale and conflicting state.

## Stakeholders to carry forward

- Primary: reporter, control-room operator/verifier, coordinator/dispatcher, responder/volunteer, resource custodian.
- Secondary: incident lead, recipient/community lead, analyst/auditor, IT/security administrator.
- Decision makers: operating authority/agency/NGO leadership, data/security owner, procurement/funding authority.

## Highest-priority pain points

1. Double allocation or false availability.
2. Unverified/duplicate reports driving work.
3. Sent assignment mistaken for accepted responsibility.
4. Dispatched mistaken for delivered; partial outcomes hidden.
5. Stale data presented as current.
6. No audit history for reconciliation or review.

## Current workflow summary

Observation → fragmented report → manual transcription → phone-based verification → separate stock check → informal reservation/assignment → manual field updates → ambiguous closure → manual reconciliation.

## Available data

- Prototype-generatable: synthetic incidents, depots, stock, roles, task events, audit events.
- Public/contextual: OSM base data subject to ODbL/usage policies; official alerts/feeds where documented; Bhuvan/NRSC layers subject to terms and availability.
- Unavailable/unknown: live agency inventory, volunteer registry, operational incidents, vehicle GPS, road closures, facility capacity.

## Constraints

- Unreliable connectivity and delayed sync.
- Privacy and safety of location/identity data.
- Different authority levels and role boundaries.
- Data freshness, provenance, and verification.
- Map/provider licences and service limits.
- External integration access and permission.
- Surge volume, malicious input, and concurrency.
- Stress, accessibility, and multilingual use.

## Existing solutions and competitor implications

- SACHET: official multi-channel CAP alerts; do not compete on generic warning dissemination.
- NDEM/Bhuvan: authoritative GIS/hazard context; position as complementary, not replacement.
- Ushahidi: crowdsourced reporting/mapping; mapping alone is not differentiating.
- Sahana Eden: broad humanitarian operations; feature breadth is not novel.
- ArcGIS Mission: mature enterprise command-and-control; do not claim superior breadth.
- ODK: offline field data collection; offline forms are available technology, not unique value.
- GDACS: high-level disaster information exchange; confirms fragmentation/coordination need.

## Technical risks

- Concurrent reservations and ledger correctness.
- Offline conflict resolution and out-of-order events.
- Reliable notification acknowledgement.
- Spatial accuracy and sensitive-location exposure.
- Cross-agency identity/integration.
- Stale data and external feed failure.

## Critical assumptions

- A coordinator role exists and can operate the workflow.
- Resource owners can provide/update availability.
- Reservation is compatible with the real SOP.
- Responders can accept/decline assignments.
- Synthetic data is permitted for the prototype.
- One narrow scenario is sufficient to prove value.

## Recommended MVP boundary

One area, one incident family, one countable resource, three visible roles, and one end-to-end report-to-confirmed-outcome story. External agency data, alerts, GPS, and notifications may be simulated with disclosure.

## Differentiation opportunities

- Transactional reservation.
- Explicit assignment acceptance.
- Provenance and freshness.
- Canonical incident with preserved source reports.
- Partial delivery and exception handling.
- Public/restricted view separation.
- Auditable timeline and degraded-mode honesty.

## Unresolved questions that block scope lock

1. Geography and legal jurisdiction.
2. First operating organization and user.
3. Incident type and operational phase.
4. Authority/verification/closure policy.
5. Resource source, owner, unit, and update process.
6. Offline requirement and real-time threshold.
7. External integration requirement.
8. Public versus restricted map fields.

---

# Research Sources

Primary and official sources used in this analysis:

1. [UNDRR — Definition: Disaster](https://www.undrr.org/terminology/disaster)
2. [UNDRR — Definition: Disaster Risk](https://www.undrr.org/terminology/disaster-risk)
3. [UNDRR — Definition: Early Warning System](https://www.undrr.org/terminology/early-warning-system)
4. [NDMA SACHET — National Disaster Alert Portal](https://sachet.ndma.gov.in/)
5. [ISRO/NRSC — Disaster Management Support](https://www.nrsc.gov.in/nrscnew/)
6. [ISRO/NRSC — National Database for Emergency Management](https://ndem.nrsc.gov.in/)
7. [Bhuvan — Indian Geo-Platform of ISRO](https://bhuvan.nrsc.gov.in/home/index.php)
8. [GDACS — Global Disaster Awareness and Coordination System overview](https://www.gdacs.org/About/overview.aspx)
9. [OASIS — Common Alerting Protocol 1.2](https://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html)
10. [OGC — OGC API Features standard](https://www.ogc.org/standards/ogcapi-features/)
11. [ICRC — Handbook on Data Protection in Humanitarian Action](https://www.icrc.org/en/data-protection-humanitarian-action-handbook)
12. [OpenStreetMap — Copyright and licence](https://www.openstreetmap.org/copyright)
13. [Ushahidi — Platform overview](https://www.ushahidi.com/)
14. [Sahana Foundation — Eden legacy archive and features](https://sahanafoundation.org/products/eden/)
15. [Esri — ArcGIS Mission overview](https://www.esri.com/en-us/arcgis/products/arcgis-mission/overview)
16. [ODK — ODK Collect documentation](https://docs.getodk.org/collect-intro/)
17. [MeitY — Data Protection Framework](https://www.meity.gov.in/data-protection-framework)
18. [India Code — official legislation repository](https://www.indiacode.nic.in/)

---

## Research limitations

- The PS does not identify a sponsor, jurisdiction, operating organization, disaster type, or scale.
- No target-user interviews, SOPs, real incident logs, inventory schema, integration documentation, or hackathon rules were supplied.
- India examples are contextual, not proof of intended deployment.
- Public product pages establish advertised capabilities, not field effectiveness in the target context.
- The analysis deliberately avoids fabricated statistics, APIs, datasets, and prior-hackathon comparisons.
- Legal/privacy/security observations are issue identification, not legal advice.

