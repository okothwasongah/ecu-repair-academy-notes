# Module 6 — Microcontrollers, Memory & Flashing
### ECU Repair Academy · Study Notes
**Skill Level: Advanced** · 16 h theory / 24 h lab · Prerequisite: Modules 4, 5

---

## 6.0 Learning Objectives

By the end of this module you will be able to:

1. Identify the major **automotive MCU families** and the access method each supports.
2. Describe the **memory taxonomy** of an ECU — internal flash, external EEPROM, external NOR — and what each holds.
3. Choose the right **access method** (OBD, bench/boot, BDM/JTAG, in-circuit clip, desolder) for a given task.
4. Understand the **UDS security model** ($10/$27/$34-36-37/$31) and its legitimate use.
5. Follow **flashing discipline** that avoids bricking, and execute a **bricked-flash recovery** from a verified backup.

This module is where "electronics repair" becomes "ECU repair." The single most important habit it teaches is boring and non-negotiable: **no backup, no write.** Everything else is recoverable if you have a verified original in hand.

---

## 6.1 Automotive MCU Families

| Family | Core | Typical use | Access notes |
|--------|------|-------------|--------------|
| **Freescale/NXP MPC5xx** (MPC555/561/562) | PowerPC | Bosch ME7/EDC15/EDC16 era | BDM (Background Debug Mode) header; well-documented |
| **NXP MPC55xx/56xx** | PowerPC e200 | EDC17, MED17 (Bosch) | JTAG/Nexus |
| **Infineon TriCore TC17xx** | TriCore | EDC16/EDC17, MED9/MED17 | Boot/BSL, JTAG, OCDS |
| **Infineon TriCore TC2xx/TC3xx** | TriCore | MD1/MG1 (Bosch, current) | Encrypted bootloaders, secured — often OEM-tool only |
| **Renesas / SH7058, RH850** | SuperH / RH850 | Denso, Hitachi, current | Denso "diag/boot" pin methods |
| **ST10 / C167 (ST/Infineon)** | C166 | Older Marelli, Siemens | Bootstrap loader via serial |

The trend across generations is clear: older families (MPC5xx, ST10) are open and well-documented; current families (TC2xx/TC3xx) carry **encrypted bootloaders and cryptographic security**, so full access is increasingly an OEM-authorised operation, not a bench trick. Knowing where a given ECU sits on that spectrum tells you whether a repair is a bench job or a dealer job.

---

## 6.2 Memory Taxonomy

- **Internal flash** (program + data flash inside the MCU) — holds the running firmware and calibration on modern integrated ECUs.
- **External serial EEPROM** (24Cxx I²C, 93Cxx / 95xxx SPI) — holds immobiliser data, adaptations, VIN, odometer, and coding. This is the "identity" of the car.
- **External NOR flash** (parallel or SPI, 29Fxx/S29xx) — program storage on ECUs that keep code off-chip.
- **NAND** — rare in engine ECUs; common in infotainment/telematics.

The distinction that matters for repair: **firmware** (in flash) makes the ECU *run*; **identity/adaptation data** (in external EEPROM) makes it run *in this particular car*. A module transplant that copies one but not the other will either not boot or not start.

---

## 6.3 Access Methods — When to Use What

| Method | What it is | When |
|--------|-----------|------|
| **OBD flash** | Reprogramming through the DLC with an OEM/aftermarket tool + correct security access (SA seed/key, UDS $27) | Official updates, most calibration writes; least invasive |
| **Bench / boot mode** | ECU removed, on a bench harness, forced into the bootloader via a specific pin sequence | Recovery, full read/write when OBD is locked or the ECU won't boot |
| **BDM / JTAG / Nexus** | Direct debug interface to the MCU via pads/header | Full internal memory when supported and unencrypted |
| **In-circuit memory clip** | SOIC-8 test clip onto an external EEPROM/flash while powered or on the bench | Reading/writing external EEPROM without desoldering |
| **Desolder + programmer** | Remove the chip, read on a universal programmer | When in-circuit fails, or the chip is dead or must be cloned to a new part |

