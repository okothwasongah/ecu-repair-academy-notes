# Module 1 — Fundamentals of ECU Architecture & Power Distribution
### ECU Repair Academy · Study Notes
**Skill Level: Beginner** · 8 h theory / 12 h lab · Prerequisite: ESD + electrical safety certification

---

## 1.0 Learning Objectives

By the end of this module you will be able to:

1. Describe the electrical environment an automotive ECU must survive, and name the standard (ISO 7637-2, ISO 16750-2) behind each stress condition.
2. Trace the input-protection chain from the connector pin inward, and explain what each element does and how it fails.
3. Map the full **rail tree** of a modern engine ECU and state the correct voltage and tolerance for every rail.
4. Explain the role of the System Basis Chip (SBC), the main-relay afterrun latch, and inductive flyback clamping.
5. Perform a disciplined **"dead ECU" power triage** using current-limited injection, static resistance mapping, and thermal localisation.
6. Decide, with evidence, whether a fault lies in the **ECU or the harness** — the single most valuable judgement a module-level technician makes.

The whole module rests on one idea: *an ECU is a power-conversion machine with a computer bolted on.* Most "dead ECU" faults are power faults, not logic faults, and you solve them with a multimeter, a bench supply, and a thermal camera long before you ever touch a programmer.

---

## 1.1 The Automotive Supply Environment

Every protective component inside an ECU exists to survive a hostile 12 V (or 24 V) electrical system. You cannot diagnose the protection circuitry unless you know what it is protecting against. Commit this table to memory:

| Condition | Value | Standard |
|-----------|-------|----------|
| Battery at rest (12 V system) | **12.4–12.7 V** | — |
| Engine running / charging | **13.8–14.6 V** | — |
| Cold crank dip | **6.0–9.0 V** for 15–50 ms | ISO 16750-2 |
| Load dump (alternator, unclamped) | **60–120 V** | ISO 7637-2 Pulse 5a |
| Load dump (centrally clamped alternator) | **≤ 35 V**, 100–400 ms | ISO 7637-2 Pulse 5b |
| Inductive switch-off transient | **−100 V to −150 V**, 2 ms | ISO 7637-2 Pulse 1 |
| Superimposed AC ripple | 1–4 V p-p, 50 Hz–10 kHz | ISO 7637-2 |
| 24 V commercial system | 24–28 V nominal, load dump to 200 V | — |

**Why this matters at the bench.** The two conditions that kill ECUs in the field are **load dump** (a battery terminal falling off while the alternator is charging — the classic 5a pulse to over 100 V) and **reverse polarity** (jump-start or battery fitted backwards). When you open a dead ECU, the burn pattern usually tells you which one happened: a scorched TVS/Zener near the supply pin points to an over-voltage event; a blown reverse-protection element points to polarity.

**Cold crank** is the reason ECUs are designed to keep running down to ~6 V. A drivability complaint that only appears on a cold morning start is often a brownout-reset problem: the supply sags below the SBC's reset threshold during crank, the MCU reboots, and adaptations are lost.

---

## 1.2 The Input-Protection Chain

Working from the connector pin inward, a typical modern ECU supply pin passes through this sequence. Learn the order — you will trace it physically in Lab 1.1.

**1. Reverse-polarity element.** Either a series **Schottky diode** (forward drop 0.3–0.45 V — simple but lossy, so it runs warm) or, on modern ECUs, a **P-channel MOSFET "ideal diode"** whose drop is I × R<sub>DS(on)</sub>, typically under 50 mV. This is the number-one casualty of a backwards jump-start. When it fails shorted, reverse voltage propagates downstream and takes out the SBC and CAN transceivers with it.

**2. Series impedance.** A 1–10 Ω resistor, a PTC (resettable fuse), or a ferrite bead (e.g. 600 Ω at 100 MHz). Limits inrush and couples with the bulk capacitance to filter high-frequency trash.

**3. Transient suppressor.** A TVS diode (for example an SMBJ26A: breakdown ≈ 28.9 V, clamp ≈ 42 V) or a 33 V/36 V Zener referenced to chassis ground. This is the sacrificial element for load dump. A TVS that has absorbed one big event often fails **leaky** (not fully shorted) — it will pull a rail down by tens of milliamps and warm slightly, which you find with the thermal camera in Step 4 of triage.

