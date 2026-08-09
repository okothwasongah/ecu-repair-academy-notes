# Module 2 — Diagnostic Equipment Mastery
### ECU Repair Academy · Study Notes
**Skill Level: Beginner** · 10 h theory / 16 h lab · Prerequisite: Module 1

---

## 2.0 Learning Objectives

By the end of this module you will be able to:

1. Choose an oscilloscope by **bandwidth, sample rate, and memory depth** for a specific automotive signal, and explain why a "20 MHz automotive scope" cannot show you a CAN edge.
2. Select and compensate the correct **probe** for each measurement, and recognise the artefacts a bad ground lead injects.
3. Reproduce, from memory, the standard **capture settings** for the signals you meet daily — injectors, crank/cam, O₂, ignition, CAN, SPI, switcher nodes, rail ripple.
4. Use a **logic analyzer** to decode SPI/I²C/CAN/LIN inside an ECU and localise a fault to a driver ASIC before desoldering anything.
5. Apply **bench power-supply discipline** matched to the task — first power-up, normal running, flashing, short injection, crank simulation.

A technician is only as good as the picture their instruments give them. Most misdiagnoses at the bench come not from bad reasoning but from a scope set up so that the true signal never appeared on screen.

---

## 2.1 Oscilloscope Fundamentals

### Bandwidth and rise time

Rise time and bandwidth are linked by:

**t<sub>r</sub> ≈ 0.35 / BW**

So a 100 MHz scope resolves a 3.5 ns edge. And measured rise time is never the signal alone — it is the root-sum-square of signal, scope, and probe:

**t<sub>meas</sub> = √(t<sub>signal</sub>² + t<sub>scope</sub>² + t<sub>probe</sub>²)**

The practical consequence: a 20 MHz "automotive scope" has a rise time of ~17.5 ns and **fundamentally cannot show you a clean CAN edge (~50–100 ns) or an SPI clock.** It will round the edges into slopes and you will chase ringing and reflections that are artefacts of your instrument, not the circuit. For bus and digital work you need **≥ 100 MHz**.

### Sample rate

Nyquist (sample at twice the highest frequency) is only the theoretical floor for *detecting* a signal. To *reconstruct edges* accurately you want **5–10 samples per rise time.** For a 500 kbit/s CAN bus — bit time 2 µs, edges of 50–100 ns — budget **≥ 100 MS/s.**

### Memory depth

Memory depth decides whether you can capture a long intermittent at a useful sample rate:

**t<sub>capture</sub> = memory ÷ sample rate**

1 Mpts at 100 MS/s buys you only **10 ms** of capture. Catching a rough-running intermittent that appears over 30 s needs either very deep memory (≥ 100 Mpts) or **segmented acquisition**, which stores only the windows around each trigger and ignores the dead time between.

---

## 2.2 Probing

The probe is part of the measurement. Choose it deliberately:

| Probe | Use | Loading | Caution |
|-------|-----|---------|---------|
| 1:1 (200 mV/div floor) | Ripple, low-level sensors | 1 MΩ ∥ ~100 pF, ~6 MHz BW | Too slow for buses |
| 10:1 passive | General purpose | 10 MΩ ∥ 10–15 pF | **Must be compensated** against the 1 kHz square wave before every session |
| Ground spring (vs. 15 cm lead) | > 10 MHz signals | — | A long ground lead adds ~25 nH/inch → ringing that isn't in the circuit |
| Differential probe | CAN/FlexRay differential, floating nodes | — | Required for a true differential voltage |
| Current clamp 20 A (**100 mV/A**) | Injectors, small solenoids | — | Zero/degauss before each use |
| Current clamp 60/600 A (10 mV/A) | Starter, alternator, parasitic draw | — | Low resolution at low current |
| Secondary ignition attenuator | Coil secondary (kV) | — | **Never** probe secondary with a standard probe |

**Grounding discipline.** The scope chassis is earthed through the mains lead. Clipping the probe ground clip to a live rail creates a short circuit through the mains earth — this destroys probes, blows the fault, and can be dangerous. On a vehicle, always ground to battery negative or a proven chassis point, and reach for a **differential probe** whenever both nodes float (as CAN_H and CAN_L do).

**Probe compensation.** A 10:1 passive probe has a trimmer that matches its capacitance to the scope input. If it is not compensated against the scope's 1 kHz reference square wave, square edges will over- or under-shoot and every reading is subtly wrong. Compensate at the *start of every session* — Lab 2.1 shows you exactly how much the picture changes.

---

## 2.3 Standard Capture Settings Library

You should be able to set these up on demand without thinking. Learn the shape you expect *before* you connect, so a wrong picture jumps out at you.

