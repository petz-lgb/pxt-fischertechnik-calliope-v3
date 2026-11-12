> **⚠️ This extension is vibe-coded.**
>
> This extension was developed with the assistance of AI ("vibe coding"). Its source code has not yet been fully verified in the MakeCode online compiler or tested on physical hardware. **Please review and test it before using it in lessons.**

# fischertechnik Calliope – MakeCode Extension (v0.1.22)

A collection of child-friendly programming blocks for the **fischertechnik Calliope** construction kit, designed for **Calliope mini V3** in Microsoft MakeCode.

## Unofficial MakeCode extension

This independently developed extension provides simplified programming blocks for use with the fischertechnik Calliope construction kit and the Calliope mini V3.

This project is not officially affiliated with, endorsed by, or supported by fischertechnik GmbH or Calliope gGmbH.

All product names and trademarks mentioned are used solely to describe compatibility.

## Programming blocks

| Block | Type | Function |
|---|---|---|
| **LED [P0] [ON/OFF/TOGGLE]** | Command | Sets the output to digital 1 or 0, or toggles the last state written by this extension |
| **Motor [M1/M2] turns [↶ LEFT/↷ RIGHT] at [TURBO/FAST/MEDIUM/SLOW]** | Command | Controls the Calliope motor drivers at 100/75/50/25%; block M1 corresponds to physical M0, block M2 to physical M1 |
| **Stop motor [M1/M2]** | Command | Stops the selected motor by setting its power to 0% |
| **Light sensor pin [P0/P1/P2/P3] detects at least [BRIGHT/MEDIUM/DIM]** | Boolean | Checks the sensor reading against a brightness threshold; P0–P2 analog, P3 digital only |
| **Brightness light sensor [P0/P1/P2/P3]** | Number | Returns a measurement: analog 0–1023 on P0–P2; digital 0 or 1023 on P3 |
| **Start light barrier, LED on [P0/P1/P2/P3]** | Command | Explicitly switches the selected light-barrier emitter LED on |
| **Light barrier sensor [P2] is [BLOCKED/CLEAR]** | Boolean | Checks the phototransistor with an internal fixed threshold of 800; the emitter LED must be started separately |
| **Push button [P3] is [PRESSED/NOT PRESSED/TAPPED]** | Boolean | Reads a digital input with an internal pull-up; a 30–1000 ms press followed by release is reported once as TAPPED |
| **wait [1] [Seconds/Minutes]** | Command | Pauses the current program for 0–99 whole seconds or minutes |
| **until [sensor condition] [true/false] do** | Loop | Runs the nested commands until the selected hardware condition matches the desired truth value; rechecks the sensor every iteration |

The **Sensoren** group contains the regular numeric light-sensor block and one advanced calibration block: `Light level [..] threshold [..]`.

> **Note:** The English names in this table describe the functionality. The block labels in the current v0.1.22 implementation are in German.

## Extension gallery icon

The repository includes `icon.png` (300 × 200 px, less than 100 KB) in the repository root. It depicts a Calliope mini connected to fischertechnik-style motor, LED and switch modules on a bright yellow background. The image is intended for the MakeCode extension gallery. According to MakeCode documentation, custom gallery icons appear for **approved extensions**; merely adding the file does not constitute gallery approval.

## Toolbox organization and color

The **fischertechnik** toolbox category remains deep blue (`#1456B8`) and keeps the same seven groups. Starting in v0.1.22, the individual blocks are colored by function group:

| Group shown in MakeCode | Color | Blocks |
|---|---|---|
| **Licht (LED)** | Gold `#B68400` | LED output |
| **Motor** | Orange `#D56722` | Motor control, then separate motor stop command |
| **Eingabe** | Magenta `#B83D88` | Push button |
| **Sensoren** | Green `#24804C` | Light-sensor condition, numerical brightness measurement and advanced threshold calibration |
| **Lichtschranke** | Teal green `#00876C` | Start emitter LED and light barrier check |
| **Steuerung** | Violet `#6054AE` | Wait block |
| **Logik** | Petrol `#087C93` | Until-loop |