**4. Bulk capacitance.** 47–470 µF electrolytic or polymer, rated 50 V, plus a 100 nF X7R decoupling capacitor at each IC. Electrolytics age: their ESR climbs and capacitance falls, producing ripple and brownout resets under load.

**5. EMC filter.** A common-mode choke across the supply pair on later modules, to meet radiated-emissions limits.

> **Rule of thumb:** when a board is dead after an electrical event, replace the reverse-protection element *first*, then bring the board up current-limited, and only then work outward. Powering a board with a shorted protection FET in place just pushes the fault deeper.

---

## 1.3 The Rail Tree

A modern engine ECU (TriCore-class) generates four to six regulated rails from the raw battery feed. This is the heart of the module — you will reverse-engineer a real one in Lab 1.1.

| Rail | Typical Value | Tolerance | Purpose | Source |
|------|---------------|-----------|---------|--------|
| V<sub>BAT</sub> (KL30) | 12–14.6 V | — | Drivers, keep-alive memory | Battery direct, fused |
| KL15 (ignition) | 12–14.6 V | — | Wake signal, **not** the main supply | Ignition switch |
| Pre-regulator | 5.5–6.5 V | ±5 % | Feeds LDOs efficiently | Buck switcher, 300 kHz–2.2 MHz |
| V<sub>DD5</sub> (logic 5 V) | 5.00 V | **±2 %** (4.90–5.10) | Legacy logic, ADC reference | LDO in SBC |
| V<sub>REF</sub> sensor supply | 5.00 V | **±1 %** (4.95–5.05) | TPS/MAP/pedal reference, current-limited 80–200 mA, short-protected | Dedicated tracking LDO |
| V<sub>DD3V3</sub> | 3.30 V | ±3 % | CAN/FlexRay transceivers, flash, SPI | LDO or second buck |
| V<sub>CORE</sub> | **1.25–1.30 V** (TriCore TC1x/TC2x), 1.5 V (some) | ±3 % | MCU core | Buck or high-current LDO |
| V<sub>DDM</sub> / analogue | 5.0 V filtered | ±1 % | Knock/analogue front end | RC or ferrite-filtered from 5 V |
| Standby / RTC | 3.0–3.3 V | — | Keep-alive, wake logic | Always-on LDO |

**The two easy misreads to avoid:**

- **KL15 is a signal, not a supply.** It tells the ECU to wake; it does not power the drivers. A car that is dead with the key on may simply have lost KL15 at the ignition switch — the ECU is innocent.
- **V<sub>CORE</sub> is legitimately low-impedance.** The MCU core draws a lot of current, so 20–300 Ω from V<sub>CORE</sub> to ground is *normal*. Beginners condemn boards on this reading. Always compare against a known-good board before calling a core rail shorted.

**Worked example — the tracking sensor reference.** The V<sub>REF</sub> that feeds your throttle, MAP, and pedal sensors is a separate, current-limited, short-protected 5 V regulator held to ±1 %. When a customer crushes a harness and shorts one sensor's 5 V feed to ground, the ECU's V<sub>REF</sub> collapses and *every* sensor on that reference reads implausible at once. The DTC list looks catastrophic; the fault is one pinched wire. Module 1's core skill is not panicking at a long DTC list — it is proving whether V<sub>REF</sub> is being dragged down inside the ECU or out in the harness (see §1.6, "ECU vs harness").

---

## 1.4 System Basis Chip, Main-Relay Latch & Flyback

### The System Basis Chip (SBC)

From roughly 2005, the discrete regulator + watchdog + CAN transceiver merged into a single package called an SBC. Common devices: **Infineon TLE926x/TLE9263, NXP UJA1169/UJA1075, ST L9788/L99xx, Bosch CJ-series ASICs.**

