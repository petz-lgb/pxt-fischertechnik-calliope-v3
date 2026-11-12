/**
 * fischertechnik Calliope - kindgerechte Blöcke für externe Bauteile.
 * Zielplattform: Microsoft MakeCode für Calliope mini (vor allem V3).
 * Die beiden analogen Sensoreingänge P1 und P2 sind bewusst eingeschränkt:
 * weitere Kontakte sind auf V3 entweder nicht analogfähig oder belegt.
 */

//% color="#1456B8" icon="\uf085" block="fischertechnik" weight=85
//% groups=['Licht (LED)', 'Motor', 'Eingabe', 'Sensoren', 'Steuerung']
namespace fischertechnik {
    /** Vier frei nutzbare digitale Ringkontakte P0 bis P3. */
    export enum Anschluss {
        //% block="P0"
        P0 = 0,
        //% block="P1"
        P1 = 1,
        //% block="P2"
        P2 = 2,
        //% block="P3"
        P3 = 3
    }

    /** LED-Ausgänge an den vier großen programmierbaren Ringkontakten. */
    export enum LEDAnschluss {
        //% block="P0"
        P0 = 0,
        //% block="P1"
        P1 = 1,
        //% block="P2"
        P2 = 2,
        //% block="P3"
        P3 = 3
    }

    /** Auf dem Calliope V3 frei zugängliche analoge Sensoranschlüsse. */
    export enum SensorAnschluss {
        //% block="P1"
        P1 = 1,
        //% block="P2"
        P2 = 2
    }

    export enum LEDZustand {
        //% block="an"
        An = 1,
        //% block="aus"
        Aus = 0,
        //% block="wechseln"
        Wechseln = 2
    }

    // Die sichtbaren Dropdown-Werte heißen ausschließlich M1 und M2.
    export enum MotorAnschluss {
        //% block="M1"
        M1 = 0,
        //% block="M2"
        M2 = 1
    }

    export enum Drehrichtung {
        //% block="↶ links"
        Links = -1,
        //% block="↷ rechts"
        Rechts = 1
    }

    export enum Geschwindigkeit {
        //% block="turbo"
        Turbo = 100,
        //% block="schnell"
        Schnell = 75,
        //% block="mittel"
        Mittel = 50,
        //% block="langsam"
        Langsam = 25,
        //% block="stop"
        Stop = 0
    }

    /** Die Stufe bezeichnet die mindestens benötigte Helligkeit. */
    export enum Helligkeit {
        //% block="stark"
        Stark = 0,
        //% block="mittel"
        Mittel = 1,
        //% block="schwach"
        Schwach = 2
    }

    export enum TasterZustand {
        //% block="gedrückt"
        Gedrueckt = 1,
        //% block="nicht gedrückt"
        NichtGedrueckt = 0,
        //% block="angetippt"
        Angetippt = 2
    }

    export enum LichtschrankenZustand {
        //% block="unterbrochen"
        Unterbrochen = 1,
        //% block="frei"
        Frei = 0
    }

    /** Einheit der kindgerechten Wartezeit. */
    export enum WarteEinheit {
        //% block="Sekunden"
        Sekunden = 0,
        //% block="Minuten"
        Minuten = 1
    }

    // Zustand von P0 bis P3 als einfache Bitmaske statt Array.
    let ledZustaende = 0
    // Externe Taster nur beim ersten Lesen des jeweiligen Pins konfigurieren.
    let tasterInitialisiert = 0
    // Zusaetzliche Zustandsbits fuer das einmalige Antipp-Ereignis.
    let tasterVorherGedrueckt = 0
    let tasterAntippEreignisse = 0
    let tasterMonitorGestartet = false
    let tasterStartP0 = 0
    let tasterStartP1 = 0
    let tasterStartP2 = 0
    let tasterStartP3 = 0
    // Vorläufige Werte für fischertechnik-Fototransistor, vom Modell abhängig.
    // Übliche Beschaltung des Sets: hell = kleiner Rohwert, dunkel = größer.
    let grenzeStark = 12
    let grenzeMittel = 22
    let grenzeSchwach = 40