The light-threshold calibration block remains advanced. The numerical brightness block is visible in the normal Sensors section. Group names and block labels remain in German for classroom use.

### Experimental per-block coloring (v0.1.22)

The PXT block loader uses a block function's own `color` attribute before falling back to its namespace color (unless an explicit `blockNamespace` overrides it). This version assigns a per-function `color="#RRGGBB"` annotation while retaining the existing block ID, function, group and namespace. The fischertechnik category itself remains blue `#1456B8`; the individual blocks should have the seven different colors within that single category.

This is a visual-only test: no wiring, sensor logic, motor commands or generated TypeScript APIs are changed. The result still needs testing in the Calliope MakeCode editor because editor versions and caching may affect rendering.

Dropdowns now use **lowercase German words**, such as `an`, `aus`, `wechseln`, `links`, `rechts`, `turbo`, `gedrückt`, and `nicht gedrückt`. Hardware identifiers such as `P0`, `P1`, `M1`, and `M2` remain unchanged. This is a display-only change; TypeScript enum identifiers and behavior are preserved.

## Light barrier blocks (v0.1.14)

The toolbox now has a dedicated **Lichtschranke** group. The first block is **`Lichtschranke starten, LED auf [P0]`**, which explicitly switches on the selected emitter LED on P0, P1, P2, or P3.

The next block is a compact, horizontal, Boolean check: **`Lichtschranke Sensor [P2] ist [unterbrochen/frei]`**. It uses `inlineInputMode=inline`, offers P0, P1, P2 as analog receiver inputs plus P3 as a digital-only receiver, and exposes only the two desired states (`unterbrochen`, `frei`).

The light-barrier check **does not turn on the LED**. It reads the phototransistor only, so call the LED startup block first (e.g. in `beim Start`). It compares the analog value with a **fixed internal threshold of 800** (midway between the reported free value 562 and interrupted value 1022). This threshold is not linked to the light-sensor brightness dropdown or its adjustable `Lichtstufe` calibration.

The former four-argument light-barrier block has been **deprecated**, not deleted. Existing MakeCode programs using the old block should continue to work; it retains its original auto-on LED behavior and brightness-level dropdown. Newly created programs should use the two new-style blocks above.

Never use the same pin for the sender LED and receiver sensor, and follow electrical wiring requirements for the chosen components. Test the fixed threshold on the actual phototransistor and illumination setup before classroom use.

### Light-barrier threshold corrected using measured values (v0.1.18)

Actual analog readings reported for the connected fischertechnik phototransistor are **562 when free** and **1022 when interrupted**. The previous fixed threshold of 25 was far below both readings, so the barrier would always appear interrupted. Version 0.1.18 raises the fixed threshold used by the newer `Lichtschranke Sensor [P2] ist [unterbrochen/frei]` block to **800**:

- Reading **0–800**: **free**.
- Reading **801–1023**: **interrupted**.

The comparison direction (`reading > threshold` means interrupted) remains correct. This threshold is based on the reported measurements and may need adjustment under different lighting conditions or wiring. The ordinary light-sensor thresholds and deprecated legacy block remain unchanged.

### Light-barrier fixed threshold adjustment (v0.1.17)

The newer `Lichtschranke Sensor [P2] ist [unterbrochen/frei]` block now considers the barrier **interrupted when the raw analog reading is greater than 25**, and **free otherwise**. Only the newer light-barrier check was changed; the regular light-sensor thresholds (12/22/40), numeric brightness reporter, and deprecated old light-barrier block remain unchanged.

Changing the threshold from 22 to 25 can only change the result for raw readings of **23–25**. If the barrier still reports interrupted with the light unobstructed, use the `Helligkeit Lichtsensor [P2]` reporter to inspect the actual receiver value with and without an obstruction. The LED transmitter must be switched on by `Lichtschranke starten` first, and transmitter/receiver must not share a pin.

## Logic: repeat-until sensor condition (v0.1.20)

The **Logik** group contains a C-shaped block with a statement body:

**`bis [Taster P3 gedrückt] [wahr] mache`**