| Signal | V/div | Time/div | Coupling | Trigger | Expected |
|--------|-------|----------|----------|---------|----------|
| Port injector voltage | 20 V/div | 2 ms/div | DC | Falling, 6 V | 14 V rail, pull to ~0.5 V for 2–5 ms, flyback 60–72 V |
| Port injector current (clamp) | 0.5 A/div | 1 ms/div | DC | Rising, 0.3 A | Ramp to 0.9–1.2 A, small "pintle bump" ~1.0 ms |
| GDI injector current | 2 A/div | 0.5 ms/div | DC | Rising, 1 A | Peak **6–12 A**, drop to hold 2–4 A |
| VR (inductive) crank sensor | 5 V/div | 5 ms/div | AC | Rising, 1 V | 0.5–2 V p-p cranking, 20–100 V p-p at rpm, sine with missing-tooth gap |
| Hall crank/cam | 2 V/div | 5 ms/div | DC | Falling, 2.5 V | 0 V ↔ 5 V (or 12 V), square, ≤ 200 ns edges |
| MAP sensor | 1 V/div | 100 ms/div | DC | — | 0.5 V idle vacuum → 4.5 V WOT (typ. 3-bar map) |
| Narrowband O₂ | 200 mV/div | 200 ms/div | DC | — | **0.1–0.9 V**, ≥ 8 crossings / 10 s at 2500 rpm |
| Wideband pump current | 1 mA/div | 500 ms/div | DC | — | ±2–3 mA around 0 at λ = 1 |
| Ignition primary | 100 V/div | 5 ms/div | DC | Falling | Dwell 1.5–5 ms, clamp 350–420 V, burn-line ripple |
| Throttle motor H-bridge | 5 V/div | 200 µs/div | DC | — | PWM 1–2 kHz, duty ∝ demand |
| CAN H / CAN L | 1 V/div | 10 µs/div | DC | Falling on CAN_H | See Module 3 |
| SPI (MCU↔driver IC) | 2 V/div | 2 µs/div | DC | CS falling | 1–10 MHz clock, clean 0/3.3 V |
| Switcher node | 5 V/div | 500 ns/div | DC | Rising | Square at 300 kHz–2.2 MHz, ≤ 100 ns edges |
| Rail ripple | 20 mV/div | 5 µs/div | **AC + 20 MHz BW limit** | — | < 50 mV p-p |

**Worked example — reading an injector.** On the voltage channel you expect the line to sit at battery (~14 V), get pulled to near ground for the 2–5 ms injection, then snap up to the 60–72 V clamp at switch-off. On the *current* channel (clamp) you expect a ramp to ~1 A with a tiny "pintle bump" where the injector mechanically opens. If the pintle bump is missing, the injector is stuck; if the flyback is a low rounded hump, the coil has shorted turns. Two channels, captured together, tell you electrical *and* mechanical health in one shot.

---

## 2.4 Logic Analyzer & Protocol Decode

- **Minimum spec:** 8–16 channels, ≥ 100 MS/s, threshold-adjustable for 3.3 V and 5 V logic, with SPI/I²C/UART/CAN/LIN decoders (Saleae Logic 8/Pro, DSLogic, or scope-integrated serial decode).
- **Sampling rule:** sample at ≥ 4× the fastest clock. A 10 MHz SPI clock needs ≥ 40 MS/s to see the bits and ~100 MS/s to catch setup/hold marginality.
- **Diagnostic use inside an ECU.** Decode the SPI conversation between the MCU and an injector/ignition driver ASIC. If the ASIC returns a **persistent fault bit** in its status frame, you have localised the failure to the driver silicon or its load — *before* desoldering anything. Decoding I²C to a 24Cxx EEPROM confirms whether the MCU is even reaching memory.
- **Threshold configuration matters.** Set 5 V thresholds on a 3.3 V bus and you get "no data" and a wasted afternoon. Always confirm the logic level first.

---

## 2.5 Bench Power-Supply Discipline

Match the supply to the task. The wrong current limit is either useless (misses the short) or destructive (blows the board):

| Task | Voltage | Current limit | Note |
|------|---------|---------------|------|
| First power-up, unknown board | 13.8 V | **0.3 A** | Detects hard shorts without damage |
| Normal operation | 13.8 V | 3 A | |
| Flashing / programming | **13.5 V, stable** | **≥ 5 A** | Voltage sag during a flash write is the #1 cause of a bricked ECU |
| Short injection | 1.5–2.0 V | 2–3 A | Thermal localisation |
| Crank simulation | Ramp 13.8 → 9.0 V | 5 A | Brownout-behaviour testing |

The **flashing** row carries into Module 6 — a sagging shop battery during a write is how ECUs get bricked. A regulated programming supply is not optional.

---

## 2.6 Bench Labs

**Lab 2.1 — Probe Compensation & Ground-Lead Artefact.** Capture the same 1 MHz square wave three ways: (a) uncompensated probe, (b) compensated with a 15 cm ground lead, (c) compensated with a ground spring. Measure the overshoot and ringing frequency in each, and explain the L-C circuit the ground loop forms.

**Lab 2.2 — Injector Signature Library.** Capture and archive voltage + current for a healthy port injector, a coil-shorted injector, and a high-resistance connection. Annotate and upload to the shared waveform library — this becomes course content.

**Lab 2.3 — Blind Waveform Identification.** Twenty anonymised captures: identify the signal, the vehicle system, and whether it is in or out of specification, with justification for each.