    function analogPin(port: SensorAnschluss): AnalogPin {
        return port === SensorAnschluss.P1 ? AnalogPin.P1 : AnalogPin.P2
    }

    function sensorDigitalPin(port: SensorAnschluss): DigitalPin {
        return port === SensorAnschluss.P1 ? DigitalPin.P1 : DigitalPin.P2
    }

    function grenze(stufe: Helligkeit): number {
        if (stufe === Helligkeit.Stark) return grenzeStark
        if (stufe === Helligkeit.Mittel) return grenzeMittel
        return grenzeSchwach
    }

    function lichtWert(port: SensorAnschluss): number {
        // Die fischertechnik-Beschaltung mit Fototransistor nach GND
        // nutzt den internen Pull-up als definierten Gegenwiderstand.
        pins.setPull(sensorDigitalPin(port), PinPullMode.PullUp)
        return pins.analogReadPin(analogPin(port))
    }

    /**
     * Schaltet eine externe LED. WECHSELN kippt den letzten Zustand,
     * der mit dieser Erweiterung für denselben Pin geschrieben wurde.
     */
    //% blockId=ftcalliope_led
    //% block="LED $pin $zustand"
    //% pin.defl=fischertechnik.LEDAnschluss.P0
    //% weight=100 group="Licht (LED)"
    export function led(pin: LEDAnschluss, zustand: LEDZustand): void {
        ledSchalten(pin, zustand)
    }

    // Explizite Pinwahl und einfacher Zustand ohne Array-Zugriffe.
    // Dieselbe Funktion wird auch von der Lichtschranke verwendet.
    function ledSchalten(pin: LEDAnschluss, zustand: LEDZustand): void {
        let index = pin as number
        if (index < 0 || index > 3) return
        let maske = 1 << index
        let neu = 0
        if (zustand === LEDZustand.An) neu = 1
        else if (zustand === LEDZustand.Wechseln) neu = (ledZustaende & maske) === 0 ? 1 : 0

        if (pin === LEDAnschluss.P0) pins.digitalWritePin(DigitalPin.P0, neu)
        else if (pin === LEDAnschluss.P1) pins.digitalWritePin(DigitalPin.P1, neu)
        else if (pin === LEDAnschluss.P2) pins.digitalWritePin(DigitalPin.P2, neu)
        else if (pin === LEDAnschluss.P3) pins.digitalWritePin(DigitalPin.P3, neu)

        if (neu === 1) ledZustaende |= maske
        else ledZustaende &= ~maske
    }

    /**
     * Steuert den direkt angeschlossenen Gleichstrommotor.
     * Die Auswahl M1/M2 ist kindgerecht; Hardwareanschlüsse: M0/M1.
     * WARNUNG: Richtung per negativem Prozentwert ist auf V3 verfügbar;
     * ältere Firmware / V2 kann den Rückwärtslauf nicht unterstützen.
     */
    //% blockId=ftcalliope_motor
    //% block="Motor $kanal dreht $richtung mit $tempo"
    //% kanal.defl=fischertechnik.MotorAnschluss.M1
    //% weight=90 group="Motor"
    export function motor(kanal: MotorAnschluss, richtung: Drehrichtung, tempo: Geschwindigkeit): void {
        let leistung = (tempo as number) * (richtung as number)
        if (tempo === Geschwindigkeit.Stop) leistung = 0
        motors.dualMotorPower(kanal === MotorAnschluss.M1 ? Motor.M0 : Motor.M1, leistung)
    }

    /**
     * Wahr, wenn ausreichend Licht auf den fischertechnik-Fototransistor fällt.
     * Die Schwellwerte lassen sich im Abschnitt Einstellungen kalibrieren.
     */
    //% blockId=ftcalliope_lichtsensor
    //% block="Lichtsensor Pin $pin ist mindestens $stufe beleuchtet"
    //% pin.defl=fischertechnik.SensorAnschluss.P2
    //% weight=80 group="Sensoren"
    export function lichtsensor(pin: SensorAnschluss, stufe: Helligkeit): boolean {
        return lichtWert(pin) <= grenze(stufe)
    }

