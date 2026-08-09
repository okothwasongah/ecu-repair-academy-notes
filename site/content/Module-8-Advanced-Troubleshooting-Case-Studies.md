# Module 8 — Advanced Troubleshooting Case Studies
### ECU Repair Academy · Study Notes
**Skill Level: Expert** · 10 h theory / 30 h lab · Prerequisite: Modules 1–7

---

## 8.0 Learning Objectives

This is the integrative module. Each case demands skills drawn from across Modules 1–7, delivered as instructor-graded restorations on real failed cores. By the end you will be able to:

1. Restore a **water/flood-damaged** board, capturing the car's identity before the board degrades further.
2. Recover a **reverse-polarity / jump-start** casualty by working the damage-propagation chain in the right order.
3. Localise the hardest fault class — the **intermittent thermomechanical solder joint**.
4. Untangle a **multi-fault driver cascade** with proper root-cause discipline.
5. Isolate a **"no-communication with a running engine"** fault to the comms front-end.
6. Pass the **certification practical** — a blind fault board plus a bricked-module recovery.

The theme of the whole module: real faults arrive in combination, and the technician who wins is the one with a disciplined *order of operations*, not the one who knows the most facts.

---

## 8.1 Case A — Water / Flood-Damage Restoration

**Mechanism.** Conductive, corrosive ingress → dendritic growth across insulation → galvanic corrosion of copper, pads, and vias, worst under BGAs and inside connectors where moisture lingers.

**Workflow:**

1. **Do not power a wet board.** Photograph it as-found for the record.
2. **Clean and dry.** Full disassembly; ultrasonic clean (deionised water + appropriate flux/cleaner) or an IPA scrub; then dry thoroughly — bake at **60–70 °C** for hours.
3. **Inspect** every pad, via, and BGA under the microscope for green corrosion and lifted copper.
4. **Rebuild** corroded pads and traces (Module 5); reball corroded BGAs; replace corroded connectors.
5. **Rail triage** (Module 1) and **component signature compare** (Module 4).
6. **Read memory as soon as the MCU is alive** (Module 6) — *capture the car's identity before the board degrades further.* This step is time-critical; corrosion continues even after cleaning.
7. **If the MCU is dead,** transplant + EEPROM migration (Modules 6–7).
8. **Re-coat** with conformal coating and run a full functional bench test (Module 7).

The judgement call unique to water damage: **prioritise reading the immo/adaptation data early,** because a board that boots today may not boot next week as latent corrosion spreads.

---

## 8.2 Case B — Reverse-Polarity / Jump-Start Recovery

**Propagation chain.** The reverse-protection element fails → SBC/regulator damage → CAN-transceiver damage (the bus commonly sits at 12 V, which destroys transceivers) → sometimes driver ASICs downstream.

**Workflow.** Replace the **protection element first,** bring the board up **current-limited** (Module 1), then work outward in the order the damage propagated: **SBC → transceivers → drivers,** verifying each rail before proceeding to the next stage. Always establish *why* it happened — the customer jump-started backwards — and warn them about **secondary latent damage** that may surface later. Fixing the visible casualty without checking downstream is how a "repaired" ECU comes back a week later.

---

## 8.3 Case C — Intermittent Thermomechanical Solder Joint

**Signature.** The fault appears with heat, vibration, or after warm-up and vanishes on the bench. This is the hardest class because the board tests fine when you have it.

**Methods:**

- **Freeze spray + heat gun** localisation: selectively cool or heat suspect areas while monitoring the fault — a rail, comms, or the actual symptom.
- **Flex test:** under power, gently twist or press regions of the board to provoke the dropout.
- **Thermal cycling** on a preheater while watching the scope.

**Usual culprits:** connector-pin solder joints, large-thermal-mass driver grounds, crystal legs, and BGA corner balls (lead-free "champagne" cracking). The fix is a proper **reflow or full reball** — never just "add solder," which masks the cracked joint for weeks and then fails again.

---

## 8.4 Case D — Multi-Fault Driver Cascade

A shorted injector took out a driver channel **and** stressed the boost supply on a GDI ECU. This case teaches root-cause discipline: **fix the load first,** replace *all* the stressed silicon (not just the obviously-dead channel), and verify the flyback and boost rails before declaring the job done. A cascade leaves marginal, half-damaged parts that fail later if you only replace the one that died outright.

---

## 8.5 Case E — "No-Communication" With a Running Engine

The engine runs fine but the scan tool cannot reach the ECU. The discriminator is whether the **comms front-end** (a K-line/CAN interface IC such as the L9637, or a CAN transceiver) has failed while the MCU keeps running the engine (Module 3) — versus a **gateway** fault or a **harness** fault. This case teaches you to isolate the communication front-end from the healthy core: the engine running proves the MCU and drivers are alive, so the fault is downstream of the processor in the comms path.

---

## 8.6 Certification Practical (capstone exam)

- **Blind fault board:** an ECU with 2–3 seeded faults spanning power, bus, and board level. Diagnose and repair to a functional bench pass within the time limit, documenting your method as you go.
- **Bricked-module recovery:** recover an instructor-bricked ECU from boot mode with correct power and backup discipline.
- **Written:** 4 h across all modules, drawn from the platform question bank.
- **Pass = both practicals functional + written ≥ 80 %.**

