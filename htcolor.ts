const enum HTCS2Mode {
    Active = 0, // Use ambient light cancellation
    Passive = 1, // Disable ambient light cancellation
    Raw = 3 // Raw data from light sensor
}

const enum HTCS2SoftMode {
    All = 0,
    Color = 1,
    Rgbw = 2,
    PassiveRgbw = 5,
    RawRgbw = 6,
}

const enum HTCS2FreqMode {
    //% block="50"
    Freq50 = 53, // Set sensor to 50Hz cancellation mode // 35
    //% block="60"
    Freq60 = 54 // Set sensor to 60Hz cancellation mode // 36
}

namespace sensors {

    /**
    * The new and totally redesigned HiTechnic Color Sensor V2 operates by using a single white LED to illuminate the target and analyses the color components of the light reflected by the target's surface and calculates a Color Number that is returned.
    * NOTE: The Color Sensor V2 must be configured to match the mains electricity frequency for your country details on how to configure the Color Sensor V2 can be found in the configuration tab on this page.
    */
    //% fixedInstances
    export class HiTechnicColorSensor extends sensors.internal.IICSensor {

        constructor(port: number) {
            super(port);
            this.setMode(HTCS2SoftMode.All);
        }
        
        setMode(m: HTCS2SoftMode) {
            //this.transaction(1, [65, m], 0);
            this._setMode(m);
        }

        _setMode(m: number) {
            let v = m | 0;
            this.mode = v;
            if (!this.isActive()) return;
            if (this.realmode != this.mode) {
                this.realmode = v;
                if (m == HTCS2SoftMode.All || m == HTCS2SoftMode.Color || m == HTCS2SoftMode.Rgbw) {
                    this.transaction(1, [65, HTCS2Mode.Active], 0);
                } else if (m == HTCS2SoftMode.PassiveRgbw) {
                    this.transaction(1, [65, HTCS2Mode.Passive], 0);
                } else if (m == HTCS2SoftMode.RawRgbw) {
                    this.transaction(1, [65, HTCS2Mode.Raw], 0);
                }
                //setIICMode(this._port, this._deviceType(), v);
            }
        }

        _query() {
            this.transaction(1, [66], 8);
            if (this.mode == HTCS2SoftMode.All) {
                return [this.getBytes()[0], this.getBytes()[1], this.getBytes()[2], this.getBytes()[3], this.getBytes()[4]];
            } else if (this.mode == HTCS2SoftMode.Color) {
                return [this.getBytes()[0]];
            } else if (this.mode == HTCS2SoftMode.Rgbw) {
                return [this.getBytes()[1], this.getBytes()[2], this.getBytes()[3], this.getBytes()[4]];
            } else if (this.mode == HTCS2SoftMode.PassiveRgbw || this.mode == HTCS2SoftMode.RawRgbw) {
                return [this.getBytes()[0], this.getBytes()[1], this.getBytes()[2], this.getBytes()[3], this.getBytes()[4], this.getBytes()[5], this.getBytes()[6], this.getBytes()[7]];
            }
            return [0];
        }

        _info() {
            if (HTCS2SoftMode.Color) {
                return [this._query()[0].toString()];
            } else if (this.mode == HTCS2SoftMode.All || this.mode == HTCS2SoftMode.Rgbw || this.mode == HTCS2SoftMode.PassiveRgbw || this.mode == HTCS2SoftMode.RawRgbw) {
                return this._query().map(number => number.toString());
            }
            return ["0"];
        }

        /**
         * Get software mode to HiTechnic Color Sensor v2.
         * @param sensor the ht color sensor v2 port
         */
        //% block="**ht color sensor** $this|get mode"
        //% blockId=HTCS2GetMode
        //% parts="htcolorsensor"
        //% blockNamespace=sensors
        //% this.fieldEditor="ports"
        //% weight=90
        //% subcategory="HiTechnic"
        //% blockHidden=true
        getMode() {
            return <HTCS2SoftMode>this.mode;
        }

        /**
         * Get array with color, red, green, blue, white values from HiTechnic Color Sensor v2.
         * @param sensor the ht color sensor v2 port
         */
        //% block="**ht color sensor** $this|all"
        //% blockId=HTCS2GetAll
        //% parts="htcolorsensor"
        //% blockNamespace=sensors
        //% this.fieldEditor="ports"
        //% weight=100 blockGap=12
        //% subcategory="HiTechnic"
        //% group="Color Sensor V2"
        getAll(): number[] {
            this.setMode(HTCS2SoftMode.All);
            this.poke();
            return this._query();
        }

        /**
         * Get color code from HiTechnic Color Sensor v2.
         * @param sensor the ht color sensor v2 port
         */
        //% block="**ht color sensor** $this|color"
        //% blockId=HTCS2GetColor
        //% parts="htcolorsensor"
        //% blockNamespace=sensors
        //% this.fieldEditor="ports"
        //% weight=99 blockGap=12
        //% subcategory="HiTechnic"
        //% group="Color Sensor V2"
        getColor(): number {
            this.setMode(HTCS2SoftMode.Color);
            this.poke();
            return this._query()[0];
        }

        /**
         * Get array with RGBW values from HiTechnic Color Sensor v2.
         * @param sensor the ht color sensor v2 port
         */
        //% block="**ht color sensor** $this|RGBW"
        //% blockId=HTCS2GetRGBW
        //% parts="htcolorsensor"
        //% blockNamespace=sensors
        //% this.fieldEditor="ports"
        //% weight=98 blockGap=12
        //% subcategory="HiTechnic"
        //% group="Color Sensor V2"
        getRGBW(): number[] {
            this.setMode(HTCS2SoftMode.Rgbw);
            this.poke();
            return this._query();
        }

