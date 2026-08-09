# Module 5 — Precision Soldering & Micro-Rework
### ECU Repair Academy · Study Notes
**Skill Level: Intermediate → Advanced** · 8 h theory / 40 h lab (the heaviest hands-on module) · Prerequisite: Module 4

---

## 5.0 Learning Objectives

By the end of this module you will be able to:

1. Explain solder **metallurgy** and set a correct **reflow profile** for leaded and lead-free work.
2. Identify and safely remove each type of **conformal coating** before rework.
3. Work the full **technique ladder** from 0402 passives up to **BGA removal, reball, and replacement**.
4. Repair **lifted pads, burnt traces, and damaged vias** to a durable standard.
5. Recognise and prevent the defects a repair itself can introduce — cold joints, tombstoning, bridges, head-in-pillow, popcorning.

This is the module that separates a diagnostician from a repairer. You can localise a fault perfectly and still destroy the board removing the part. The bench hours here are deliberately the highest in the programme, because hand skill only comes from repetition graded against a standard.

---

## 5.1 Metallurgy & Thermal Profiles

| Solder | Composition | Melt / liquidus | Working iron-tip temp |
|--------|-------------|-----------------|-----------------------|
| Leaded eutectic | Sn63/Pb37 | **183 °C** (eutectic) | 330–360 °C |
| Lead-free | SAC305 (Sn96.5/Ag3/Cu0.5) | **217–220 °C** | 360–390 °C |
| Low-temp (rework aid) | Sn42/Bi58 | **138 °C** | BGA-removal assist only — do not leave in structural joints |

**Reflow profile zones (SAC305):** preheat with a ramp of ≤ 1–3 °C/s → soak at 150–200 °C for 60–120 s (activates flux, equalises thermal mass across the board) → reflow peak **235–250 °C** with ≥ 30 s above 217 °C → cooldown at ≤ 4 °C/s. Overshoot delaminates the board; too-slow a ramp exhausts the flux before the joint reflows, giving you dull, oxidised joints.

**Flux chemistry.** No-clean (low residue, leave-on) for field repair; water-soluble (aggressive, *must* be washed off) for heavy corrosion; rosin/RMA as a general-purpose choice. **Never** bring acid plumbing flux near electronics — it will corrode the board over the following weeks.

**The eutectic point matters** because Sn63/Pb37 goes straight from solid to liquid at 183 °C with no plastic (pasty) range — that is why it wets so cleanly and why it remains the beginner's friend for hand work, even though production is lead-free.

---

## 5.2 Conformal Coating Removal (before *any* rework)

Identify the coating type first, because the removal method differs:

- **Acrylic** — softens with IPA/acetone or gentle heat. The easiest.
- **Urethane** — needs a dedicated stripper or careful mechanical removal.
- **Silicone** — peel it back; re-coating needs a primer.
- **Parylene** — mechanical / micro-abrasion only; solvents will not touch it.

Remove locally with a hot-air pencil at low temperature and a plastic pick, or a fibreglass scratch brush, then flux the exposed pads. Never reflow a joint through conformal coating — trapped coating outgasses and contaminates the joint.

---

## 5.3 Tools

| Tool | Spec |
|------|------|
| Temperature-controlled iron | 60–90 W, calibrated, fine + chisel + hoof tips |
| Hot-air rework station | 100–500 °C, adjustable airflow, nozzle set |
| Preheater | IR or hotplate, 100–250 °C bottom-side (prevents warp, reduces top-side ΔT) |
| BGA rework station | Top + bottom heat, thermocouple profiling, vision alignment (for Module 6 MCU work) |
| Stencils + solder paste | Mini-stencils for QFN/BGA reballing; Type 4 paste |
| Reballing kit | Preforms/stencils, correct ball diameter (0.3–0.5 mm typical) |
| Microscope | 7–45× stereo zoom, ring light |
| Consumables | Solder wick, low-temp alloy, tacky flux, IPA, kapton tape, drag-solder tip |
| Fume extraction | **Mandatory** — see the safety framework |

