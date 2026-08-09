# Module 7 — Firmware, Pairing, Cloning & Bench Emulation
### ECU Repair Academy · Study Notes
**Skill Level: Expert** · 16 h theory / 24 h lab · Prerequisite: Module 6
**⚠ Legal/ethics gate required before enrolment — see §7.0.**

---

## 7.0 Scope, Ethics & Legal Boundary (mandatory — read first)

This module teaches the **legitimate, lawful** applications of firmware and memory work:

- **ECU replacement & cloning for repair** — moving a car's identity (VIN, immobiliser pairing, adaptations) from a failed ECU to a matching replacement so the vehicle runs again, performed **by or for the vehicle's owner or an authorised repairer.**
- **Checksum integrity** — recomputing checksums so a legitimately edited or repaired file is valid.
- **Bench emulation** — driving an ECU on the bench with simulated sensor signals to test and verify a repair.

**Explicitly out of scope and not taught:**

- Defeating anti-theft / immobiliser security on a vehicle you do not own or are not authorised to service, or to enable vehicle theft.
- Odometer alteration (illegal in Kenya and essentially everywhere).
- Emissions defeat: EGR/DPF/SCR/AdBlue "delete" maps, lambda/O₂ removal, or DTC masking to hide a removed emissions device — the same boundary held across the whole programme.
- Any tuning that knowingly exceeds a component's safe mechanical/thermal limits without disclosure.

Enrolment requires a **signed acknowledgement** that you will apply these skills only to vehicles you own or are authorised to service, and in compliance with local law. The platform records this acceptance. This gate exists to keep both the certification credible and the work lawful — an emissions delete or a stolen-vehicle immo bypass is not a repair, and this module will not help with it.

---

## 7.1 Learning Objectives

By the end of this module you will be able to:

1. Explain **checksum theory** and recompute a checksum after a legitimate repair edit.
2. Perform an **EEPROM pairing / ECU-replacement** so a matched replacement ECU starts the car.
3. Build a **bench-emulation rig** — crank/cam signal generation and sensor emulation — to run and verify an ECU off-vehicle.
4. Understand **cloning** as an owner/authorised-repairer recovery technique for a specific vehicle.

---

## 7.2 Checksum Theory

Edited or repaired firmware must satisfy the ECU's integrity checks or it will not run. From oldest to newest:

- **Simple sum / XOR** — the oldest ECUs.
- **CRC-16 / CRC-32** — most calibration areas; the polynomial and seed are map-specific.
- **Multi-region checksums** — separate sums over the code and each calibration block; some ECUs additionally carry a **cryptographic signature** (modern secured ECUs — *not* defeatable here).

The workflow you learn: locate the checksum region, identify the algorithm (many are documented for legacy Bosch/EDC/ME), recompute after a legitimate change, and verify the ECU accepts the file. The emphasis is on **repair edits** — for example, correcting a corrupted calibration block from your own verified backup — not on illicit tuning. A checksum that does not match is why a hand-edited or partially-corrupted file gets rejected at boot.

---

## 7.3 EEPROM Pairing / ECU-Replacement Workflow (repair use)

When an engine ECU is dead and replaced with a used or replacement unit, the car's identity must migrate so the immobiliser lets it start:

1. **Read the external EEPROM** of the old ECU (immo data, VIN, adaptations) — or reconstruct from the vehicle's key/immo master (BCM/EZS) where the ECU data is unrecoverable.
2. **Confirm the replacement ECU is the exact matching hardware/software** part.
3. **Write the car's immo/adaptation data** into the replacement's EEPROM so it pairs with the existing keys and immobiliser.
4. Where the OEM procedure requires it, perform the **online/authorised component-protection or immo-adaptation step** (e.g. VAG component protection, Mercedes EZS pairing) through the proper channel — flagged as OEM-authorised, not bypassed.
5. **Verify:** start the engine, confirm no immo DTCs, correct VIN, and correct adaptations.