Select a condition from the first dropdown (pressed/tapped Taster on P0–P3, or interrupted light barrier on P0–P3), and select `wahr` or `falsch` in the second dropdown. The commands nested in the block run repeatedly **until the selected sensor condition equals the desired Boolean value**. The condition is checked **before** each iteration, so if it is already satisfied, the body does not run. A 1 ms pause between iterations lets the microcontroller run other fibers.

**Critical MakeCode limitation:** This custom extension **cannot** provide a general-purpose Boolean expression socket that automatically reevaluates arbitrary attached expressions each loop. In ordinary extension functions, `condition: boolean` is evaluated once on entry and passed by value; a loop based on this parameter would not react to a changing sensor. For correctness, this block uses a **dropdown of supported sensor conditions**, which the extension explicitly re-reads on each iteration. Use the built-in **`während`** block with an inverted condition for arbitrary complex expressions. A completely general `bis [any Boolean block] [wahr|falsch] mache` requires editor/compiler support, not just a normal GitHub extension.

Example: choose `bis [Lichtschranke P2 unterbrochen] [wahr] mache` and put motor commands inside. The motor commands repeat while the light beam is free and stop being issued after it is blocked; put `Motor stoppen` directly **after** the loop if the motor must stop physically. Before testing a light barrier, use `Lichtschranke starten` to enable the emitter LED. For tap conditions, remember that `angetippt` is a one-shot event.

## Custom wait block

The **Steuerung** group contains the block `warte [1] [Sekunden/Minuten]` (wait [1] [seconds/minutes]).

- Type a whole number from **0 to 99** in the numeric field. The MakeCode input is configured with `min=0`, `max=99`, and default `1`.
- Select **Sekunden** or **Minuten** from the dropdown.
- Runtime code clamps negative values to 0 and values over 99 to 99. The numeric field in the MakeCode block is configured for 0–99. A decimal number passed through TypeScript is accepted and may pause for fractional seconds/minutes.
- The block calls the built-in `basic.pause()` directly with the duration multiplied by 1000 for seconds or 60000 for minutes. It avoids `isNaN()`, `Math.round()`, and nested `Math.min()` / `Math.max()` calls in the previous version. This pauses the current sequence while MakeCode's scheduler can continue running other independent tasks.

### Wait-block crash troubleshooting (v0.1.9)

The previous v0.1.7–v0.1.8 implementation used `isNaN()` and nested Math helpers before the pause. A user reported a Calliope mini crash when using this block. The cause has **not** been conclusively identified, but these extra operations are unnecessary for a basic wait block. Version 0.1.9 removes them and calls only `basic.pause(dauer * 1000)` or `basic.pause(dauer * 60000)`, with two simple range checks.

**Isolation test:** Run a new project without any external wiring, containing only the fischertechnik wait block set to 1 second between built-in LED display actions; then try a 1-minute delay. If it still crashes, replace only this block with the standard MakeCode `basic.pause(1000)` and compare. Record any panic/error number shown on the LED matrix; do not assume the underlying cause is fixed until verified on physical hardware.

## Sensor pin selection and motor-stop behavior (v0.1.21)

All sensor dropdowns now offer P0, P1, P2 and P3 (digital), including the light-sensor Boolean block, numeric light-sensor reporter, light-barrier check and supported light-barrier conditions in the `bis` loop. On V3, P3 cannot measure analog values; see the hardware notes below. Do not use the same pin simultaneously for the light-barrier LED, the phototransistor and/or an external push button.

**Motor warning:** The `bis` loop only controls how often its contained statements are executed; it does not reverse previous output settings. `Motor M2 dreht ...` sets a persistent motor power. To stop the motor on button P2 press, use:

```text
dauerhaft
  wenn Lichtschranke Sensor P1 ist unterbrochen dann
    bis Taster P2 gedrückt wahr mache
      Motor M2 dreht rechts mit langsam
    Motor stoppen M2
```

The `Motor stoppen M2` block belongs **below the `bis` loop but inside the `wenn` block**. Once the `bis` condition is satisfied, control proceeds to the stop command. A shared pin cannot be used for the light barrier and push button simultaneously.

