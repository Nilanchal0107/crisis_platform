# Verified Response Ledger — 8-Minute Presentation Script

**Target runtime:** 8:00 · **Pace:** ~140 wpm · **Format:** Talking head/voiceover + screen recording of the live app
**Screens used:** Landing/Login → SCR-001 Reporter → SCR-002 Coordinator → SCR-003 Responder → back to SCR-002 (audit + map)

Each block shows **[TIME]**, **VOICEOVER** (read this), and *[ON SCREEN]* (what to show/click while you talk). Practice the demo path once before recording — the reservation race condition and the partial-delivery reconciliation are the two moments that must land cleanly.

---

## 1. Hook + the problem (0:00 – 0:45)

**[0:00]**
*[ON SCREEN: Title card — "Verified Response Ledger" — or the Landing screen.]*

**VOICEOVER:**
"When a disaster hits, the map isn't the hard part. Every crisis app shows pins on a map. The hard part is what happens *behind* the pin: did anyone actually verify this report? Is that '20 kits available' number real, or was it already promised to someone else an hour ago? Did the volunteer who got the message actually agree to go? And when they come back, did they really deliver everything — or is 8 kits quietly missing and nobody noticed?

Today I'm walking you through the Verified Response Ledger — a full-stack crisis coordination platform we built to answer exactly those questions, not just draw the map."

---

## 2. The real problem (0:45 – 1:45)

**[0:45]**
*[ON SCREEN: Stay on landing screen or a simple slide with the 4 organizer requirements if you have one; otherwise keep talking over the app.]*

**VOICEOVER:**
"The brief asked for a centralized platform connecting communities, volunteers, and agencies — real-time incident reporting, resource tracking, task coordination, and an interactive map.

But if you look at how crisis response actually fails, it's rarely because nobody had a map. It's because a report arrives by phone, stock is tracked in a separate spreadsheet, and a task gets sent over WhatsApp with no way to know if it was ever accepted. 'Sent' gets treated as 'done.' 'Dispatched' gets treated as 'delivered.' And two coordinators can promise the same last box of supplies to two different people at the same time.

So instead of building another dashboard, we built a system where every one of those hand-offs is an enforced, auditable state — not a status label someone forgot to update."

---

## 3. The solution, in one line (1:45 – 2:30)

**[1:45]**
*[ON SCREEN: Login screen — show the three role options: Reporter, Coordinator, Responder.]*

**VOICEOVER:**
"We call it the Verified Response Ledger. One line: it turns an unverified report into a resourced, explicitly-owned, and reconciled response — by making five things impossible to fake.

Reported is not the same as verified. Displayed-available is not the same as uncommitted. Sent is not the same as accepted. Dispatched is not the same as delivered. And partial is never silently treated as complete.

There are three roles — Community Reporter, Agency Coordinator, and Volunteer Responder — and I'm going to walk through the exact same incident as all three, live, so you can see the full loop."

---

## 4. Demo — Reporter submits an incident (2:30 – 3:15)

**[2:30]**
*[ON SCREEN: Log in as Reporter → open the intake form.]*

**VOICEOVER:**
"I'm a resident reporting a flood-relief need. I drop a pin on the map, choose incident type and severity, add a short description, and submit."

*[ON SCREEN: Fill the form, click submit, show the ReceiptCard.]*

**VOICEOVER:**
"Notice what I get back: a reference number and a status of 'Under Review' — not 'confirmed,' not a green checkmark. My report hasn't been trusted yet. It's just entered an accountable process. That distinction matters, because a citizen report is not the same thing as a verified incident — and the system never pretends otherwise."

---

## 5. Demo — Coordinator verifies and reserves (3:15 – 4:45)

**[3:15]**
*[ON SCREEN: Log in as Coordinator → CoordinatorScreen with queue + map.]*

**VOICEOVER:**
"Now I switch to the Coordinator view. This is the operations workspace — a live queue on one side, the map on the other, both reading from the exact same data. My new report just appeared, unverified, on both."

*[ON SCREEN: Click the incoming report → open VerificationModal → click Verify.]*

**VOICEOVER:**
"I review the source and location, and verify it. Only now does it become a real, actionable incident — that verification step is a human decision, not a rubber stamp the system applies automatically."

*[ON SCREEN: Open the Resource Ledger panel — show available/reserved/in-transit/delivered breakdown.]*

**VOICEOVER:**
"Here's our resource pool — 20 relief kits, with a clear breakdown of what's available versus already committed, and when this count was last confirmed. This is the part most crisis dashboards fake: a number that *looks* live but is actually hours stale."

*[ON SCREEN: Open ReservationModal, reserve 20 kits, confirm.]*

**VOICEOVER:**
"I reserve all 20 kits for this incident. Watch the balance — available drops to zero, reserved goes up by 20, atomically."

---

## 6. Demo — the race condition (the money shot) (4:45 – 5:30)