The practical is graded as much on *method* as on outcome — did you current-limit before power-up, measure resistance with power off, check the load before replacing the driver, and take a backup before writing? A correct repair reached by an unsafe or lucky route does not pass.

---

## 8.7 Assessment

### Multiple-Choice Questions

**Q1.** On a water-damaged ECU whose MCU is still alive, the time-critical step is:
- A. Re-coat with conformal coating immediately
- B. Read the memory (immo/adaptation data) before latent corrosion degrades the board further
- C. Replace all the electrolytics
- D. Reball every BGA first

**Q2.** After a reverse-polarity event, the correct repair order is:
- A. Drivers → transceivers → SBC → protection element
- B. Protection element first, then SBC → transceivers → drivers, verifying each rail
- C. Reflash the ECU, then replace parts
- D. Replace only the visibly burnt component

**Q3.** A fault appears only after the engine warms up and disappears on the bench. The best localisation technique is:
- A. A static resistance map
- B. Freeze spray / heat gun and a flex test under power
- C. Reflashing the firmware
- D. Replacing the crystal

**Q4.** An engine runs perfectly but the scan tool cannot communicate. This most strongly implicates:
- A. A dead MCU
- B. A shorted injector driver
- C. The comms front-end (interface IC / transceiver), gateway, or harness — not the core
- D. A cracked crystal

**Q5.** In a multi-fault driver cascade caused by a shorted injector, the correct discipline is:
- A. Replace only the dead channel and refit
- B. Fix the load first, replace all stressed silicon, and verify the flyback/boost rails
- C. Reflash to clear the codes
- D. Increase the current limit and retest

### Practical Scenarios

**Scenario A.** You receive a flood-damaged ECU from a car the owner wants saved. The board is corroded but the MCU appears to power up. Describe your restoration sequence and justify the order — in particular, explain why you would read the memory before completing the cosmetic and structural repairs.

**Scenario B (capstone-style).** You are handed a blind fault board with an unknown combination of faults. It is dead on arrival. Describe the disciplined, safe sequence you would follow to find and fix the faults, and state the specific safety/method checkpoints an examiner would expect to see you hit.

---

### Answer Key

**Q1 — B.** Corrosion continues after cleaning, so a board that boots today may not boot next week. Capturing the immo/adaptation data while the MCU is alive protects the car's identity and your ability to complete the repair (or transplant) later.

**Q2 — B.** Damage propagates from the protection element inward, so you replace it first, bring the board up current-limited, and work outward SBC → transceivers → drivers, verifying each rail before continuing. Replacing only the visible casualty leaves downstream latent damage.

**Q3 — B.** A warm-up/vibration-dependent, bench-invisible fault is thermomechanical. You provoke it with selective heating/cooling and a flex test under power while monitoring the symptom — a static resistance map cannot catch an intermittent.

**Q4 — C.** A running engine proves the MCU and drivers are alive, so a comms failure sits in the front-end (interface IC/transceiver), the gateway, or the harness — downstream of the healthy core.

**Q5 — B.** A cascade leaves marginal, half-damaged silicon. Fix the load (the shorted injector) first, replace all stressed parts, and verify the flyback and boost rails — replacing only the dead channel invites a repeat failure.

**Scenario A — model answer.** (1) **Do not power it wet;** photograph as-found. (2) **Clean and dry** — ultrasonic/IPA, then bake at 60–70 °C for hours. (3) **Inspect** all pads/vias/BGAs for corrosion. (4) **Rail triage and signature compare** to see what survived. (5) **Read the memory as soon as the MCU is alive — before the cosmetic/structural rebuild.** The justification: corrosion is ongoing and a board that boots now may fail during or after the lengthy pad/trace/BGA rebuild; capturing the immo/adaptation data early guarantees you can restore the car's identity even if the board later dies and you must transplant to a donor. (6) Only then complete pad/trace/BGA repairs, re-coat, and run a full functional bench test. Order is driven by risk: identity first, cosmetics last.

**Scenario B — model answer.** Pre-flight: **ESD strap, dissipative mat, caps discharged** (examiner checkpoint 1). **Visual/olfactory** inspection under the microscope. **Static resistance map with power off** (checkpoint 2 — measuring Ω on a powered board is a method fault) to find any shorted rail. **Current-limited power-up** at 13.8 V / 0.3 A (checkpoint 3 — never force high current into an unknown board); if it trips CC, drop to 1.5–2.0 V / 2–3 A and localise thermally. Work each fault in turn: for a shorted rail, signature-compare and lift-and-verify the culprit; **check the load before replacing any driver** (checkpoint 4); for a bus fault, measure the 60 Ω and scope both lines; for a no-clock condition, test the crystal. **Take a backup before any write** if flashing is involved (checkpoint 5). Repair with proper rework, then **verify under power** — rails in spec, ripple within limits, comms with a valid ACK, drivers switching cleanly into load. Document method throughout; the examiner grades the safe, disciplined route as much as the working outcome.

---

*End of Module 8 study notes — end of programme.*
