/**
 * fischertechnik Calliope - kindgerechte Blöcke für externe Bauteile.
 * Zielplattform: Microsoft MakeCode für Calliope mini (vor allem V3).
 * Die beiden analogen Sensoreingänge P1 und P2 sind bewusst eingeschränkt:
 * weitere Kontakte sind auf V3 entweder nicht analogfähig oder belegt.
 */

//% color="#137C85" icon="\uf085" block="fischertechnik" weight=85
//% groups=['Aktoren', 'Sensoren', 'Einstellungen']
namespace fischertechnik {
    /** Frei nutzbare digitale GPIO: vier Ringpins und zwei Pins auf der Stiftleiste. */
    export enum Anschluss {
        //% block="P0"
        P0 = 0,
        //% block="P1"
        P1 = 1,
        //% block="P2"
        P2 = 2,
        //% block="P3"
        P3 = 3,
        //% block="C8 (Stiftleiste)"
        C8 = 4,
        //% block="C9 (Stiftleiste)"
        C9 = 5
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
        //% block="AN"
        An = 1,
        //% block="AUS"
        Aus = 0,
        //% block="WECHSELN"
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
        //% block="↶ LINKS"
        Links = -1,
        //% block="↷ RECHTS"
        Rechts = 1
    }

    export enum Geschwindigkeit {
        //% block="TURBO"
        Turbo = 100,
        //% block="SCHNELL"
        Schnell = 75,
        //% block="MITTEL"
        Mittel = 50,
        //% block="LANGSAM"
        Langsam = 25,
        //% block="STOP"
        Stop = 0
    }

    /** Die Stufe bezeichnet die mindestens benötigte Helligkeit. */
    export enum Helligkeit {
        //% block="STARK"
        Stark = 0,
        //% block="MITTEL"
        Mittel = 1,
        //% block="SCHWACH"
        Schwach = 2
    }

    export enum TasterZustand {
        //% block="GEDRÜCKT"
        Gedrueckt = 1,
        //% block="NICHT GEDRÜCKT"
        NichtGedrueckt = 0
    }

    export enum LichtschrankenZustand {
        //% block="UNTERBROCHEN"
        Unterbrochen = 1,
        //% block="FREI"
        Frei = 0
    }

    // Anfangszustand der durch diese Erweiterung geschalteten LEDs = AUS.
    // Der Cache vermeidet, dass digitalReadPin den Ausgang umkonfiguriert.
    let ledPegel = [0, 0, 0, 0]
    // Vorläufige Werte für fischertechnik-Fototransistor, vom Modell abhängig.
    // Übliche Beschaltung des Sets: hell = kleiner Rohwert, dunkel = größer.
    let grenzeStark = 12
    let grenzeMittel = 22
    let grenzeSchwach = 40

    function digitalPin(port: Anschluss): DigitalPin {
        switch (port) {
            case Anschluss.P0: return DigitalPin.P0
            case Anschluss.P1: return DigitalPin.P1
            case Anschluss.P2: return DigitalPin.P2
            case Anschluss.P3: return DigitalPin.P3
            case Anschluss.C8: return DigitalPin.C8
            default: return DigitalPin.C9
        }
    }

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
    //% weight=100 group="Aktoren"
    export function led(pin: LEDAnschluss, zustand: LEDZustand): void {
        ledSchalten(pin, zustand)
    }

    // Die gemeinsame LED-Schaltlogik wird auch für die Lichtschranke genutzt.
    function ledSchalten(pin: LEDAnschluss, zustand: LEDZustand): void {
        let i = pin as number
        let neu = 0
        if (zustand === LEDZustand.An) neu = 1
        else if (zustand === LEDZustand.Wechseln) neu = ledPegel[i] === 1 ? 0 : 1
        ledPegel[i] = neu
        pins.digitalWritePin(digitalPin(pin as number as Anschluss), neu)
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
    //% weight=90 group="Aktoren"
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
        if (ledPegel[ledPin as number] !== 1) {
            ledSchalten(ledPin, LEDZustand.An)
            basic.pause(30)
        }
        let unterbrochen = lichtWert(sensorPin) > grenze(stufe)
        return zustand === LichtschrankenZustand.Unterbrochen ? unterbrochen : !unterbrochen
    }

    /**
     * Externer fischertechnik-Taster als Bedingung.
     * Verdrahtung: Schließer Kontakte 1+3 zwischen 3V und Signalpin.
     * Ein interner Pull-down hält den geöffneten Eingang auf 0.
     */
    //% blockId=ftcalliope_taster
    //% block="Taster Pin $pin ist $zustand"
    //% pin.defl=fischertechnik.Anschluss.P3
    //% weight=60 group="Sensoren"
    export function taster(pin: Anschluss, zustand: TasterZustand): boolean {
        let gpio = digitalPin(pin)
        pins.setPull(gpio, PinPullMode.PullDown)
        let gedrueckt = pins.digitalReadPin(gpio) === 1
        return zustand === TasterZustand.Gedrueckt ? gedrueckt : !gedrueckt
    }

    /** Kalibriert eine der drei Lichtstufen auf einen eigenen Analogwert (0 bis 1023). */
    //% blockId=ftcalliope_grenze
    //% block="Lichtstufe $stufe Grenzwert $wert"
    //% wert.min=0 wert.max=1023 wert.defl=22
    //% weight=20 group="Einstellungen" advanced=true
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
    //% weight=10 group="Einstellungen" advanced=true
    export function lichtMesswert(pin: SensorAnschluss): number {
        return lichtWert(pin)
    }
}
