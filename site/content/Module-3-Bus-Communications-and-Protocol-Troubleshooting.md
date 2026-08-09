# Module 3 — Bus Communications & Protocol Troubleshooting
### ECU Repair Academy · Study Notes
**Skill Level: Intermediate** · 12 h theory / 16 h lab · Prerequisite: Modules 1, 2

---

## 3.0 Learning Objectives

By the end of this module you will be able to:

1. State the exact **physical-layer voltages** for high-speed CAN, and apply the **60 Ω termination rule** correctly (and know when it does *not* apply).
2. Work through a structured **CAN troubleshooting protocol** from resistance measurement to bit-level error-frame analysis.
3. Recognise and test **LIN, K-Line, FlexRay**, and identify **MOST and automotive Ethernet** at awareness level.
4. Confirm a faulty **bus transceiver** with evidence and replace it cleanly, restoring communication.

Communication faults feel mysterious — "the module won't talk" — but they resolve into a small number of physical-layer conditions you can measure. The discipline is to reach for the multimeter and scope before the diagnostic tool's guesswork.

---

## 3.1 CAN — Physical Layer (ISO 11898-2, High-Speed)

CAN signals differentially. Two lines, CAN_H and CAN_L, both idle at 2.5 V (recessive) and split apart to signal a dominant bit:

| Parameter | Recessive | Dominant |
|-----------|-----------|----------|
| CAN_H | **2.5 V** | **3.5 V** (3.0–4.5 V) |
| CAN_L | **2.5 V** | **1.5 V** (0.5–2.25 V) |
| Differential (V<sub>H</sub> − V<sub>L</sub>) | **−0.5 to +0.05 V** (nominally 0 V) | **1.5–3.0 V** (nominally 2.0 V) |

**Termination and the 60 Ω rule.** Each physical end of the backbone carries a **120 Ω ±1 %** terminator. Two 120 Ω resistors in parallel present **60 Ω measured across CAN_H–CAN_L with the vehicle asleep.** This single measurement is the fastest CAN health check you own:

- **60 Ω** → both terminators present, wiring intact.
- **120 Ω** → one terminator lost or one end open.
- **40 Ω** → an *extra* terminator, common after a retrofit or a wrongly-added module.
- **< 10 Ω** → the pair is shorted together or to something.

**Split termination.** Many modules use 2 × 60 Ω in series with the midpoint decoupled to ground through a **4.7 nF** capacitor, which improves common-mode emissions. Do not mistake the 60 Ω half-network for a failed 120 Ω terminator.

**Bit rates and lengths.** 500 kbit/s powertrain (bit time 2 µs), 250 kbit/s chassis/commercial, 125 kbit/s comfort, 33.3 kbit/s single-wire GMLAN. **CAN FD** runs arbitration at 500 kbit/s and a data phase of 2–8 Mbit/s. Bus length is propagation-limited: roughly 40 m at 1 Mbit/s, 100 m at 500 kbit/s, 500 m at 125 kbit/s.

**Transceivers.** TJA1050/1040/1042/1043/1044, MCP2551/2562, NCV7340, PCA82C250 — usually SO-8. Standard SO-8 pinout: 1 TXD, 2 GND, 3 V<sub>CC</sub>, 4 RXD, 5 V<sub>REF</sub>/V<sub>IO</sub>, 6 CAN_L, 7 CAN_H, 8 STB/S.

**Low-speed fault-tolerant CAN (ISO 11898-3)** is a different animal: CAN_H idles at 0 V and drives to ~3.6 V; CAN_L idles at 5 V and drives to ~1.4 V; termination is distributed (500 Ω–16 kΩ per node); and the bus keeps running single-wire after a fault. **Do not apply the 60 Ω rule here** — you will misdiagnose a healthy low-speed bus.

---

## 3.2 CAN Troubleshooting Protocol