## Pin selection: what is actually available?

The Calliope mini has **six large contact pads**, but two of them are **+3 V** and **GND**, not programmable inputs/outputs. The other four are digital signals **P0, P1, P2, and P3**.

The LED, push-button, and light-barrier LED-emitter selections all offer only **P0–P3**. The header pins C8 and C9 are not available in these dropdowns.

On Calliope mini V3 the large contact pads **P0, P1 and P2** support real ADC analog readings. **P3 does not support analog input** on V3; this extension deliberately provides a *digital-only* fallback there, mapping LOW to 0 and HIGH to 1023. The P3 dropdown explicitly says `P3 (digital)` to avoid suggesting it measures proportional light intensity. Use P0, P1 or P2 for real brightness readings or calibrated light-barrier thresholds.

## Wiring and operation

- **LED:** Connect between the selected signal pin and GND, observing polarity. `ON` sets the output HIGH. Use the LED components provided with the fischertechnik set; do not connect an unprotected bare LED without an appropriate series resistor.
- **Motor:** Connect to **M0+/M0−** (block option M1) or **M1+/M1−** (block option M2). The directional arrows refer to electrical rotation direction. Actual visible rotation depends on polarity and viewing angle.
- **Phototransistor:** Connect to an analog input (P0, P1 or P2) for numerical brightness readings, or to P3 only when binary light/dark detection is acceptable, using the wiring specified for the fischertechnik set. The extension enables a pull-up resistor; with this arrangement, **lower raw readings mean more light**.
- **Push button (v0.1.9):** Use the normally open contacts **1 and 3** between **GND and the selected signal pin**. The extension enables the internal pull-up resistor: unpressed reads **1**, pressed reads **0**. Do **not** wire the button between 3.3 V and the input for this version; it will not detect a press.
- **Light barrier:** Use **different pins** for the emitter LED and phototransistor. Switch on the LED explicitly using `Lichtschranke starten`; the new condition block only reads the receiver. Turn off the LED with the normal LED block `aus`. The legacy condition block still turns its emitter on automatically.

## Push-button reset troubleshooting (v0.1.6)

A Calliope mini V3 may reset if a connected switch creates an electrical short, or if there is a runtime issue in the input code. The exact cause of the reported reset has not yet been confirmed.

Version 0.1.6 simplifies the push-button function. It configures the selected input's internal pull-down **once per pin**, then directly reads P0–P3 instead of repeatedly calling `setPull` and using a dynamic pin mapping. LED and motor behavior are unchanged.

For a safe diagnosis, **disconnect all external wiring first** and test the new button block on an unconnected pin. This should not reset the board (although the reading should stay at "not pressed"). Then check the wiring before connecting the switch:

- **Historical note (v0.1.6):** That version expected 3.3 V → switch → input. Since v0.1.9 the connection is **GND → switch → selected signal pin**; the code now uses an internal pull-up and active-low detection.
- Never connect 3.3 V directly to GND, even through a closed switch.
- Do not share a pin simultaneously between an LED output and a push-button input.
- If the board resets only when pressing the switch, check its physical terminal pairing and connections before repeating the test.

The normal MakeCode calls `pins.setPull()` and `pins.digitalReadPin()` are documented by Calliope, but this patch still requires verification on physical V3 hardware.

## Push-button tap detection (v0.1.10)

A third option in the `Taster` dropdown is **`angetippt`** (tapped). It is true only after a button press of **30–1000 ms**, followed by release; a long hold is not considered a tap.

- Each completed tap returns true **once** when the `angetippt` state is checked; then the event is consumed.
- `gedrückt` and `nicht gedrückt` remain unchanged.
- Each of P0–P3 has independent tracking without dynamically allocated arrays.
- **Update in v0.1.12:** Monitoring is performed by a single background task that samples initialized pins approximately every 10 ms, independently of when the `Taster` block is evaluated. Taps can therefore be captured during `warte` or other yielding MakeCode pauses. The completed tap is retained until the next `Taster ... ist angetippt` evaluation, which consumes it. The background monitor starts when the `Taster` block is called for the first time. Very brief pulses shorter than the sampling interval can still be missed.
- Use the existing wiring: **selected pin → normally open switch → GND**, with the internal pull-up.

