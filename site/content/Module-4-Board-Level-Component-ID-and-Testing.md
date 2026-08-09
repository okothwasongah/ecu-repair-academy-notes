# Module 4 — Board-Level Component Identification & Testing
### ECU Repair Academy · Study Notes
**Skill Level: Intermediate** · 14 h theory / 20 h lab · Prerequisite: Module 2

---

## 4.0 Learning Objectives

By the end of this module you will be able to:

1. Identify every common discrete on an ECU board and state its healthy test reading — diodes, MOSFETs, BJTs, passives, crystals.
2. Test a **MOSFET** and a **driver stage** in and out of circuit, and interpret ambiguous in-circuit readings.
3. Recognise the failure signatures of **MLCCs, electrolytics, shunt resistors, and crystals**.
4. Use a **signature tracker (V-I curve comparison)** to find a faulty part on a dead board without a schematic.
5. Apply **root-cause discipline** — never replace a shorted driver without checking the load that killed it.

Module 1 tells you *which rail* is faulty. Module 4 tells you *which component* on that rail is the culprit — and, crucially, *why* it failed, so your repair lasts more than a few seconds.

---

## 4.1 The Discrete Zoo

### Diode / junction reference (DMM diode mode, healthy forward drops)

| Junction | Forward drop | Notes |
|----------|-------------|-------|
| Silicon signal diode | **0.55–0.70 V** | Open = OL; shorted = ~0 V both ways |
| Schottky | **0.15–0.45 V** | Used in reverse-protection and switchers |
| Base-emitter (Si BJT) | 0.6–0.7 V | Two-junction transistor model |
| LED (indicator) | 1.6–3.3 V | Colour-dependent |
| Zener (forward) | 0.7 V | Reverse breakdown is the working point |
| Body diode of MOSFET | 0.4–0.6 V | Present S→D even on a good FET |

This is why your DMM's diode mode needs **≥ 2.0 V** open-circuit (Module 1): to forward-bias two series junctions you need more than a single 0.7 V drop of headroom.

### MOSFET testing (out of circuit preferred)

- **Gate-source and gate-drain must read OL (open).** Any low reading = gate-oxide punch-through — the FET is dead.
- The **body diode** conducts source→drain at ~0.5 V and blocks drain→source.
- **Latch test:** briefly touch the gate to the drain to charge it; an N-channel FET then conducts D→S until you discharge the gate. A FET that will not latch on this way is dead.
- **In-circuit caution:** parallel gate resistors and body diodes make readings ambiguous. Compare against the identical FET in an adjacent driver channel — symmetry is your friend on a multi-channel board.

### Injection-driver topologies

- **Low-side smart drivers** (BTS/ISO/VNx families, or integrated in a multi-channel ASIC) — the most common driver for injectors, solenoids, and relays. Fault feedback arrives via an SPI status register (which you decoded in Module 2).
- **Darlington arrays (ULN2803, discrete BUxxx)** — older ignition/relay drivers. High gain (β ~ 1000) but high V<sub>CE(sat)</sub> (~1 V), so they run hot; the common failure is a shorted collector-emitter from over-temperature.
- **H-bridge (throttle, EGR DC motor, turbo actuator)** — four FETs. Test each leg; a single shorted low-side FET blows the fuse the instant KL15 comes up.

### Passives

| Component | Test | Fail signature |
|-----------|------|----------------|
| MLCC (X7R/X5R) | Capacitance + short check | Cracked MLCC → dead short across a rail (flexure cracks near board edge/connector) |
| Electrolytic | ESR meter | ESR up 3–10×, capacitance down; vented top |
| Sense resistor (shunt) | 4-wire, 1–50 mΩ | Open = injector/current-sense DTC; drifts high with heat cycling |
| Current-sense / gate resistors | In-circuit Ω vs neighbour | Open series gate resistor = driver won't switch |
| Crystal / resonator | See below | No oscillation = dead MCU |