**Lab 2.4 — SPI Decode on a Live ECU.** Attach the logic analyzer to the MCU↔driver-ASIC bus of a running bench ECU. Decode the initialisation sequence, then induce an open-circuit injector and identify the exact status bit that changes.

---

## 2.7 Assessment

### Multiple-Choice Questions

**Q1.** You are trying to see whether a CAN bus has clean edges but only a 20 MHz scope is available. The main problem is:
- A. The scope's sample rate is too high
- B. The scope's rise time (~17.5 ns) is too slow to resolve the ~50–100 ns CAN edges, so it will round them
- C. CAN cannot be viewed on any oscilloscope
- D. You must use AC coupling

**Q2.** You need to capture a rough-running intermittent that appears over about 30 seconds without losing edge detail. The right approach is:
- A. Lower the sample rate to 1 kS/s
- B. Use segmented acquisition or very deep memory
- C. Use a 1:1 probe
- D. Trigger on the rising edge only

**Q3.** Measuring the differential voltage on CAN_H and CAN_L, the correct probe choice is:
- A. A 1:1 passive probe
- B. A secondary ignition attenuator
- C. A differential probe
- D. A 60/600 A current clamp

**Q4.** Before flashing an ECU on the bench, the correct supply setting is:
- A. 13.8 V at a 0.3 A limit
- B. 1.5 V at a 2 A limit
- C. 13.5 V, stable, at ≥ 5 A
- D. 9.0 V at 5 A

**Q5.** A logic analyzer connected to an internal SPI bus shows "no data" even though the ECU is running. The most likely setup error is:
- A. Too many channels enabled
- B. The logic threshold is set for 5 V on a 3.3 V bus
- C. The decoder is set to CAN instead of SPI
- D. The ground spring is too short

### Practical Scenarios

**Scenario A.** A colleague reports that every injector waveform on a particular car "looks like it's ringing badly" and suspects failing injectors. When you look at their setup you see a 10:1 probe with a 15 cm ground lead, never compensated. Explain what is really happening, how you would prove it, and what the correct setup is.

**Scenario B.** You suspect an injector-driver ASIC on a bench ECU but do not want to desolder it on a guess. Describe how you would use the oscilloscope and logic analyzer together to confirm the ASIC (rather than the injector or harness) is at fault before removing anything.

---

### Answer Key

**Q1 — B.** Bandwidth sets rise time via t<sub>r</sub> ≈ 0.35/BW; a 20 MHz scope resolves only ~17.5 ns, far slower than CAN edges, so it rounds them and invents slope where the real signal is crisp. You need ≥ 100 MHz for bus work.

**Q2 — B.** Capture time = memory ÷ sample rate, so a long event at high sample rate needs deep memory or segmented acquisition, which records only the windows around each trigger. Dropping the sample rate (A) throws away the edge detail you are trying to keep.

**Q3 — C.** CAN_H and CAN_L are a differential pair referenced to neither ground; a differential probe measures the true H−L voltage safely. A single-ended 1:1 probe misreads and its ground clip can short the bus.

**Q4 — C.** Flashing demands a stable 13.5 V at ≥ 5 A. Voltage sag mid-write is the leading cause of a bricked ECU. The 0.3 A and 1.5 V settings belong to triage and short injection.

**Q5 — B.** A 3.3 V bus read with a 5 V logic threshold never crosses the threshold, so the analyzer sees flat lines and reports no data. Confirm the logic level and set the threshold accordingly.

**Scenario A — model answer.** The "ringing" is almost certainly a measurement artefact, not the injectors. An uncompensated 10:1 probe mismatches the scope input capacitance, and a 15 cm ground lead adds roughly 25 nH per inch of inductance, forming an L-C tank with the probe tip capacitance that rings on every fast edge. **To prove it:** compensate the probe against the scope's 1 kHz square wave, then re-capture — the square should have flat tops. Replace the ground lead with a ground spring and the high-frequency ringing collapses. Capture the same injector before and after; the "fault" disappears with the setup change, proving the injectors were healthy. **Correct setup:** compensated 10:1 probe, ground spring (or shortest possible ground), appropriate V/div and time/div from the capture library, DC coupling, trigger on the falling edge at ~6 V.

**Scenario B — model answer.** (1) With the scope, confirm the driver's *output* behaviour: on the injector pin you should see the pull-to-ground during injection and the 60–72 V flyback at switch-off. If the output never switches, the driver or its command is suspect. (2) With the logic analyzer on the MCU↔ASIC SPI bus, decode the command frames and the ASIC's status frames. Capture the baseline, then induce the open-circuit injector: a healthy ASIC reports the changed condition in a status bit (e.g. open-load flag). (3) The confirming logic: if the MCU is issuing correct SPI commands (TXD toggling as decoded) **and** the ASIC either fails to drive the output or returns a persistent internal-fault bit unrelated to the load, the fault is in the driver silicon — desolder with confidence. If instead the ASIC flags open-load only when you create the open, the ASIC is healthy and the fault is the injector or harness. Two instruments, no guesswork, no premature desoldering.

---

*End of Module 2 study notes.*