    /**
     * Startet die Lichtschranke, indem sie die gewaehlte Sende-LED einschaltet.
     * Die Sende-LED bleibt eingeschaltet, bis sie separat ausgeschaltet wird.
     */
    //% blockId=ftcalliope_lichtschranke_starten
    //% block="Lichtschranke starten, LED auf $ledPin"
    //% ledPin.defl=fischertechnik.LEDAnschluss.P0
    //% weight=75 group="Sensoren"
    export function lichtschrankeStarten(ledPin: LEDAnschluss): void {
        ledSchalten(ledPin, LEDZustand.An)
    }

    /**
     * Schaltet die Sender-LED ein und meldet, ob der Lichtstrahl unterbrochen ist.
     * Die Sender-LED bleibt nach Aufruf eingeschaltet.
     */
    //% blockId=ftcalliope_lichtschranke
    //% block="Lichtschranke LED $ledPin Sensor $sensorPin ist $zustand bei $stufe"
    //% ledPin.defl=fischertechnik.LEDAnschluss.P0
    //% sensorPin.defl=fischertechnik.SensorAnschluss.P2
    //% weight=70 group="Sensoren"
    export function lichtschranke(ledPin: LEDAnschluss, sensorPin: SensorAnschluss, zustand: LichtschrankenZustand, stufe: Helligkeit): boolean {
        if ((ledPin as number) === (sensorPin as number)) return false
        // Nur beim erstmaligen Einschalten kurze Einschwingzeit.
        if ((ledZustaende & (1 << (ledPin as number))) === 0) {
            ledSchalten(ledPin, LEDZustand.An)
            basic.pause(30)
        }
        let unterbrochen = lichtWert(sensorPin) > grenze(stufe)
        return zustand === LichtschrankenZustand.Unterbrochen ? unterbrochen : !unterbrochen
    }

    /**
     * Liest den digitalen Pegel eines fischertechnik-Tasters.
     * Beschaltung: Eingang P0-P3 -> Schliesser -> GND (interner Pull-up).
     * Ein gedrueckter Taster ergibt daher den Pegel 0.
     */
    function tasterIstGedrueckt(pin: Anschluss): boolean {
        if (pin === Anschluss.P0) return pins.digitalReadPin(DigitalPin.P0) === 0
        if (pin === Anschluss.P1) return pins.digitalReadPin(DigitalPin.P1) === 0
        if (pin === Anschluss.P2) return pins.digitalReadPin(DigitalPin.P2) === 0
        return pins.digitalReadPin(DigitalPin.P3) === 0
    }

    /** Wird unabhaengig vom Abfrageblock regelmaessig aufgerufen. */
    function tasterUeberwachen(pin: Anschluss): void {
        let maske = 1 << (pin as number)
        let gedrueckt = tasterIstGedrueckt(pin)
        let warGedrueckt = (tasterVorherGedrueckt & maske) !== 0

        if (gedrueckt && !warGedrueckt) {
            tasterVorherGedrueckt |= maske
            let start = input.runningTime()
            if (pin === Anschluss.P0) tasterStartP0 = start
            else if (pin === Anschluss.P1) tasterStartP1 = start
            else if (pin === Anschluss.P2) tasterStartP2 = start
            else if (pin === Anschluss.P3) tasterStartP3 = start
        } else if (!gedrueckt && warGedrueckt) {
            tasterVorherGedrueckt &= ~maske
            let start = 0
            if (pin === Anschluss.P0) start = tasterStartP0
            else if (pin === Anschluss.P1) start = tasterStartP1
            else if (pin === Anschluss.P2) start = tasterStartP2
            else if (pin === Anschluss.P3) start = tasterStartP3
            let dauer = input.runningTime() - start
            // Nur ein kurzer Druck mit anschliessendem Loslassen gilt als Antippen.
            if (dauer >= 30 && dauer <= 1000) {
                tasterAntippEreignisse |= maske
            }
        }
    }