The **preheater** is the tool beginners skip and professionals never do. Bringing the whole board to 120–150 °C from below dramatically reduces the top-side temperature you need to reflow a joint, which means less warp, fewer lifted pads, and no thermal shock to nearby parts.

---

## 5.4 Technique Ladder (graded, sequential)

You do not skip rungs. Each is signed off before the next:

1. **0805 → 0603 → 0402 passives** — place, tack one end, solder, inspect. Target: no tombstoning, correct fillet.
2. **SOIC / SO-8 (transceivers, EEPROM)** — drag-solder, wick the excess, verify no bridges under the scope.
3. **TQFP / LQFP (100–176-pin MCU-adjacent)** — drag-solder or hot-air with paste + stencil; check every lead for a bridge or open.
4. **QFN / DFN (thermal pad)** — paste + stencil + hot air; the hidden centre pad needs the correct paste volume and a via-assisted or edge-fillet inspection.
5. **BGA removal, cleanup, reball, replacement** — profile with a thermocouple; remove at the profiled peak; wick and flux the pads flat; reball with a preform/stencil; align and reflow; verify with continuity to a breakout or a functional test.
6. **Trace, pad & via repair** — see §5.5.

---

## 5.5 Trace, Pad & Via Repair

- **Lifted pad:** scrape the solder mask back to expose the trace, tin it, and bridge with **0.1 mm magnet wire** from the trace to the component lead. Anchor the joint with epoxy so it survives handling.
- **Burnt / open trace:** cut back to clean copper at both ends, tin, and jumper with wire sized to the current — 30 AWG for signal, 24–20 AWG for driver/power traces. Insulate and conformal-coat.
- **Damaged via:** via-stitch with a copper rivet, or thread a wire through and solder both sides.
- **Corroded pads (water damage):** clean to bright copper, re-tin, and rebuild a missing pad with copper foil + epoxy if needed.

---

## 5.6 Common Failure Modes (of the repair itself)

| Defect | Cause | Fix |
|--------|-------|-----|
| Cold joint (grainy, dull) | Too little heat/time | Reheat with flux to a shiny fillet |
| Tombstoning | Uneven pad heating on a passive | Reheat both ends simultaneously |
| Bridge | Excess solder | Wick, add flux |
| Lifted pad | Excess heat/time, prying | Jumper repair |
| Head-in-pillow (BGA) | Warped package / oxidised ball | Reball, correct the profile |
| Popcorning | Moisture in a plastic package reflowed hot | Bake parts 24 h @ 125 °C before rework |

**Popcorning** deserves emphasis: plastic packages absorb atmospheric moisture, and if you reflow them hot the trapped water flashes to steam and cracks the package audibly — like popcorn. Moisture-sensitive parts (and boards that have sat in humidity) get baked at 125 °C before any hot-air work.

---

## 5.7 Bench Labs

**Lab 5.1 — Passive Practice Grid.** 50 joints across 0805/0603/0402 on a practice board; graded to IPC-A-610 Class 3.

**Lab 5.2 — SO-8 Transceiver Swap** (ties to Module 3 Lab 3.4).

**Lab 5.3 — QFP Reflow.** Remove and replace a 144-pin QFP with paste + hot air; zero bridges under 40×.

**Lab 5.4 — QFN Thermal-Pad Rework.** Reflow a QFN with the correct paste volume on the hidden centre pad; verify with an edge-fillet inspection.

**Lab 5.5 — BGA Reball & Replace** (capstone; also the gate into Module 6 MCU work). Profile, remove, dress the pads, reball, align, reflow, verify.

**Lab 5.6 — Trace/Pad Reconstruction** on a deliberately damaged board — lifted pad jumper, burnt-trace bypass, and a via stitch.

---

## 5.8 Assessment

### Multiple-Choice Questions

**Q1.** The eutectic melting point of Sn63/Pb37 solder is:
- A. 138 °C
- B. 183 °C
- C. 217 °C
- D. 250 °C