**[4:45]**
*[ON SCREEN: Trigger or simulate a second, concurrent reservation attempt for 10 kits against the same pool — via ConflictModal or a second session/tab.]*

**VOICEOVER:**
"Now here's the proof point. A second coordinator — or in this case, a second attempt — tries to reserve 10 more kits from the same pool, at the same time."

*[ON SCREEN: Show the rejection / ConflictModal with current balance.]*

**VOICEOVER:**
"Rejected. Not because of a lock screen or a 'please wait' spinner — because the system checks real availability at the moment of commit, and there's nothing left to give. This is the exact failure mode that causes double-promised aid in the real world, and here it's structurally impossible. Exactly one commitment wins, and the loser sees the real, current balance instead of a stale number."

---

## 7. Demo — task offer and responder acceptance (5:30 – 6:30)

**[5:30]**
*[ON SCREEN: Back in Coordinator view → OfferTaskModal → select a responder, enter instructions, offer task.]*

**VOICEOVER:**
"With the reservation locked in, I offer the task to a volunteer — instructions, quantity, location. Notice the status: 'Offered — awaiting responder acknowledgement.' Not assigned. Not covered. I have not yet transferred responsibility to anyone."

*[ON SCREEN: Log in as Responder → ResponderScreen → open the offered TaskCard.]*

**VOICEOVER:**
"Switching to the volunteer's view — they see the same offer, with the same 'no accepted owner yet' framing."

*[ON SCREEN: Click Accept on TaskAcknowledgementControl, then DispatchDialog to dispatch 20.]*

**VOICEOVER:**
"Only when they explicitly accept does ownership actually transfer. Then they dispatch the 20 kits — which moves the resource state from reserved to in-transit. Sent is not accepted. Accepted is not delivered. Every one of those is its own recorded event."

---

## 8. Demo — partial delivery and honest reconciliation (6:30 – 7:15)

**[6:30]**
*[ON SCREEN: OutcomeModal — enter delivered quantity 12, exception reason for remaining 8, submit.]*

**VOICEOVER:**
"Back in the field, the responder hits a blocked road and only delivers 12 of the 20 kits. They record that honestly — 12 delivered, 8 with a stated access exception. The system doesn't let them silently close this as 'done.'"

*[ON SCREEN: Switch to Coordinator → ReconciliationPanel — show 12 delivered / 8 unresolved, confirm partial outcome.]*

**VOICEOVER:**
"The coordinator sees the same math — 12 delivered, 8 still unresolved — and confirms a *partial* resolution. Nothing disappears. Those 8 kits stay visible as an open exception instead of quietly vanishing from the books, which is exactly the kind of gap that causes real shortages downstream."

---

## 9. Audit trail and the map (7:15 – 7:40)

**[7:15]**
*[ON SCREEN: Open AuditTimeline for this incident.]*

**VOICEOVER:**
"Every one of those steps — submitted, verified, reserved, offered, accepted, dispatched, partially delivered, reconciled — is a timestamped, attributed event on this incident's audit trail. Nothing here can be quietly edited or deleted."

*[ON SCREEN: Flip to OperationalMap — show the marker's state/freshness labels.]*

**VOICEOVER:**
"And the map you started with is just a live view of that same governed state — not a separate source of truth. Source, freshness, and status travel with every marker, so nobody mistakes a stale pin for a current one."

---

## 10. Stack, scope, and close (7:40 – 8:00)

**[7:40]**
*[ON SCREEN: Optional quick cut to architecture doc or just the app.]*

**VOICEOVER:**
"Under the hood, it's a TypeScript full stack — a Node backend with atomic, transaction-safe reservations, and a React frontend, all built directly off a locked PRD and UI spec so nothing here was improvised. AI, live GPS, and government integrations were deliberately kept out of the critical path — this proves the *coordination workflow* is trustworthy first.

That's the Verified Response Ledger: not a prettier map, but a system where a promise of help is a promise the platform can actually keep. Thanks for watching."

**[8:00] — END**

---

## Timing cheat sheet

| Segment | Time | Duration |
|---|---|---|
| Hook | 0:00–0:45 | 0:45 |
| Problem | 0:45–1:45 | 1:00 |
| Solution one-liner | 1:45–2:30 | 0:45 |
| Reporter demo | 2:30–3:15 | 0:45 |
| Coordinator verify + reserve | 3:15–4:45 | 1:30 |
| Race condition | 4:45–5:30 | 0:45 |
| Offer + accept | 5:30–6:30 | 1:00 |
| Partial delivery + reconcile | 6:30–7:15 | 0:45 |
| Audit + map | 7:15–7:40 | 0:25 |
| Close | 7:40–8:00 | 0:20 |

**Before recording:** reset demo data to the known 20-kit seed state (FR-025 demo reset) so the reservation numbers match this script exactly.
