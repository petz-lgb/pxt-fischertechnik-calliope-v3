# fischertechnik Calliope – MakeCode-Erweiterung (0.1.0)

Kindgerechte Blöcke für den **fischertechnik Calliope**-Baukasten in Microsoft MakeCode für Calliope mini. **Prototyp:** Quellcode statisch geprüft, noch **nicht** auf der Hardware bzw. im MakeCode-Onlinecompiler getestet.

## Fünf gewünschte Blöcke

| Block | Art | Funktion |
|---|---|---|
| **LED Pin [P0] [AN/AUS/WECHSELN]** | Befehl | Digital 1, 0 oder Wechsel gegenüber letztem durch diese Erweiterung geschriebenen Zustand |
| **Motor [M1/M2] dreht [↶ LINKS/↷ RECHTS] mit [TURBO/SCHNELL/MITTEL/LANGSAM/STOP]** | Befehl | Über Calliope-Motortreiber, 100/75/50/25/0 %; M1 = physikalisches M0, M2 = physikalisches M1 |
| **Lichtsensor Pin [P1/P2] ist mindestens [STARK/MITTEL/SCHWACH] beleuchtet** | Wahrheitswert | Prüft, ob der analoge Wert im Helligkeitsbereich liegt |
| **Lichtschranke LED [P0] Sensor [P2] ist [UNTERBROCHEN/FREI] bei [STARK/MITTEL/SCHWACH]** | Wahrheitswert | Sender-LED einschalten und Fototransistor prüfen |
| **Taster Pin [P3] ist [GEDRÜCKT/NICHT GEDRÜCKT]** | Wahrheitswert | Digitaler Eingang mit Pull-down, Taster als Schließer zwischen 3V und Pin |

Darüber hinaus im Abschnitt **Einstellungen**: `Lichtstufe [..] Grenzwert [..]` sowie `Lichtsensor Pin [..] Messwert` zur Kalibrierung.

## Welche Pin-Auswahl ist technisch sinnvoll?

Der Calliope mini besitzt **sechs große Kontaktflächen**, aber zwei davon sind **+3V** und **GND** (keine programmierbaren Ein-/Ausgänge). Vier sind digitale Signale **P0, P1, P2, P3**.

Daher bieten LED und Taster sechs **echte digitale** Anschlüsse: **P0–P3** sowie **C8 und C9** an der **Stiftleiste** (nicht an den sechs großen Ringkontakten). Am Calliope mini V3 sind für den analogen fischertechnik-Fototransistor an den großen Kontakten dagegen nur **P1 und P2** praktikabel; weitere analoge Kanäle sind anderweitig belegt. Die Beschränkung des Fototransistor-Dropdowns auf P1 und P2 ist Absicht.

## Verdrahtung und Bedeutung

- **LED:** zwischen Signalpin und GND, Polarität beachten. Bei `AN` ist der Ausgang HIGH. Verwende die LED-Bauteile des fischertechnik-Sets, nicht ungeschützte Einzel-LEDs ohne passenden Vorwiderstand.
- **Motor:** an **M0+/M0−** (Blockauswahl M1) oder **M1+/M1−** (Blockauswahl M2). Die Richtungspiktogramme beziehen sich auf die elektrische Drehrichtung; die sichtbare Drehrichtung hängt von der Anschluss-Polung und dem Blickwinkel ab.
- **Fototransistor:** an einem analogen Eingang P1 oder P2 mit der zum fischertechnik-Set passenden Beschaltung. Die Erweiterung verwendet einen Pull-up; bei dieser Beschaltung bedeutet *kleinerer Rohwert = heller*.
- **Taster:** Schließerkontakte **1 und 3**, zwischen **3V und gewähltem Signalpin**. Die Erweiterung schaltet intern auf Pull-down, damit ungedrückt eine stabile 0 anliegt. Die in manchen Anleitungen gezeigte Schaltung gegen GND erfordert eine umgekehrte Logik und funktioniert damit nicht ohne Anpassung.
- **Lichtschranke:** Sender-LED und Fototransistor an **zwei unterschiedlichen Pins**. Beim ersten Prüfen wird die LED eingeschaltet; sie bleibt danach an. Für ausgeschaltete LED einfach später den LED-Block `AUS` auf ihren Pin anwenden.

## Helligkeitsstufen / Kalibrierung