**Q2.** A passive component has stood up on one end during reflow ("tombstoning"). The cause is:
- A. Too much flux
- B. Uneven heating of the two pads
- C. Moisture in the package
- D. A cracked crystal

**Q3.** Before hot-air rework on a plastic-package IC that may have absorbed moisture, you should:
- A. Increase the airflow to maximum
- B. Bake the part at 125 °C for ~24 h to prevent popcorning
- C. Apply water-soluble flux
- D. Use Sn42/Bi58 in the final joint

**Q4.** The main purpose of a bottom-side preheater during rework is to:
- A. Melt the solder faster with the iron alone
- B. Reduce the top-side temperature needed and minimise warp and lifted pads
- C. Remove conformal coating
- D. Bake out moisture during flashing

**Q5.** You must reball a BGA. The correct sequence is:
- A. Reflow, remove, wick, align
- B. Profile → remove at peak → wick/flux pads flat → reball → align → reflow → verify
- C. Align → reflow → profile → remove
- D. Wick pads → align → reball → remove

### Practical Scenarios

**Scenario A.** A previous "repair" left an ECU with an intermittent no-start. Under the microscope you find several dull, grainy joints on the connector pins and one lifted pad on a signal trace. Describe how you would correctly remediate each defect and verify the result.

**Scenario B.** You need to remove a moisture-sensitive QFP that sits close to a plastic connector and an electrolytic capacitor, on a board that has been stored in a humid workshop. Outline your full preparation and process to remove and replace the part without popcorning it, warping the board, or damaging the neighbouring components.

---

### Answer Key

**Q1 — B.** Sn63/Pb37 is eutectic at 183 °C, moving directly between solid and liquid with no pasty range — which is why it wets cleanly. 138 °C is Sn42/Bi58; 217 °C is SAC305.

**Q2 — B.** Tombstoning happens when one pad reflows before the other and surface tension pulls the part upright. The fix is even, simultaneous heating of both pads.

**Q3 — B.** Baking at 125 °C for about 24 h drives out absorbed moisture so it cannot flash to steam and crack the package during hot reflow (popcorning).

**Q4 — B.** A preheater raises the whole board from below, cutting the top-side temperature and dwell needed to reflow a joint, which reduces warp, thermal shock, and lifted pads.

**Q5 — B.** The correct order is profile with a thermocouple, remove at the profiled peak, wick and flux the pads flat, reball with a preform/stencil, align, reflow, and verify continuity or function.

**Scenario A — model answer.** (1) **Cold/grainy connector joints:** these are under-heated joints. Add flux and reflow each to a bright, concave fillet at the correct tip temperature (330–360 °C leaded); if the pins carry current, confirm a full wetted fillet, not just a surface skin. (2) **Lifted pad on a signal trace:** scrape back the solder mask to expose clean trace, tin it, and bridge from the trace to the component lead with 0.1 mm magnet wire, then anchor with epoxy so vibration will not re-break it. (3) **Verify:** re-inspect every joint under 40×, then bench-test — the connector joints should now hold under a gentle flex test (Module 8's technique), and the repaired signal net should show continuity and correct function. Document the before/after.

**Scenario B — model answer.** (1) **Bake first:** because the board sat in humidity and the QFP is moisture-sensitive, bake the board/part at 125 °C for ~24 h to drive out moisture and prevent popcorning. (2) **Protect the neighbours:** shield the plastic connector and the electrolytic with kapton tape or a heat shield, since both are heat-sensitive; the electrolytic especially must not be cooked. (3) **Preheat from below** to 120–150 °C so the top-side hot-air temperature and dwell are minimised — this protects the board from warp and the neighbours from collateral heat. (4) **Remove** the QFP with hot air at a controlled temperature and airflow, lifting only when all leads are molten. (5) **Dress the pads** (wick flat, flux), place and reflow the new QFP with paste, and inspect every lead for bridges/opens under the microscope. (6) **Verify** function and re-coat. The key precautions are the pre-bake (popcorning), the shielding + preheat (neighbours and warp), and controlled airflow (no blown-off small parts).

---

*End of Module 5 study notes.*