**UDS / security context.** Modern ECUs gate write access behind ISO 14229 (UDS): `$10` diagnostic session control, `$27` security access (seed → key), `$34/$36/$37` request/transfer/exit download, `$31` routine control (erase, checksum). The seed/key algorithm is the security barrier. **This course teaches the protocol mechanics and their legitimate use — dealer-level reprogramming and verified module replacement. It does not supply seed/key crack tools or bypasses for security you are not authorised to access.**

---

## 6.4 Flashing Discipline — Avoiding a Brick

1. **Power first.** A regulated **13.5 V, ≥ 5 A, low-ripple** supply — a battery maintainer or programming supply, never a sagging shop battery. Voltage dropout mid-write is the leading cause of a bricked ECU.
2. **Full backup before any write.** Read and save the complete original — internal flash + external EEPROM + calibration — with a verified checksum. **No backup, no write.**
3. **Verify the file matches the hardware** — part number, MCU, region — before flashing.
4. **Stable comms** — good ground, short leads, no other loads waking the bus mid-write.
5. **Never interrupt** an erase/write. If it fails, do not blindly power-cycle; re-establish the bootloader and re-attempt from the backup.

---

## 6.5 Bricked-Flash Recovery Workflow

1. **Symptom triage (Module 1):** rails good? reset loop? crystal alive? — rule out a hardware fault first, because a "brick" is sometimes a dead crystal.
2. Attempt to **re-enter the bootloader / boot mode** on the bench.
3. If the MCU responds in boot mode, **re-write from your verified backup.**
4. If OBD/boot is dead but the MCU is alive, use **BDM/JTAG** where supported.
5. If the internal flash is corrupt but the MCU is otherwise healthy, re-flash internal memory via the debug interface using a **known-good dump matched to that exact hardware and immo data.**
6. If the MCU itself is dead, transplant to a **donor of identical hardware**, migrate the external EEPROM (immo/adaptation) so the "new" ECU keeps the car's identity, then reflash. (This bridges into Module 7.)

---

## 6.6 Common Failure Modes

| Failure | Cause | Recovery |
|---------|-------|----------|
| Bricked during OBD update | Voltage sag, comms drop | Boot-mode recovery from backup |
| Corrupt EEPROM (adaptations lost) | Afterrun power loss (Module 1) | Restore EEPROM from backup or rebuild via coding |
| Checksum error after edit | Edited without recomputing checksum | Recompute and re-write (Module 7) |
| Dead flash cells | Wear / age | Chip replacement + reflash |
| Locked/secured MCU | OEM security | Use the authorised OEM path; not defeatable in this course |

---

## 6.7 Bench Labs

**Lab 6.1 — Full Backup & Restore.** Read the internal + external memory of a bench ECU, verify checksums, write it back, and confirm it is identical. Prove your backup discipline before you are ever allowed to edit.

**Lab 6.2 — In-Circuit EEPROM Read.** Clip onto a 95xxx SPI EEPROM, read it, and identify the VIN / odometer / coding regions as data structures (read-only exercise).

**Lab 6.3 — Boot-Mode Entry.** Put three different ECU families into boot mode using the correct pin methods, and read the device ID from each.

**Lab 6.4 — Recover a Bricked Bench ECU** (instructor-bricked from a known backup) via boot mode. Capstone.

---

## 6.8 Assessment

### Multiple-Choice Questions

**Q1.** The single most important rule before writing any ECU is:
- A. Use the fastest programmer available
- B. Take a full, checksum-verified backup — no backup, no write
- C. Disconnect the battery
- D. Recompute the checksum first