The distinction that keeps this lawful: you are restoring *this owner's* car to running order with a matched part, not defeating security to enable theft. Steps 1–2 assume you have legitimate access to the vehicle and its keys.

---

## 7.4 Bench Emulation & Signal Generation

To run and test an ECU off-vehicle you replace the car with signals and loads:

- **Crank/cam simulation:** a signal generator or dedicated ECU test-bench produces the VR or Hall crank/cam patterns with the correct tooth count, missing-tooth gap, and cam phase. Frequency maps to rpm — for a 60-2 wheel, **f = rpm × 58 / 60.**
- **Sensor emulation:** resistive/voltage sources for coolant temperature (NTC), MAP (0.5–4.5 V), TPS, and so on.
- **Load emulation:** injector/coil dummy loads (the Module 1 load bank) so the drivers switch into a realistic load and report healthy.
- **Bus partner:** a second node or bench tool to ACK the ECU's CAN frames and run diagnostics.

Commercial bench-test units exist for the major ECU families; this course teaches you to build a **generic bench** with a function generator plus the standard harness, so you are not dependent on a single proprietary box.

---

## 7.5 Cloning (repair context)

"Cloning" here means making a replacement ECU behave exactly like the failed original, so the car starts and runs without a full OEM re-adaptation:

1. **Full read** of the donor/failed ECU (flash + EEPROM), verified.
2. **Confirm identical hardware/software** on the replacement.
3. **Write** flash + EEPROM to the replacement.
4. **Recompute any checksums; verify.**
5. **Bench-test with emulated signals** before fitting.

This is taught strictly as an **owner / authorised-repairer recovery technique for a specific vehicle** — not batch reproduction, not circumventing licensing, not producing "spare" identities.

---

## 7.6 Common Failure Modes

| Issue | Cause | Fix |
|-------|-------|-----|
| Runs but immo light on / no-start | EEPROM immo data not migrated/matched | Re-pair the EEPROM to the vehicle immo master |
| Starts and stalls | Component protection / adaptation not done | Complete the authorised adaptation |
| Won't accept flash | Checksum/signature mismatch | Recompute the checksum; secured ECUs need the OEM path |
| Wrong maps / drivability | Non-matching software version | Match the exact part/software |

---

## 7.7 Bench Labs

**Lab 7.1 — Checksum Repair.** Given a backup with one deliberately corrupted calibration byte, restore it and recompute the checksum so a legacy EDC/ME-class ECU accepts the file.

**Lab 7.2 — EEPROM Migration (simulated donor pair).** Migrate immo/adaptation data from a "failed" bench ECU to a matching replacement using instructor-provided vehicles/kit; verify the start.

**Lab 7.3 — Build a Crank/Cam Bench.** Generate a 60-2 crank + cam signal and get a bench ECU to "run" — injector and coil drivers pulsing correctly — with emulated sensors.

**Lab 7.4 — Full Clone & Verify** on matched hardware, owner-authorised donor set. Capstone.

---

## 7.8 Assessment

### Multiple-Choice Questions

**Q1.** A legitimately repaired calibration file is rejected by the ECU at boot. The most likely reason is:
- A. The crystal is cracked
- B. The checksum was not recomputed after the edit
- C. The CAN terminator is missing
- D. The supply sagged

**Q2.** After an ECU replacement the engine cranks but will not start and the immobiliser light stays on. The most likely cause is:
- A. A shorted injector driver
- B. The immo/adaptation data in the external EEPROM was not migrated/matched to the vehicle
- C. A dead crystal
- D. Wrong ignition-coil dwell

**Q3.** For a 60-2 crank trigger wheel, the crank-signal frequency at a given rpm is:
- A. rpm × 60 / 58
- B. rpm × 58 / 60
- C. rpm × 2
- D. rpm / 60

