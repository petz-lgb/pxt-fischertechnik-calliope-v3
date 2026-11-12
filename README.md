> **⚠️ This extension is vibe-coded.**
>
> This extension was developed with the assistance of AI ("vibe coding"). Its source code has not yet been fully verified in the MakeCode online compiler or tested on physical hardware. **Please review and test it before using it in lessons.**

# fischertechnik Calliope – MakeCode Extension (v0.1.5)

A collection of child-friendly programming blocks for the **fischertechnik Calliope** construction kit, designed for **Calliope mini V3** in Microsoft MakeCode.

## Unofficial MakeCode extension

This independently developed extension provides simplified programming blocks for use with the fischertechnik Calliope construction kit and the Calliope mini V3.

This project is not officially affiliated with, endorsed by, or supported by fischertechnik GmbH or Calliope gGmbH.

All product names and trademarks mentioned are used solely to describe compatibility.

## The five programming blocks

| Block | Type | Function |
|---|---|---|
| **LED [P0] [ON/OFF/TOGGLE]** | Command | Sets the output to digital 1 or 0, or toggles the last state written by this extension |
| **Motor [M1/M2] turns [↶ LEFT/↷ RIGHT] at [TURBO/FAST/MEDIUM/SLOW/STOP]** | Command | Controls the Calliope motor drivers at 100/75/50/25/0%; block M1 corresponds to physical M0, block M2 to physical M1 |
| **Light sensor pin [P1/P2] detects at least [BRIGHT/MEDIUM/DIM]** | Boolean | Checks whether the analog reading meets the selected light threshold |
| **Light barrier LED [P0] sensor [P2] is [BLOCKED/CLEAR] at [BRIGHT/MEDIUM/DIM]** | Boolean | Switches on the emitter LED and evaluates the phototransistor |
| **Push button [P3] is [PRESSED/NOT PRESSED]** | Boolean | Reads a digital input with a pull-down resistor; the normally open switch connects 3 V to the pin when pressed |

The **Sensors** group also contains two advanced calibration blocks: `Light level [..] threshold [..]` and `Light sensor pin [..] reading`.

> **Note:** The English names in this table describe the functionality. The block labels in the current v0.1.5 implementation are in German.

## Toolbox organization and color

The extension uses a high-contrast **deep blue** (`#1456B8`) and four groups within the **fischertechnik** MakeCode category:

| Group shown in MakeCode | Blocks |
|---|---|
| **Licht (LED)** | LED output |
| **Motor** | Motor control |
| **Eingabe** | Push button |
| **Sensoren** | Light sensor, light barrier, light threshold calibration, and light-sensor reading |

The two calibration blocks are marked as advanced and may be shown separately under the editor's advanced view. Group names and block labels remain in German for classroom use.

Dropdowns now use **lowercase German words**, such as `an`, `aus`, `wechseln`, `links`, `rechts`, `turbo`, `gedrückt`, and `nicht gedrückt`. Hardware identifiers such as `P0`, `P1`, `M1`, and `M2` remain unchanged. This is a display-only change; TypeScript enum identifiers and behavior are preserved.

## Pin selection: what is actually available?

The Calliope mini has **six large contact pads**, but two of them are **+3 V** and **GND**, not programmable inputs/outputs. The other four are digital signals **P0, P1, P2, and P3**.

The LED, push-button, and light-barrier LED-emitter selections all offer only **P0–P3**. The header pins C8 and C9 are not available in these dropdowns.

For the analog fischertechnik phototransistor, **P1 and P2** are the practical choices among the large contact pads on Calliope mini V3. Other analog channels are used for different purposes. The light-sensor dropdown is deliberately limited to P1 and P2.

## Wiring and operation

- **LED:** Connect between the selected signal pin and GND, observing polarity. `ON` sets the output HIGH. Use the LED components provided with the fischertechnik set; do not connect an unprotected bare LED without an appropriate series resistor.
- **Motor:** Connect to **M0+/M0−** (block option M1) or **M1+/M1−** (block option M2). The directional arrows refer to electrical rotation direction. Actual visible rotation depends on polarity and viewing angle.
- **Phototransistor:** Connect to an analog input (P1 or P2) using the wiring specified for the fischertechnik set. The extension enables a pull-up resistor; with this arrangement, **lower raw readings mean more light**.
- **Push button:** Use the normally open contacts **1 and 3**, connected between **3 V and the selected signal pin**. The extension uses a pull-down resistor so an unpressed button reliably reads 0. Some guides show wiring against GND; that arrangement requires inverted logic and will not work with the current implementation without changes.
- **Light barrier:** Use **different pins** for the emitter LED and phototransistor. The LED switches on when the light barrier is first evaluated and stays on. To turn it off later, use the LED block with `OFF` on the emitter pin.