**The cracked MLCC is the archetypal ECU fault.** Ceramic capacitors are brittle; board flex near a connector or mounting point cracks them, and a cracked MLCC often fails as a dead short across a rail. It is the most common cause of the "hard short" you localise thermally in Module 1.

### Crystals & oscillators

Typical values: **8, 16, 20, 24, 40 MHz** MCU main clock; **32.768 kHz** RTC. Test methods:

- Scope on the **output leg (XOUT)** with a 10:1 probe — probing XIN often *stops* oscillation because the probe capacitance loads the input.
- Better still, scope a downstream clock-derived signal (an SPI clock present ⇒ the oscillator is alive) — non-contact confirmation.
- A cracked crystal (mechanical shock, or heat from an adjacent driver) is the classic "completely dead, no visible damage" fault. Cracked **loading capacitors** (typically 8–22 pF) have the same effect.

---

## 4.2 Tools

Hot-air and soldering gear (detailed in Module 5), an **ESR meter**, an **LCR meter**, a **component/transistor tester**, a **4-wire milliohm meter**, a bench PSU, a thermal camera, a 10–40× microscope, and — the standout — a **curve tracer or "Huntron"-style signature tracker.** The signature tracker compares the V-I curve at a pin against a known-good board; it is extraordinarily powerful for finding a faulty part on a dead board when you have no schematic and no power.

---

## 4.3 Diagnostic Procedure — Component-Level Isolation

1. **Localise the rail short** from Module 1 to a region → identify every component on that rail node.
2. **V-I signature compare** each suspect against a golden board with the signature tracker.
3. **Thermal confirm** under current-limited injection (the hot part is the shorted part).
4. **Lift and verify:** remove the suspect and re-measure the rail. Restored → confirmed. Still shorted → keep going (multiple MLCCs often share a node).
5. **Root-cause the failure — don't just replace.** A shorted injector-driver FET is frequently *caused* by a shorted injector or a chafed harness. Replace the FET without checking the load and it dies again in seconds.

---

## 4.4 Common Failure Modes

| Component | Root cause | Workflow |
|-----------|-----------|----------|
| Shorted injector-driver FET/ASIC channel | Shorted injector coil, chafed harness to ground, water | Test the **load and harness first**; replace driver; verify flyback clamp after |
| Cracked MLCC on 5 V | Board flex, thermal cycling | Locate thermally, replace same value/voltage, reduce mechanical stress |
| Open shunt resistor | Overcurrent event, corrosion | Replace exact value; investigate *why* it saw overcurrent |
| Dead crystal | Shock, adjacent heat | Replace crystal **+ both load caps** |
| Blown Darlington ignition driver | Coil-primary short, dwell overrun | Replace; verify coil-primary resistance in spec |
| Leaky ESD/TVS diode | Old load-dump event | Replace; check for an upstream alternator issue |

---

## 4.5 Bench Labs

**Lab 4.1 — Golden Board Signature Library.** Build a V-I signature reference of every pin on a known-good ECU using the signature tracker; store the curves for later diff comparison.

**Lab 4.2 — Driver Autopsy.** Given three ECUs with injector faults, determine for each whether the fault is the FET, the ASIC channel, the load, or the harness — using board-level measurement only, before applying power.

**Lab 4.3 — The Dead-Board Crystal.** Diagnose a board that is "completely dead — no rails pulsing, no reset loop" down to a cracked crystal; replace it and revive the board.

**Lab 4.4 — MLCC Short Hunt.** Locate a single cracked 0402 MLCC shorting the 3.3 V rail among ~40 candidates using thermal + signature methods.

---

## 4.6 Assessment

### Multiple-Choice Questions

**Q1.** In diode mode you read ~0 V in **both** directions across a component that should be a signal diode. This means:
- A. It is healthy
- B. It is open
- C. It is shorted
- D. It is a Schottky

**Q2.** Testing an N-channel MOSFET out of circuit, you read a low resistance gate-to-source. This indicates:
- A. A healthy FET
- B. Gate-oxide punch-through — the FET is dead
- C. The body diode is conducting
- D. Normal in-circuit loading