**Q4.** Which of the following is explicitly **out of scope** for this module?
- A. Recomputing a checksum after a repair edit
- B. Migrating EEPROM identity to a matched replacement ECU
- C. Writing an EGR/DPF delete map to defeat an emissions device
- D. Building a crank/cam bench to verify a repair

**Q5.** Cloning, as taught here, is legitimate only when it is:
- A. Used to produce spare ECU identities for resale
- B. An owner/authorised-repairer recovery for one specific vehicle with matched hardware
- C. Applied to bypass component protection on any car
- D. Used to roll back an odometer

### Practical Scenarios

**Scenario A.** A customer's engine ECU has failed on a car they own, and you have sourced a used replacement of the same part number. Describe the complete legitimate process to get the car running again — including how you handle the immobiliser, what you verify, and where an OEM-authorised step is required rather than a bench workaround.

**Scenario B.** You want to verify a firmware/EEPROM repair on the bench before refitting the ECU to the vehicle. Describe how you would build and use a bench-emulation rig to confirm the ECU runs correctly, and list what a successful test proves.

---

### Answer Key

**Q1 — B.** Any edit changes the data the checksum protects; if it is not recomputed, the ECU's integrity check fails and it refuses the file. (Secured ECUs additionally check a cryptographic signature, which is not defeated here.)

**Q2 — B.** The immobiliser reads identity from the external EEPROM. If that data was not migrated to or matched on the replacement, the immo will not authorise start even though the engine mechanics and firmware are fine.

**Q3 — B.** A 60-2 wheel has 58 physical teeth, so f = rpm × 58 / 60 (with the two-tooth gap giving the sync reference).

**Q4 — C.** Emissions-defeat maps (EGR/DPF/SCR/AdBlue delete, lambda removal, DTC masking) are explicitly excluded. The other three are legitimate repair/verification tasks the module teaches.

**Q5 — B.** Cloning is legitimate only as an owner/authorised-repairer recovery for one specific vehicle on matched hardware — never for batch identities, security bypass, or odometer fraud.

**Scenario A — model answer.** (1) Confirm you have legitimate access — it is the owner's car and you have the keys. (2) **Read the external EEPROM** of the failed ECU (immo data, VIN, adaptations); if the old ECU is unreadable, reconstruct the immo data from the vehicle's immo master (BCM/EZS). (3) **Confirm the replacement is the exact matching hardware/software** part number — a mismatch causes wrong maps or a no-run. (4) **Write the car's immo/adaptation data** into the replacement's EEPROM so it pairs with the existing keys. (5) **Where the OEM requires it** — e.g. VAG component protection or Mercedes EZS pairing — perform that step through the proper authorised channel, not a bypass. (6) **Verify:** engine starts, no immo DTCs, correct VIN, correct adaptations, and a road/idle check. The immobiliser is handled by *matching identity*, not defeating security.

**Scenario B — model answer.** (1) Build the rig on the standard bench harness: fused KL30, switched KL15, ground, CAN_H/L. (2) **Crank/cam:** drive the ECU with a function generator producing a 60-2 crank pattern (f = rpm × 58/60) plus a phased cam signal. (3) **Sensors:** emulate coolant temp (NTC resistance), MAP (0.5–4.5 V), TPS, etc., with resistive/voltage sources at plausible values. (4) **Loads:** connect injector and coil dummy loads so the drivers switch into a realistic load and do not flag open-circuit. (5) **Bus partner:** provide a node/tool to ACK the ECU's CAN frames and run diagnostics. (6) Power the ECU and confirm it "runs" — injector and coil drivers pulse correctly on the scope, no implausible sensor faults, and it communicates on CAN. **A successful test proves** the repaired firmware/EEPROM boots, the immo/adaptation data is consistent, the drivers switch correctly into load, and the ECU communicates — i.e. it is safe to refit — without risking a non-start or damage on the actual vehicle.

---

*End of Module 7 study notes.*