        /**
         * Get array with RGBW values from HiTechnic Color Sensor v2 when the backlight is off.
         * @param sensor the ht color sensor v2 port
         */
        //% block="**ht color sensor** $this|RGBW at passive"
        //% blockId=HTCS2GetPassiveRGBW
        //% parts="htcolorsensor"
        //% blockNamespace=sensors
        //% this.fieldEditor="ports"
        //% weight=97 blockGap=12
        //% subcategory="HiTechnic"
        //% group="Color Sensor V2"
        getPassiveRGBW(): number[] {
            this.setMode(HTCS2SoftMode.PassiveRgbw);
            const r = this.getBytes()[0] * 256 + this.getBytes()[1];
            const g = this.getBytes()[2] * 256 + this.getBytes()[3];
            const b = this.getBytes()[4] * 256 + this.getBytes()[5];
            const w = this.getBytes()[6] * 256 + this.getBytes()[7];
            return [r, g, b, w];
        }

        /**
         * Get array with raw RGBW values from HiTechnic Color Sensor v2.
         * @param sensor the ht color sensor v2 port
         */
        //% block="**ht color sensor** $this|raw RGBW"
        //% blockId=HTCS2GetRawRGBW
        //% parts="htcolorsensor"
        //% blockNamespace=sensors
        //% this.fieldEditor="ports"
        //% weight=97
        //% subcategory="HiTechnic"
        //% group="Color Sensor V2"
        getRawRGBW(): number[] {
            this.setMode(HTCS2SoftMode.RawRgbw);
            const r = this.getBytes()[0] * 256 + this.getBytes()[1];
            const g = this.getBytes()[2] * 256 + this.getBytes()[3];
            const b = this.getBytes()[4] * 256 + this.getBytes()[5];
            const w = this.getBytes()[6] * 256 + this.getBytes()[7];
            return [r, g, b, w];
        }

        /**
         * Get array with HSVL values from HiTechnic Color Sensor v2.
         * @param sensor the ht color sensor v2 port
         */
        //% block="**ht color sensor** $this|HSVL"
        //% blockId=HTCS2GetHSVL
        //% parts="htcolorsensor"
        //% blockNamespace=sensors
        //% this.fieldEditor="ports"
        //% weight=95
        //% subcategory="HiTechnic"
        //% group="Color Sensor V2"
        getHSVL(): number[] {
            // https://github.com/ofdl-robotics-tw/EV3-CLEV3R-Modules/blob/main/Mods/HTColorV2.bpm
            this.setMode(HTCS2SoftMode.Rgbw);
            this.poke();
            const rgbArr = this._query();
            let r = rgbArr[0], g = rgbArr[1], b = rgbArr[2];

            // https://clev3r.ru/codesamples/
            // Color sensor V2 RGB Maxmium is 255
            let hue = 0, sat = 0, val = 0;

            let max = Math.max(Math.max(r, g), b);
            let min = Math.min(Math.min(r, g), b);
            let light = (max + min) / 5.12;
            val = max / 2.56;
            if (val == 0) { // It's black, there's no way to tell hue and sat
                hue = -1;
                sat = -1;
            }

            if (hue != -1 && sat != -1) {
                r = r / max;
                g = g / max;
                b = b / max;
                max = Math.max(Math.max(r, g), b);
                min = Math.min(Math.min(r, g), b);
                sat = (max - min) * 100;
                if (sat == 0) hue = -1;

                if (hue != -1) { // It's white, there's no way to tell hue
                    r = (r - min) / (max - min);
                    g = (g - min) / (max - min);
                    b = (b - min) / (max - min);
                    max = Math.max(r, g);
                    max = Math.max(max, b);
                    min = Math.min(r, g);
                    min = Math.min(min, b);

                    if (max == r) {
                        hue = 0 + 60 * (g - b);
                        if (hue < 0) hue += 360;
                    } else if (max == g) hue = 120 + 60 * (b - r);
                    else hue = 240 + 60 * (r - g);
                }
            }
            return [Math.round(hue), Math.round(sat), Math.round(val), Math.round(light)];
        }

        /**
         * Set the sensor to the selected frequency to HiTechnic Color Sensor v2. The Sensor is configured by default for locations with 60Hz electrical supplies.
         * @param sensor the ht color sensor v2 port
         * @param sensor the ht color sensor v2 frequency
         */
        //% block="**ht color sensor** $this|set $freq|(Hz) frequency"
        //% blockId=HTCS2SetHz
        //% parts="htcolorsensor"
        //% blockNamespace=sensors
        //% this.fieldEditor="ports"
        //% weight=89 blockGap=12
        //% subcategory="HiTechnic"
        setHz(freq: HTCS2FreqMode) {
            //blockHidden=true
            // https://github.com/ofdl-robotics-tw/EV3-CLEV3R-Modules/blob/main/Mods/HTColorV2.bpm
            this.transaction(1, [65, freq], 0);
        }

        _IICId() {
            return 'HiTechncColorPD';
        }
    }

    //% whenUsed block="1" weight=95 fixedInstance jres=icons.port1
    export const htColor1 = new HiTechnicColorSensor(1);

    //% whenUsed block="2" weight=90 fixedInstance jres=icons.port2
    export const htColor2 = new HiTechnicColorSensor(2);

    //% whenUsed block="3" weight=90 fixedInstance jres=icons.port3
    export const htColor3 = new HiTechnicColorSensor(3);
    
    //% whenUsed block="4" weight=90 fixedInstance jres=icons.port4
    export const htColor4 = new HiTechnicColorSensor(4);
}