**Q3.** A board is completely dead: rails come up and current is normal, but the MCU reset line is high with no clock activity and no watchdog pulsing. The most likely fault is:
- A. A shorted 5 V rail
- B. A cracked crystal (no MCU clock)
- C. A failed CAN transceiver
- D. An open main relay

**Q4.** You replace a shorted injector-driver FET and it fails again within seconds of power-up. The most likely reason is:
- A. The replacement FET was defective
- B. You did not check the load — a shorted injector or harness is still present
- C. The crystal is cracked
- D. The 3.3 V rail is noisy

**Q5.** The most powerful tool for finding a faulty component on a **dead, unpowered** board with no schematic is:
- A. A thermal camera
- B. An oscilloscope
- C. A signature tracker (V-I curve comparison against a known-good board)
- D. A logic analyzer

### Practical Scenarios

**Scenario A.** A board has a hard short on the 3.3 V rail localised (from Module 1) to a cluster of about a dozen decoupling MLCCs and a transceiver. Describe how you would identify the single faulty part without removing all twelve capacitors, and how you would confirm the repair.

**Scenario B.** An ECU comes in with a dead injector-driver channel. Explain the full sequence you would follow to repair it so that it stays repaired — including what you check before and after replacing the driver, and why.

---

### Answer Key

**Q1 — C.** ~0 V in both directions is a dead short; a healthy silicon diode reads 0.55–0.70 V one way and OL the other. Open would read OL both ways.

**Q2 — B.** Gate-to-source should be OL. Any low reading means the gate oxide has punched through and the FET is dead. The body diode conducts source-to-drain, not gate-to-source.

**Q3 — B.** Power is fine and current is normal-awake, so it is not a rail short. The MCU has power (reset high) but cannot run because there is no clock — a cracked crystal or cracked load caps. That is exactly the hand-off from Module 1 Step 6.

**Q4 — B.** A driver FET usually dies because of what it drives. A shorted injector coil or a harness chafed to ground re-destroys the new FET instantly. Always test the load and harness first, and verify the flyback clamp after the repair.

**Q5 — C.** The signature tracker compares V-I curves against a golden board with no power applied and no schematic needed — ideal for a dead board. A thermal camera needs current flowing; scope and logic analyzer need the board alive.

**Scenario A — model answer.** (1) With the board unpowered, run the **signature tracker** across each capacitor and the transceiver, comparing V-I curves to the golden board from Lab 4.1 — the shorted part shows a near-vertical (low-impedance) curve while the healthy ones match reference. (2) Cross-check with **thermal injection:** apply 1.5–2.0 V at 2–3 A into the 3.3 V rail and watch the thermal camera; the faulty MLCC (or the transceiver) heats first. (3) **Lift and verify:** remove only the suspect and re-measure the rail. If 3.3 V-to-ground returns to its healthy kΩ range, it is confirmed; if still shorted, another MLCC on the node shares the fault, so continue. (4) Replace with the same value and voltage rating, re-measure, and power up current-limited to confirm the rail is clean and ripple is in spec. No blind removal of all twelve.

**Scenario B — model answer.** (1) **Before touching the driver,** test the *load*: measure the injector coil resistance (port injector ~12–16 Ω; a low or zero reading = shorted turns) and inspect the harness for chafe-to-ground. A shorted injector or harness is usually what killed the driver. (2) Confirm the driver itself is faulty — out-of-circuit MOSFET tests or a persistent ASIC status-fault bit (Module 2 SPI decode), compared against a healthy adjacent channel. (3) **Repair the root cause first** (replace the shorted injector / fix the harness), *then* replace the driver FET or ASIC channel using proper rework (Module 5). (4) **After the repair,** power up on the bench with a dummy load and capture the **flyback clamp** on the scope — a healthy 60–72 V spike with a sharp knee confirms the driver switches cleanly into a good load. Skipping the load check (step 1) is the single most common reason a "repaired" driver dies again immediately.

---

*End of Module 4 study notes.*