    /** Ein einziger Hintergrundprozess fuer alle tatsaechlich benutzten Taster. */
    function tasterMonitorStarten(): void {
        if (tasterMonitorGestartet) return
        tasterMonitorGestartet = true
        control.inBackground(function () {
            while (true) {
                if ((tasterInitialisiert & 1) !== 0) tasterUeberwachen(Anschluss.P0)
                if ((tasterInitialisiert & 2) !== 0) tasterUeberwachen(Anschluss.P1)
                if ((tasterInitialisiert & 4) !== 0) tasterUeberwachen(Anschluss.P2)
                if ((tasterInitialisiert & 8) !== 0) tasterUeberwachen(Anschluss.P3)
                // Gibt die Steuerung an andere MakeCode-Programmteile ab.
                basic.pause(10)
            }
        })
    }

    /**
     * Externer fischertechnik-Taster als Bedingung.
     * Verdrahtung: Schliesser Kontakte 1+3 zwischen GND und Signalpin.
     * 'angetippt' wird durch einen unabhaengigen Hintergrundmonitor erkannt,
     * gespeichert und bei der ersten passenden Abfrage einmalig gemeldet.
     */
    //% blockId=ftcalliope_taster
    //% block="Taster $pin ist $zustand"
    //% pin.defl=fischertechnik.Anschluss.P3
    //% weight=60 group="Eingabe"
    export function taster(pin: Anschluss, zustand: TasterZustand): boolean {
        let index = pin as number
        if (index < 0 || index > 3) return false
        let maske = 1 << index
        if ((tasterInitialisiert & maske) === 0) {
            if (pin === Anschluss.P0) pins.setPull(DigitalPin.P0, PinPullMode.PullUp)
            else if (pin === Anschluss.P1) pins.setPull(DigitalPin.P1, PinPullMode.PullUp)
            else if (pin === Anschluss.P2) pins.setPull(DigitalPin.P2, PinPullMode.PullUp)
            else if (pin === Anschluss.P3) pins.setPull(DigitalPin.P3, PinPullMode.PullUp)
            tasterInitialisiert |= maske
        }
        // Nicht in jeder Schleifenrunde neue Hintergrundprozesse starten.
        tasterMonitorStarten()

        if (zustand === TasterZustand.Angetippt) {
            let erkannt = (tasterAntippEreignisse & maske) !== 0
            if (erkannt) tasterAntippEreignisse &= ~maske
            return erkannt
        }

        let gedrueckt = tasterIstGedrueckt(pin)
        return zustand === TasterZustand.Gedrueckt ? gedrueckt : !gedrueckt
    }

    /**
     * Wartet die ausgewählte Anzahl ganzer Sekunden oder Minuten.
     * Die Zahl ist auf zwei Stellen (0 bis 99) begrenzt.
     */
    //% blockId=ftcalliope_warte
    //% block="warte $dauer $einheit"
    //% dauer.min=0 dauer.max=99 dauer.defl=1
    //% weight=100 group="Steuerung"
    export function warte(dauer: number, einheit: WarteEinheit): void {
        // Kein isNaN oder verschachteltes Math: nur die native MakeCode-Pause.
        if (dauer < 0) dauer = 0
        if (dauer > 99) dauer = 99
        if (einheit === WarteEinheit.Minuten) {
            basic.pause(dauer * 60000)
        } else {
            basic.pause(dauer * 1000)
        }
    }

    /** Kalibriert eine der drei Lichtstufen auf einen eigenen Analogwert (0 bis 1023). */
    //% blockId=ftcalliope_grenze
    //% block="Lichtstufe $stufe Grenzwert $wert"
    //% wert.min=0 wert.max=1023 wert.defl=22
    //% weight=20 group="Sensoren" advanced=true
    export function lichtGrenze(stufe: Helligkeit, wert: number): void {
        wert = Math.max(0, Math.min(1023, Math.round(wert)))
        if (stufe === Helligkeit.Stark) grenzeStark = wert
        else if (stufe === Helligkeit.Mittel) grenzeMittel = wert
        else grenzeSchwach = wert
    }

    /** Liefert den Fototransistor-Rohwert, z.B. zur Kalibrierung. */
    //% blockId=ftcalliope_lichtwert
    //% block="Lichtsensor Pin $pin Messwert"
    //% pin.defl=fischertechnik.SensorAnschluss.P2
    //% weight=10 group="Sensoren" advanced=true
    export function lichtMesswert(pin: SensorAnschluss): number {
        return lichtWert(pin)
    }
}