Diagnostic significance: an SBC stuck in reset or fail-safe pulls the whole ECU down and *looks* exactly like a dead MCU. The tell is a **watchdog reset loop** — watch V<sub>DD5</sub> on the scope: if it pulses at a fixed cadence (typically 50–500 ms), the SBC is repeatedly resetting the MCU, not sitting shorted. That single observation redirects you from "hunt for a short" to "why won't the MCU service its watchdog" (corrupt firmware, SPI failure to the SBC, sagging V<sub>CORE</sub>, or a dead crystal — the branch point handled in §1.6).

### The Main-Relay Afterrun Latch

An ECU does **not** lose power the instant you switch off. The sequence is:

1. KL15 goes high → ECU energises the main-relay coil through a low-side driver → V<sub>BAT</sub> reaches the drivers.
2. KL15 goes low → the ECU **holds** the relay closed for 2–120 s to write learned adaptations to EEPROM, park the throttle, run the cooling fan, and finish afterrun tasks.

**Failure mode:** if the ECU cannot hold the relay — open low-side driver, corroded relay contact, broken KL30 feed — power is yanked mid-write every key-off. Symptoms: adaptations reset every drive cycle, and, over time, a **corrupted EEPROM** from repeated interrupted writes. If a customer complains that the car "relearns itself" constantly, suspect the afterrun path before the software.

### Inductive Flyback / Freewheel Clamping

Every inductive load kicks back per **V = −L·di/dt** when its driver switches off. The clamp voltage is diagnostic — memorise these:

| Load | Inductance | Current | Clamp method | Clamp voltage |
|------|-----------|---------|--------------|---------------|
| Relay coil | 0.5–3 H | 80–180 mA | Freewheel diode across coil | ~0.7 V above V<sub>BAT</sub> |
| Solenoid valve (EGR, purge) | 20–100 mH | 0.5–1.5 A | Internal clamp in smart driver | **40–55 V** |
| Fuel injector (port, saturated) | **10–16 mH**, 12–16 Ω | 0.9–1.2 A | Driver active clamp | **60–72 V** |
| GDI injector (peak & hold) | 0.5–2 mH, 0.7–2 Ω | **6–12 A peak**, 2–4 A hold | Boost supply + clamp | Boost rail **60–90 V**, clamp 65–95 V |
| Ignition coil primary (IGBT) | 3–8 mH | 6–9 A dwell | IGBT active clamp | **350–420 V** |

**Reading the flyback.** A healthy injector switch-off shows a crisp spike up to the clamp level with a sharp knee. A **rounded, low spike (< 30 V)** means shorted turns in the injector coil or a failing clamp inside the driver. You capture exactly this in Lab 1.3.

### Grounds

ECUs use separated grounds bonded at a single star point: **power ground** (driver returns, tens of amps), **analogue/sensor ground** (microvolt-critical), **digital ground**, and **shield/chassis**. A corroded power ground dropping even **0.3 V** shifts every ground-referenced sensor and produces implausible, multi-system faults.

> **The ground rule for this whole course:** before condemning any module, prove **≤ 0.1 V** drop on the ground path and **≤ 0.3 V** drop on the supply path, measured at full load. Most "bad ECU" no-starts are bad grounds.

---

## 1.5 Tools & Equipment

| Tool | Specification | Why this spec |
|------|--------------|---------------|
| Bench power supply | 0–30 V / 0–5 A, **adjustable current limit**, CV/CC display, ≤ 5 mV ripple | Current limiting is the one feature that stops you turning a repairable board into scrap |
| Digital multimeter | True-RMS, 6000-count min, CAT III 600 V, µA range, diode test with **≥ 2.0 V** open-circuit | 2 V test voltage is needed to forward-bias two junctions in series |
| Milliohm meter / 4-wire | 0.1 mΩ resolution | Short-hunting on a copper plane |
| Thermal camera or IR thermometer | ≥ 160×120 px, 30 mK NETD, or FLIR ONE class | Finds the shorted part in seconds |
| Isopropanol (≥ 99 %) + brush | — | Evaporative short-finding (cold-spot method) |
| ESD workstation | 1 MΩ wrist strap, dissipative mat (10⁶–10⁹ Ω/sq), common bonding point | Mandatory |
| Bench harness | Fused KL30, switched KL15, ground, CAN H/L, 5 A blade fuse | Reusable across Modules 1–8 |
| Load bank | 4× 12 Ω 25 W (injector dummy), 4× 1 Ω 50 W (coil dummy) | Prevents driver damage when running a bare ECU |