This feature still requires a real-hardware Calliope mini V3 test.

### Background tap monitor (v0.1.12)

The previous implementation recognized a tap only when a repeated block call happened to observe both the press and the release. If an `ansonsten` branch contained a multi-second pause, the release was never observed and `angetippt` did not trigger. In v0.1.12 a single background fiber tracks transitions and buffers one event per pin, without creating a new fiber for every call.

**Suggested test:** Use the `Taster P3 ist angetippt` block in a `dauerhaft` loop, with the Taster connected between P3 and GND. In the otherwise branch, include a 2-second built-in MakeCode pause. Tap P3 briefly during that pause. After the pause, the buffered tap should be reported once. The feature must still be tested on physical Calliope mini V3 hardware.

## Push-button update (v0.1.8): active-low with internal pull-up

The button block now follows the simple two-wire connection **P0/P1/P2/P3 → normally open switch (contacts 1 and 3) → GND**. The pull-up keeps the unconnected pin at a stable logical `1`; pressing the switch pulls it to `0`.

**Safe first test:** With the Calliope mini V3 disconnected from all external parts, run only the push-button block on P3. The result should remain "not pressed". Then briefly connect **P3 to GND** using a cable (without connecting 3.3 V); the button block should report "pressed". Never bridge 3.3 V and GND.

This is a diagnostic change based on standard Calliope pin-input behavior. The previous reset has **not** been reproduced or conclusively diagnosed, and v0.1.9 has not yet been tested on real hardware.

## Numeric light-sensor block (v0.1.16)

The **Sensoren** group now visibly includes **`Helligkeit Lichtsensor [P2]`**. Select **P0**, **P1**, **P2**, or **P3 (digital)**; it returns a numeric value instead of a true/false condition. For example, create a MakeCode variable named `Helligkeit` and use the standard variable-assignment block **`setze Helligkeit auf [Helligkeit Lichtsensor P2]`**.

For P0–P2, the block returns a raw analog reading from `pins.analogReadPin()` (nominal scale **0–1023**), not a calibrated brightness in lux. At P3 the block reads a digital input and returns **0 or 1023 only**, not an analog value. With the intended phototransistor wiring and pull-up, **smaller readings correspond to brighter light**. The existing TypeScript API and block ID are unchanged, so projects using the previously hidden numeric block remain compatible.

## Light thresholds and calibration

Initial thresholds are **BRIGHT = 12**, **MEDIUM = 22**, and **DIM = 40** on the editor's analog reading scale (0–1023).

**These are provisional test values, not universal brightness measurements.** The fischertechnik teaching guide gives a sample threshold of 22 for a phototransistor light barrier in Open Roberta, but this number cannot be assumed to work unchanged with every Calliope device, circuit, or editor.

Measure actual readings with `Helligkeit Lichtsensor [..]` while the phototransistor is illuminated and shaded. Then adjust the thresholds at program startup using `Light level [..] threshold [..]`.

Threshold logic:

- Brightness condition is true when `analog reading <= threshold`.
- A light barrier is considered blocked when `analog reading > threshold`.
- Higher thresholds make the sensor respond to weaker light.

## Dedicated motor stop block (v0.1.19)

The **Motor** toolbox group now shows two blocks, in order:

1. **`Motor [M1] dreht [↶ links] mit [turbo/schnell/mittel/langsam]`** — the speed dropdown no longer offers **stop**.
2. **`Motor stoppen [M1]`** — selects M1 or M2 and immediately sets the selected hardware motor driver power to **0%**.

The former `Geschwindigkeit.Stop = 0` enum member is kept only for backwards compatibility with projects written using an earlier version, but is marked `blockHidden=1` to remove it from the speed dropdown. The existing `motor` API and its original block ID remain unchanged, and older programs using the stop enum continue to stop the motor. Both blocks preserve the M1→hardware M0 and M2→hardware M1 mapping.

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