### Step 1 — Resistance (all modules asleep, battery disconnected or ≥ 5 min sleep)
Measure H–L at the DLC (pins 6 and 14): expect **60 Ω**. Then measure H–GND and L–GND: expect **> 1 MΩ**. Leakage below ~10 kΩ to ground indicates a water-intruded connector.

### Step 2 — Scope both lines together (referenced to battery negative)
1 V/div, 10 µs/div, trigger on CAN_H falling edge. Read the picture against this table:

| Observation | Diagnosis |
|-------------|-----------|
| Perfect mirror about 2.5 V, clean edges | Healthy |
| CAN_H stuck at 2.5 V, CAN_L active | CAN_H open, or that transceiver's H output failed |
| Both stuck at 0 V | Bus shorted to ground, or a transceiver latched dominant |
| Both stuck at 12 V | CAN shorted to battery — expect multiple destroyed transceivers |
| Signal present but rounded, slow edges | Missing termination or excessive stub length |
| Correct shape, amplitude only ~1 V differential | Extra terminator / stub-connected module |
| Frames present but no ACK slot pulled dominant | Only one node alive — the ECU transmits, nobody hears it |
| Continuous dominant | A node with a failed transceiver output stage or a stuck TXD |

### Step 3 — Node isolation
Disconnect modules one at a time (or unclip the ring) while watching the bus recover. On a star topology, isolate at the gateway.

### Step 4 — Bit-level analysis
Decode the frame and look for **error frames** (six consecutive dominant bits) and note which node generates them. A high error-frame rate *with correct voltages* usually means clock/oscillator drift on one node — a crystal-loading problem (Module 4), not wiring.

**Worked example — the "no ACK" trap.** A workshop replaces an engine ECU; it powers up and transmits, but nothing responds. On the scope the frames look correct in shape but you never see another node pull the ACK slot dominant. That is not a wiring fault — it is a *lonely node*. Either the rest of the bus is asleep/unpowered, the gateway is down, or the replacement ECU is on the wrong bus segment. The physical layer is fine; the topology or power to the other modules is the issue.

---

## 3.3 LIN (ISO 17987)

LIN is the cheap single-wire sub-bus for mirrors, small motors, and comfort actuators:

| Parameter | Value |
|-----------|-------|
| Topology | Single wire + ground, one master, up to 15 slaves |
| Bit rate | 1–20 kbit/s (**19.2 kbit/s** most common; 9.6 kbit/s also frequent) |
| Recessive | ≥ **0.8 × V<sub>BAT</sub>** (~11 V) |
| Dominant | ≤ **0.2 × V<sub>BAT</sub>** (~2 V) |
| Master pull-up | **1 kΩ + series diode** to V<sub>BAT</sub> |
| Slave pull-up | **30 kΩ + diode** |
| Frame | Break (≥ 13 dominant bits) → Sync 0x55 → PID → 2/4/8 data bytes → checksum |
| Transceivers | TJA1020/1021/1027, MC33660, L9637 |

**Scope settings:** 5 V/div, 1 ms/div, DC, trigger falling at 6 V. Diagnostic tells: *no break field* = master dead; *break present but no slave response* = slave dead or unpowered; *slow rise on the recessive edge* = missing master pull-up (measure ~1 kΩ from LIN to V<sub>BAT</sub>) or excessive bus capacitance.

---

## 3.4 K-Line (ISO 9141-2 / ISO 14230 KWP2000)

A single bidirectional wire, ~10.4 kbit/s, 0 V/12 V levels, with a ~510 Ω pull-up to V<sub>BAT</sub>. Initialisation is either **5-baud init** (an address byte such as 0x33 sent at 5 bit/s, then 0x55 sync and two key bytes) or **fast init** (a 25 ms low / 25 ms high wake pattern). The interface IC is usually an **L9637** or MC33290 in SO-8 — failure of this small chip is a very common "module runs fine but won't communicate" fault on 1996–2006 vehicles.

---

## 3.5 FlexRay (ISO 17458)