The bench supply's **current limit** is the tool that defines whether you are a module-level technician or a component gambler. Everything in §1.6 depends on it.

---

## 1.6 Step-by-Step Procedure — "Dead ECU" Power Triage

> **Pre-flight:** ESD strap on, board on a dissipative mat, no ignition source near solvents, board de-energised, bulk capacitors discharged.

### Step 1 — Visual & olfactory
Under a 10–40× stereo microscope, look for burst electrolytics, cratered SOICs, dark discolouration around a driver bank, dendritic growth (a sign of water ingress), lifted pads, and connector-interface corrosion. Smell the board — burnt epoxy carries a distinctive odour and finds damage the eye misses.

### Step 2 — Static resistance map (board unpowered, DMM in Ω and diode mode)
Measure **each rail node to power ground** and compare to these healthy in-circuit readings:

| Rail | Healthy in-circuit reading | Interpretation |
|------|--------------------------|----------------|
| V<sub>BAT</sub> → GND | **> 1 kΩ**, often 5–100 kΩ with capacitive climb | < 20 Ω = shorted bulk cap, TVS, or driver |
| 5 V → GND | **1–20 kΩ**; diode mode 0.4–0.9 V | **< 5 Ω** = shorted decoupling cap or blown LDO pass element |
| 3.3 V → GND | 0.5–10 kΩ | < 3 Ω = shorted transceiver or flash |
| V<sub>CORE</sub> 1.3 V → GND | **20–300 Ω** (legitimately low) | Do not condemn on low ohms alone; compare to a known-good board |
| Sensor V<sub>REF</sub> → GND | 1–10 kΩ (in-vehicle with sensors: 200 Ω–2 kΩ) | Near 0 Ω *in the vehicle* = crushed harness, **not** the ECU |

Record every value on the **Pin Fingerprint** form. Building this reference database across boards is a graded deliverable — a known-good fingerprint is what makes a shorted rail obvious next time.

### Step 3 — Current-limited power-up
Set the bench PSU to **13.8 V, current limit 0.3 A**. Apply KL30 + GND only.
- Supply drops into CC at ~0 V → **hard short.** Go to Step 4.
- Draw **1–15 mA** → normal sleep. Raise the limit to 2 A, apply KL15, expect **150–600 mA** awake.
- Draw 50–200 mA with no KL15 → **parasitic leak** — a partially shorted TVS or a leaking driver output.

### Step 4 — Short localisation by thermal injection
Set the PSU to **1.5–2.0 V, current limit 2.0–3.0 A** and inject into the shorted rail. Ohm's law keeps power dissipation survivable while the shorted device heats up. Find it with the thermal camera, or paint the area with IPA and watch which component boils it off first (the cold-spot method). Confirm by lifting one end of the suspect part and re-measuring the rail.

### Step 5 — Rail-by-rail verification under power
Scope each rail DC-coupled for level and AC-coupled (with the 20 MHz bandwidth limit) for ripple:

| Measurement | Pass criterion |
|-------------|----------------|
| 5 V rail level | 4.90–5.10 V |
| 5 V ripple | **< 50 mV p-p** |
| 3.3 V ripple | < 40 mV p-p |
| V<sub>CORE</sub> ripple | < 30 mV p-p |
| Switcher node | Clean square, 300 kHz–2.2 MHz, no missing pulses |
| Reset line (MCU nRESET) | Rises to rail within 10–100 ms and **stays high** |

### Step 6 — Watchdog-loop discrimination
If the rails pulse rhythmically, the SBC is resetting the MCU. Causes, in order of likelihood: MCU not servicing the watchdog (corrupt firmware → Module 6), SBC↔MCU SPI communication failure, V<sub>CORE</sub> sagging under load, or a failed crystal (→ Module 4). This is the hand-off point out of "power" and into "processor."

---

## 1.7 Common Failure Modes