**Q2.** During an OBD flash the supply voltage sags and the write fails. The most likely result and correct response is:
- A. No harm; just re-run the update from a cold start
- B. A bricked ECU; re-establish the bootloader and recover from the verified backup
- C. A dead crystal; replace it
- D. A shorted 5 V rail; inject current

**Q3.** The car's immobiliser data, VIN, and adaptations are typically stored in:
- A. Internal MCU flash only
- B. External serial EEPROM (e.g. 95xxx SPI / 24Cxx I²C)
- C. External NOR program flash
- D. NAND

**Q4.** In UDS, security access (seed → key) before a write is service:
- A. $10
- B. $27
- C. $34
- D. $31

**Q5.** A modern TC2xx/TC3xx-based ECU with an encrypted bootloader needs a full internal-flash write. The appropriate path is:
- A. Crack the seed/key on the bench
- B. Use the authorised OEM/dealer path — it is not defeatable in this course
- C. Desolder and read on a universal programmer
- D. BDM without security

### Practical Scenarios

**Scenario A.** A workshop hands you an ECU that was "half updated" — the customer's tool lost connection mid-flash and now the ECU is dead. Walk through your recovery process from the moment it lands on your bench, and state where a good backup does and does not save you.

**Scenario B.** You are asked to prepare for a routine calibration write on an EDC16-class ECU. Describe your full setup and discipline — power, backup, verification, comms — and explain the specific consequence of getting each one wrong.

---

### Answer Key

**Q1 — B.** No backup, no write. A verified full backup makes almost every flashing accident recoverable; without one, a failed write can be terminal.

**Q2 — B.** A sag mid-write typically bricks the ECU. The recovery is to re-establish the bootloader/boot mode and re-write from the verified backup — which is exactly why the backup and a stable ≥ 5 A supply are mandatory.

**Q3 — B.** Identity and adaptation data live in the external serial EEPROM, separate from the firmware in flash. That separation is why a transplant must migrate the EEPROM, not just copy the flash.

**Q4 — B.** $27 is security access (seed/key). $10 is session control, $34/$36/$37 are the download transfer sequence, $31 is routine control (erase, checksum).

**Q5 — B.** An encrypted, secured bootloader is an OEM-authorised operation. The course teaches the mechanics and legitimate use but does not defeat security you are not authorised to access.

**Scenario A — model answer.** (1) **Hardware triage first (Module 1):** confirm rails are good, the crystal is alive, and there is no watchdog reset loop — occasionally a "brick" is actually a hardware fault, and you must not assume corruption. (2) **Attempt bootloader entry** on the bench via the correct boot-mode pin method for that family. (3) If it responds, **re-write from a verified backup.** Here is where the backup saves you: if *you* have a matching, checksum-verified dump (your own or a correct known-good matched to this exact hardware and immo data), recovery is straightforward. (4) If the MCU responds only over **BDM/JTAG**, use that to restore internal flash. (5) **Where a backup does *not* save you:** if no backup exists and the ECU is secured/encrypted, or if the corrupt write also damaged the immo/EEPROM identity with no source to restore from — then you are into a matched-donor transplant + EEPROM migration (Module 7), or an OEM-authorised reprogram. The lesson: the *customer's* missing backup is why this is hard; your discipline is to never create that situation.

**Scenario B — model answer.** **Power:** regulated 13.5 V at ≥ 5 A, low ripple, from a programming supply — a sag mid-write bricks the ECU. **Backup:** read and save internal flash + external EEPROM + calibration with verified checksums *before* any write — without it a failed or wrong write is unrecoverable. **File/hardware match:** confirm the calibration file matches the exact part number, MCU, and region — flashing a mismatched file gives wrong maps, drivability faults, or a no-run. **Comms:** solid ground, short leads, and nothing else waking the bus mid-write — a dropped frame during transfer corrupts the write. **Never interrupt** the erase/write; if it fails, re-establish the bootloader and restore from backup rather than power-cycling blindly. Each failure maps to a specific, avoidable brick.

---

*End of Module 6 study notes.*