| Parameter | Value |
|-----------|-------|
| Data rate | **10 Mbit/s** per channel (2.5/5 Mbit/s also defined) |
| Channels | A and B (BP/BM pairs), redundant or doubled bandwidth |
| Idle level | ~2.5 V both lines |
| Differential data | ±**600 mV** typical (±300 mV min at receiver) |
| Termination | **80–110 Ω** across BP/BM at each end |
| Topology | Bus, star (active star ICs), or hybrid |
| Transceivers | TJA1080/1081/1082, AS8221 |
| Timing | TDMA, static + dynamic segments, cycle typically 5 ms |

Physical-layer testing needs a **≥ 200 MHz scope and a differential probe**: measure the eye opening, check the idle offset, and verify termination with the network asleep. Any single-ended reading here misleads.

---

## 3.6 MOST & Automotive Ethernet (Awareness Level)

- **MOST25/50/150** is a **plastic optical-fibre ring** at 650 nm. Test it with an optical power meter and the OEM ring-break diagnostic — **never with a DMM.** A single dirty connector breaks the whole ring; the ring-break diagnosis identifies the node *after* the break.
- **100BASE-T1 / 1000BASE-T1** is a single unshielded twisted pair, full duplex, PAM3 (100 Mbit/s). It needs a media converter and a specialised probe head; in the field, inspect the twisted pair and read the link-partner LED status.

---

## 3.7 Transceiver Replacement Workflow

1. **Confirm the transceiver — not the harness.** Power the ECU on the bench in isolation and check for correct recessive **2.5 V** on both CAN lines with **no** bus attached.
2. Verify V<sub>CC</sub> (5 V) and V<sub>IO</sub> (3.3 V) at the transceiver pins, and the STB/EN state.
3. Confirm TXD from the MCU is toggling (logic analyzer) while CAN_H/L stay dead → the transceiver is proven faulty.
4. Remove conformal coating locally (Module 5), desolder the SO-8 with hot air at **380 °C, low airflow**, board preheated to 150 °C.
5. Clean the pads, tin, place the new device, solder at **330 °C** (leaded) with no-clean flux, inspect under 40×.
6. Re-verify the **60 Ω**, recessive **2.5 V**, and a live frame capture. Re-coat.

---

## 3.8 Bench Labs

**Lab 3.1 — Build a Two-Node CAN Bench.** Two ECUs, correct termination, 500 kbit/s. Measure the 60 Ω, capture a healthy frame, and identify the ACK bit visually on the scope.

**Lab 3.2 — Fault-Injection Matrix.** Systematically introduce: open CAN_H, open CAN_L, H→GND, L→GND, H→L, H→12 V, one terminator removed, one extra terminator added. Record the voltage table and scope image for all eight — this becomes your personal fault-signature reference card.

**Lab 3.3 — LIN Slave Silence.** Given a LIN network with a non-responding slave, determine — using scope evidence only, in ≤ 15 min — whether the fault is the master pull-up, wiring, slave supply, or slave silicon.

**Lab 3.4 — Transceiver Transplant.** Replace a deliberately destroyed TJA1042 on a scrap board and restore communication. Graded on joint quality (IPC-A-610 Class 2), absence of collateral damage, and functional verification.

---

## 3.9 Assessment

### Multiple-Choice Questions

**Q1.** With the vehicle asleep you measure **40 Ω** across CAN_H–CAN_L. The most likely cause is:
- A. One terminator has gone open
- B. An extra terminator has been added to the bus
- C. The bus is shorted to ground
- D. Normal for a healthy 500 kbit/s bus

**Q2.** On a high-speed CAN bus, CAN_H sits stuck at 2.5 V while CAN_L is active. This points to:
- A. A shorted pair
- B. CAN_H open or that transceiver's H output failed
- C. An extra terminator
- D. A dead master

**Q3.** You measure a healthy 60 Ω and see correctly-shaped frames, but no node ever pulls the ACK slot dominant. This means:
- A. The wiring is shorted
- B. The termination is missing
- C. Only one node is alive — it transmits but nothing acknowledges
- D. The bus is shorted to 12 V