| Failure | Signature | Repair workflow |
|---------|-----------|-----------------|
| Reverse polarity | Blown reverse-protect FET/diode, burnt KL30 trace, dead SBC | Replace protection element **first**, power up current-limited; expect secondary SBC and CAN-transceiver damage |
| Shorted sensor 5 V (harness) | 0.0 V V<sub>REF</sub>, multiple implausible sensor DTCs | Disconnect ECU; measure V<sub>REF</sub> pin to ground at the vehicle connector. < 100 Ω = harness. ECU usually innocent |
| Sensor 5 V driver internally shorted | 0 V V<sub>REF</sub> **with ECU disconnected** from harness | Replace the tracking LDO / SBC channel |
| Failed bulk electrolytic | High ripple, brownout resets under load, ESR > 3× spec | Replace with 105 °C low-ESR polymer, correct polarity/height |
| Cold/cracked solder at connector pins | Intermittent no-start with vibration/temperature | Reflow with flux at 330 °C or full pin re-solder (Module 5) |
| Main-relay driver open | Loses adaptations every key-off, afterrun absent | Replace low-side driver; check freewheel diode |
| Corroded ground pin | 0.3–1.5 V ground offset, multi-system faults | Repin the connector; never "clean and hope" |

**The ECU-vs-harness decision (the money skill).** For any V<sub>REF</sub> or sensor-supply short: measure the suspect pin to ground **at the vehicle connector with the ECU unplugged.** Still shorted → it is the harness or a sensor; the ECU is innocent. Now measure the same rail **on the bench with the ECU alone** → shorted here means the internal driver/LDO is the fault. Two measurements settle what a hundred DTCs cannot.

---

## 1.8 Bench Labs

**Lab 1.1 — Rail Tree Reverse Engineering.** Given a donor ECU (Bosch ME7 or EDC16 class), produce a complete power-tree diagram: connector pin → protection → pre-regulator → each LDO → each consumer, with measured voltages and part numbers. *Deliverable:* annotated photo + block diagram + Pin Fingerprint table.

**Lab 1.2 — Short Hunting.** The instructor installs a covert short (an 0603 cap bridged with solder under conformal coating). Locate it using current-limited injection and thermal imaging in ≤ 20 min, removing no more than one component.

**Lab 1.3 — Flyback Capture.** With injector dummy loads on the bench harness, capture and measure the flyback clamp voltage of a saturated and a peak-and-hold driver. Compare against spec, then insert a partially shorted injector coil and document how the waveform changes.

**Lab 1.4 — Reverse-Polarity Post-Mortem.** On a scrap board, deliberately apply −13.8 V through a 5 A fuse for 2 s. Document every damaged device and reconstruct the failure-propagation path from the protection element outward.

---

## 1.9 Assessment

### Multiple-Choice Questions

**Q1.** Measured across CAN_H–CAN_L is a Module 3 topic, but on the supply side: you read **3 Ω from the 5 V rail to ground** on an unpowered board. The most likely cause is:
- A. Normal V<sub>CORE</sub> loading
- B. A shorted decoupling capacitor or a blown LDO pass element
- C. A missing main relay
- D. A dead crystal

**Q2.** A car loses its learned throttle adaptation after every key-off. The most likely root cause is:
- A. Corrupt flash in the MCU
- B. A failed CAN transceiver
- C. An open main-relay low-side driver (no afterrun hold)
- D. A cracked MLCC on the 3.3 V rail

**Q3.** During "dead ECU" triage you apply 13.8 V at a 0.3 A limit and the supply immediately drops into constant-current at ~0 V. Your next step is:
- A. Raise the limit to 5 A and force it on
- B. Reduce to 1.5–2.0 V at 2–3 A and localise the short thermally
- C. Reflash the ECU
- D. Replace the crystal

**Q4.** You see V<sub>DD5</sub> pulsing on and off at a fixed ~200 ms cadence. This indicates:
- A. A hard short on the 5 V rail
- B. A healthy sleeping ECU
- C. A watchdog reset loop (SBC repeatedly resetting the MCU)
- D. Normal afterrun behaviour