Startwerte: `STARK = 12`, `MITTEL = 22`, `SCHWACH = 40` auf der analogen Rohwertskala des Editors (0–1023). **Dies sind erste Testwerte und nicht allgemein gültige Helligkeitsmessungen.** Die fischertechnik-Handreichung zeigt bei einer Lichtschranke mit dem Fototransistor beispielhaft einen Grenzwert 22 in Open Roberta; diese Zahl lässt sich nicht ohne Messung für jeden Calliope und jede Verdrahtung garantieren. Prüfe die tatsächlichen Werte mit `Lichtsensor Pin [..] Messwert` bei beleuchtetem und abgeschattetem Fototransistor und passe die Schwellen mit `Lichtstufe [..] Grenzwert [..]` bei `beim Start` an.

Die Schwellwertlogik ist bewusst so gewählt:
- Helligkeit erfüllt, falls `Analogwert <= Grenzwert`.
- Lichtschranke unterbrochen, falls `Analogwert > Grenzwert`.
- Größere Schwellen machen den Sensor empfindlicher für schwaches Licht.

## Motoren / Hardwareversion

Auf Calliope mini **V3** nimmt `motors.dualMotorPower()` auch **negative Prozentwerte** an; damit ist Rechts-/Linksdrehung möglich. Der ältere V2/DAL-Motortreiber unterstützt bei `dualMotorPower` möglicherweise nur Werte >=0 und interpretiert negative Werte als Stopp. **Richtungswechsel mit der aktuellen Erweiterung ist deshalb zunächst für V3 vorgesehen**. Bitte die Ziel-Hardwareversion vor dem Unterricht prüfen.

## Import in MakeCode

Eine einzelne ZIP-Datei ist **noch keine** öffentlich bereitgestellte MakeCode-Erweiterung. So wird aus diesem Quellpaket eine regulär importierbare Erweiterung:

1. ZIP entpacken. Die enthaltenen Dateien **im Stammverzeichnis** eines neuen, öffentlichen GitHub-Repositories ablegen, z. B. `pxt-fischertechnik-calliope`.
2. Im [Calliope MakeCode](https://makecode.calliope.cc/) ein neues Projekt für **Calliope mini V3** öffnen.
3. **Erweiterungen** öffnen und nach `github:BENUTZERNAME/pxt-fischertechnik-calliope` suchen.
4. Die Kategorie **fischertechnik** enthält die fünf Blöcke und die Einstellmöglichkeiten.

Ohne GitHub kann man den TypeScript-Inhalt zum Entwickeln in einem Projekt verwenden; die automatische Darstellung als separate importierbare Kategorie setzt jedoch die korrekte Erweiterungsstruktur voraus.

### Kurzes Beispiel

```typescript
basic.forever(function () {
    if (fischertechnik.taster(fischertechnik.Anschluss.P3, fischertechnik.TasterZustand.Gedrueckt)) {
        fischertechnik.led(fischertechnik.Anschluss.P1, fischertechnik.LEDZustand.An)
    } else {
        fischertechnik.led(fischertechnik.Anschluss.P1, fischertechnik.LEDZustand.Aus)
    }
    basic.pause(20)
})
```

## Technischer Status

- TypeScript-Quellcode, `pxt.json`, Beispiele und Dokumentation enthalten.
- MakeCode/PXT-Kompilierung und tatsächliche motorische Drehrichtung **noch nicht** verifiziert.
- Für den Unterricht zuerst an einem einzelnen V3 mit LED + Taster, dann Fototransistor, dann Motor testen.

## Quellen

- fischertechnik Calliope (Komponenten): https://www.fischertechnik.de/de-de/schulen/lernmaterial/calliope
- fischertechnik Begleitheft (insbesondere S. 14, 30–33): https://www.fischertechnik.de/-/media/fischertechnik/fite/service/elearning/lehren/calliope-2018/begleitheft-ft-calliope-2020-12-21.pdf
- Calliope Pinbelegung: https://docs.calliope.cc/tech/hardware/pins/
- Calliope Motorfunktion V3 (Originalcode): https://raw.githubusercontent.com/microsoft/pxt-calliope/master/libs/core-mini-codal/motors.ts
- Calliope Motorfunktion V2 (Originalcode): https://raw.githubusercontent.com/microsoft/pxt-calliope/master/libs/core-mini-dal/motors.ts