**Q4.** A LIN sub-bus shows a break field and sync but the addressed slave never responds. The fault is most likely:
- A. A missing master pull-up
- B. The slave is dead or unpowered
- C. A shorted CAN terminator
- D. Excessive bus capacitance on the master

**Q5.** For MOST25 fibre-ring diagnosis you should use:
- A. A DMM in diode mode
- B. A 60 Ω resistance check
- C. An optical power meter and the OEM ring-break diagnostic
- D. A differential probe at 200 MHz

### Practical Scenarios

**Scenario A.** A vehicle has multiple "lost communication" DTCs across several modules after a recent aftermarket accessory install. Describe your CAN troubleshooting sequence from the first resistance measurement onward, and state what an extra-terminator fault would look like at each step.

**Scenario B.** An ECU on the bench will not communicate, but the engine management appears otherwise healthy. Explain how you would confirm the CAN transceiver (rather than the MCU or the wiring) is the fault, and outline the replacement and verification steps.

---

### Answer Key

**Q1 — B.** 40 Ω is below the healthy 60 Ω, which means more than two 120 Ω terminators are in parallel — an extra terminator, typical after an aftermarket module is spliced in. An open terminator would raise the reading to 120 Ω, not lower it.

**Q2 — B.** If CAN_H cannot reach its dominant 3.5 V while CAN_L still swings, the H side is open or that transceiver's high-side output has failed. A shorted pair or short to 12 V would move both lines together.

**Q3 — C.** Correct shape plus healthy termination but no ACK means the transmitting node is alone — the other modules are asleep, unpowered, off-segment, or the gateway is down. It is a topology/power problem, not a physical-layer wiring fault.

**Q4 — B.** Break and sync prove the master is alive and the pull-up is working. The failure is downstream: the addressed slave is dead or unpowered. A missing pull-up would corrupt the recessive level and the break itself.

**Q5 — C.** MOST is an optical ring; you test it optically with a power meter and the ring-break diagnostic. Electrical tools (DMM, 60 Ω check, differential probe) do not apply to fibre.

**Scenario A — model answer.** (1) **Resistance first:** with everything asleep, measure H–L at the DLC. A newly-added accessory that spliced in its own terminator will read ~40 Ω instead of 60 Ω — the immediate tell. Also check H–GND and L–GND for the water/short case. (2) **Scope both lines:** an extra terminator loads the bus, so the differential amplitude drops (you may see ~1 V differential instead of ~2 V) and edges soften — marginal signalling that drops modules intermittently. (3) **Isolate:** disconnect the accessory; the resistance should return to 60 Ω and the amplitude recover. (4) **Verify:** re-capture a clean frame and confirm all modules re-appear. The root cause is the accessory's added termination overloading the bus; the fix is to remove or correct it, not to replace modules.

**Scenario B — model answer.** (1) Put the ECU on the bench in isolation with the standard harness and **no bus attached**; scope CAN_H and CAN_L — a healthy transceiver holds both at recessive **2.5 V**. If they sit at 0 V, 12 V, or float, the transceiver is suspect. (2) Verify the transceiver has its supplies: V<sub>CC</sub> 5 V, V<sub>IO</sub> 3.3 V, and the correct STB/EN state — a transceiver in standby looks dead but is fine. (3) With the logic analyzer, confirm the **MCU's TXD is toggling** while CAN_H/L stay static — that proves the MCU is trying to talk and the transceiver is not driving the bus: transceiver confirmed faulty. (4) **Replace:** remove conformal coating locally, desolder the SO-8 at 380 °C low airflow over a 150 °C preheat, clean and tin the pads, fit the new device at 330 °C with no-clean flux, inspect under 40×. (5) **Verify:** recessive 2.5 V restored, 60 Ω correct with a bus attached, and a live frame captured with a proper ACK. Re-coat.

---

*End of Module 3 study notes.*