**Q5.** The correct pass criterion for 5 V-rail ripple, measured AC-coupled with the 20 MHz bandwidth limit, is:
- A. < 5 mV p-p
- B. < 50 mV p-p
- C. < 500 mV p-p
- D. Ripple is irrelevant on a logic rail

### Practical Scenarios

**Scenario A.** A vehicle arrives with a fault list showing implausible values from the MAP, TPS, and accelerator-pedal sensors simultaneously, plus a "sensor reference voltage low" code. The engine runs in limp mode. Describe, step by step, how you would determine whether the fault is inside the ECU or in the vehicle harness, and state the two specific measurements that settle it.

**Scenario B.** A bench ECU is completely dead: no communication, no relay click. Walk through your full triage from pre-flight to root cause, naming the instrument and the expected reading at each step, and explain how you would distinguish a shorted 5 V rail from a dead-crystal no-start.

---

### Answer Key

**Q1 — B.** On an unpowered board, 3 Ω from 5 V to ground is far below the healthy 1–20 kΩ; it points to a shorted decoupling capacitor (often a flex-cracked MLCC) or a failed LDO pass element. (A) is wrong because that low-impedance allowance applies to V<sub>CORE</sub>, not the 5 V logic rail.

**Q2 — C.** Adaptations are written to EEPROM during the afterrun hold. If the main-relay low-side driver is open, power is removed at key-off before the write completes, so the ECU relearns every cycle. Repeated interrupted writes can eventually corrupt the EEPROM outright.

**Q3 — B.** A hard short calls for low-voltage, current-limited thermal injection (1.5–2.0 V at 2–3 A) so the shorted device heats enough to find with a thermal camera without further damage. Forcing high current (A) destroys the board; (C) and (D) skip diagnosis entirely.

**Q4 — C.** A fixed-cadence pulse on the 5 V rail is the classic watchdog reset loop — the SBC brings the MCU up, the MCU fails to service the watchdog, and the SBC resets it, repeating. It is not a hard short (which would hold the rail down) nor normal sleep.

**Q5 — B.** The pass criterion is < 50 mV p-p on the 5 V rail. Excess ripple points to a tired bulk electrolytic (high ESR) or a switcher problem and causes brownout resets under load.

**Scenario A — model answer.** (1) Read the codes but do not trust the count — a collapsed V<sub>REF</sub> makes every sensor on that reference read implausible at once. (2) With the ignition off, unplug the ECU and measure the sensor-reference pin **to ground at the vehicle-side connector**: below ~100 Ω indicates a shorted harness or sensor — the ECU is innocent. (3) If that reading is healthy, put the ECU on the bench alone and measure the same V<sub>REF</sub> output pin to ground: a short here confirms the internal tracking LDO / SBC channel. **The two settling measurements are: V<sub>REF</sub>-to-ground at the vehicle connector (ECU unplugged) and V<sub>REF</sub>-to-ground on the bench (ECU isolated).** (4) Repair accordingly: harness repin/insulation for the former, LDO/SBC channel replacement for the latter, then re-verify V<sub>REF</sub> at 4.95–5.05 V under load.

**Scenario B — model answer.** Pre-flight (ESD strap, mat, caps discharged). **Step 1 visual/olfactory** under the microscope for burns, bulged caps, dendrites. **Step 2 static resistance map** — 5 V to ground should read 1–20 kΩ; a reading under 5 Ω flags a shorted 5 V rail immediately. **Step 3 current-limited power-up** at 13.8 V / 0.3 A: CC at ~0 V = hard short; 1–15 mA = normal sleep. **Step 4** if shorted, inject 1.5–2.0 V at 2–3 A and find the hot part thermally. **Step 5** if it powers, scope every rail for level and ripple, and confirm nRESET rises and stays high. **Distinguishing the two no-starts:** a shorted 5 V rail shows itself in Step 2 (ohms far too low) and Step 3 (instant CC) — the board never really powers. A dead-crystal no-start passes Steps 2–3 cleanly (rails come up, current is normal-awake) but in Step 5/6 the MCU reset line goes high with **no clock activity** and no watchdog pulsing — the processor has power but cannot run because it has no oscillator. That sends you to Module 4's crystal test, not to a short hunt.

---

*End of Module 1 study notes.*