## Light thresholds and calibration

Initial thresholds are **BRIGHT = 12**, **MEDIUM = 22**, and **DIM = 40** on the editor's analog reading scale (0–1023).

**These are provisional test values, not universal brightness measurements.** The fischertechnik teaching guide gives a sample threshold of 22 for a phototransistor light barrier in Open Roberta, but this number cannot be assumed to work unchanged with every Calliope device, circuit, or editor.

Measure actual readings with `Light sensor pin [..] reading` while the phototransistor is illuminated and shaded. Then adjust the thresholds at program startup using `Light level [..] threshold [..]`.

Threshold logic:

- Brightness condition is true when `analog reading <= threshold`.
- A light barrier is considered blocked when `analog reading > threshold`.
- Higher thresholds make the sensor respond to weaker light.

## Motors and hardware version

This extension targets **Calliope mini V3**.

On V3, `motors.dualMotorPower()` accepts **negative percentage values**, which makes reversing motor direction possible. Older V2/DAL implementations may interpret negative values as stop rather than reverse. The motor-direction implementation in this extension is therefore intended specifically for **V3**.

**Physical motor labels:** The block's **M1** selects the Calliope's physical **M0** motor connection; the block's **M2** selects its physical **M1** connection.

## Importing into MakeCode

The extension files must be available at the root of a compatible GitHub repository to use the standard GitHub extension import:

1. Open [MakeCode for Calliope mini](https://makecode.calliope.cc/) and create a new project for **Calliope mini V3**.
2. Open **Extensions**.
3. Search for `github:petz-lgb/pxt-fischertechnik-calliope-v3`.
4. Add the extension. The **fischertechnik** category provides the five blocks and calibration options.

The standard GitHub URL import is intended for an accessible, public repository. A private repository may require a different development or distribution workflow.

### Short example

```typescript
basic.forever(function () {
    if (fischertechnik.taster(fischertechnik.Anschluss.P3, fischertechnik.TasterZustand.Gedrueckt)) {
        fischertechnik.led(fischertechnik.LEDAnschluss.P1, fischertechnik.LEDZustand.An)
    } else {
        fischertechnik.led(fischertechnik.LEDAnschluss.P1, fischertechnik.LEDZustand.Aus)
    }
    basic.pause(20)
})
```

## LED crash troubleshooting (v0.1.3)

If the Calliope mini V3 resets when an LED block is used:

1. Disconnect all external components. Create a new MakeCode project **without this extension** and test `pins.digitalWritePin(DigitalPin.P0, 1)` from the regular Pins category.
2. If this runs normally, inspect the LED's wiring, polarity, and current limiting before reconnecting it. A standard V3 GPIO pin should supply no more than about 5 mA.
3. If the built-in Pins block also crashes when the LED is attached, an electrical issue is likely; do not keep retrying an unsafe circuit.
4. If only this extension crashes, note the MakeCode project, selected pin, LED wiring, any displayed error code, and whether the mini restarts or disconnects during flashing.

Version 0.1.3 replaces the LED state array with a single bitmask and selects P0–P3 explicitly. This is a **diagnostic simplification, not a confirmed fix**.

References: [Calliope mini power limits](https://docs.calliope.cc/tech/hardware/stromversorgung/) · [Calliope error codes](https://docs.calliope.cc/tech/software/error/).

## Development and testing status

- TypeScript source, `pxt.json`, examples, and documentation are included.
- The source code has undergone static checks, but **MakeCode/PXT compilation and actual motor direction have not yet been verified**.
- Before classroom use, test on a single Calliope mini V3: first LED and push button, then phototransistor, and finally motor.

## References

- fischertechnik Calliope (components): https://www.fischertechnik.de/de-de/schulen/lernmaterial/calliope
- fischertechnik teaching guide (especially pp. 14 and 30–33): https://www.fischertechnik.de/-/media/fischertechnik/fite/service/elearning/lehren/calliope-2018/begleitheft-ft-calliope-2020-12-21.pdf
- Calliope pinout: https://docs.calliope.cc/tech/hardware/pins/
- Calliope V3 motor implementation (source): https://raw.githubusercontent.com/microsoft/pxt-calliope/master/libs/core-mini-codal/motors.ts
- Calliope V2 motor implementation (source): https://raw.githubusercontent.com/microsoft/pxt-calliope/master/libs/core-mini-dal/motors.ts
