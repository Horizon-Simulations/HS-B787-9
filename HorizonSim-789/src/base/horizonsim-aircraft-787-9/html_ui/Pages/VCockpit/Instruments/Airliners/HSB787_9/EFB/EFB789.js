/**
 * Valid type arguments for Set/GetSimVarValue
 */
var SimVarValueType;
(function (SimVarValueType) {
    SimVarValueType["Amps"] = "Amperes";
    SimVarValueType["Bool"] = "bool";
    SimVarValueType["Celsius"] = "celsius";
    SimVarValueType["Degree"] = "degrees";
    SimVarValueType["Enum"] = "enum";
    SimVarValueType["Farenheit"] = "farenheit";
    SimVarValueType["Feet"] = "feet";
    SimVarValueType["FPM"] = "feet per minute";
    SimVarValueType["GAL"] = "gallons";
    SimVarValueType["GPH"] = "gph";
    SimVarValueType["Hours"] = "Hours";
    SimVarValueType["HPA"] = "hectopascals";
    SimVarValueType["InHG"] = "inches of mercury";
    SimVarValueType["KHz"] = "KHz";
    SimVarValueType["Knots"] = "knots";
    SimVarValueType["LBS"] = "pounds";
    SimVarValueType["LLA"] = "latlonalt";
    SimVarValueType["Mach"] = "mach";
    SimVarValueType["MB"] = "Millibars";
    SimVarValueType["Meters"] = "meters";
    SimVarValueType["MetersPerSecond"] = "meters per second";
    SimVarValueType["MetersPerSecondSquared"] = "meters per second squared";
    SimVarValueType["MillimetersWater"] = "millimeters of water";
    SimVarValueType["MHz"] = "MHz";
    SimVarValueType["NM"] = "nautical mile";
    SimVarValueType["Number"] = "number";
    SimVarValueType["Percent"] = "percent";
    SimVarValueType["PercentOver100"] = "percent over 100";
    SimVarValueType["Pounds"] = "pounds";
    SimVarValueType["PPH"] = "Pounds per hour";
    SimVarValueType["PSI"] = "psi";
    SimVarValueType["Radians"] = "radians";
    SimVarValueType["Rankine"] = "rankine";
    SimVarValueType["RPM"] = "Rpm";
    SimVarValueType["Seconds"] = "seconds";
    SimVarValueType["SlugsPerCubicFoot"] = "slug per cubic foot";
    SimVarValueType["String"] = "string";
    SimVarValueType["Volts"] = "Volts";
})(SimVarValueType || (SimVarValueType = {}));
const latlonaltRegEx = new RegExp(/latlonalt/i);
const latlonaltpbhRegex = new RegExp(/latlonaltpbh/i);
const pbhRegex = new RegExp(/pbh/i);
const pid_structRegex = new RegExp(/pid_struct/i);
const xyzRegex = new RegExp(/xyz/i);
const stringRegex = new RegExp(/string/i);
const boolRegex = new RegExp(/boolean|bool/i);
const numberRegex = new RegExp(/number/i);
const defaultSource = '';
SimVar.GetSimVarValue = (name, unit, dataSource = defaultSource) => {
    try {
        if (simvar) {
            let output;
            const registeredID = SimVar.GetRegisteredId(name, unit, dataSource);
            if (registeredID >= 0) {
                if (numberRegex.test(unit)) {
                    output = simvar.getValueReg(registeredID);
                }
                else if (stringRegex.test(unit)) {
                    output = simvar.getValueReg_String(registeredID);
                }
                else if (latlonaltRegEx.test(unit)) {
                    output = new LatLongAlt(simvar.getValue_LatLongAlt(name, dataSource));
                }
                else if (latlonaltpbhRegex.test(unit)) {
                    output = new LatLongAltPBH(simvar.getValue_LatLongAltPBH(name, dataSource));
                }
                else if (pbhRegex.test(unit)) {
                    output = new PitchBankHeading(simvar.getValue_PBH(name, dataSource));
                }
                else if (pid_structRegex.test(unit)) {
                    output = new PID_STRUCT(simvar.getValue_PID_STRUCT(name, dataSource));
                }
                else if (xyzRegex.test(unit)) {
                    output = new XYZ(simvar.getValue_XYZ(name, dataSource));
                }
                else {
                    output = simvar.getValueReg(registeredID);
                }
            }
            return output;
        }
        else {
            console.warn('SimVar handler is not defined (' + name + ')');
        }
    }
    catch (error) {
        console.warn('ERROR ', error, ' GetSimVarValue ' + name + ' unit : ' + unit);
        return null;
    }
    return null;
};
SimVar.SetSimVarValue = (name, unit, value, dataSource = defaultSource) => {
    if (value == undefined) {
        console.warn(name + ' : Trying to set a null value');
        return Promise.resolve();
    }
    try {
        if (simvar) {
            const regID = SimVar.GetRegisteredId(name, unit, dataSource);
            if (regID >= 0) {
                if (stringRegex.test(unit)) {
                    return Coherent.call('setValueReg_String', regID, value);
                }
                else if (boolRegex.test(unit)) {
                    return Coherent.call('setValueReg_Bool', regID, !!value);
                }
                else if (numberRegex.test(unit)) {
                    return Coherent.call('setValueReg_Number', regID, value);
                }
                else if (latlonaltRegEx.test(unit)) {
                    return Coherent.call('setValue_LatLongAlt', name, value, dataSource);
                }
                else if (latlonaltpbhRegex.test(unit)) {
                    return Coherent.call('setValue_LatLongAltPBH', name, value, dataSource);
                }
                else if (pbhRegex.test(unit)) {
                    return Coherent.call('setValue_PBH', name, value, dataSource);
                }
                else if (pid_structRegex.test(unit)) {
                    return Coherent.call('setValue_PID_STRUCT', name, value, dataSource);
                }
                else if (xyzRegex.test(unit)) {
                    return Coherent.call('setValue_XYZ', name, value, dataSource);
                }
                else {
                    return Coherent.call('setValueReg_Number', regID, value);
                }
            }
        }
        else {
            console.warn('SimVar handler is not defined');
        }
    }
    catch (error) {
        console.warn('error SetSimVarValue ' + error);
    }
    return Promise.resolve();
};

/**
 * A number with an associated unit. Each NumberUnit is created with a reference unit type,
 * which cannot be changed after instantiation. The reference unit type determines how the
 * value of the NumberUnit is internally represented. Each NumberUnit also maintains an
 * active unit type, which can be dynamically changed at any time.
 */
class NumberUnit {
    /**
     * Constructor.
     * @param number - the initial numeric value of the new NumberUnit.
     * @param unit - the unit type of the new NumberUnit.
     */
    constructor(number, unit) {
        this._number = number;
        this._unit = unit;
        this.readonly = new NumberUnitReadOnly(this);
    }
    /**
     * Gets this NumberUnit's numeric value.
     * @returns This NumberUnit's numeric value.
     */
    get number() {
        return this._number;
    }
    /**
     * Gets this NumberUnit's unit type.
     * @returns This NumberUnit's unit type.
     */
    get unit() {
        return this._unit;
    }
    /**
     * Converts a value to a numeric value with this NumberUnit's unit type.
     * @param value - the value.
     * @param unit - the unit type of the new value. Defaults to this NumberUnit's unit type. This argument is ignored if
     * value is a NumberUnit.
     * @returns the numeric of the value with this NumberUnit's unit type.
     */
    toNumberOfThisUnit(value, unit) {
        if ((typeof value !== 'number') && this.unit.canConvert(value.unit)) {
            return this.unit.convertFrom(value.number, value.unit);
        }
        if (typeof value === 'number' && (!unit || this.unit.canConvert(unit))) {
            return unit ? this.unit.convertFrom(value, unit) : value;
        }
        return undefined;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    set(arg1, arg2) {
        const converted = this.toNumberOfThisUnit(arg1, arg2);
        if (converted !== undefined) {
            this._number = converted;
            return this;
        }
        throw new Error('Invalid unit conversion attempted.');
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    add(arg1, arg2, arg3) {
        const isArg2NumberUnit = arg2 instanceof NumberUnit;
        const converted = this.toNumberOfThisUnit(arg1, isArg2NumberUnit ? undefined : arg2);
        if (converted !== undefined) {
            let out = isArg2NumberUnit ? arg2 : arg3;
            if (out) {
                out.set(this.number + converted, this.unit);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                out = this;
                this._number += converted;
            }
            return out;
        }
        throw new Error('Invalid unit conversion attempted.');
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    subtract(arg1, arg2, arg3) {
        const isArg2NumberUnit = arg2 instanceof NumberUnit;
        const converted = this.toNumberOfThisUnit(arg1, isArg2NumberUnit ? undefined : arg2);
        if (converted !== undefined) {
            let out = isArg2NumberUnit ? arg2 : arg3;
            if (out) {
                out.set(this.number - converted, this.unit);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                out = this;
                this._number -= converted;
            }
            return out;
        }
        throw new Error('Invalid unit conversion attempted.');
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    scale(factor, out) {
        if (out) {
            return out.set(this.number * factor, this.unit);
        }
        else {
            this._number *= factor;
            return this;
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    ratio(value, unit) {
        const converted = this.toNumberOfThisUnit(value, unit);
        if (converted) {
            return this.number / converted;
        }
        throw new Error('Invalid unit conversion attempted.');
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    abs(out) {
        if (out) {
            return out.set(Math.abs(this.number), this.unit);
        }
        else {
            this._number = Math.abs(this._number);
            return this;
        }
    }
    /**
     * Returns the numeric value of this NumberUnit after conversion to a specified unit.
     * @param unit The unit to which to convert.
     * @returns The converted numeric value.
     * @throws Error if this NumberUnit's unit type cannot be converted to the specified unit.
     */
    asUnit(unit) {
        return this.unit.convertTo(this.number, unit);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    compare(value, unit) {
        const converted = this.toNumberOfThisUnit(value, unit);
        if (converted === undefined) {
            throw new Error('Invalid unit conversion attempted.');
        }
        const diff = this.number - converted;
        if (Math.abs(diff) < 1e-14) {
            return 0;
        }
        return Math.sign(diff);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    equals(value, unit) {
        const converted = this.toNumberOfThisUnit(value, unit);
        if (converted === undefined) {
            return false;
        }
        if (isNaN(converted) && this.isNaN()) {
            return true;
        }
        const diff = this.number - converted;
        return !isNaN(diff) && Math.abs(diff) < 1e-14;
    }
    /**
     * Checks whether this NumberUnit has a numeric value of NaN.
     * @returns Whether this NumberUnit has a numeric value of NaN.
     */
    isNaN() {
        return isNaN(this.number);
    }
    /**
     * Copies this NumberUnit.
     * @returns A copy of this NumberUnit.
     */
    copy() {
        return new NumberUnit(this.number, this.unit);
    }
}
/**
 * A read-only interface for a WT_NumberUnit.
 */
class NumberUnitReadOnly {
    /**
     * Constructor.
     * @param source - the source of the new read-only NumberUnit.
     */
    constructor(source) {
        this.source = source;
    }
    /**
     * Gets this NumberUnit's numeric value.
     * @returns This NumberUnit's numeric value.
     */
    get number() {
        return this.source.number;
    }
    /**
     * Gets this NumberUnit's unit type.
     * @returns This NumberUnit's unit type.
     */
    get unit() {
        return this.source.unit;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    add(arg1, arg2, arg3) {
        const isArg2NumberUnit = arg2 instanceof NumberUnit;
        const out = (isArg2NumberUnit ? arg2 : arg3);
        if (typeof arg1 === 'number') {
            return this.source.add(arg1, arg2, out);
        }
        else {
            return this.source.add(arg1, out);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    subtract(arg1, arg2, arg3) {
        const isArg2NumberUnit = arg2 instanceof NumberUnit;
        const out = (isArg2NumberUnit ? arg2 : arg3);
        if (typeof arg1 === 'number') {
            return this.source.subtract(arg1, arg2, out);
        }
        else {
            return this.source.subtract(arg1, out);
        }
    }
    /**
     * Scales this NumberUnit by a unit-less factor and returns the result.
     * @param factor The factor by which to scale.
     * @param out The NumberUnit to which to write the result.
     * @returns The scaled value.
     */
    scale(factor, out) {
        return this.source.scale(factor, out);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    ratio(arg1, arg2) {
        if (typeof arg1 === 'number') {
            return this.source.ratio(arg1, arg2);
        }
        else {
            return this.source.ratio(arg1);
        }
    }
    /**
     * Calculates the absolute value of this NumberUnit and returns the result.
     * @param out The NumberUnit to which to write the result.
     * @returns The absolute value.
     */
    abs(out) {
        return this.source.abs(out);
    }
    /**
     * Returns the numeric value of this NumberUnit after conversion to a specified unit.
     * @param unit The unit to which to convert.
     * @returns The converted numeric value.
     * @throws Error if this NumberUnit's unit type cannot be converted to the specified unit.
     */
    asUnit(unit) {
        return this.source.asUnit(unit);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    compare(arg1, arg2) {
        if (typeof arg1 === 'number') {
            return this.source.compare(arg1, arg2);
        }
        else {
            return this.source.compare(arg1);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    equals(arg1, arg2) {
        if (typeof arg1 === 'number') {
            return this.source.equals(arg1, arg2);
        }
        else {
            return this.source.equals(arg1);
        }
    }
    /**
     * Checks whether this NumberUnit has a numeric value of NaN.
     * @returns Whether this NumberUnit has a numeric value of NaN.
     */
    isNaN() {
        return this.source.isNaN();
    }
    /**
     * Copies this NumberUnit.
     * @returns A copy of this NumberUnit.
     */
    copy() {
        return this.source.copy();
    }
}
/**
 * A unit of measurement.
 */
class AbstractUnit {
    /**
     * Constructor.
     * @param name The name of this unit.
     */
    constructor(name) {
        this.name = name;
    }
    /** @inheritdoc */
    canConvert(otherUnit) {
        return this.family === otherUnit.family;
    }
    /** @inheritdoc */
    createNumber(value) {
        return new NumberUnit(value, this);
    }
    /** @inheritdoc */
    equals(other) {
        return this.family === other.family && this.name === other.name;
    }
}
/**
 * A unit that can be converted to another unit of the same type via a fixed linear transformation.
 */
class SimpleUnit extends AbstractUnit {
    /**
     * Constructor.
     * @param family The family to which this unit belongs.
     * @param name The name of this unit.
     * @param scaleFactor The relative linear scale of the new unit compared to the standard unit of the same family.
     * @param zeroOffset The zero offset of the new unit compared to the standard unit of the same family.
     */
    constructor(family, name, scaleFactor, zeroOffset = 0) {
        super(name);
        this.family = family;
        this.scaleFactor = scaleFactor;
        this.zeroOffset = zeroOffset;
    }
    /** @inheritdoc */
    canConvert(otherUnit) {
        return otherUnit instanceof SimpleUnit && super.canConvert(otherUnit);
    }
    /** @inheritdoc */
    convertTo(value, toUnit) {
        if (!this.canConvert(toUnit)) {
            throw new Error(`Invalid conversion from ${this.name} to ${toUnit.name}.`);
        }
        return (value + this.zeroOffset) * (this.scaleFactor / toUnit.scaleFactor) - toUnit.zeroOffset;
    }
    /** @inheritdoc */
    convertFrom(value, fromUnit) {
        if (!this.canConvert(fromUnit)) {
            throw new Error(`Invalid conversion from ${fromUnit.name} to ${this.name}.`);
        }
        return (value + fromUnit.zeroOffset) * (fromUnit.scaleFactor / this.scaleFactor) - this.zeroOffset;
    }
}
/**
 * A unit of measure composed of the multiplicative combination of multiple elementary units.
 */
class CompoundUnit extends AbstractUnit {
    /**
     * Constructor.
     * @param family The family to which this unit belongs.
     * @param numerator An array of CompoundableUnits containing all the units in the numerator of the compound unit.
     * @param denominator An array of CompoundableUnits containing all the units in the denominator of the compound unit.
     * @param name The name of this unit. If not defined, one will be automatically generated.
     */
    constructor(family, numerator, denominator, name) {
        // if not specified, build name from component units.
        if (name === undefined) {
            name = '';
            let i = 0;
            while (i < numerator.length - 1) {
                name += `${numerator[i++].name}-`;
            }
            name += `${numerator[i].name}`;
            if (denominator.length > 0) {
                name += ' per ';
                i = 0;
                while (i < denominator.length - 1) {
                    name += `${denominator[i++].name}-`;
                }
                name += `${denominator[i].name}`;
            }
        }
        super(name);
        this.family = family;
        this.numerator = Array.from(numerator);
        this.denominator = Array.from(denominator);
        this.numerator.sort((a, b) => a.family.localeCompare(b.family));
        this.denominator.sort((a, b) => a.family.localeCompare(b.family));
        this.scaleFactor = this.getScaleFactor();
    }
    /**
     * Gets the scale factor for this unit.
     * @returns the scale factor for this unit.
     */
    getScaleFactor() {
        let factor = 1;
        factor = this.numerator.reduce((prev, curr) => prev * curr.scaleFactor, factor);
        factor = this.denominator.reduce((prev, curr) => prev / curr.scaleFactor, factor);
        return factor;
    }
    /** @inheritdoc */
    canConvert(otherUnit) {
        return otherUnit instanceof CompoundUnit && super.canConvert(otherUnit);
    }
    /** @inheritdoc */
    convertTo(value, toUnit) {
        if (!this.canConvert(toUnit)) {
            throw new Error(`Invalid conversion from ${this.name} to ${toUnit.name}.`);
        }
        return value * (this.scaleFactor / toUnit.scaleFactor);
    }
    /** @inheritdoc */
    convertFrom(value, fromUnit) {
        if (!this.canConvert(fromUnit)) {
            throw new Error(`Invalid conversion from ${fromUnit.name} to ${this.name}.`);
        }
        return value * (fromUnit.scaleFactor / this.scaleFactor);
    }
}
/**
 * Predefined unit families.
 */
var UnitFamily;
(function (UnitFamily) {
    UnitFamily["Distance"] = "distance";
    UnitFamily["Angle"] = "angle";
    UnitFamily["Duration"] = "duration";
    UnitFamily["Weight"] = "weight";
    UnitFamily["Mass"] = "weight";
    UnitFamily["Volume"] = "volume";
    UnitFamily["Pressure"] = "pressure";
    UnitFamily["Temperature"] = "temperature";
    UnitFamily["TemperatureDelta"] = "temperature_delta";
    UnitFamily["Speed"] = "speed";
    UnitFamily["Acceleration"] = "acceleration";
    UnitFamily["WeightFlux"] = "weight_flux";
    UnitFamily["MassFlux"] = "weight_flux";
    UnitFamily["VolumeFlux"] = "volume_flux";
    UnitFamily["Density"] = "density";
    UnitFamily["Force"] = "force";
})(UnitFamily || (UnitFamily = {}));
/**
 * Predefined unit types.
 */
class UnitType {
}
UnitType.METER = new SimpleUnit(UnitFamily.Distance, 'meter', 1);
UnitType.FOOT = new SimpleUnit(UnitFamily.Distance, 'foot', 0.3048);
UnitType.KILOMETER = new SimpleUnit(UnitFamily.Distance, 'kilometer', 1000);
/** Statute mile. */
UnitType.MILE = new SimpleUnit(UnitFamily.Distance, 'mile', 1609.34);
/** Nautical mile. */
UnitType.NMILE = new SimpleUnit(UnitFamily.Distance, 'nautical mile', 1852);
/** Great-arc radian. The average radius of Earth. */
UnitType.GA_RADIAN = new SimpleUnit(UnitFamily.Distance, 'great arc radian', 6378100);
/** 9.80665 meters, for internal use. */
UnitType.G_METER = new SimpleUnit(UnitFamily.Distance, '9.80665 meter', 9.80665);
UnitType.RADIAN = new SimpleUnit(UnitFamily.Angle, 'radian', 1);
UnitType.DEGREE = new SimpleUnit(UnitFamily.Angle, 'degree', Math.PI / 180);
UnitType.ARC_MIN = new SimpleUnit(UnitFamily.Angle, 'minute', Math.PI / 180 / 60);
UnitType.ARC_SEC = new SimpleUnit(UnitFamily.Angle, 'second', Math.PI / 180 / 3600);
UnitType.MILLISECOND = new SimpleUnit(UnitFamily.Duration, 'millisecond', 0.001);
UnitType.SECOND = new SimpleUnit(UnitFamily.Duration, 'second', 1);
UnitType.MINUTE = new SimpleUnit(UnitFamily.Duration, 'minute', 60);
UnitType.HOUR = new SimpleUnit(UnitFamily.Duration, 'hour', 3600);
UnitType.KILOGRAM = new SimpleUnit(UnitFamily.Weight, 'kilogram', 1);
UnitType.POUND = new SimpleUnit(UnitFamily.Weight, 'pound', 0.453592);
UnitType.SLUG = new SimpleUnit(UnitFamily.Weight, 'slug', 14.59390);
UnitType.TON = new SimpleUnit(UnitFamily.Weight, 'ton', 907.185);
UnitType.TONNE = new SimpleUnit(UnitFamily.Weight, 'tonne', 1000);
/** Weight equivalent of one liter of fuel, using the generic conversion 1 gallon = 6.7 pounds. */
UnitType.LITER_FUEL = new SimpleUnit(UnitFamily.Weight, 'liter', 0.80283679);
/** Weight equivalent of one gallon of fuel, using the generic conversion 1 gallon = 6.7 pounds. */
UnitType.GALLON_FUEL = new SimpleUnit(UnitFamily.Weight, 'gallon', 3.0390664);
/** Weight equivalent of one imperial gallon of fuel, using the generic conversion 1 gallon = 6.7 pounds. */
UnitType.IMP_GALLON_FUEL = new SimpleUnit(UnitFamily.Weight, 'imperial gallon', 3.6497683);
UnitType.LITER = new SimpleUnit(UnitFamily.Volume, 'liter', 1);
UnitType.GALLON = new SimpleUnit(UnitFamily.Volume, 'gallon', 3.78541);
/** Hectopascal. */
UnitType.HPA = new SimpleUnit(UnitFamily.Pressure, 'hectopascal', 1);
/** Atmosphere. */
UnitType.ATM = new SimpleUnit(UnitFamily.Pressure, 'atmosphere', 1013.25);
/** Inch of mercury. */
UnitType.IN_HG = new SimpleUnit(UnitFamily.Pressure, 'inch of mercury', 33.8639);
/** Millimeter of mercury. */
UnitType.MM_HG = new SimpleUnit(UnitFamily.Pressure, 'millimeter of mercury', 1.33322);
/** Pound per square inch. */
UnitType.PSI = new SimpleUnit(UnitFamily.Pressure, 'pound per square inch', 68.9476);
UnitType.KELVIN = new SimpleUnit(UnitFamily.Temperature, 'kelvin', 1, 0);
UnitType.CELSIUS = new SimpleUnit(UnitFamily.Temperature, '° Celsius', 1, 273.15);
UnitType.FAHRENHEIT = new SimpleUnit(UnitFamily.Temperature, '° Fahrenheit', 5 / 9, 459.67);
UnitType.RANKINE = new SimpleUnit(UnitFamily.Temperature, '° Rankine', 5 / 9, 0);
/** Change in degrees Celsius. */
UnitType.DELTA_CELSIUS = new SimpleUnit(UnitFamily.TemperatureDelta, 'Δ° Celsius', 1);
/** Change in degrees Fahrenheit. */
UnitType.DELTA_FAHRENHEIT = new SimpleUnit(UnitFamily.TemperatureDelta, 'Δ° Fahrenheit', 5 / 9);
UnitType.KNOT = new CompoundUnit(UnitFamily.Speed, [UnitType.NMILE], [UnitType.HOUR], 'knot');
/** Kilometer per hour. */
UnitType.KPH = new CompoundUnit(UnitFamily.Speed, [UnitType.KILOMETER], [UnitType.HOUR]);
/** Miles per hour. */
UnitType.MPH = new CompoundUnit(UnitFamily.Speed, [UnitType.MILE], [UnitType.HOUR]);
/** Meter per minute. */
UnitType.MPM = new CompoundUnit(UnitFamily.Speed, [UnitType.METER], [UnitType.MINUTE]);
/** Meter per second. */
UnitType.MPS = new CompoundUnit(UnitFamily.Speed, [UnitType.METER], [UnitType.SECOND]);
/** Foot per minute. */
UnitType.FPM = new CompoundUnit(UnitFamily.Speed, [UnitType.FOOT], [UnitType.MINUTE]);
/** Foot per second. */
UnitType.FPS = new CompoundUnit(UnitFamily.Speed, [UnitType.FOOT], [UnitType.SECOND]);
/** Meter per minute per second. */
UnitType.MPM_PER_SEC = new CompoundUnit(UnitFamily.Acceleration, [UnitType.METER], [UnitType.MINUTE, UnitType.SECOND]);
/** Meter per second per second. */
UnitType.MPS_PER_SEC = new CompoundUnit(UnitFamily.Acceleration, [UnitType.METER], [UnitType.SECOND, UnitType.SECOND]);
/** Foot per minute per second. */
UnitType.FPM_PER_SEC = new CompoundUnit(UnitFamily.Acceleration, [UnitType.FOOT], [UnitType.MINUTE, UnitType.SECOND]);
/** Foot per second per second. */
UnitType.FPS_PER_SEC = new CompoundUnit(UnitFamily.Acceleration, [UnitType.FOOT], [UnitType.SECOND, UnitType.SECOND]);
/** Knot per second. */
UnitType.KNOT_PER_SEC = new CompoundUnit(UnitFamily.Acceleration, [UnitType.NMILE], [UnitType.HOUR, UnitType.SECOND]);
/** Average gravitational acceleration on Earth at sea level. */
UnitType.G_ACCEL = new CompoundUnit(UnitFamily.Acceleration, [UnitType.G_METER], [UnitType.SECOND, UnitType.SECOND]);
/** Kilogram per hour. */
UnitType.KGH = new CompoundUnit(UnitFamily.WeightFlux, [UnitType.KILOGRAM], [UnitType.HOUR]);
/** Pound per hour. */
UnitType.PPH = new CompoundUnit(UnitFamily.WeightFlux, [UnitType.POUND], [UnitType.HOUR]);
/** Weight equivalent of one liter of fuel per hour, using the generic conversion 1 gallon = 6.7 pounds. */
UnitType.LPH_FUEL = new CompoundUnit(UnitFamily.WeightFlux, [UnitType.LITER_FUEL], [UnitType.HOUR]);
/** Weight equivalent of one gallon of fuel per hour, using the generic conversion 1 gallon = 6.7 pounds. */
UnitType.GPH_FUEL = new CompoundUnit(UnitFamily.WeightFlux, [UnitType.GALLON_FUEL], [UnitType.HOUR]);
/** Weight equivalent of one imperial gallon of fuel per hour, using the generic conversion 1 gallon = 6.7 pounds. */
UnitType.IGPH_FUEL = new CompoundUnit(UnitFamily.WeightFlux, [UnitType.IMP_GALLON_FUEL], [UnitType.HOUR]);
/** Density in slugs per cubic foot */
UnitType.SLUG_PER_FT3 = new CompoundUnit(UnitFamily.Density, [UnitType.SLUG], [UnitType.FOOT, UnitType.FOOT, UnitType.FOOT]);
/** Density in kilograms per cubic meter */
UnitType.KG_PER_M3 = new CompoundUnit(UnitFamily.Density, [UnitType.KILOGRAM], [UnitType.METER, UnitType.METER, UnitType.METER]);
/** Newton. */
UnitType.NEWTON = new CompoundUnit(UnitFamily.Force, [UnitType.KILOGRAM, UnitType.METER], [UnitType.SECOND, UnitType.SECOND]);
/** Pound (force). */
UnitType.POUND_FORCE = new CompoundUnit(UnitFamily.Force, [UnitType.POUND, UnitType.G_METER], [UnitType.SECOND, UnitType.SECOND]);

/**
 * A basic event-bus publisher.
 */
class BasePublisher {
    /**
     * Creates an instance of BasePublisher.
     * @param bus The common event bus.
     * @param pacer An optional pacer to control the rate of publishing.
     */
    constructor(bus, pacer = undefined) {
        this.bus = bus;
        this.publisher = this.bus.getPublisher();
        this.publishActive = false;
        this.pacer = pacer;
    }
    /**
     * Start publishing.
     */
    startPublish() {
        this.publishActive = true;
    }
    /**
     * Stop publishing.
     */
    stopPublish() {
        this.publishActive = false;
    }
    /**
     * Tells whether or not the publisher is currently active.
     * @returns True if the publisher is active, false otherwise.
     */
    isPublishing() {
        return this.publishActive;
    }
    /**
     * A callback called when the publisher receives an update cycle.
     */
    onUpdate() {
        return;
    }
    /**
     * Publish a message if publishing is acpive
     * @param topic The topic key to publish to.
     * @param data The data type for chosen topic.
     * @param sync Whether or not the event should be synced to other instruments. Defaults to `false`.
     * @param isCached Whether or not the event should be cached. Defaults to `true`.
     */
    publish(topic, data, sync = false, isCached = true) {
        if (this.publishActive && (!this.pacer || this.pacer.canPublish(topic, data))) {
            this.publisher.pub(topic, data, sync, isCached);
        }
    }
}
/**
 * A base class for publishers that need to handle simvars with built-in
 * support for pacing callbacks.
 */
class SimVarPublisher extends BasePublisher {
    /**
     * Create a SimVarPublisher
     * @param simVarMap A map of simvar event type keys to a SimVarDefinition.
     * @param bus The EventBus to use for publishing.
     * @param pacer An optional pacer to control the rate of publishing.
     */
    constructor(simVarMap, bus, pacer) {
        super(bus, pacer);
        this.resolvedSimVars = new Map();
        this.indexedSimVars = new Map();
        this.subscribed = new Set();
        for (const [topic, entry] of simVarMap) {
            if (entry.indexed) {
                this.indexedSimVars.set(topic, {
                    name: entry.name,
                    type: entry.type,
                    map: entry.map,
                    indexes: entry.indexed === true ? undefined : new Set(entry.indexed),
                    defaultIndex: entry.defaultIndex,
                });
            }
            else {
                this.resolvedSimVars.set(topic, Object.assign({}, entry));
            }
        }
        const handleSubscribedTopic = (topic) => {
            if (this.resolvedSimVars.has(topic)) {
                // If topic matches an already resolved topic -> start publishing.
                this.onTopicSubscribed(topic);
            }
            else {
                // Check if topic matches indexed topic.
                this.tryMatchIndexedSubscribedTopic(topic);
            }
        };
        // Iterate over each subscribed topic on the bus to see if it matches any of our topics. If so, start publishing.
        this.bus.forEachSubscribedTopic(handleSubscribedTopic);
        // Listen to first-time topic subscriptions. If any of them match our topics, start publishing.
        this.bus.getSubscriber().on('event_bus_topic_first_sub').handle(handleSubscribedTopic);
    }
    /**
     * Checks if a subscribed topic matches one of this publisher's indexed topics, and if so resolves and starts
     * publishing the indexed topic.
     * @param topic The subscribed topic to check.
     */
    tryMatchIndexedSubscribedTopic(topic) {
        var _a;
        if (this.indexedSimVars.size === 0) {
            return;
        }
        let entry = this.indexedSimVars.get(topic);
        if (entry) {
            // The subscribed topic matches an unsuffixed topic -> check if the unsuffixed topic should be published and if
            // so, resolve the default index.
            if (entry.defaultIndex !== null) {
                const resolved = this.resolveIndexedSimVar(topic, entry, (_a = entry.defaultIndex) !== null && _a !== void 0 ? _a : 1);
                if (resolved !== undefined) {
                    this.onTopicSubscribed(resolved);
                }
            }
            return;
        }
        if (!SimVarPublisher.INDEXED_REGEX.test(topic)) { // Don't generate an array if we don't have to.
            return;
        }
        const match = topic.match(SimVarPublisher.INDEXED_REGEX);
        const [, matchedTopic, index] = match;
        entry = this.indexedSimVars.get(matchedTopic);
        if (entry) {
            const resolved = this.resolveIndexedSimVar(matchedTopic, entry, parseInt(index));
            if (resolved !== undefined) {
                this.onTopicSubscribed(resolved);
            }
        }
    }
    /**
     * Attempts to resolve an indexed topic with an index, generating a version of the topic which is mapped to an
     * indexed simvar. The resolved indexed topic can then be published.
     * @param topic The topic to resolve.
     * @param entry The entry of the topic to resolve.
     * @param index The index with which to resolve the topic. If not defined, the topic will resolve to itself (without
     * a suffix) and will be mapped the index-1 version of its simvar.
     * @returns The resolved indexed topic, or `undefined` if the topic could not be resolved with the specified index.
     */
    resolveIndexedSimVar(topic, entry, index) {
        index !== null && index !== void 0 ? index : (index = 1);
        const resolvedTopic = `${topic}_${index}`;
        if (this.resolvedSimVars.has(resolvedTopic)) {
            return resolvedTopic;
        }
        const defaultIndex = entry.defaultIndex === undefined ? 1 : entry.defaultIndex;
        // Ensure that the index we are trying to resolve is a valid index for the topic.
        if (entry.indexes !== undefined && !entry.indexes.has(index)) {
            return undefined;
        }
        this.resolvedSimVars.set(resolvedTopic, {
            name: entry.name.replace('#index#', `${index !== null && index !== void 0 ? index : 1}`),
            type: entry.type,
            map: entry.map,
            unsuffixedTopic: defaultIndex === index ? topic : undefined
        });
        return resolvedTopic;
    }
    /**
     * Responds to when one of this publisher's topics is subscribed to for the first time.
     * @param topic The topic that was subscribed to.
     */
    onTopicSubscribed(topic) {
        if (this.subscribed.has(topic)) {
            return;
        }
        this.subscribed.add(topic);
        // Immediately publish the current value if publishing is active.
        if (this.publishActive) {
            this.publishTopic(topic);
        }
    }
    /**
     * NOOP - For backwards compatibility.
     * @deprecated
     * @param data Key of the event type in the simVarMap
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    subscribe(data) {
        return;
    }
    /**
     * NOOP - For backwards compatibility.
     * @deprecated
     * @param data Key of the event type in the simVarMap
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unsubscribe(data) {
        return;
    }
    /**
     * Publish all subscribed data points to the bus.
     */
    onUpdate() {
        for (const topic of this.subscribed.values()) {
            this.publishTopic(topic);
        }
    }
    /**
     * Publishes data to the event bus for a topic.
     * @param topic The topic to publish.
     */
    publishTopic(topic) {
        const entry = this.resolvedSimVars.get(topic);
        if (entry !== undefined) {
            const value = this.getValueFromEntry(entry);
            this.publish(topic, value);
            // Check if we need to publish the same value to the unsuffixed version of the topic.
            if (entry.unsuffixedTopic) {
                this.publish(entry.unsuffixedTopic, value);
            }
        }
    }
    /**
     * Gets the current value for a topic.
     * @param topic A topic.
     * @returns The current value for the specified topic.
     */
    getValue(topic) {
        const entry = this.resolvedSimVars.get(topic);
        if (entry === undefined) {
            return undefined;
        }
        return this.getValueFromEntry(entry);
    }
    /**
     * Gets the current value for a resolved topic entry.
     * @param entry An entry for a resolved topic.
     * @returns The current value for the specified entry.
     */
    getValueFromEntry(entry) {
        return entry.map === undefined
            ? this.getSimVarValue(entry)
            : entry.map(this.getSimVarValue(entry));
    }
    /**
     * Gets the value of the SimVar
     * @param entry The SimVar definition entry
     * @returns The value of the SimVar
     */
    getSimVarValue(entry) {
        const svValue = SimVar.GetSimVarValue(entry.name, entry.type);
        if (entry.type === SimVarValueType.Bool) {
            return svValue === 1;
        }
        return svValue;
    }
}
SimVarPublisher.INDEXED_REGEX = /(.*)_(0|[1-9]\d*)$/;

/**
 * A utitlity class for basic math.
 */
class MathUtils {
    /**
     * Clamps a numerical value to the min/max range.
     * @param value The value to be clamped.
     * @param min The minimum.
     * @param max The maximum.
     *
     * @returns The clamped numerical value..
     */
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    /**
     * Rounds a number.
     * @param value The number to round.
     * @param precision The precision with which to round. Defaults to `1`.
     * @returns The rounded number.
     */
    static round(value, precision = 1) {
        return Math.round(value / precision) * precision;
    }
    /**
     * Ceils a number.
     * @param value The number to ceil.
     * @param precision The precision with which to ceil. Defaults to `1`.
     * @returns The ceiled number.
     */
    static ceil(value, precision = 1) {
        return Math.ceil(value / precision) * precision;
    }
    /**
     * Floors a number.
     * @param value The number to floor.
     * @param precision The precision with which to floor. Defaults to `1`.
     * @returns The floored number.
     */
    static floor(value, precision = 1) {
        return Math.floor(value / precision) * precision;
    }
    /**
     * Calculates the angular difference between two angles in the range `[0, 2 * pi)`. The calculation supports both
     * directional and non-directional differences. The directional difference is the angle swept from the start angle
     * to the end angle proceeding in the direction of increasing angle. The non-directional difference is the smaller
     * of the two angles swept from the start angle to the end angle proceeding in either direction.
     * @param start The starting angle, in radians.
     * @param end The ending angle, in radians.
     * @param directional Whether to calculate the directional difference. Defaults to `true`.
     * @returns The angular difference between the two angles, in radians, in the range `[0, 2 * pi)`.
     */
    static diffAngle(start, end, directional = true) {
        const diff = ((end - start) % MathUtils.TWO_PI + MathUtils.TWO_PI) % MathUtils.TWO_PI;
        return directional ? diff : Math.min(diff, MathUtils.TWO_PI - diff);
    }
    /**
     * Calculates the angular difference between two angles in the range `[0, 360)`. The calculation supports both
     * directional and non-directional differences. The directional difference is the angle swept from the start angle
     * to the end angle proceeding in the direction of increasing angle. The non-directional difference is the smaller
     * of the two angles swept from the start angle to the end angle proceeding in either direction.
     * @param start The starting angle, in degrees.
     * @param end The ending angle, in degrees.
     * @param directional Whether to calculate the directional difference. Defaults to `true`.
     * @returns The angular difference between the two angles, in degrees, in the range `[0, 360)`.
     */
    static diffAngleDeg(start, end, directional = true) {
        const diff = ((end - start) % 360 + 360) % 360;
        return directional ? diff : Math.min(diff, 360 - diff);
    }
    /**
     * Linearly interpolates a keyed value along one dimension.
     * @param x The key of the value to interpolate.
     * @param x0 The key of the first known value.
     * @param x1 The key of the second known value.
     * @param y0 The first known value.
     * @param y1 The second known value.
     * @param clampStart Whether to clamp the interpolated value to the first known value. Defaults to false.
     * @param clampEnd Whether to clamp the interpolated value to the second known value. Defaults to false.
     * @returns The interpolated value corresponding to the specified key.
     */
    static lerp(x, x0, x1, y0, y1, clampStart = false, clampEnd = false) {
        if (x0 !== x1 && y0 !== y1) {
            const fraction = MathUtils.clamp((x - x0) / (x1 - x0), clampStart ? 0 : -Infinity, clampEnd ? 1 : Infinity);
            return fraction * (y1 - y0) + y0;
        }
        else {
            return y0;
        }
    }
    /**
     * Linearly interpolates a keyed vector along one dimension. If the known vectors and the result vector have unequal
     * lengths, then only the components shared by all vectors are interpolated in the result.
     * @param out The object to which to write the result.
     * @param x The key of the vector to interpolate.
     * @param x0 The key of the first known vector.
     * @param x1 The key of the second known vector.
     * @param y0 The first known vector.
     * @param y1 The second known vector.
     * @param clampStart Whether to clamp the components of the interpolated vector to those of the first known vector.
     * Defaults to false.
     * @param clampEnd Whether to clamp the components of the interpolated vector to those of the second known vector.
     * Defaults to false.
     * @returns The interpolated vector corresponding to the specified key.
     */
    static lerpVector(out, x, x0, x1, y0, y1, clampStart = false, clampEnd = false) {
        const length = Math.min(y0.length, y1.length, out.length);
        for (let i = 0; i < length; i++) {
            out[i] = MathUtils.lerp(x, x0, x1, y0[i], y1[i], clampStart, clampEnd);
        }
        return out;
    }
}
/** Twice the value of pi. */
MathUtils.TWO_PI = Math.PI * 2;
/** Half the value of pi. */
MathUtils.HALF_PI = Math.PI / 2;
/** Square root of 3. */
MathUtils.SQRT3 = Math.sqrt(3);
/** Square root of 1/3. */
MathUtils.SQRT1_3 = 1 / Math.sqrt(3);

/**
 * A {@link Subscription} which executes a handler function every time it receives a notification.
 */
class HandlerSubscription {
    /**
     * Constructor.
     * @param handler This subscription's handler. The handler will be called each time this subscription receives a
     * notification from its source.
     * @param initialNotifyFunc A function which sends initial notifications to this subscription. If not defined, this
     * subscription will not support initial notifications.
     * @param onDestroy A function which is called when this subscription is destroyed.
     */
    constructor(handler, initialNotifyFunc, onDestroy) {
        this.handler = handler;
        this.initialNotifyFunc = initialNotifyFunc;
        this.onDestroy = onDestroy;
        this._isAlive = true;
        this._isPaused = false;
        this.canInitialNotify = initialNotifyFunc !== undefined;
    }
    /** @inheritdoc */
    get isAlive() {
        return this._isAlive;
    }
    /** @inheritdoc */
    get isPaused() {
        return this._isPaused;
    }
    /**
     * Sends an initial notification to this subscription.
     * @throws Error if this subscription is not alive.
     */
    initialNotify() {
        if (!this._isAlive) {
            throw new Error('HandlerSubscription: cannot notify a dead Subscription.');
        }
        this.initialNotifyFunc && this.initialNotifyFunc(this);
    }
    /** @inheritdoc */
    pause() {
        if (!this._isAlive) {
            throw new Error('Subscription: cannot pause a dead Subscription.');
        }
        this._isPaused = true;
        return this;
    }
    /** @inheritdoc */
    resume(initialNotify = false) {
        if (!this._isAlive) {
            throw new Error('Subscription: cannot resume a dead Subscription.');
        }
        if (!this._isPaused) {
            return this;
        }
        this._isPaused = false;
        if (initialNotify) {
            this.initialNotify();
        }
        return this;
    }
    /** @inheritdoc */
    destroy() {
        if (!this._isAlive) {
            return;
        }
        this._isAlive = false;
        this.onDestroy && this.onDestroy(this);
    }
}

/**
 * A pipe from an input subscribable to an output mutable subscribable. Each notification received by the pipe is used
 * to change the state of the output subscribable.
 */
class SubscribablePipe extends HandlerSubscription {
    // eslint-disable-next-line jsdoc/require-jsdoc
    constructor(from, to, arg3, arg4) {
        let handler;
        let onDestroy;
        if (typeof arg4 === 'function') {
            handler = (fromVal) => {
                to.set(arg3(fromVal, to.get()));
            };
            onDestroy = arg4;
        }
        else {
            handler = (fromVal) => {
                to.set(fromVal);
            };
            onDestroy = arg3;
        }
        super(handler, (sub) => { sub.handler(from.get()); }, onDestroy);
    }
}

/**
 * An abstract implementation of a subscribable which allows adding, removing, and notifying subscribers.
 */
class AbstractSubscribable {
    constructor() {
        this.isSubscribable = true;
        this.notifyDepth = 0;
        /** A function which sends initial notifications to subscriptions. */
        this.initialNotifyFunc = this.notifySubscription.bind(this);
        /** A function which responds to when a subscription to this subscribable is destroyed. */
        this.onSubDestroyedFunc = this.onSubDestroyed.bind(this);
    }
    /**
     * Adds a subscription to this subscribable.
     * @param sub The subscription to add.
     */
    addSubscription(sub) {
        if (this.subs) {
            this.subs.push(sub);
        }
        else if (this.singletonSub) {
            this.subs = [this.singletonSub, sub];
            delete this.singletonSub;
        }
        else {
            this.singletonSub = sub;
        }
    }
    /** @inheritdoc */
    sub(handler, initialNotify = false, paused = false) {
        const sub = new HandlerSubscription(handler, this.initialNotifyFunc, this.onSubDestroyedFunc);
        this.addSubscription(sub);
        if (paused) {
            sub.pause();
        }
        else if (initialNotify) {
            sub.initialNotify();
        }
        return sub;
    }
    /** @inheritdoc */
    unsub(handler) {
        let toDestroy = undefined;
        if (this.singletonSub && this.singletonSub.handler === handler) {
            toDestroy = this.singletonSub;
        }
        else if (this.subs) {
            toDestroy = this.subs.find(sub => sub.handler === handler);
        }
        toDestroy === null || toDestroy === void 0 ? void 0 : toDestroy.destroy();
    }
    /**
     * Notifies subscriptions that this subscribable's value has changed.
     */
    notify() {
        let needCleanUpSubs = false;
        this.notifyDepth++;
        if (this.singletonSub) {
            try {
                if (this.singletonSub.isAlive && !this.singletonSub.isPaused) {
                    this.notifySubscription(this.singletonSub);
                }
                needCleanUpSubs || (needCleanUpSubs = !this.singletonSub.isAlive);
            }
            catch (error) {
                console.error(`AbstractSubscribable: error in handler: ${error}`);
                if (error instanceof Error) {
                    console.error(error.stack);
                }
            }
        }
        else if (this.subs) {
            const subLen = this.subs.length;
            for (let i = 0; i < subLen; i++) {
                try {
                    const sub = this.subs[i];
                    if (sub.isAlive && !sub.isPaused) {
                        this.notifySubscription(sub);
                    }
                    needCleanUpSubs || (needCleanUpSubs = !sub.isAlive);
                }
                catch (error) {
                    console.error(`AbstractSubscribable: error in handler: ${error}`);
                    if (error instanceof Error) {
                        console.error(error.stack);
                    }
                }
            }
        }
        this.notifyDepth--;
        if (needCleanUpSubs && this.notifyDepth === 0) {
            if (this.singletonSub && !this.singletonSub.isAlive) {
                delete this.singletonSub;
            }
            else if (this.subs) {
                this.subs = this.subs.filter(sub => sub.isAlive);
            }
        }
    }
    /**
     * Notifies a subscription of this subscribable's current state.
     * @param sub The subscription to notify.
     */
    notifySubscription(sub) {
        sub.handler(this.get());
    }
    /**
     * Responds to when a subscription to this subscribable is destroyed.
     * @param sub The destroyed subscription.
     */
    onSubDestroyed(sub) {
        // If we are not in the middle of a notify operation, remove the subscription.
        // Otherwise, do nothing and let the post-notify clean-up code handle it.
        if (this.notifyDepth === 0) {
            if (this.singletonSub === sub) {
                delete this.singletonSub;
            }
            else if (this.subs) {
                const index = this.subs.indexOf(sub);
                if (index >= 0) {
                    this.subs.splice(index, 1);
                }
            }
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    map(fn, equalityFunc, mutateFunc, initialVal) {
        return new MappedSubscribableClass(this, fn, equalityFunc !== null && equalityFunc !== void 0 ? equalityFunc : AbstractSubscribable.DEFAULT_EQUALITY_FUNC, mutateFunc, initialVal);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    pipe(to, arg2, arg3) {
        let sub;
        let paused;
        if (typeof arg2 === 'function') {
            sub = new SubscribablePipe(this, to, arg2, this.onSubDestroyedFunc);
            paused = arg3 !== null && arg3 !== void 0 ? arg3 : false;
        }
        else {
            sub = new SubscribablePipe(this, to, this.onSubDestroyedFunc);
            paused = arg2 !== null && arg2 !== void 0 ? arg2 : false;
        }
        this.addSubscription(sub);
        if (paused) {
            sub.pause();
        }
        else {
            sub.initialNotify();
        }
        return sub;
    }
}
/**
 * Checks if two values are equal using the strict equality operator.
 * @param a The first value.
 * @param b The second value.
 * @returns whether a and b are equal.
 */
AbstractSubscribable.DEFAULT_EQUALITY_FUNC = (a, b) => a === b;
/**
 * An implementation of {@link MappedSubscribable}.
 */
class MappedSubscribableClass extends AbstractSubscribable {
    /**
     * Constructor.
     * @param input This subscribable's input.
     * @param mapFunc The function which maps this subject's inputs to a value.
     * @param equalityFunc The function which this subject uses to check for equality between values.
     * @param mutateFunc The function which this subject uses to change its value.
     * @param initialVal The initial value of this subject.
     */
    constructor(input, mapFunc, equalityFunc, mutateFunc, initialVal) {
        super();
        this.input = input;
        this.mapFunc = mapFunc;
        this.equalityFunc = equalityFunc;
        this.isSubscribable = true;
        this._isAlive = true;
        this._isPaused = false;
        if (initialVal && mutateFunc) {
            this.value = initialVal;
            mutateFunc(this.value, this.mapFunc(this.input.get()));
            this.mutateFunc = (newVal) => { mutateFunc(this.value, newVal); };
        }
        else {
            this.value = this.mapFunc(this.input.get());
            this.mutateFunc = (newVal) => { this.value = newVal; };
        }
        this.inputSub = this.input.sub(inputValue => {
            this.updateValue(inputValue);
        }, true);
    }
    /** @inheritdoc */
    get isAlive() {
        return this._isAlive;
    }
    /** @inheritdoc */
    get isPaused() {
        return this._isPaused;
    }
    /**
     * Re-maps this subject's value from its input, and notifies subscribers if this results in a change to the mapped
     * value according to this subject's equality function.
     * @param inputValue The input value.
     */
    updateValue(inputValue) {
        const value = this.mapFunc(inputValue, this.value);
        if (!this.equalityFunc(this.value, value)) {
            this.mutateFunc(value);
            this.notify();
        }
    }
    /** @inheritdoc */
    get() {
        return this.value;
    }
    /** @inheritdoc */
    pause() {
        if (!this._isAlive) {
            throw new Error('MappedSubscribable: cannot pause a dead subscribable');
        }
        if (this._isPaused) {
            return this;
        }
        this.inputSub.pause();
        this._isPaused = true;
        return this;
    }
    /** @inheritdoc */
    resume() {
        if (!this._isAlive) {
            throw new Error('MappedSubscribable: cannot resume a dead subscribable');
        }
        if (!this._isPaused) {
            return this;
        }
        this._isPaused = false;
        this.inputSub.resume(true);
        return this;
    }
    /** @inheritdoc */
    destroy() {
        this._isAlive = false;
        this.inputSub.destroy();
    }
}

/**
 * A subscribable subject whose value can be freely manipulated.
 */
class Subject extends AbstractSubscribable {
    /**
     * Constructs an observable Subject.
     * @param value The initial value.
     * @param equalityFunc The function to use to check for equality.
     * @param mutateFunc The function to use to mutate the subject's value.
     */
    constructor(value, equalityFunc, mutateFunc) {
        super();
        this.value = value;
        this.equalityFunc = equalityFunc;
        this.mutateFunc = mutateFunc;
        this.isMutableSubscribable = true;
    }
    /**
     * Creates and returns a new Subject.
     * @param v The initial value of the subject.
     * @param equalityFunc The function to use to check for equality between subject values. Defaults to the strict
     * equality comparison (`===`).
     * @param mutateFunc The function to use to change the subject's value. If not defined, new values will replace
     * old values by variable assignment.
     * @returns A Subject instance.
     */
    static create(v, equalityFunc, mutateFunc) {
        return new Subject(v, equalityFunc !== null && equalityFunc !== void 0 ? equalityFunc : Subject.DEFAULT_EQUALITY_FUNC, mutateFunc);
    }
    /** @inheritdoc */
    notifySub(sub) {
        sub(this.value);
    }
    /**
     * Sets the value of this subject and notifies subscribers if the value changed.
     * @param value The new value.
     */
    set(value) {
        if (!this.equalityFunc(value, this.value)) {
            if (this.mutateFunc) {
                this.mutateFunc(this.value, value);
            }
            else {
                this.value = value;
            }
            this.notify();
        }
    }
    /**
     * Applies a partial set of properties to this subject's value and notifies subscribers if the value changed as a
     * result.
     * @param value The properties to apply.
     */
    apply(value) {
        let changed = false;
        for (const prop in value) {
            changed = value[prop] !== this.value[prop];
            if (changed) {
                break;
            }
        }
        Object.assign(this.value, value);
        changed && this.notify();
    }
    /** @inheritdoc */
    notify() {
        super.notify();
    }
    /**
     * Gets the value of this subject.
     * @returns The value of this subject.
     */
    get() {
        return this.value;
    }
}

/**
 * Utility methods for working with Subscribables.
 */
class SubscribableUtils {
    /**
     * Checks if a query is a subscribable.
     * @param query A query.
     * @returns Whether the query is a subscribable.
     */
    static isSubscribable(query) {
        return typeof query === 'object' && query !== null && query.isSubscribable === true;
    }
    /**
     * Checks if a query is a mutable subscribable.
     * @param query A query.
     * @returns Whether the query is a mutable subscribable.
     */
    static isMutableSubscribable(query) {
        return typeof query === 'object' && query !== null && query.isMutableSubscribable === true;
    }
    /**
     * Converts a value to a subscribable.
     *
     * If the `excludeSubscribables` argument is `true` and the value is already a subscribable, then the value is
     * returned unchanged. Otherwise, a new subscribable whose state is always equal to the value will be created and
     * returned.
     * @param value The value to convert to a subscribable.
     * @param excludeSubscribables Whether to return subscribable values as-is instead of wrapping them in another
     * subscribable.
     * @returns A subscribable.
     */
    static toSubscribable(value, excludeSubscribables) {
        if (excludeSubscribables && SubscribableUtils.isSubscribable(value)) {
            return value;
        }
        else {
            return Subject.create(value);
        }
    }
}
/**
 * A numeric equality function which returns `true` if and only if two numbers are strictly equal or if they are both
 * `NaN`.
 * @param a The first number to compare.
 * @param b The second number to compare.
 * @returns Whether the two numbers are strictly equal or both `NaN`.
 */
SubscribableUtils.NUMERIC_NAN_EQUALITY = (a, b) => a === b || (isNaN(a) && isNaN(b));

/**
 * Utility class for generating common functions for mapping subscribables.
 */
class SubscribableMapFunctions {
    /**
     * Generates a function which maps an input to itself.
     * @returns A function which maps an input to itself.
     */
    static identity() {
        return (input) => input;
    }
    /**
     * Generates a function which maps an input boolean to its negation.
     * @returns A function which maps an input boolean to its negation.
     */
    static not() {
        return (input) => !input;
    }
    /**
     * Generates a function which maps an input boolean tuple to `true` if at least one tuple member is `true` and to
     * `false` otherwise. A zero-length tuple is mapped to `false`.
     * @returns A function which maps an input boolean tuple to `true` if at least one tuple member is `true` and to
     * `false` otherwise.
     */
    static or() {
        return (input) => input.length > 0 && input.includes(true);
    }
    /**
     * Generates a function which maps an input boolean tuple to `true` if no tuple member is `true` and to
     * `false` otherwise. A zero-length tuple is mapped to `true`.
     * @returns A function which maps an input boolean tuple to `true` if no tuple member is `true` or there are no
     * tuple members, and to `false` otherwise.
     */
    static nor() {
        return (input) => !input.includes(true);
    }
    /**
     * Generates a function which maps an input boolean tuple to `true` if all tuple members are `true` and to `false`
     * otherwise. A zero-length tuple is mapped to `false`.
     * @returns A function which maps an input boolean tuple to `true` if all tuple members are `true` and to `false`
     * otherwise.
     */
    static and() {
        return (input) => input.length > 0 && !input.includes(false);
    }
    /**
     * Generates a function which maps an input boolean tuple to `false` if all tuple members are `true` and to `false`
     * otherwise. A zero-length tuple is mapped to `true`.
     * @returns A function which maps an input boolean tuple to `true` if all tuple members are `true` and to `false`
     * otherwise.
     */
    static nand() {
        return (input) => input.length < 1 || input.includes(false);
    }
    /**
     * Generates a function which maps an input number to its negation.
     * @returns A function which maps an input number to its negation.
     */
    static negate() {
        return (input) => -input;
    }
    /**
     * Generates a function which maps an input number to its absolute value.
     * @returns A function which maps an input number to its absolute value.
     */
    static abs() {
        return Math.abs;
    }
    /**
     * Generates a function which maps an input number to a rounded version of itself at a certain precision.
     * @param precision The precision to which to round the input.
     * @returns A function which maps an input number to a rounded version of itself at the specified precision.
     */
    static withPrecision(precision) {
        return SubscribableUtils.isSubscribable(precision)
            ? (input) => {
                const precisionVal = precision.get();
                return Math.round(input / precisionVal) * precisionVal;
            }
            : (input) => {
                return Math.round(input / precision) * precision;
            };
    }
    /**
     * Generates a function which maps an input number to itself if and only if it differs from the previous mapped value
     * by a certain amount, and to the previous mapped value otherwise.
     * @param threshold The minimum difference between the input and the previous mapped value required to map the input
     * to itself.
     * @returns A function which maps an input number to itself if and only if it differs from the previous mapped value
     * by the specified amount, and to the previous mapped value otherwise.
     */
    static changedBy(threshold) {
        return SubscribableUtils.isSubscribable(threshold)
            ? (input, currentVal) => currentVal === undefined || Math.abs(input - currentVal) >= threshold.get() ? input : currentVal
            : (input, currentVal) => currentVal === undefined || Math.abs(input - currentVal) >= threshold ? input : currentVal;
    }
    /**
     * Generates a function which maps an input number to itself up to a maximum frequency, and to the previous mapped
     * value otherwise.
     * @param freq The maximum frequency at which to map the input to itself, in hertz.
     * @param timeFunc A function which gets the current time in milliseconds. Defaults to `Date.now()`.
     * @returns A function which maps an input number to itself up to the specified maximum frequency, and to the
     * previous mapped value otherwise.
     */
    static atFrequency(freq, timeFunc = Date.now) {
        let t0;
        let timeRemaining = 0;
        if (SubscribableUtils.isSubscribable(freq)) {
            return (input, currentVal) => {
                let returnValue = currentVal !== null && currentVal !== void 0 ? currentVal : input;
                const currentTime = timeFunc();
                const dt = currentTime - (t0 !== null && t0 !== void 0 ? t0 : (t0 = currentTime));
                t0 = currentTime;
                timeRemaining -= dt;
                if (timeRemaining <= 0) {
                    const period = 1000 / freq.get();
                    timeRemaining = period + timeRemaining % period;
                    returnValue = input;
                }
                return returnValue;
            };
        }
        else {
            const period = 1000 / freq;
            return (input, currentVal) => {
                let returnValue = currentVal !== null && currentVal !== void 0 ? currentVal : input;
                const currentTime = timeFunc();
                const dt = currentTime - (t0 !== null && t0 !== void 0 ? t0 : (t0 = currentTime));
                t0 = currentTime;
                timeRemaining -= dt;
                if (timeRemaining <= 0) {
                    timeRemaining = period + timeRemaining % period;
                    returnValue = input;
                }
                return returnValue;
            };
        }
    }
}

/**
 * A subscribable subject that is a mapped stream from one or more input subscribables.
 */
class MappedSubject extends AbstractSubscribable {
    /**
     * Creates a new MappedSubject.
     * @param mapFunc The function which maps this subject's inputs to a value.
     * @param equalityFunc The function which this subject uses to check for equality between values.
     * @param mutateFunc The function which this subject uses to change its value.
     * @param initialVal The initial value of this subject.
     * @param inputs The subscribables which provide the inputs to this subject.
     */
    constructor(mapFunc, equalityFunc, mutateFunc, initialVal, ...inputs) {
        super();
        this.mapFunc = mapFunc;
        this.equalityFunc = equalityFunc;
        this.isSubscribable = true;
        this._isAlive = true;
        this._isPaused = false;
        this.inputs = inputs;
        this.inputValues = inputs.map(input => input.get());
        if (initialVal && mutateFunc) {
            this.value = initialVal;
            mutateFunc(this.value, this.mapFunc(this.inputValues, undefined));
            this.mutateFunc = (newVal) => { mutateFunc(this.value, newVal); };
        }
        else {
            this.value = this.mapFunc(this.inputValues, undefined);
            this.mutateFunc = (newVal) => { this.value = newVal; };
        }
        this.inputSubs = this.inputs.map((input, index) => input.sub(inputValue => {
            this.inputValues[index] = inputValue;
            this.updateValue();
        }));
    }
    /** @inheritdoc */
    get isAlive() {
        return this._isAlive;
    }
    /** @inheritdoc */
    get isPaused() {
        return this._isPaused;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    static create(...args) {
        let mapFunc, equalityFunc, mutateFunc, initialVal;
        if (typeof args[0] === 'function') {
            // Mapping function was supplied.
            mapFunc = args.shift();
            if (typeof args[0] === 'function') {
                equalityFunc = args.shift();
            }
            else {
                equalityFunc = AbstractSubscribable.DEFAULT_EQUALITY_FUNC;
            }
            if (typeof args[0] === 'function') {
                mutateFunc = args.shift();
                initialVal = args.shift();
            }
        }
        else {
            mapFunc = MappedSubject.IDENTITY_MAP;
            equalityFunc = MappedSubject.NEVER_EQUALS;
        }
        return new MappedSubject(mapFunc, equalityFunc, mutateFunc, initialVal, ...args);
    }
    /**
     * Re-maps this subject's value from its input, and notifies subscribers if this results in a change to the mapped
     * value according to this subject's equality function.
     */
    updateValue() {
        const value = this.mapFunc(this.inputValues, this.value);
        if (!this.equalityFunc(this.value, value)) {
            this.mutateFunc(value);
            this.notify();
        }
    }
    /** @inheritdoc */
    get() {
        return this.value;
    }
    /** @inheritdoc */
    pause() {
        if (!this._isAlive) {
            throw new Error('MappedSubject: cannot pause a dead subject');
        }
        if (this._isPaused) {
            return this;
        }
        for (let i = 0; i < this.inputSubs.length; i++) {
            this.inputSubs[i].pause();
        }
        this._isPaused = true;
        return this;
    }
    /** @inheritdoc */
    resume() {
        if (!this._isAlive) {
            throw new Error('MappedSubject: cannot resume a dead subject');
        }
        if (!this._isPaused) {
            return this;
        }
        this._isPaused = false;
        for (let i = 0; i < this.inputSubs.length; i++) {
            this.inputValues[i] = this.inputs[i].get();
            this.inputSubs[i].resume();
        }
        this.updateValue();
        return this;
    }
    /** @inheritdoc */
    destroy() {
        this._isAlive = false;
        for (let i = 0; i < this.inputSubs.length; i++) {
            this.inputSubs[i].destroy();
        }
    }
}
MappedSubject.IDENTITY_MAP = SubscribableMapFunctions.identity();
MappedSubject.NEVER_EQUALS = () => false;

/**
 * 2D vector mathematical operations.
 */
/**
 * 3D vector mathematical operations.
 */
class Vec3Math {
    // eslint-disable-next-line jsdoc/require-jsdoc
    static create(x, y, z) {
        const vec = new Float64Array(3);
        if (x !== undefined && y !== undefined && z !== undefined) {
            vec[0] = x;
            vec[1] = y;
            vec[2] = z;
        }
        return vec;
    }
    /**
     * Gets the spherical angle theta (polar angle) of a vector in radians.
     * @param vec A vector.
     * @returns The spherical angle theta of the vector.
     */
    static theta(vec) {
        return Math.atan2(Math.hypot(vec[0], vec[1]), vec[2]);
    }
    /**
     * Gets the spherical angle phi (azimuthal angle) of a vector in radians.
     * @param vec A vector.
     * @returns The spherical angle phi of the vector.
     */
    static phi(vec) {
        return Math.atan2(vec[1], vec[0]);
    }
    /**
     * Sets the components of a vector.
     * @param x The new x-component.
     * @param y The new y-component.
     * @param z The new z-component.
     * @param vec The vector to change.
     * @returns The vector after it has been changed.
     */
    static set(x, y, z, vec) {
        vec[0] = x;
        vec[1] = y;
        vec[2] = z;
        return vec;
    }
    /**
     * Sets the spherical components of a vector.
     * @param r The new length (magnitude).
     * @param theta The new spherical angle theta (polar angle), in radians.
     * @param phi The new spherical angle phi (azimuthal angle), in radians.
     * @param vec The vector to change.
     * @returns The vector after it has been changed.
     */
    static setFromSpherical(r, theta, phi, vec) {
        const sinTheta = Math.sin(theta);
        vec[0] = r * sinTheta * Math.cos(phi);
        vec[1] = r * sinTheta * Math.sin(phi);
        vec[2] = r * Math.cos(theta);
        return vec;
    }
    /**
     * Add one vector to another.
     * @param v1 The first vector.
     * @param v2 The second vector.
     * @param out The vector to write the results to.
     * @returns the vector sum.
     */
    static add(v1, v2, out) {
        out[0] = v1[0] + v2[0];
        out[1] = v1[1] + v2[1];
        out[2] = v1[2] + v2[2];
        return out;
    }
    /**
     * Subtracts one vector from another.
     * @param v1 The first vector.
     * @param v2 The second vector.
     * @param out The vector to write the results to.
     * @returns the vector difference.
     */
    static sub(v1, v2, out) {
        out[0] = v1[0] - v2[0];
        out[1] = v1[1] - v2[1];
        out[2] = v1[2] - v2[2];
        return out;
    }
    /**
     * Gets the dot product of two vectors.
     * @param v1 The first vector.
     * @param v2 The second vector.
     * @returns The dot product of the vectors.
     */
    static dot(v1, v2) {
        return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    }
    /**
     * Gets the cross product of two vectors.
     * @param v1 - the first vector.
     * @param v2 - the second vector.
     * @param out - the vector to which to write the result.
     * @returns the cross product.
     */
    static cross(v1, v2, out) {
        const x1 = v1[0];
        const y1 = v1[1];
        const z1 = v1[2];
        const x2 = v2[0];
        const y2 = v2[1];
        const z2 = v2[2];
        out[0] = y1 * z2 - z1 * y2;
        out[1] = z1 * x2 - x1 * z2;
        out[2] = x1 * y2 - y1 * x2;
        return out;
    }
    /**
     * Multiplies a vector by a scalar.
     * @param v1 The vector to multiply.
     * @param scalar The scalar to apply.
     * @param out The vector to write the results to.
     * @returns The scaled vector.
     */
    static multScalar(v1, scalar, out) {
        out[0] = v1[0] * scalar;
        out[1] = v1[1] * scalar;
        out[2] = v1[2] * scalar;
        return out;
    }
    /**
     * Gets the magnitude of a vector.
     * @param v1 The vector to get the magnitude for.
     * @returns the vector's magnitude.
     */
    static abs(v1) {
        return Math.hypot(v1[0], v1[1], v1[2]);
    }
    /**
     * Normalizes the vector to a unit vector.
     * @param v1 The vector to normalize.
     * @param out The vector to write the results to.
     * @returns the normalized vector.
     */
    static normalize(v1, out) {
        const mag = Vec3Math.abs(v1);
        out[0] = v1[0] / mag;
        out[1] = v1[1] / mag;
        out[2] = v1[2] / mag;
        return out;
    }
    /**
     * Gets the Euclidean distance between two vectors.
     * @param vec1 The first vector.
     * @param vec2 The second vector.
     * @returns the Euclidean distance between the two vectors.
     */
    static distance(vec1, vec2) {
        return Math.hypot(vec2[0] - vec1[0], vec2[1] - vec1[0], vec2[2] - vec1[2]);
    }
    /**
     * Checks if two vectors are equal.
     * @param vec1 The first vector.
     * @param vec2 The second vector.
     * @returns Whether the two vectors are equal.
     */
    static equals(vec1, vec2) {
        return vec1[0] === vec2[0] && vec1[1] === vec2[1] && vec1[2] === vec2[2];
    }
    /**
     * Checks if a vector is finite. A vector is considered finite if all of its components are finite.
     * @param vec The vector to check.
     * @returns Whether the specified vector is finite.
     */
    static isFinite(vec) {
        return isFinite(vec[0]) && isFinite(vec[1]) && isFinite(vec[2]);
    }
    /**
     * Copies one vector to another.
     * @param from The vector from which to copy.
     * @param to The vector to which to copy.
     * @returns the changed vector.
     */
    static copy(from, to) {
        return Vec3Math.set(from[0], from[1], from[2], to);
    }
}

/**
 * A read-only wrapper for a GeoPoint.
 */
class GeoPointReadOnly {
    /**
     * Constructor.
     * @param source - the source of the new read-only point.
     */
    constructor(source) {
        this.source = source;
    }
    /**
     * The latitude of this point, in degrees.
     * @returns the latitude of this point.
     */
    get lat() {
        return this.source.lat;
    }
    /**
     * The longitude of this point, in degrees.
     * @returns the longitude of this point.
     */
    get lon() {
        return this.source.lon;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    distance(arg1, arg2) {
        if (typeof arg1 === 'number') {
            return this.source.distance(arg1, arg2);
        }
        else {
            return this.source.distance(arg1);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    distanceRhumb(arg1, arg2) {
        if (typeof arg1 === 'number') {
            return this.source.distanceRhumb(arg1, arg2);
        }
        else {
            return this.source.distanceRhumb(arg1);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    bearingTo(arg1, arg2) {
        if (typeof arg1 === 'number') {
            return this.source.bearingTo(arg1, arg2);
        }
        else {
            return this.source.bearingTo(arg1);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    bearingFrom(arg1, arg2) {
        if (typeof arg1 === 'number') {
            return this.source.bearingFrom(arg1, arg2);
        }
        else {
            return this.source.bearingFrom(arg1);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    bearingRhumb(arg1, arg2) {
        if (typeof arg1 === 'number') {
            return this.source.bearingRhumb(arg1, arg2);
        }
        else {
            return this.source.bearingRhumb(arg1);
        }
    }
    /**
     * Offsets this point by an initial bearing and distance along a great circle.
     * @param bearing The initial true bearing (forward azimuth), in degrees, by which to offset.
     * @param distance The distance, in great-arc radians, by which to offset.
     * @param out The GeoPoint to which to write the result. If not supplied, a new GeoPoint object is created.
     * @returns The offset point.
     * @throws Error if argument `out` is undefined.
     */
    offset(bearing, distance, out) {
        if (!out) {
            throw new Error('Cannot mutate a read-only GeoPoint.');
        }
        return this.source.offset(bearing, distance, out);
    }
    /**
     * Offsets this point by a constant bearing and distance along a rhumb line.
     * @param bearing The true bearing, in degrees, by which to offset.
     * @param distance The distance, in great-arc radians, by which to offset.
     * @param out The GeoPoint to which to write the result. If not supplied, a new GeoPoint object is created.
     * @returns The offset point.
     * @throws Error if argument `out` is undefined.
     */
    offsetRhumb(bearing, distance, out) {
        if (!out) {
            throw new Error('Cannot mutate a read-only GeoPoint.');
        }
        return this.source.offsetRhumb(bearing, distance, out);
    }
    /**
     * Gets the antipode of this point.
     * @param out The GeoPoint ot which to write the result.
     * @returns The antipode of this point.
     * @throws Error if argument `out` is undefined.
     */
    antipode(out) {
        if (!out) {
            throw new Error('Cannot mutate a read-only GeoPoint.');
        }
        return this.source.antipode(out);
    }
    /**
     * Calculates the cartesian (x, y, z) representation of this point, in units of great-arc radians. By convention,
     * in the cartesian coordinate system the origin is at the center of the Earth, the positive x-axis passes through
     * 0 degrees N, 0 degrees E, and the positive z-axis passes through the north pole.
     * @param out The vector array to which to write the result.
     * @returns The cartesian representation of this point.
     */
    toCartesian(out) {
        return this.source.toCartesian(out);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    equals(arg1, arg2, arg3) {
        if (typeof arg1 === 'number') {
            return this.source.equals(arg1, arg2, arg3);
        }
        else {
            return this.source.equals(arg1, arg2);
        }
    }
    /** @inheritdoc */
    copy(to) {
        return this.source.copy(to);
    }
}
/**
 * A point on Earth's surface. This class uses a spherical Earth model.
 */
class GeoPoint {
    /**
     * Constructor.
     * @param lat The latitude, in degrees.
     * @param lon The longitude, in degrees.
     */
    constructor(lat, lon) {
        this._lat = 0;
        this._lon = 0;
        this.set(lat, lon);
        this.readonly = new GeoPointReadOnly(this);
    }
    /**
     * The latitude of this point, in degrees.
     * @returns the latitude of this point.
     */
    get lat() {
        return this._lat;
    }
    /**
     * The longitude of this point, in degrees.
     * @returns the longitude of this point.
     */
    get lon() {
        return this._lon;
    }
    /**
     * Converts an argument list consisting of either a LatLonInterface or lat/lon coordinates into an equivalent
     * LatLonInterface.
     * @param arg1 Argument 1.
     * @param arg2 Argument 2.
     * @returns A LatLonInterface.
     */
    static asLatLonInterface(arg1, arg2) {
        if (typeof arg1 === 'number') {
            return GeoPoint.tempGeoPoint.set(arg1, arg2);
        }
        else {
            return arg1;
        }
    }
    /**
     * Converts an argument list consisting of either a 3D vector or x, y, z components into an equivalent 3D vector.
     * @param arg1 Argument 1.
     * @param arg2 Argument 2.
     * @param arg3 Argument 3.
     * @returns A 3D vector.
     */
    static asVec3(arg1, arg2, arg3) {
        if (typeof arg1 === 'number') {
            return Vec3Math.set(arg1, arg2, arg3, GeoPoint.tempVec3);
        }
        else {
            return arg1;
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    set(arg1, arg2) {
        let lat, lon;
        if (typeof arg1 === 'number') {
            lat = arg1;
            lon = arg2;
        }
        else {
            lat = arg1.lat;
            lon = arg1.lon;
        }
        lat = GeoPoint.toPlusMinus180(lat);
        lon = GeoPoint.toPlusMinus180(lon);
        if (Math.abs(lat) > 90) {
            lat = 180 - lat;
            lat = GeoPoint.toPlusMinus180(lat);
            lon += 180;
            lon = GeoPoint.toPlusMinus180(lon);
        }
        this._lat = lat;
        this._lon = lon;
        return this;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    setFromCartesian(arg1, arg2, arg3) {
        const vec = GeoPoint.asVec3(arg1, arg2, arg3);
        const theta = Vec3Math.theta(vec);
        const phi = Vec3Math.phi(vec);
        return this.set(90 - theta * Avionics.Utils.RAD2DEG, phi * Avionics.Utils.RAD2DEG);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    distance(arg1, arg2) {
        const other = GeoPoint.asLatLonInterface(arg1, arg2);
        return GeoPoint.distance(this.lat, this.lon, other.lat, other.lon);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    distanceRhumb(arg1, arg2) {
        const other = GeoPoint.asLatLonInterface(arg1, arg2);
        return GeoPoint.distanceRhumb(this.lat, this.lon, other.lat, other.lon);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    bearingTo(arg1, arg2) {
        const other = GeoPoint.asLatLonInterface(arg1, arg2);
        return GeoPoint.initialBearing(this.lat, this.lon, other.lat, other.lon);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    bearingFrom(arg1, arg2) {
        const other = GeoPoint.asLatLonInterface(arg1, arg2);
        return GeoPoint.finalBearing(other.lat, other.lon, this.lat, this.lon);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    bearingRhumb(arg1, arg2) {
        const other = GeoPoint.asLatLonInterface(arg1, arg2);
        return GeoPoint.bearingRhumb(this.lat, this.lon, other.lat, other.lon);
    }
    /**
     * Offsets this point by an initial bearing and distance along a great circle.
     * @param bearing The initial true bearing (forward azimuth), in degrees, by which to offset.
     * @param distance The distance, in great-arc radians, by which to offset.
     * @param out The GeoPoint to which to write the result. By default this point.
     * @returns The offset point.
     */
    offset(bearing, distance, out) {
        const latRad = this.lat * Avionics.Utils.DEG2RAD;
        const lonRad = this.lon * Avionics.Utils.DEG2RAD;
        const sinLat = Math.sin(latRad);
        const cosLat = Math.cos(latRad);
        const sinBearing = Math.sin(bearing * Avionics.Utils.DEG2RAD);
        const cosBearing = Math.cos(bearing * Avionics.Utils.DEG2RAD);
        const angularDistance = distance;
        const sinAngularDistance = Math.sin(angularDistance);
        const cosAngularDistance = Math.cos(angularDistance);
        const offsetLatRad = Math.asin(sinLat * cosAngularDistance + cosLat * sinAngularDistance * cosBearing);
        const offsetLonDeltaRad = Math.atan2(sinBearing * sinAngularDistance * cosLat, cosAngularDistance - sinLat * Math.sin(offsetLatRad));
        const offsetLat = offsetLatRad * Avionics.Utils.RAD2DEG;
        const offsetLon = (lonRad + offsetLonDeltaRad) * Avionics.Utils.RAD2DEG;
        return (out !== null && out !== void 0 ? out : this).set(offsetLat, offsetLon);
    }
    /**
     * Offsets this point by a constant bearing and distance along a rhumb line.
     * @param bearing The true bearing, in degrees, by which to offset.
     * @param distance The distance, in great-arc radians, by which to offset.
     * @param out The GeoPoint to which to write the result. By default this point.
     * @returns The offset point.
     */
    offsetRhumb(bearing, distance, out) {
        const latRad = this.lat * Avionics.Utils.DEG2RAD;
        const lonRad = this.lon * Avionics.Utils.DEG2RAD;
        const bearingRad = bearing * Avionics.Utils.DEG2RAD;
        const deltaLat = distance * Math.cos(bearingRad);
        let offsetLat = latRad + deltaLat;
        let offsetLon;
        if (Math.abs(offsetLat) >= Math.PI / 2) {
            // you can't technically go past the poles along a rhumb line, so we will simply terminate the path at the pole
            offsetLat = Math.sign(offsetLat) * 90;
            offsetLon = 0; // since longitude is meaningless at the poles, we'll arbitrarily pick a longitude of 0 degrees.
        }
        else {
            const deltaPsi = GeoPoint.deltaPsi(latRad, offsetLat);
            const correction = GeoPoint.rhumbCorrection(deltaPsi, latRad, offsetLat);
            const deltaLon = distance * Math.sin(bearingRad) / correction;
            offsetLon = lonRad + deltaLon;
            offsetLat *= Avionics.Utils.RAD2DEG;
            offsetLon *= Avionics.Utils.RAD2DEG;
        }
        return (out !== null && out !== void 0 ? out : this).set(offsetLat, offsetLon);
    }
    /**
     * Gets the antipode of this point.
     * @param out The GeoPoint to which to write the results. By default this point.
     * @returns The antipode of this point.
     */
    antipode(out) {
        return (out !== null && out !== void 0 ? out : this).set(-this._lat, this._lon + 180);
    }
    /** @inheritdoc */
    toCartesian(out) {
        return GeoPoint.sphericalToCartesian(this, out);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    equals(arg1, arg2, arg3) {
        const other = GeoPoint.asLatLonInterface(arg1, arg2);
        if (other) {
            if (isNaN(this._lat) && isNaN(this._lon) && isNaN(other.lat) && isNaN(other.lon)) {
                return true;
            }
            const tolerance = typeof arg1 === 'number' ? arg3 : arg2;
            const distance = this.distance(other);
            return !isNaN(distance) && distance <= (tolerance !== null && tolerance !== void 0 ? tolerance : GeoPoint.EQUALITY_TOLERANCE);
        }
        else {
            return false;
        }
    }
    /** @inheritdoc */
    copy(to) {
        return to ? to.set(this.lat, this.lon) : new GeoPoint(this.lat, this.lon);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    static sphericalToCartesian(arg1, arg2, arg3) {
        const point = GeoPoint.asLatLonInterface(arg1, arg2);
        const theta = (90 - point.lat) * Avionics.Utils.DEG2RAD;
        const phi = point.lon * Avionics.Utils.DEG2RAD;
        return Vec3Math.setFromSpherical(1, theta, phi, arg3 !== null && arg3 !== void 0 ? arg3 : arg2);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    static equals(arg1, arg2, arg3, arg4, arg5) {
        if (arg1 instanceof Float64Array) {
            return GeoPoint.distance(arg1, arg2) <= (arg3 !== null && arg3 !== void 0 ? arg3 : GeoPoint.EQUALITY_TOLERANCE);
        }
        else if (typeof arg1 === 'number') {
            return GeoPoint.distance(arg1, arg2, arg3, arg4) <= (arg5 !== null && arg5 !== void 0 ? arg5 : GeoPoint.EQUALITY_TOLERANCE);
        }
        else {
            return GeoPoint.distance(arg1, arg2) <= (arg3 !== null && arg3 !== void 0 ? arg3 : GeoPoint.EQUALITY_TOLERANCE);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    static distance(arg1, arg2, arg3, arg4) {
        if (arg1 instanceof Float64Array) {
            return Math.acos(Utils.Clamp(Vec3Math.dot(arg1, arg2), -1, 1));
        }
        else {
            let lat1, lon1, lat2, lon2;
            if (typeof arg1 === 'number') {
                lat1 = arg1;
                lon1 = arg2;
                lat2 = arg3;
                lon2 = arg4;
            }
            else {
                lat1 = arg1.lat;
                lon1 = arg1.lon;
                lat2 = arg2.lat;
                lon2 = arg2.lon;
            }
            lat1 *= Avionics.Utils.DEG2RAD;
            lon1 *= Avionics.Utils.DEG2RAD;
            lat2 *= Avionics.Utils.DEG2RAD;
            lon2 *= Avionics.Utils.DEG2RAD;
            // haversine formula
            const sinHalfDeltaLat = Math.sin((lat2 - lat1) / 2);
            const sinHalfDeltaLon = Math.sin((lon2 - lon1) / 2);
            const a = sinHalfDeltaLat * sinHalfDeltaLat + Math.cos(lat1) * Math.cos(lat2) * sinHalfDeltaLon * sinHalfDeltaLon;
            return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    static distanceRhumb(arg1, arg2, arg3, arg4) {
        let lat1, lon1, lat2, lon2;
        if (typeof arg1 === 'number') {
            lat1 = arg1 * Avionics.Utils.DEG2RAD;
            lon1 = arg2 * Avionics.Utils.DEG2RAD;
            lat2 = arg3 * Avionics.Utils.DEG2RAD;
            lon2 = arg4 * Avionics.Utils.DEG2RAD;
        }
        else if (arg1 instanceof Float64Array) {
            const point1 = GeoPoint.tempGeoPoint.setFromCartesian(arg1);
            lat1 = point1.lat;
            lon1 = point1.lon;
            const point2 = GeoPoint.tempGeoPoint.setFromCartesian(arg2);
            lat2 = point2.lat;
            lon2 = point2.lon;
        }
        else {
            lat1 = arg1.lat;
            lon1 = arg1.lon;
            lat2 = arg2.lat;
            lon2 = arg2.lon;
        }
        const deltaLat = lat2 - lat1;
        let deltaLon = lon2 - lon1;
        const deltaPsi = GeoPoint.deltaPsi(lat1, lat2);
        const correction = GeoPoint.rhumbCorrection(deltaPsi, lat1, lat2);
        if (Math.abs(deltaLon) > Math.PI) {
            deltaLon += -Math.sign(deltaLon) * 2 * Math.PI;
        }
        return Math.sqrt(deltaLat * deltaLat + correction * correction * deltaLon * deltaLon);
    }
    /**
     * Calculates the initial true bearing (forward azimuth) from one point to another along the great circle connecting
     * the two.
     * @param lat1 The latitude of the initial point, in degrees.
     * @param lon1 The longitude of the initial point, in degrees.
     * @param lat2 The latitude of the final point, in degrees.
     * @param lon2 The longitude of the final point, in degrees.
     * @returns The initial true bearing, in degrees, from the initial point to the final point along the great circle
     * connecting the two.
     */
    static initialBearing(lat1, lon1, lat2, lon2) {
        lat1 *= Avionics.Utils.DEG2RAD;
        lat2 *= Avionics.Utils.DEG2RAD;
        lon1 *= Avionics.Utils.DEG2RAD;
        lon2 *= Avionics.Utils.DEG2RAD;
        const cosLat2 = Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * cosLat2 * Math.cos(lon2 - lon1);
        const y = Math.sin(lon2 - lon1) * cosLat2;
        const bearing = Math.atan2(y, x) * Avionics.Utils.RAD2DEG;
        return (bearing + 360) % 360; // enforce range [0, 360)
    }
    /**
     * Calculates the final true bearing from one point to another along the great circle connecting the two.
     * @param lat1 The latitude of the initial point, in degrees.
     * @param lon1 The longitude of the initial point, in degrees.
     * @param lat2 The latitude of the final point, in degrees.
     * @param lon2 The longitude of the final point, in degrees.
     * @returns The final true bearing, in degrees, from the initial point to the final point along the great circle
     * connecting the two.
     */
    static finalBearing(lat1, lon1, lat2, lon2) {
        return (GeoPoint.initialBearing(lat2, lon2, lat1, lon1) + 180) % 360;
    }
    /**
     * Calculates the constant true bearing from one point to another along the rhumb line connecting the two.
     * @param lat1 The latitude of the initial point, in degrees.
     * @param lon1 The longitude of the initial point, in degrees.
     * @param lat2 The latitude of the final point, in degrees.
     * @param lon2 The longitude of the final point, in degrees.
     * @returns The constant true bearing, in degrees, from the initial point to the final point along the rhumb line
     * connecting the two.
     */
    static bearingRhumb(lat1, lon1, lat2, lon2) {
        lat1 *= Avionics.Utils.DEG2RAD;
        lat2 *= Avionics.Utils.DEG2RAD;
        lon1 *= Avionics.Utils.DEG2RAD;
        lon2 *= Avionics.Utils.DEG2RAD;
        let deltaLon = lon2 - lon1;
        const deltaPsi = GeoPoint.deltaPsi(lat1, lat2);
        if (Math.abs(deltaLon) > Math.PI) {
            deltaLon += -Math.sign(deltaLon) * 2 * Math.PI;
        }
        return Math.atan2(deltaLon, deltaPsi) * Avionics.Utils.RAD2DEG;
    }
    /**
     * Converts an angle, in degrees, to an equivalent value in the range [-180, 180).
     * @param angle An angle in degrees.
     * @returns The angle's equivalent in the range [-180, 180).
     */
    static toPlusMinus180(angle) {
        return ((angle % 360) + 540) % 360 - 180;
    }
    /**
     * Calculates the difference in isometric latitude from a pair of geodetic (geocentric) latitudes.
     * @param latRad1 Geodetic latitude 1, in radians.
     * @param latRad2 Geodetic latitude 2, in radians.
     * @returns The difference in isometric latitude from latitude 1 to latitude 2, in radians.
     */
    static deltaPsi(latRad1, latRad2) {
        return Math.log(Math.tan(latRad2 / 2 + Math.PI / 4) / Math.tan(latRad1 / 2 + Math.PI / 4));
    }
    /**
     * Calculates the rhumb correction factor between two latitudes.
     * @param deltaPsi The difference in isometric latitude beween the two latitudes.
     * @param latRad1 Geodetic latitude 1, in radians.
     * @param latRad2 Geodetic latitude 2, in radians.
     * @returns The rhumb correction factor between the two latitudes.
     */
    static rhumbCorrection(deltaPsi, latRad1, latRad2) {
        return Math.abs(deltaPsi) > 1e-12 ? ((latRad2 - latRad1) / deltaPsi) : Math.cos(latRad1);
    }
}
/**
 * The default equality tolerance, defined as the maximum allowed distance between two equal points in great-arc
 * radians.
 */
GeoPoint.EQUALITY_TOLERANCE = 1e-7; // ~61 cm
GeoPoint.tempVec3 = new Float64Array(3);
GeoPoint.tempGeoPoint = new GeoPoint(0, 0);

/**
 * A circle on Earth's surface, defined as the set of points on the Earth's surface equidistant (as measured
 * geodetically) from a central point.
 */
class GeoCircle {
    /**
     * Constructor.
     * @param center The center of the new small circle, represented as a position vector in the standard geographic
     * cartesian reference system.
     * @param radius The radius of the new small circle in great-arc radians.
     */
    constructor(center, radius) {
        this._center = new Float64Array(3);
        this._radius = 0;
        this._sinRadius = 0;
        this.set(center, radius);
    }
    // eslint-disable-next-line jsdoc/require-returns
    /**
     * The center of this circle.
     */
    get center() {
        return this._center;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /**
     * The radius of this circle, in great-arc radians.
     */
    get radius() {
        return this._radius;
    }
    /**
     * Checks whether this circle is a great circle, or equivalently, whether its radius is equal to pi / 2 great-arc
     * radians.
     * @returns Whether this circle is a great circle.
     */
    isGreatCircle() {
        return this._radius === Math.PI / 2;
    }
    /**
     * Calculates the length of an arc along this circle subtended by a central angle.
     * @param angle A central angle, in radians.
     * @returns The length of the arc subtended by the angle, in great-arc radians.
     */
    arcLength(angle) {
        return this._sinRadius * angle;
    }
    /**
     * Calculates the central angle which subtends an arc along this circle of given length.
     * @param length An arc length, in great-arc radians.
     * @returns The central angle which subtends an arc along this circle of the given length, in radians.
     */
    angularWidth(length) {
        return length / this._sinRadius;
    }
    /**
     * Sets the center and radius of this circle.
     * @param center The new center.
     * @param radius The new radius in great-arc radians.
     * @returns this circle, after it has been changed.
     */
    set(center, radius) {
        if (center instanceof Float64Array) {
            if (Vec3Math.abs(center) === 0) {
                // if center has no direction, arbitrarily set the center to 0 N, 0 E.
                Vec3Math.set(1, 0, 0, this._center);
            }
            else {
                Vec3Math.normalize(center, this._center);
            }
        }
        else {
            GeoPoint.sphericalToCartesian(center, this._center);
        }
        this._radius = Math.abs(radius) % Math.PI;
        this._sinRadius = Math.sin(this._radius);
        return this;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    setAsGreatCircle(arg1, arg2) {
        this.set(GeoCircle._getGreatCircleNormal(arg1, arg2, GeoCircle.vec3Cache[0]), Math.PI / 2);
        return this;
    }
    /**
     * Reverses the direction of this circle. This sets the center of the circle to its antipode and the radius to its
     * complement with `Math.PI`.
     * @returns This circle, after it has been reversed.
     */
    reverse() {
        Vec3Math.multScalar(this._center, -1, this._center);
        this._radius = Math.PI - this._radius;
        return this;
    }
    /**
     * Gets the distance from a point to the center of this circle, in great-arc radians.
     * @param point The point to which to measure the distance.
     * @returns the distance from the point to the center of this circle.
     */
    distanceToCenter(point) {
        if (point instanceof Float64Array) {
            point = Vec3Math.normalize(point, GeoCircle.vec3Cache[0]);
        }
        else {
            point = GeoPoint.sphericalToCartesian(point, GeoCircle.vec3Cache[0]);
        }
        const dot = Vec3Math.dot(point, this._center);
        return Math.acos(Utils.Clamp(dot, -1, 1));
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    closest(point, out) {
        if (!(point instanceof Float64Array)) {
            point = GeoPoint.sphericalToCartesian(point, GeoCircle.vec3Cache[0]);
        }
        const offset = Vec3Math.multScalar(this._center, Math.cos(this._radius), GeoCircle.vec3Cache[1]);
        const dot = Vec3Math.dot(Vec3Math.sub(point, offset, GeoCircle.vec3Cache[2]), this._center);
        const planeProjected = Vec3Math.sub(point, Vec3Math.multScalar(this._center, dot, GeoCircle.vec3Cache[2]), GeoCircle.vec3Cache[2]);
        if (Vec3Math.dot(planeProjected, planeProjected) === 0 || Math.abs(Vec3Math.dot(planeProjected, this._center)) === 1) {
            // the point is equidistant from all points on this circle
            return out instanceof GeoPoint ? out.set(NaN, NaN) : Vec3Math.set(NaN, NaN, NaN, out);
        }
        const displacement = Vec3Math.multScalar(Vec3Math.normalize(Vec3Math.sub(planeProjected, offset, GeoCircle.vec3Cache[2]), GeoCircle.vec3Cache[2]), Math.sin(this._radius), GeoCircle.vec3Cache[2]);
        const closest = Vec3Math.add(offset, displacement, GeoCircle.vec3Cache[2]);
        return out instanceof Float64Array ? Vec3Math.normalize(closest, out) : out.setFromCartesian(closest);
    }
    /**
     * Calculates and returns the great-circle distance from a specified point to the closest point that lies on this
     * circle. In other words, calculates the shortest distance from a point to this circle. The distance is signed, with
     * positive distances representing deviation away from the center of the circle, and negative distances representing
     * deviation toward the center of the circle.
     * @param point A point, represented as either a position vector or lat/long coordinates.
     * @returns the great circle distance, in great-arc radians, from the point to the closest point on this circle.
     */
    distance(point) {
        const distanceToCenter = this.distanceToCenter(point);
        return distanceToCenter - this._radius;
    }
    /**
     * Checks whether a point lies on this circle.
     * @param point A point, represented as either a position vector or lat/long coordinates.
     * @param tolerance The error tolerance, in great-arc radians, of this operation. Defaults to
     * `GeoCircle.ANGULAR_TOLERANCE` if not specified.
     * @returns whether the point lies on this circle.
     */
    includes(point, tolerance = GeoCircle.ANGULAR_TOLERANCE) {
        const distance = this.distance(point);
        return Math.abs(distance) < tolerance;
    }
    /**
     * Checks whether a point lies within the boundary defined by this circle. This is equivalent to checking whether
     * the distance of the point from the center of this circle is less than or equal to this circle's radius.
     * @param point A point, represented as either a position vector or lat/long coordinates.
     * @param inclusive Whether points that lie on this circle should pass the check. True by default.
     * @param tolerance The error tolerance, in great-arc radians, of this operation. Defaults to
     * `GeoCircle.ANGULAR_TOLERANCE` if not specified.
     * @returns whether the point lies within the boundary defined by this circle.
     */
    encircles(point, inclusive = true, tolerance = GeoCircle.ANGULAR_TOLERANCE) {
        const distance = this.distance(point);
        return inclusive
            ? distance <= tolerance
            : distance < -tolerance;
    }
    /**
     * Gets the angular distance along an arc between two points that lie on this circle. The arc extends from the first
     * point to the second in a counterclockwise direction when viewed from above the center of the circle.
     * @param start A point on this circle which marks the beginning of an arc.
     * @param end A point on this circle which marks the end of an arc.
     * @param tolerance The error tolerance, in great-arc radians, when checking if `start` and `end` lie on this circle.
     * Defaults to `GeoCircle.ANGULAR_TOLERANCE` if not specified.
     * @param equalityTolerance The angular tolerance for considering the start and end points to be equal, in radians.
     * If the absolute (direction-agnostic) angular distance between the start and end points is less than or equal to
     * this value, then the zero will be returned. Defaults to `0`.
     * @returns the angular width of the arc between the two points, in radians.
     * @throws Error if either point does not lie on this circle.
     */
    angleAlong(start, end, tolerance = GeoCircle.ANGULAR_TOLERANCE, equalityTolerance = 0) {
        if (!(start instanceof Float64Array)) {
            start = GeoPoint.sphericalToCartesian(start, GeoCircle.vec3Cache[1]);
        }
        if (!(end instanceof Float64Array)) {
            end = GeoPoint.sphericalToCartesian(end, GeoCircle.vec3Cache[2]);
        }
        if (!this.includes(start, tolerance) || !this.includes(end, tolerance)) {
            throw new Error(`GeoCircle: at least one of the two specified arc end points does not lie on this circle (start point distance of ${this.distance(start)}, end point distance of ${this.distance(end)}, vs tolerance of ${tolerance}).`);
        }
        if (this._radius <= GeoCircle.ANGULAR_TOLERANCE) {
            return 0;
        }
        const startRadialNormal = Vec3Math.normalize(Vec3Math.cross(this._center, start, GeoCircle.vec3Cache[3]), GeoCircle.vec3Cache[3]);
        const endRadialNormal = Vec3Math.normalize(Vec3Math.cross(this._center, end, GeoCircle.vec3Cache[4]), GeoCircle.vec3Cache[4]);
        const angularDistance = Math.acos(Utils.Clamp(Vec3Math.dot(startRadialNormal, endRadialNormal), -1, 1));
        const isArcGreaterThanSemi = Vec3Math.dot(startRadialNormal, end) < 0;
        const angle = isArcGreaterThanSemi ? MathUtils.TWO_PI - angularDistance : angularDistance;
        return angle >= MathUtils.TWO_PI - equalityTolerance || angle <= equalityTolerance ? 0 : angle;
    }
    /**
     * Gets the distance along an arc between two points that lie on this circle. The arc extends from the first point
     * to the second in a counterclockwise direction when viewed from above the center of the circle.
     * @param start A point on this circle which marks the beginning of an arc.
     * @param end A point on this circle which marks the end of an arc.
     * @param tolerance The error tolerance, in great-arc radians, when checking if `start` and `end` lie on this circle.
     * Defaults to `GeoCircle.ANGULAR_TOLERANCE` if not specified.
     * @param equalityTolerance The tolerance for considering the start and end points to be equal, in great-arc radians.
     * If the absolute (direction-agnostic) along-arc distance between the start and end points is less than or equal to
     * this value, then the zero will be returned. Defaults to `0`.
     * @returns the length of the arc between the two points, in great-arc radians.
     * @throws Error if either point does not lie on this circle.
     */
    distanceAlong(start, end, tolerance = GeoCircle.ANGULAR_TOLERANCE, equalityTolerance = 0) {
        return this.arcLength(this.angleAlong(start, end, tolerance, this.angularWidth(equalityTolerance)));
    }
    /**
     * Calculates the true bearing along this circle at a point on the circle.
     * @param point A point on this circle.
     * @param tolerance The error tolerance, in great-arc radians, when checking if `point` lies on this circle. Defaults
     * to `GeoCircle.ANGULAR_TOLERANCE` if not specified.
     * @returns the bearing along this circle at the point.
     * @throws Error if the point does not lie on this circle.
     */
    bearingAt(point, tolerance = GeoCircle.ANGULAR_TOLERANCE) {
        if (!(point instanceof Float64Array)) {
            point = GeoPoint.sphericalToCartesian(point, GeoCircle.vec3Cache[1]);
        }
        if (!this.includes(point, tolerance)) {
            throw new Error(`GeoCircle: the specified point does not lie on this circle (distance of ${Math.abs(this.distance(point))} vs tolerance of ${tolerance}).`);
        }
        if (this._radius <= GeoCircle.ANGULAR_TOLERANCE || 1 - Math.abs(Vec3Math.dot(point, GeoCircle.NORTH_POLE)) <= GeoCircle.ANGULAR_TOLERANCE) {
            // Meaningful bearings cannot be defined along a circle with 0 radius (effectively a point) and at the north and south poles.
            return NaN;
        }
        const radialNormal = Vec3Math.normalize(Vec3Math.cross(this._center, point, GeoCircle.vec3Cache[2]), GeoCircle.vec3Cache[2]);
        const northNormal = Vec3Math.normalize(Vec3Math.cross(point, GeoCircle.NORTH_POLE, GeoCircle.vec3Cache[3]), GeoCircle.vec3Cache[3]);
        return (Math.acos(Utils.Clamp(Vec3Math.dot(radialNormal, northNormal), -1, 1)) * (radialNormal[2] >= 0 ? 1 : -1) * Avionics.Utils.RAD2DEG - 90 + 360) % 360;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    offsetDistanceAlong(point, distance, out, tolerance = GeoCircle.ANGULAR_TOLERANCE) {
        const angle = distance / Math.sin(this.radius);
        return this._offsetAngleAlong(point, angle, out, tolerance);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    offsetAngleAlong(point, angle, out, tolerance = GeoCircle.ANGULAR_TOLERANCE) {
        return this._offsetAngleAlong(point, angle, out, tolerance);
    }
    /**
     * Offsets a point on this circle by a specified angular distance. The direction of the offset for positive distances
     * is counterclockwise when viewed from above the center of this circle.
     * @param point The point to offset.
     * @param angle The angular distance by which to offset, in radians.
     * @param out A Float64Array or GeoPoint object to which to write the result.
     * @param tolerance The error tolerance, in great-arc radians, when checking if `point` lies on this circle. Defaults
     * to `GeoCircle.ANGULAR_TOLERANCE` if not specified.
     * @returns The offset point.
     * @throws Error if the point does not lie on this circle.
     */
    _offsetAngleAlong(point, angle, out, tolerance = GeoCircle.ANGULAR_TOLERANCE) {
        if (!(point instanceof Float64Array)) {
            point = GeoPoint.sphericalToCartesian(point, GeoCircle.vec3Cache[3]);
        }
        if (!this.includes(point, tolerance)) {
            throw new Error(`GeoCircle: the specified point does not lie on this circle (distance of ${Math.abs(this.distance(point))} vs tolerance of ${tolerance}).`);
        }
        if (this.radius === 0) {
            return out instanceof GeoPoint ? out.setFromCartesian(point) : Vec3Math.copy(point, out);
        }
        // Since point may not lie exactly on this circle due to error tolerance, project point onto this circle to ensure
        // the offset point lies exactly on this circle.
        point = this.closest(point, GeoCircle.vec3Cache[3]);
        const sin = Math.sin(angle / 2);
        const q0 = Math.cos(angle / 2);
        const q1 = sin * this._center[0];
        const q2 = sin * this._center[1];
        const q3 = sin * this._center[2];
        const q0Sq = q0 * q0;
        const q1Sq = q1 * q1;
        const q2Sq = q2 * q2;
        const q3Sq = q3 * q3;
        const q01 = q0 * q1;
        const q02 = q0 * q2;
        const q03 = q0 * q3;
        const q12 = q1 * q2;
        const q13 = q1 * q3;
        const q23 = q2 * q3;
        const rot_11 = q0Sq + q1Sq - q2Sq - q3Sq;
        const rot_12 = 2 * (q12 - q03);
        const rot_13 = 2 * (q13 + q02);
        const rot_21 = 2 * (q12 + q03);
        const rot_22 = q0Sq - q1Sq + q2Sq - q3Sq;
        const rot_23 = 2 * (q23 - q01);
        const rot_31 = 2 * (q13 - q02);
        const rot_32 = 2 * (q23 + q01);
        const rot_33 = (q0Sq - q1Sq - q2Sq + q3Sq);
        const x = point[0];
        const y = point[1];
        const z = point[2];
        const rotX = rot_11 * x + rot_12 * y + rot_13 * z;
        const rotY = rot_21 * x + rot_22 * y + rot_23 * z;
        const rotZ = rot_31 * x + rot_32 * y + rot_33 * z;
        return out instanceof Float64Array
            ? Vec3Math.set(rotX, rotY, rotZ, out)
            : out.setFromCartesian(Vec3Math.set(rotX, rotY, rotZ, GeoCircle.vec3Cache[2]));
    }
    /**
     * Calculates and returns the set of intersection points between this circle and another one, and writes the results
     * to an array of position vectors.
     * @param other The other circle to test for intersections.
     * @param out An array in which to store the results. The results will be stored at indexes 0 and 1. If these indexes
     * are empty, then new Float64Array objects will be created and inserted into the array.
     * @returns The number of solutions written to the out array. Either 0, 1, or 2.
     */
    intersection(other, out) {
        const center1 = this._center;
        const center2 = other._center;
        const radius1 = this._radius;
        const radius2 = other._radius;
        /**
         * Theory: We can model geo circles as the intersection between a sphere and the unit sphere (Earth's surface).
         * Therefore, the intersection of two geo circles is the intersection between two spheres AND the unit sphere.
         * First, we find the intersection of the two non-Earth spheres (which can either be a sphere, a circle, or a
         * point), then we find the intersection of that geometry with the unit sphere.
         */
        const dot = Vec3Math.dot(center1, center2);
        const dotSquared = dot * dot;
        if (dotSquared === 1) {
            // the two circles are concentric; either there are zero solutions or infinite solutions; either way we don't
            // write any solutions to the array.
            return 0;
        }
        // find the position vector to the center of the circle which defines the intersection of the two geo circle
        // spheres.
        const a = (Math.cos(radius1) - dot * Math.cos(radius2)) / (1 - dotSquared);
        const b = (Math.cos(radius2) - dot * Math.cos(radius1)) / (1 - dotSquared);
        const intersection = Vec3Math.add(Vec3Math.multScalar(center1, a, GeoCircle.vec3Cache[0]), Vec3Math.multScalar(center2, b, GeoCircle.vec3Cache[1]), GeoCircle.vec3Cache[0]);
        const intersectionLengthSquared = Vec3Math.dot(intersection, intersection);
        if (intersectionLengthSquared > 1) {
            // the two geo circle spheres do not intersect.
            return 0;
        }
        const cross = Vec3Math.cross(center1, center2, GeoCircle.vec3Cache[1]);
        const crossLengthSquared = Vec3Math.dot(cross, cross);
        if (crossLengthSquared === 0) {
            // this technically can't happen (since we already check if center1 dot center2 === +/-1 above, but just in
            // case...)
            return 0;
        }
        const offset = Math.sqrt((1 - intersectionLengthSquared) / crossLengthSquared);
        let solutionCount = 1;
        if (!out[0]) {
            out[0] = new Float64Array(3);
        }
        out[0].set(cross);
        Vec3Math.multScalar(out[0], offset, out[0]);
        Vec3Math.add(out[0], intersection, out[0]);
        if (offset > 0) {
            if (!out[1]) {
                out[1] = new Float64Array(3);
            }
            out[1].set(cross);
            Vec3Math.multScalar(out[1], -offset, out[1]);
            Vec3Math.add(out[1], intersection, out[1]);
            solutionCount++;
        }
        return solutionCount;
    }
    /**
     * Calculates and returns the set of intersection points between this circle and another one, and writes the results
     * to an array of GeoPoint objects.
     * @param other The other circle to test for intersections.
     * @param out An array in which to store the results. The results will be stored at indexes 0 and 1. If these indexes
     * are empty, then new GeoPoint objects will be created and inserted into the array.
     * @returns The number of solutions written to the out array. Either 0, 1, or 2.
     */
    intersectionGeoPoint(other, out) {
        const solutionCount = this.intersection(other, GeoCircle.intersectionCache);
        for (let i = 0; i < solutionCount; i++) {
            if (!out[i]) {
                out[i] = new GeoPoint(0, 0);
            }
            out[i].setFromCartesian(GeoCircle.intersectionCache[i]);
        }
        return solutionCount;
    }
    /**
     * Calculates and returns the number of intersection points between this circle and another one. Returns NaN if there
     * are an infinite number of intersection points.
     * @param other The other circle to test for intersections.
     * @param tolerance The error tolerance, in great-arc radians, of this operation. Defaults to
     * `GeoCircle.ANGULAR_TOLERANCE` if not specified.
     * @returns the number of intersection points between this circle and the other one.
     */
    numIntersectionPoints(other, tolerance = GeoCircle.ANGULAR_TOLERANCE) {
        const center1 = this.center;
        const center2 = other.center;
        const radius1 = this.radius;
        const radius2 = other.radius;
        const dot = Vec3Math.dot(center1, center2);
        const dotSquared = dot * dot;
        if (dotSquared === 1) {
            // the two circles are concentric; if they are the same circle there are an infinite number of intersections,
            // otherwise there are none.
            if (dot === 1) {
                // centers are the same
                return (Math.abs(this.radius - other.radius) <= tolerance) ? NaN : 0;
            }
            else {
                // centers are antipodal
                return (Math.abs(Math.PI - this.radius - other.radius) <= tolerance) ? NaN : 0;
            }
        }
        const a = (Math.cos(radius1) - dot * Math.cos(radius2)) / (1 - dotSquared);
        const b = (Math.cos(radius2) - dot * Math.cos(radius1)) / (1 - dotSquared);
        const intersection = Vec3Math.add(Vec3Math.multScalar(center1, a, GeoCircle.vec3Cache[0]), Vec3Math.multScalar(center2, b, GeoCircle.vec3Cache[1]), GeoCircle.vec3Cache[1]);
        const intersectionLengthSquared = Vec3Math.dot(intersection, intersection);
        if (intersectionLengthSquared > 1) {
            return 0;
        }
        const cross = Vec3Math.cross(center1, center2, GeoCircle.vec3Cache[1]);
        const crossLengthSquared = Vec3Math.dot(cross, cross);
        if (crossLengthSquared === 0) {
            return 0;
        }
        const sinTol = Math.sin(tolerance);
        return ((1 - intersectionLengthSquared) / crossLengthSquared > sinTol * sinTol) ? 2 : 1;
    }
    /**
     * Creates a new small circle from a lat/long coordinate pair and radius.
     * @param point The center of the new small circle.
     * @param radius The radius of the new small circle, in great-arc radians.
     * @returns a small circle.
     */
    static createFromPoint(point, radius) {
        return new GeoCircle(GeoPoint.sphericalToCartesian(point, GeoCircle.vec3Cache[0]), radius);
    }
    static createGreatCircle(arg1, arg2) {
        return new GeoCircle(GeoCircle._getGreatCircleNormal(arg1, arg2, GeoCircle.vec3Cache[0]), Math.PI / 2);
    }
    /* eslint-enable jsdoc/require-jsdoc */
    /**
     * Creates a new great circle defined by one point and a bearing offset. The new great circle will be equivalent to
     * the path projected from the point with the specified initial bearing (forward azimuth).
     * @param point A point that lies on the new great circle.
     * @param bearing The initial bearing from the point.
     * @returns a great circle.
     */
    static createGreatCircleFromPointBearing(point, bearing) {
        return new GeoCircle(GeoCircle.getGreatCircleNormalFromPointBearing(point, bearing, GeoCircle.vec3Cache[0]), Math.PI / 2);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    static getGreatCircleNormal(arg1, arg2, out) {
        return GeoCircle._getGreatCircleNormal(arg1, arg2, out);
    }
    /**
     * Calculates a normal vector for a great circle given two points which lie on the circle, or a point and initial bearing.
     * @param arg1 A point that lies on the great circle.
     * @param arg2 A second point that lies on the great circle, or an initial bearing from the first point.
     * @param out The vector to which to write the result.
     * @returns the normal vector for the great circle.
     */
    static _getGreatCircleNormal(arg1, arg2, out) {
        if (typeof arg2 === 'number') {
            return GeoCircle.getGreatCircleNormalFromPointBearing(arg1, arg2, out);
        }
        else {
            return GeoCircle.getGreatCircleNormalFromPoints(arg1, arg2, out);
        }
    }
    /**
     * Calculates a normal vector for a great circle given two points which lie on the cirlce.
     * @param point1 The first point that lies on the great circle.
     * @param point2 The second point that lies on the great circle.
     * @param out The vector to which to write the result.
     * @returns the normal vector for the great circle.
     */
    static getGreatCircleNormalFromPoints(point1, point2, out) {
        if (!(point1 instanceof Float64Array)) {
            point1 = GeoPoint.sphericalToCartesian(point1, GeoCircle.vec3Cache[0]);
        }
        if (!(point2 instanceof Float64Array)) {
            point2 = GeoPoint.sphericalToCartesian(point2, GeoCircle.vec3Cache[1]);
        }
        return Vec3Math.normalize(Vec3Math.cross(point1, point2, out), out);
    }
    /**
     * Calculates a normal vector for a great circle given a point and initial bearing.
     * @param point A point that lies on the great circle.
     * @param bearing The initial bearing from the point.
     * @param out The vector to which to write the result.
     * @returns the normal vector for the great circle.
     */
    static getGreatCircleNormalFromPointBearing(point, bearing, out) {
        if (point instanceof Float64Array) {
            point = GeoCircle.tempGeoPoint.setFromCartesian(point);
        }
        const lat = point.lat * Avionics.Utils.DEG2RAD;
        const long = point.lon * Avionics.Utils.DEG2RAD;
        bearing *= Avionics.Utils.DEG2RAD;
        const sinLat = Math.sin(lat);
        const sinLon = Math.sin(long);
        const cosLon = Math.cos(long);
        const sinBearing = Math.sin(bearing);
        const cosBearing = Math.cos(bearing);
        const x = sinLon * cosBearing - sinLat * cosLon * sinBearing;
        const y = -cosLon * cosBearing - sinLat * sinLon * sinBearing;
        const z = Math.cos(lat) * sinBearing;
        return Vec3Math.set(x, y, z, out);
    }
}
GeoCircle.ANGULAR_TOLERANCE = 1e-7; // ~61cm
GeoCircle.NORTH_POLE = new Float64Array([0, 0, 1]);
GeoCircle.tempGeoPoint = new GeoPoint(0, 0);
GeoCircle.vec3Cache = [new Float64Array(3), new Float64Array(3), new Float64Array(3), new Float64Array(3), new Float64Array(3)];
GeoCircle.intersectionCache = [new Float64Array(3), new Float64Array(3)];

/**
 * Navigational mathematics functions.
 */
class NavMath {
    /**
     * Clamps a value to a min and max.
     * @param val The value to clamp.
     * @param min The minimum value to clamp to.
     * @param max The maximum value to clamp to.
     * @returns The clamped value.
     */
    static clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }
    /**
     * Normalizes a heading to a 0-360 range.
     * @param heading The heading to normalize.
     * @returns The normalized heading.
     */
    static normalizeHeading(heading) {
        if (isFinite(heading)) {
            return (heading % 360 + 360) % 360;
        }
        else {
            console.error(`normalizeHeading: Invalid heading: ${heading}`);
            return NaN;
        }
    }
    /**
     * Inverts a heading value by adding 180 and normalizing.
     * @param heading The heading to invert/reciprocate.
     * @returns The inverted/reciprocated heading.
     * */
    static reciprocateHeading(heading) {
        return NavMath.normalizeHeading(heading + 180);
    }
    /**
     * Gets the turn radius for a given true airspeed.
     * @param airspeedTrue The true airspeed of the plane, in knots.
     * @param bankAngle The bank angle of the plane, in degrees.
     * @returns The airplane turn radius, in meters.
     */
    static turnRadius(airspeedTrue, bankAngle) {
        return (Math.pow(airspeedTrue, 2) / (11.26 * Math.tan(bankAngle * Avionics.Utils.DEG2RAD)))
            / 3.2808399;
    }
    /**
     * Gets the required bank angle for a given true airspeed and turn radius.
     * @param airspeedTrue The true airspeed of the plane, in knots.
     * @param radius The airplane turn radius, in meters.
     * @returns The required bank angle, in degrees.
     */
    static bankAngle(airspeedTrue, radius) {
        const airspeedMS = airspeedTrue * 0.51444444;
        return Math.atan(Math.pow(airspeedMS, 2) / (radius * 9.80665)) * Avionics.Utils.RAD2DEG;
    }
    /**
     * Get the turn direction for a given course change.
     * @param startCourse The start course.
     * @param endCourse The end course.
     * @returns The turn direction for the course change.
     */
    static getTurnDirection(startCourse, endCourse) {
        return NavMath.normalizeHeading(endCourse - startCourse) > 180 ? 'left' : 'right';
    }
    /**
     * Converts polar radians to degrees north.
     * @param radians The radians to convert.
     * @returns The angle, in degrees north.
     */
    static polarToDegreesNorth(radians) {
        return NavMath.normalizeHeading((180 / Math.PI) * (Math.PI / 2 - radians));
    }
    /**
     * Converts degrees north to polar radians.
     * @param degrees The degrees to convert.
     * @returns The angle radians, in polar.
     */
    static degreesNorthToPolar(degrees) {
        return NavMath.normalizeHeading(degrees - 90) / (180 / Math.PI);
    }
    /**
     * Calculates the distance along an arc on Earth's surface. The arc begins at the intersection of the great circle
     * passing through the center of a circle of radius `radius` meters in the direction of 'startBearing', and ends at
     * the intersection of the great circle passing through the center of the circle in the direction of 'endBearing',
     * proceeding clockwise (as viewed from above).
     * @param startBearing The degrees of the start of the arc.
     * @param endBearing The degrees of the end of the arc.
     * @param radius The radius of the arc, in meters.
     * @returns The arc distance.
     */
    static calculateArcDistance(startBearing, endBearing, radius) {
        const angularWidth = ((endBearing - startBearing + 360) % 360) * Avionics.Utils.DEG2RAD;
        const conversion = UnitType.GA_RADIAN.convertTo(1, UnitType.METER);
        return angularWidth * Math.sin(radius / conversion) * conversion;
    }
    /**
     * Calculates the intersection of a line and a circle.
     * @param x1 The start x of the line.
     * @param y1 The start y of the line.
     * @param x2 The end x of the line.
     * @param y2 The end y of the line.
     * @param cx The circle center x.
     * @param cy The circle center y.
     * @param r The radius of the circle.
     * @param sRef The reference to the solution object to write the solution to.
     * @returns The number of solutions (0, 1 or 2).
     */
    static circleIntersection(x1, y1, x2, y2, cx, cy, r, sRef) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const a = dx * dx + dy * dy;
        const b = 2 * (dx * (x1 - cx) + dy * (y1 - cy));
        const c = (x1 - cx) * (x1 - cx) + (y1 - cy) * (y1 - cy) - r * r;
        const det = b * b - 4 * a * c;
        if (a < 0.0000001 || det < 0) {
            sRef.x1 = NaN;
            sRef.x2 = NaN;
            sRef.y1 = NaN;
            sRef.y2 = NaN;
            return 0;
        }
        else if (det == 0) {
            const t = -b / (2 * a);
            sRef.x1 = x1 + t * dx;
            sRef.y1 = y1 + t * dy;
            sRef.x2 = NaN;
            sRef.y2 = NaN;
            return 1;
        }
        else {
            const t1 = ((-b + Math.sqrt(det)) / (2 * a));
            sRef.x1 = x1 + t1 * dx;
            sRef.y1 = y1 + t1 * dy;
            const t2 = ((-b - Math.sqrt(det)) / (2 * a));
            sRef.x2 = x1 + t2 * dx;
            sRef.y2 = y1 + t2 * dy;
            return 2;
        }
    }
    /**
     * Gets the degrees north that a point lies on a circle.
     * @param cx The x point of the center of the circle.
     * @param cy The y point of the center of the circle.
     * @param x The x point to get the bearing for.
     * @param y The y point to get the bearing for.
     * @returns The angle in degrees north that the point is relative to the center.
     */
    static northAngle(cx, cy, x, y) {
        return NavMath.polarToDegreesNorth(Math.atan2(y - cy, x - cx));
    }
    /**
     * Checks if a degrees north bearing is between two other degrees north bearings.
     * @param bearing The bearing in degrees north to check.
     * @param start The start bearing in degrees north.
     * @param end The end bearing, in degrees north.
     * @returns True if the bearing is between the two provided bearings, false otherwise.
     */
    static bearingIsBetween(bearing, start, end) {
        const range = this.normalizeHeading(end - start);
        const relativeBearing = this.normalizeHeading(bearing - start);
        return relativeBearing >= 0 && relativeBearing <= range;
    }
    /**
     * Converts a degrees north heading to a degrees north turn circle angle.
     * @param heading The heading to convert.
     * @param turnDirection The direction of the turn.
     * @returns A degrees north turn circle angle.
     */
    static headingToAngle(heading, turnDirection) {
        return NavMath.normalizeHeading(heading + (turnDirection === 'left' ? 90 : -90));
    }
    /**
     * Converts a degrees north turn circle angle to a degrees north heading.
     * @param angle The turn circle angle to convert.
     * @param turnDirection The direction of the turn.
     * @returns A degrees north heading.
     */
    static angleToHeading(angle, turnDirection) {
        return NavMath.normalizeHeading(angle + (turnDirection === 'left' ? -90 : 90));
    }
    /**
     * Calculates the wind correction angle.
     * @param course The current plane true course.
     * @param airspeedTrue The current plane true airspeed.
     * @param windDirection The direction of the wind, in degrees true.
     * @param windSpeed The current speed of the wind.
     * @returns The calculated wind correction angle.
     */
    static windCorrectionAngle(course, airspeedTrue, windDirection, windSpeed) {
        const currCrosswind = windSpeed * (Math.sin((course * Math.PI / 180) - (windDirection * Math.PI / 180)));
        const windCorrection = 180 * Math.asin(currCrosswind / airspeedTrue) / Math.PI;
        return windCorrection;
    }
    /**
     * Calculates the cross track deviation from the provided leg fixes.
     * @param start The location of the starting fix of the leg.
     * @param end The location of the ending fix of the leg.
     * @param pos The current plane location coordinates.
     * @returns The amount of cross track deviation, in nautical miles.
     */
    static crossTrack(start, end, pos) {
        const path = NavMath.geoCircleCache[0].setAsGreatCircle(start, end);
        if (isNaN(path.center[0])) {
            return NaN;
        }
        return UnitType.GA_RADIAN.convertTo(path.distance(pos), UnitType.NMILE);
    }
    /**
     * Calculates the along-track distance from a starting point to another point along a great-circle track running
     * through the starting point.
     * @param start The start of the great-circle track.
     * @param end The end of the great-circle track.
     * @param pos The point for which to calculate the along-track distance.
     * @returns The along-track distance, in nautical miles.
     */
    static alongTrack(start, end, pos) {
        const path = NavMath.geoCircleCache[0].setAsGreatCircle(start, end);
        if (isNaN(path.center[0])) {
            return NaN;
        }
        const distance = path.distanceAlong(start, path.closest(pos, NavMath.vec3Cache[0]));
        return UnitType.GA_RADIAN.convertTo((distance + Math.PI) % (2 * Math.PI) - Math.PI, UnitType.NMILE);
    }
    /**
     * Calculates the desired track from the provided leg fixes.
     * @param start The location of the starting fix of the leg.
     * @param end The location of the ending fix of the leg.
     * @param pos The current plane location coordinates.
     * @returns The desired track, in degrees true.
     */
    static desiredTrack(start, end, pos) {
        const path = NavMath.geoCircleCache[0].setAsGreatCircle(start, end);
        if (isNaN(path.center[0])) {
            return NaN;
        }
        return path.bearingAt(path.closest(pos, NavMath.vec3Cache[0]));
    }
    /**
     * Gets the desired track for a given arc.
     * @param center The center of the arc.
     * @param turnDirection The direction of the turn.
     * @param pos The current plane position.
     * @returns The desired track.
     */
    static desiredTrackArc(center, turnDirection, pos) {
        const northAngle = NavMath.geoPointCache[0].set(pos).bearingFrom(center);
        //TODO: Clamp the arc angle to the start and end angles
        return NavMath.angleToHeading(northAngle, turnDirection);
    }
    /**
     * Gets the percentage along the arc path that the plane currently is.
     * @param start The start of the arc, in degrees north.
     * @param end The end of the arc, in degrees north.
     * @param center The center location of the arc.
     * @param turnDirection The direction of the turn.
     * @param pos The current plane position.
     * @returns The percentage along the arc the plane is.
     */
    static percentAlongTrackArc(start, end, center, turnDirection, pos) {
        const bearingFromCenter = NavMath.geoPointCache[0].set(center).bearingTo(pos);
        const sign = turnDirection === 'right' ? 1 : -1;
        const alpha = ((end - start) * sign + 360) % 360;
        const mid = (start + alpha / 2 * sign + 360) % 360;
        const rotBearing = ((bearingFromCenter - mid) + 540) % 360 - 180;
        const frac = rotBearing * sign / alpha + 0.5;
        return frac;
    }
    /**
     * Gets a position given an arc and a distance from the arc start.
     * @param start The start bearing of the arc.
     * @param center The center of the arc.
     * @param radius The radius of the arc.
     * @param turnDirection The turn direction for the arc.
     * @param distance The distance along the arc to get the position for.
     * @param out The position to write to.
     * @returns The position along the arc that was written to.
     */
    static positionAlongArc(start, center, radius, turnDirection, distance, out) {
        const convertedRadius = UnitType.GA_RADIAN.convertTo(Math.sin(UnitType.METER.convertTo(radius, UnitType.GA_RADIAN)), UnitType.METER);
        const theta = UnitType.RADIAN.convertTo(distance / convertedRadius, UnitType.DEGREE);
        const bearing = turnDirection === 'right' ? start + theta : start - theta;
        center.offset(NavMath.normalizeHeading(bearing), UnitType.METER.convertTo(radius, UnitType.GA_RADIAN), out);
        return out;
    }
    /**
     * Gets the cross track distance for a given arc.
     * @param center The center of the arc.
     * @param radius The radius of the arc, in meters.
     * @param pos The current plane position.
     * @returns The cross track distance, in NM.
     */
    static crossTrackArc(center, radius, pos) {
        return UnitType.METER.convertTo(radius, UnitType.NMILE) - UnitType.GA_RADIAN.convertTo(NavMath.geoPointCache[0].set(pos).distance(center), UnitType.NMILE);
    }
    /**
     * Gets the total difference in degrees between two angles.
     * @param a The first angle.
     * @param b The second angle.
     * @returns The difference between the two angles, in degrees.
     */
    static diffAngle(a, b) {
        let diff = b - a;
        while (diff > 180) {
            diff -= 360;
        }
        while (diff <= -180) {
            diff += 360;
        }
        return diff;
    }
    /**
     * Finds side a given sides b, c, and angles beta, gamma.
     * @param b The length of side b, as a trigonometric ratio.
     * @param c The length of side c, as a trigonometric ratio.
     * @param beta The angle, in radians, of the opposite of side b.
     * @param gamma The angle, in radians, of the opposite of side c
     * @returns The length of side a, as a trigonometric ratio.
     */
    static napierSide(b, c, beta, gamma) {
        return 2 * Math.atan(Math.tan(0.5 * (b - c))
            * (Math.sin(0.5 * (beta + gamma)) / Math.sin(0.5 * (beta - gamma))));
    }
    /**
     * Calculates a normal vector to a provided course in degrees north.
     * @param course The course in degrees north.
     * @param turnDirection The direction of the turn to orient the normal.
     * @param outVector The normal vector for the provided course.
     */
    static normal(course, turnDirection, outVector) {
        const normalCourse = NavMath.headingToAngle(course, turnDirection);
        const polarCourse = NavMath.degreesNorthToPolar(normalCourse);
        outVector[0] = Math.cos(polarCourse);
        outVector[1] = Math.sin(polarCourse);
    }
}
NavMath.vec3Cache = [new Float64Array(3)];
NavMath.geoPointCache = [new GeoPoint(0, 0), new GeoPoint(0, 0)];
NavMath.geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];

/**
 * A basic implementation of {@link Consumer}.
 */
class BasicConsumer {
    /**
     * Creates an instance of a Consumer.
     * @param subscribe A function which subscribes a handler to the source of this consumer's events.
     * @param state The state for the consumer to track.
     * @param currentHandler The current build filter handler stack, if any.
     */
    constructor(subscribe, state = {}, currentHandler) {
        this.subscribe = subscribe;
        this.state = state;
        this.currentHandler = currentHandler;
        /** @inheritdoc */
        this.isConsumer = true;
        this.activeSubs = new Map();
    }
    /** @inheritdoc */
    handle(handler, paused = false) {
        let activeHandler;
        if (this.currentHandler !== undefined) {
            /**
             * The handler reference to store.
             * @param data The input data to the handler.
             */
            activeHandler = (data) => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.currentHandler(data, this.state, handler);
            };
        }
        else {
            activeHandler = handler;
        }
        let activeSubArray = this.activeSubs.get(handler);
        if (!activeSubArray) {
            activeSubArray = [];
            this.activeSubs.set(handler, activeSubArray);
        }
        const onDestroyed = (destroyed) => {
            const activeSubsArray = this.activeSubs.get(handler);
            if (activeSubsArray) {
                activeSubsArray.splice(activeSubsArray.indexOf(destroyed), 1);
                if (activeSubsArray.length === 0) {
                    this.activeSubs.delete(handler);
                }
            }
        };
        const sub = new ConsumerSubscription(this.subscribe(activeHandler, paused), onDestroyed);
        // Need to handle the case where the subscription is destroyed immediately
        if (sub.isAlive) {
            activeSubArray.push(sub);
        }
        else if (activeSubArray.length === 0) {
            this.activeSubs.delete(handler);
        }
        return sub;
    }
    /** @inheritdoc */
    off(handler) {
        var _a;
        const activeSubArray = this.activeSubs.get(handler);
        if (activeSubArray) {
            (_a = activeSubArray.shift()) === null || _a === void 0 ? void 0 : _a.destroy();
            if (activeSubArray.length === 0) {
                this.activeSubs.delete(handler);
            }
        }
    }
    /** @inheritdoc */
    atFrequency(frequency, immediateFirstPublish = true) {
        const initialState = {
            previousTime: Date.now(),
            firstRun: immediateFirstPublish
        };
        return new BasicConsumer(this.subscribe, initialState, this.getAtFrequencyHandler(frequency));
    }
    /**
     * Gets a handler function for a 'atFrequency' filter.
     * @param frequency The frequency, in Hz, to cap to.
     * @returns A handler function for a 'atFrequency' filter.
     */
    getAtFrequencyHandler(frequency) {
        const deltaTimeTrigger = 1000 / frequency;
        return (data, state, next) => {
            const currentTime = Date.now();
            const deltaTime = currentTime - state.previousTime;
            if (deltaTimeTrigger <= deltaTime || state.firstRun) {
                while ((state.previousTime + deltaTimeTrigger) < currentTime) {
                    state.previousTime += deltaTimeTrigger;
                }
                if (state.firstRun) {
                    state.firstRun = false;
                }
                this.with(data, next);
            }
        };
    }
    /** @inheritdoc */
    withPrecision(precision) {
        return new BasicConsumer(this.subscribe, { lastValue: 0, hasLastValue: false }, this.getWithPrecisionHandler(precision));
    }
    /**
     * Gets a handler function for a 'withPrecision' filter.
     * @param precision The decimal precision to snap to.
     * @returns A handler function for a 'withPrecision' filter.
     */
    getWithPrecisionHandler(precision) {
        return (data, state, next) => {
            const dataValue = data;
            const multiplier = Math.pow(10, precision);
            const currentValueAtPrecision = Math.round(dataValue * multiplier) / multiplier;
            if (!state.hasLastValue || currentValueAtPrecision !== state.lastValue) {
                state.hasLastValue = true;
                state.lastValue = currentValueAtPrecision;
                this.with(currentValueAtPrecision, next);
            }
        };
    }
    /** @inheritdoc */
    whenChangedBy(amount) {
        return new BasicConsumer(this.subscribe, { lastValue: 0, hasLastValue: false }, this.getWhenChangedByHandler(amount));
    }
    /**
     * Gets a handler function for a 'whenChangedBy' filter.
     * @param amount The minimum amount threshold below which the consumer will not consume.
     * @returns A handler function for a 'whenChangedBy' filter.
     */
    getWhenChangedByHandler(amount) {
        return (data, state, next) => {
            const dataValue = data;
            const diff = Math.abs(dataValue - state.lastValue);
            if (!state.hasLastValue || diff >= amount) {
                state.hasLastValue = true;
                state.lastValue = dataValue;
                this.with(data, next);
            }
        };
    }
    /** @inheritdoc */
    whenChanged() {
        return new BasicConsumer(this.subscribe, { lastValue: '', hasLastValue: false }, this.getWhenChangedHandler());
    }
    /**
     * Gets a handler function for a 'whenChanged' filter.
     * @returns A handler function for a 'whenChanged' filter.
     */
    getWhenChangedHandler() {
        return (data, state, next) => {
            if (!state.hasLastValue || state.lastValue !== data) {
                state.hasLastValue = true;
                state.lastValue = data;
                this.with(data, next);
            }
        };
    }
    /** @inheritdoc */
    onlyAfter(deltaTime) {
        return new BasicConsumer(this.subscribe, { previousTime: Date.now() }, this.getOnlyAfterHandler(deltaTime));
    }
    /**
     * Gets a handler function for an 'onlyAfter' filter.
     * @param deltaTime The minimum delta time between events.
     * @returns A handler function for an 'onlyAfter' filter.
     */
    getOnlyAfterHandler(deltaTime) {
        return (data, state, next) => {
            const currentTime = Date.now();
            const timeDiff = currentTime - state.previousTime;
            if (timeDiff > deltaTime) {
                state.previousTime += deltaTime;
                this.with(data, next);
            }
        };
    }
    /**
     * Builds a handler stack from the current handler.
     * @param data The data to send in to the handler.
     * @param handler The handler to use for processing.
     */
    with(data, handler) {
        if (this.currentHandler !== undefined) {
            this.currentHandler(data, this.state, handler);
        }
        else {
            handler(data);
        }
    }
}
/**
 * A {@link Subscription} for a {@link BasicConsumer}.
 */
class ConsumerSubscription {
    /**
     * Constructor.
     * @param sub The event bus subscription backing this subscription.
     * @param onDestroy A function which is called when this subscription is destroyed.
     */
    constructor(sub, onDestroy) {
        this.sub = sub;
        this.onDestroy = onDestroy;
    }
    /** @inheritdoc */
    get isAlive() {
        return this.sub.isAlive;
    }
    /** @inheritdoc */
    get isPaused() {
        return this.sub.isPaused;
    }
    /** @inheritdoc */
    get canInitialNotify() {
        return this.sub.canInitialNotify;
    }
    /** @inheritdoc */
    pause() {
        this.sub.pause();
        return this;
    }
    /** @inheritdoc */
    resume(initialNotify = false) {
        this.sub.resume(initialNotify);
        return this;
    }
    /** @inheritdoc */
    destroy() {
        this.sub.destroy();
        this.onDestroy(this);
    }
}

/**
 * A typed container for subscribers interacting with the Event Bus.
 */
class EventSubscriber {
    /**
     * Creates an instance of an EventSubscriber.
     * @param bus The EventBus that is the parent of this instance.
     */
    constructor(bus) {
        this.bus = bus;
    }
    /**
     * Subscribes to a topic on the bus.
     * @param topic The topic to subscribe to.
     * @returns A consumer to bind the event handler to.
     */
    on(topic) {
        return new BasicConsumer((handler, paused) => {
            return this.bus.on(topic, handler, paused);
        });
    }
}

/**
 * InstrumentBackplane provides a common control point for aggregating and
 * managing any number of publishers.  This can be used as an "update loop"
 * corral", amongst other things.
 */
class InstrumentBackplane {
    /**
     * Create an InstrumentBackplane
     */
    constructor() {
        this.publishers = new Map();
        this.instruments = new Map();
    }
    /**
     * Initialize all the things. This is initially just a proxy for the
     * private initPublishers() and initInstruments() methods.
     *
     * This should be simplified.
     */
    init() {
        this.initPublishers();
        this.initInstruments();
    }
    /**
     * Update all the things.  This is initially just a proxy for the private
     * updatePublishers() and updateInstruments() methods.
     *
     * This should be simplified.
     */
    onUpdate() {
        this.updatePublishers();
        this.updateInstruments();
    }
    /**
     * Add a publisher to this backplane.
     * @param name A symbolic name for the publisher for reference.
     * @param publisher The publisher to add.
     * @param override Whether to override any existing publishers added to this backplane under the same name. If
     * `true`, any existing publisher with the same name will removed from this backplane and the new one added in its
     * place. If `false`, the new publisher will not be added if this backplane already has a publisher with the same
     * name or a publisher of the same type. Defaults to `false`.
     */
    addPublisher(name, publisher, override = false) {
        if (override || !InstrumentBackplane.checkAlreadyExists(name, publisher, this.publishers)) {
            this.publishers.set(name, publisher);
        }
    }
    /**
     * Add an instrument to this backplane.
     * @param name A symbolic name for the instrument for reference.
     * @param instrument The instrument to add.
     * @param override Whether to override any existing instruments added to this backplane under the same name. If
     * `true`, any existing instrument with the same name will removed from this backplane and the new one added in its
     * place. If `false`, the new instrument will not be added if this backplane already has an instrument with the same
     * name or an instrument of the same type. Defaults to `false`.
     */
    addInstrument(name, instrument, override = false) {
        if (override || !InstrumentBackplane.checkAlreadyExists(name, instrument, this.instruments)) {
            this.instruments.set(name, instrument);
        }
    }
    /**
     * Gets a publisher from this backplane.
     * @param name The name of the publisher to get.
     * @returns The publisher in this backplane with the specified name, or `undefined` if there is no such publisher.
     */
    getPublisher(name) {
        return this.publishers.get(name);
    }
    /**
     * Gets an instrument from this backplane.
     * @param name The name of the instrument to get.
     * @returns The instrument in this backplane with the specified name, or `undefined` if there is no such instrument.
     */
    getInstrument(name) {
        return this.instruments.get(name);
    }
    /**
     * Checks for duplicate publishers or instruments of the same name or type.
     * @param name the name of the publisher or instrument
     * @param objToCheck the object to check
     * @param map the map to check
     * @returns true if the object is already in the map
     */
    static checkAlreadyExists(name, objToCheck, map) {
        if (map.has(name)) {
            console.warn(`${name} already exists in backplane.`);
            return true;
        }
        // check if there already is a publisher with the same type
        for (const p of map.values()) {
            if (p.constructor === objToCheck.constructor) {
                console.warn(`${name} already exists in backplane.`);
                return true;
            }
        }
        return false;
    }
    /**
     * Initialize all of the publishers that you hold.
     */
    initPublishers() {
        for (const publisher of this.publishers.values()) {
            publisher.startPublish();
        }
    }
    /**
     * Initialize all of the instruments that you hold.
     */
    initInstruments() {
        for (const instrument of this.instruments.values()) {
            instrument.init();
        }
    }
    /**
     * Update all of the publishers that you hold.
     */
    updatePublishers() {
        for (const publisher of this.publishers.values()) {
            publisher.onUpdate();
        }
    }
    /**
     * Update all of the instruments that you hold.
     */
    updateInstruments() {
        for (const instrument of this.instruments.values()) {
            instrument.onUpdate();
        }
    }
}

/// <reference types="@microsoft/msfs-types/js/common" />
/**
 * An event bus that can be used to publish data from backend
 * components and devices to consumers.
 */
class EventBus {
    /**
     * Creates an instance of an EventBus.
     * @param useAlternativeEventSync Whether or not to use generic listener event sync (default false).
     * If true, FlowEventSync will only work for gauges.
     * @param shouldResync Whether the eventbus should ask for a resync of all previously cached events (default true)
     */
    constructor(useAlternativeEventSync = false, shouldResync = true) {
        this._topicSubsMap = new Map();
        this._wildcardSubs = new Array();
        this._notifyDepthMap = new Map();
        this._wildcardNotifyDepth = 0;
        this._eventCache = new Map();
        this.onWildcardSubDestroyedFunc = this.onWildcardSubDestroyed.bind(this);
        this._busId = Math.floor(Math.random() * 2147483647);
        // fallback to flowevent when genericdatalistener not avail (su9)
        useAlternativeEventSync = (typeof RegisterGenericDataListener === 'undefined');
        const syncFunc = useAlternativeEventSync ? EventBusFlowEventSync : EventBusListenerSync;
        this._busSync = new syncFunc(this.pub.bind(this), this._busId);
        if (shouldResync === true) {
            this.syncEvent('event_bus', 'resync_request', false);
            this.on('event_bus', (data) => {
                if (data == 'resync_request') {
                    this.resyncEvents();
                }
            });
        }
    }
    /**
     * Subscribes to a topic on the bus.
     * @param topic The topic to subscribe to.
     * @param handler The handler to be called when an event happens.
     * @param paused Whether the new subscription should be initialized as paused. Defaults to `false`.
     * @returns The new subscription.
     */
    on(topic, handler, paused = false) {
        let subs = this._topicSubsMap.get(topic);
        if (subs === undefined) {
            this._topicSubsMap.set(topic, subs = []);
            this.pub('event_bus_topic_first_sub', topic, false, false);
        }
        const initialNotifyFunc = (sub) => {
            const lastState = this._eventCache.get(topic);
            if (lastState !== undefined) {
                sub.handler(lastState.data);
            }
        };
        const onDestroyFunc = (sub) => {
            var _a;
            // If we are not in the middle of a notify operation, remove the subscription.
            // Otherwise, do nothing and let the post-notify clean-up code handle it.
            if (((_a = this._notifyDepthMap.get(topic)) !== null && _a !== void 0 ? _a : 0) === 0) {
                const subsToSplice = this._topicSubsMap.get(topic);
                if (subsToSplice) {
                    subsToSplice.splice(subsToSplice.indexOf(sub), 1);
                }
            }
        };
        const sub = new HandlerSubscription(handler, initialNotifyFunc, onDestroyFunc);
        subs.push(sub);
        if (paused) {
            sub.pause();
        }
        else {
            sub.initialNotify();
        }
        return sub;
    }
    /**
     * Unsubscribes a handler from the topic's events.
     * @param topic The topic to unsubscribe from.
     * @param handler The handler to unsubscribe from topic.
     * @deprecated This method has been deprecated in favor of using the {@link Subscription} object returned by `.on()`
     * to manage subscriptions.
     */
    off(topic, handler) {
        const handlers = this._topicSubsMap.get(topic);
        const toDestroy = handlers === null || handlers === void 0 ? void 0 : handlers.find(sub => sub.handler === handler);
        toDestroy === null || toDestroy === void 0 ? void 0 : toDestroy.destroy();
    }
    /**
     * Subscribes to all topics.
     * @param handler The handler to subscribe to all events.
     * @returns The new subscription.
     */
    onAll(handler) {
        const sub = new HandlerSubscription(handler, undefined, this.onWildcardSubDestroyedFunc);
        this._wildcardSubs.push(sub);
        return sub;
    }
    /**
     * Unsubscribe the handler from all topics.
     * @param handler The handler to unsubscribe from all events.
     * @deprecated This method has been deprecated in favor of using the {@link Subscription} object returned by
     * `.onAll()` to manage subscriptions.
     */
    offAll(handler) {
        const toDestroy = this._wildcardSubs.find(sub => sub.handler === handler);
        toDestroy === null || toDestroy === void 0 ? void 0 : toDestroy.destroy();
    }
    /**
     * Publishes an event to the topic on the bus.
     * @param topic The topic to publish to.
     * @param data The data portion of the event.
     * @param sync Whether or not this message needs to be synced on local stoage.
     * @param isCached Whether or not this message will be resync'd across the bus on load.
     */
    pub(topic, data, sync = false, isCached = true) {
        var _a;
        if (isCached) {
            this._eventCache.set(topic, { data: data, synced: sync });
        }
        const subs = this._topicSubsMap.get(topic);
        if (subs !== undefined) {
            let needCleanUpSubs = false;
            const notifyDepth = (_a = this._notifyDepthMap.get(topic)) !== null && _a !== void 0 ? _a : 0;
            this._notifyDepthMap.set(topic, notifyDepth + 1);
            const len = subs.length;
            for (let i = 0; i < len; i++) {
                try {
                    const sub = subs[i];
                    if (sub.isAlive && !sub.isPaused) {
                        sub.handler(data);
                    }
                    needCleanUpSubs || (needCleanUpSubs = !sub.isAlive);
                }
                catch (error) {
                    console.error(`EventBus: error in handler: ${error}. topic: ${topic}. data: ${data}. sync: ${sync}. isCached: ${isCached}`, { error, topic, data, sync, isCached, subs });
                    if (error instanceof Error) {
                        console.error(error.stack);
                    }
                }
            }
            this._notifyDepthMap.set(topic, notifyDepth);
            if (needCleanUpSubs && notifyDepth === 0) {
                const filteredSubs = subs.filter(sub => sub.isAlive);
                this._topicSubsMap.set(topic, filteredSubs);
            }
        }
        // We don't know if anything is subscribed on busses in other instruments,
        // so we'll unconditionally sync if sync is true and trust that the
        // publisher knows what it's doing.
        if (sync) {
            this.syncEvent(topic, data, isCached);
        }
        // always push to wildcard handlers
        let needCleanUpSubs = false;
        this._wildcardNotifyDepth++;
        const wcLen = this._wildcardSubs.length;
        for (let i = 0; i < wcLen; i++) {
            const sub = this._wildcardSubs[i];
            if (sub.isAlive && !sub.isPaused) {
                sub.handler(topic, data);
            }
            needCleanUpSubs || (needCleanUpSubs = !sub.isAlive);
        }
        this._wildcardNotifyDepth--;
        if (needCleanUpSubs && this._wildcardNotifyDepth === 0) {
            this._wildcardSubs = this._wildcardSubs.filter(sub => sub.isAlive);
        }
    }
    /**
     * Responds to when a wildcard subscription is destroyed.
     * @param sub The destroyed subscription.
     */
    onWildcardSubDestroyed(sub) {
        // If we are not in the middle of a notify operation, remove the subscription.
        // Otherwise, do nothing and let the post-notify clean-up code handle it.
        if (this._wildcardNotifyDepth === 0) {
            this._wildcardSubs.splice(this._wildcardSubs.indexOf(sub), 1);
        }
    }
    /**
     * Re-sync all synced events
     */
    resyncEvents() {
        for (const [topic, event] of this._eventCache) {
            if (event.synced) {
                this.syncEvent(topic, event.data, true);
            }
        }
    }
    /**
     * Publish an event to the sync bus.
     * @param topic The topic to publish to.
     * @param data The data to publish.
     * @param isCached Whether or not this message will be resync'd across the bus on load.
     */
    syncEvent(topic, data, isCached) {
        this._busSync.sendEvent(topic, data, isCached);
    }
    /**
     * Gets a typed publisher from the event bus..
     * @returns The typed publisher.
     */
    getPublisher() {
        return this;
    }
    /**
     * Gets a typed subscriber from the event bus.
     * @returns The typed subscriber.
     */
    getSubscriber() {
        return new EventSubscriber(this);
    }
    /**
     * Get the number of subscribes for a given topic.
     * @param topic The name of the topic.
     * @returns The number of subscribers.
     **/
    getTopicSubscriberCount(topic) {
        var _a, _b;
        return (_b = (_a = this._topicSubsMap.get(topic)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
    }
    /**
     * Executes a function once for each topic with at least one subscriber.
     * @param fn The function to execute.
     */
    forEachSubscribedTopic(fn) {
        this._topicSubsMap.forEach((subs, topic) => { subs.length > 0 && fn(topic, subs.length); });
    }
}
/**
 * An abstract class for bus sync implementations.
 */
class EventBusSyncBase {
    /**
     * Creates an instance of EventBusFlowEventSync.
     * @param recvEventCb A callback to execute when an event is received on the bus.
     * @param busId The ID of the bus.
     */
    constructor(recvEventCb, busId) {
        this.isPaused = false;
        this.lastEventSynced = -1;
        this.dataPackageQueue = [];
        this.recvEventCb = recvEventCb;
        this.busId = busId;
        this.hookReceiveEvent();
        /** Sends the queued up data packages */
        const sendFn = () => {
            if (!this.isPaused && this.dataPackageQueue.length > 0) {
                // console.log(`Sending ${this.dataPackageQueue.length} packages`);
                const syncDataPackage = {
                    busId: this.busId,
                    packagedId: Math.floor(Math.random() * 1000000000),
                    data: this.dataPackageQueue
                };
                if (this.executeSync(syncDataPackage)) {
                    this.dataPackageQueue.length = 0;
                }
                else {
                    console.warn('Failed to send sync data package');
                }
            }
            requestAnimationFrame(sendFn);
        };
        requestAnimationFrame(sendFn);
    }
    /**
     * Processes events received and sends them onto the local bus.
     * @param syncData The data package to process.
     */
    processEventsReceived(syncData) {
        if (this.busId !== syncData.busId) {
            // HINT: coherent events are still received twice, so check for this
            if (this.lastEventSynced !== syncData.packagedId) {
                this.lastEventSynced = syncData.packagedId;
                syncData.data.forEach((data) => {
                    try {
                        this.recvEventCb(data.topic, data.data !== undefined ? data.data : undefined, false, data.isCached);
                    }
                    catch (e) {
                        console.error(e);
                        if (e instanceof Error) {
                            console.error(e.stack);
                        }
                    }
                });
            }
        }
    }
    /**
     * Sends an event via flow events.
     * @param topic The topic to send data on.
     * @param data The data to send.
     * @param isCached Whether or not this event is cached.
     */
    sendEvent(topic, data, isCached) {
        // stringify data
        const dataObj = data;
        // build a data package
        const dataPackage = {
            topic: topic,
            data: dataObj,
            isCached: isCached
        };
        // queue data package
        this.dataPackageQueue.push(dataPackage);
    }
}
/**
 * A class that manages event bus synchronization via Flow Event Triggers.
 * DON'T USE this, it has bad performance implications.
 * @deprecated
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class EventBusCoherentSync extends EventBusSyncBase {
    /** @inheritdoc */
    executeSync(syncDataPackage) {
        // HINT: Stringifying the data again to circumvent the bad perf on Coherent interop
        try {
            this.listener.triggerToAllSubscribers(EventBusCoherentSync.EB_KEY, JSON.stringify(syncDataPackage));
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /** @inheritdoc */
    hookReceiveEvent() {
        this.listener = RegisterViewListener(EventBusCoherentSync.EB_LISTENER_KEY, undefined, true);
        this.listener.on(EventBusCoherentSync.EB_KEY, (e) => {
            try {
                const evt = JSON.parse(e);
                this.processEventsReceived(evt);
            }
            catch (error) {
                console.error(error);
            }
        });
    }
}
EventBusCoherentSync.EB_KEY = 'eb.evt';
EventBusCoherentSync.EB_LISTENER_KEY = 'JS_LISTENER_SIMVARS';
/**
 * A class that manages event bus synchronization via Flow Event Triggers.
 */
class EventBusFlowEventSync extends EventBusSyncBase {
    /** @inheritdoc */
    executeSync(syncDataPackage) {
        // console.log('Sending sync package: ' + syncDataPackage.packagedId);
        try {
            LaunchFlowEvent('ON_MOUSERECT_HTMLEVENT', EventBusFlowEventSync.EB_LISTENER_KEY, this.busId.toString(), JSON.stringify(syncDataPackage));
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /** @inheritdoc */
    hookReceiveEvent() {
        Coherent.on('OnInteractionEvent', (target, args) => {
            // identify if its a busevent
            if (args.length === 0 || args[0] !== EventBusFlowEventSync.EB_LISTENER_KEY || !args[2]) {
                return;
            }
            this.processEventsReceived(JSON.parse(args[2]));
        });
    }
}
EventBusFlowEventSync.EB_LISTENER_KEY = 'EB_EVENTS';
//// END GLOBALS DECLARATION
/**
 * A class that manages event bus synchronization via the Generic Data Listener.
 */
class EventBusListenerSync extends EventBusSyncBase {
    /** @inheritdoc */
    executeSync(syncDataPackage) {
        try {
            this.listener.send(EventBusListenerSync.EB_KEY, syncDataPackage);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /** @inheritdoc */
    hookReceiveEvent() {
        // pause the sync until the listener is ready
        this.isPaused = true;
        this.listener = RegisterGenericDataListener(() => {
            this.listener.onDataReceived(EventBusListenerSync.EB_KEY, (data) => {
                try {
                    this.processEventsReceived(data);
                }
                catch (error) {
                    console.error(error);
                }
            });
            this.isPaused = false;
        });
    }
}
EventBusListenerSync.EB_KEY = 'wt.eb.evt';
EventBusListenerSync.EB_LISTENER_KEY = 'JS_LISTENER_GENERICDATA';

/**
 * A publisher for publishing H:Events on the bus.
 */
class HEventPublisher extends BasePublisher {
    /**
     * Dispatches an H:Event to the event bus.
     * @param hEvent The H:Event to dispatch.
     * @param sync Whether this event should be synced (optional, default false)
     */
    dispatchHEvent(hEvent, sync = false) {
        // console.log(`dispaching hevent:  ${hEvent}`);
        this.publish('hEvent', hEvent, sync, false);
    }
}

/// <reference types="@microsoft/msfs-types/js/simplane" />
/**
 * The available facility frequency types.
 */
var FacilityFrequencyType;
(function (FacilityFrequencyType) {
    FacilityFrequencyType[FacilityFrequencyType["None"] = 0] = "None";
    FacilityFrequencyType[FacilityFrequencyType["ATIS"] = 1] = "ATIS";
    FacilityFrequencyType[FacilityFrequencyType["Multicom"] = 2] = "Multicom";
    FacilityFrequencyType[FacilityFrequencyType["Unicom"] = 3] = "Unicom";
    FacilityFrequencyType[FacilityFrequencyType["CTAF"] = 4] = "CTAF";
    FacilityFrequencyType[FacilityFrequencyType["Ground"] = 5] = "Ground";
    FacilityFrequencyType[FacilityFrequencyType["Tower"] = 6] = "Tower";
    FacilityFrequencyType[FacilityFrequencyType["Clearance"] = 7] = "Clearance";
    FacilityFrequencyType[FacilityFrequencyType["Approach"] = 8] = "Approach";
    FacilityFrequencyType[FacilityFrequencyType["Departure"] = 9] = "Departure";
    FacilityFrequencyType[FacilityFrequencyType["Center"] = 10] = "Center";
    FacilityFrequencyType[FacilityFrequencyType["FSS"] = 11] = "FSS";
    FacilityFrequencyType[FacilityFrequencyType["AWOS"] = 12] = "AWOS";
    FacilityFrequencyType[FacilityFrequencyType["ASOS"] = 13] = "ASOS";
    /** Clearance Pre-Taxi*/
    FacilityFrequencyType[FacilityFrequencyType["CPT"] = 14] = "CPT";
    /** Remote Clearance Delivery */
    FacilityFrequencyType[FacilityFrequencyType["GCO"] = 15] = "GCO";
})(FacilityFrequencyType || (FacilityFrequencyType = {}));
/** Additional Approach Types (additive to those defined in simplane). */
var AdditionalApproachType;
(function (AdditionalApproachType) {
    AdditionalApproachType[AdditionalApproachType["APPROACH_TYPE_VISUAL"] = 99] = "APPROACH_TYPE_VISUAL";
})(AdditionalApproachType || (AdditionalApproachType = {}));
/**
 * Flags indicating the approach fix type.
 */
var FixTypeFlags;
(function (FixTypeFlags) {
    FixTypeFlags[FixTypeFlags["None"] = 0] = "None";
    FixTypeFlags[FixTypeFlags["IAF"] = 1] = "IAF";
    FixTypeFlags[FixTypeFlags["IF"] = 2] = "IF";
    FixTypeFlags[FixTypeFlags["MAP"] = 4] = "MAP";
    FixTypeFlags[FixTypeFlags["FAF"] = 8] = "FAF";
    FixTypeFlags[FixTypeFlags["MAHP"] = 16] = "MAHP";
})(FixTypeFlags || (FixTypeFlags = {}));
/**
 * Flags indicating the rnav approach type.
 */
var RnavTypeFlags;
(function (RnavTypeFlags) {
    RnavTypeFlags[RnavTypeFlags["None"] = 0] = "None";
    RnavTypeFlags[RnavTypeFlags["LNAV"] = 1] = "LNAV";
    RnavTypeFlags[RnavTypeFlags["LNAVVNAV"] = 2] = "LNAVVNAV";
    RnavTypeFlags[RnavTypeFlags["LP"] = 4] = "LP";
    RnavTypeFlags[RnavTypeFlags["LPV"] = 8] = "LPV";
})(RnavTypeFlags || (RnavTypeFlags = {}));
/**
 * The class of airport facility.
 */
var AirportClass;
(function (AirportClass) {
    /** No other airport class could be identified. */
    AirportClass[AirportClass["None"] = 0] = "None";
    /** The airport has at least one hard surface runway. */
    AirportClass[AirportClass["HardSurface"] = 1] = "HardSurface";
    /** The airport has no hard surface runways. */
    AirportClass[AirportClass["SoftSurface"] = 2] = "SoftSurface";
    /** The airport has only water surface runways. */
    AirportClass[AirportClass["AllWater"] = 3] = "AllWater";
    /** The airport has no runways, but does contain helipads. */
    AirportClass[AirportClass["HeliportOnly"] = 4] = "HeliportOnly";
    /** The airport is a non-public use airport. */
    AirportClass[AirportClass["Private"] = 5] = "Private";
})(AirportClass || (AirportClass = {}));
/**
 * The class of an airport facility, expressed as a mask for nearest airport search session filtering.
 */
var AirportClassMask;
(function (AirportClassMask) {
    /** No other airport class could be identified. */
    AirportClassMask[AirportClassMask["None"] = 0] = "None";
    /** The airport has at least one hard surface runway. */
    AirportClassMask[AirportClassMask["HardSurface"] = 2] = "HardSurface";
    /** The airport has no hard surface runways. */
    AirportClassMask[AirportClassMask["SoftSurface"] = 4] = "SoftSurface";
    /** The airport has only water surface runways. */
    AirportClassMask[AirportClassMask["AllWater"] = 8] = "AllWater";
    /** The airport has no runways, but does contain helipads. */
    AirportClassMask[AirportClassMask["HeliportOnly"] = 16] = "HeliportOnly";
    /** The airport is a non-public use airport. */
    AirportClassMask[AirportClassMask["Private"] = 32] = "Private";
})(AirportClassMask || (AirportClassMask = {}));
/**
 * An enumeration of possible intersection types.
 */
var IntersectionType;
(function (IntersectionType) {
    IntersectionType[IntersectionType["None"] = 0] = "None";
    IntersectionType[IntersectionType["Named"] = 1] = "Named";
    IntersectionType[IntersectionType["Unnamed"] = 2] = "Unnamed";
    IntersectionType[IntersectionType["Vor"] = 3] = "Vor";
    IntersectionType[IntersectionType["NDB"] = 4] = "NDB";
    IntersectionType[IntersectionType["Offroute"] = 5] = "Offroute";
    IntersectionType[IntersectionType["IAF"] = 6] = "IAF";
    IntersectionType[IntersectionType["FAF"] = 7] = "FAF";
    IntersectionType[IntersectionType["RNAV"] = 8] = "RNAV";
    IntersectionType[IntersectionType["VFR"] = 9] = "VFR";
})(IntersectionType || (IntersectionType = {}));
var UserFacilityType;
(function (UserFacilityType) {
    UserFacilityType[UserFacilityType["RADIAL_RADIAL"] = 0] = "RADIAL_RADIAL";
    UserFacilityType[UserFacilityType["RADIAL_DISTANCE"] = 1] = "RADIAL_DISTANCE";
    UserFacilityType[UserFacilityType["LAT_LONG"] = 2] = "LAT_LONG";
})(UserFacilityType || (UserFacilityType = {}));
/**
 * ARINC 424 Leg Types
 */
var LegType;
(function (LegType) {
    /** An unknown leg type. */
    LegType[LegType["Unknown"] = 0] = "Unknown";
    /** An arc-to-fix leg. This indicates a DME arc leg to a specified fix.*/
    LegType[LegType["AF"] = 1] = "AF";
    /** A course-to-altitude leg. */
    LegType[LegType["CA"] = 2] = "CA";
    /**
     * A course-to-DME-distance leg. This leg is flown on a wind corrected course
     * to a specific DME distance from another fix.
     */
    LegType[LegType["CD"] = 3] = "CD";
    /** A course-to-fix leg.*/
    LegType[LegType["CF"] = 4] = "CF";
    /** A course-to-intercept leg. */
    LegType[LegType["CI"] = 5] = "CI";
    /** A course-to-radial intercept leg. */
    LegType[LegType["CR"] = 6] = "CR";
    /** A direct-to-fix leg, from an unspecified starting position. */
    LegType[LegType["DF"] = 7] = "DF";
    /**
     * A fix-to-altitude leg. A FA leg is flown on a track from a fix to a
     * specified altitude.
     */
    LegType[LegType["FA"] = 8] = "FA";
    /**
     * A fix-to-distance leg. This leg is flown on a track from a fix to a
     * specific distance from the fix.
     */
    LegType[LegType["FC"] = 9] = "FC";
    /**
     * A fix to DME distance leg. This leg is flown on a track from a fix to
     * a specific DME distance from another fix.
     */
    LegType[LegType["FD"] = 10] = "FD";
    /** A course-to-manual-termination leg. */
    LegType[LegType["FM"] = 11] = "FM";
    /** A hold-to-altitude leg. The hold is flown until a specified altitude is reached. */
    LegType[LegType["HA"] = 12] = "HA";
    /**
     * A hold-to-fix leg. This indicates one time around the hold circuit and
     * then an exit.
     */
    LegType[LegType["HF"] = 13] = "HF";
    /** A hold-to-manual-termination leg. */
    LegType[LegType["HM"] = 14] = "HM";
    /** Initial procedure fix. */
    LegType[LegType["IF"] = 15] = "IF";
    /** A procedure turn leg. */
    LegType[LegType["PI"] = 16] = "PI";
    /** A radius-to-fix leg, with endpoint fixes, a center fix, and a radius. */
    LegType[LegType["RF"] = 17] = "RF";
    /** A track-to-fix leg, from the previous fix to the terminator. */
    LegType[LegType["TF"] = 18] = "TF";
    /** A heading-to-altitude leg. */
    LegType[LegType["VA"] = 19] = "VA";
    /** A heading-to-DME-distance leg. */
    LegType[LegType["VD"] = 20] = "VD";
    /** A heading-to-intercept leg. */
    LegType[LegType["VI"] = 21] = "VI";
    /** A heading-to-manual-termination leg. */
    LegType[LegType["VM"] = 22] = "VM";
    /** A heading-to-radial intercept leg. */
    LegType[LegType["VR"] = 23] = "VR";
    /** A leg representing a lateral and vertical discontinuity in the flight plan. */
    LegType[LegType["Discontinuity"] = 99] = "Discontinuity";
    /** A leg representing a lateral and vertical discontinuity in the flight plan that does not prevent sequencing. */
    LegType[LegType["ThruDiscontinuity"] = 100] = "ThruDiscontinuity";
})(LegType || (LegType = {}));
/**
 * Types of altitude restrictions on procedure legs.
 */
var AltitudeRestrictionType;
(function (AltitudeRestrictionType) {
    AltitudeRestrictionType[AltitudeRestrictionType["Unused"] = 0] = "Unused";
    AltitudeRestrictionType[AltitudeRestrictionType["At"] = 1] = "At";
    AltitudeRestrictionType[AltitudeRestrictionType["AtOrAbove"] = 2] = "AtOrAbove";
    AltitudeRestrictionType[AltitudeRestrictionType["AtOrBelow"] = 3] = "AtOrBelow";
    AltitudeRestrictionType[AltitudeRestrictionType["Between"] = 4] = "Between";
})(AltitudeRestrictionType || (AltitudeRestrictionType = {}));
var LegTurnDirection;
(function (LegTurnDirection) {
    LegTurnDirection[LegTurnDirection["None"] = 0] = "None";
    LegTurnDirection[LegTurnDirection["Left"] = 1] = "Left";
    LegTurnDirection[LegTurnDirection["Right"] = 2] = "Right";
    LegTurnDirection[LegTurnDirection["Either"] = 3] = "Either";
})(LegTurnDirection || (LegTurnDirection = {}));
var AirwayType;
(function (AirwayType) {
    AirwayType[AirwayType["None"] = 0] = "None";
    AirwayType[AirwayType["Victor"] = 1] = "Victor";
    AirwayType[AirwayType["Jet"] = 2] = "Jet";
    AirwayType[AirwayType["Both"] = 3] = "Both";
})(AirwayType || (AirwayType = {}));
var NdbType;
(function (NdbType) {
    NdbType[NdbType["CompassPoint"] = 0] = "CompassPoint";
    NdbType[NdbType["MH"] = 1] = "MH";
    NdbType[NdbType["H"] = 2] = "H";
    NdbType[NdbType["HH"] = 3] = "HH";
})(NdbType || (NdbType = {}));
var VorType;
(function (VorType) {
    VorType[VorType["Unknown"] = 0] = "Unknown";
    VorType[VorType["VOR"] = 1] = "VOR";
    VorType[VorType["VORDME"] = 2] = "VORDME";
    VorType[VorType["DME"] = 3] = "DME";
    VorType[VorType["TACAN"] = 4] = "TACAN";
    VorType[VorType["VORTAC"] = 5] = "VORTAC";
    VorType[VorType["ILS"] = 6] = "ILS";
    VorType[VorType["VOT"] = 7] = "VOT";
})(VorType || (VorType = {}));
var RunwaySurfaceType;
(function (RunwaySurfaceType) {
    RunwaySurfaceType[RunwaySurfaceType["Concrete"] = 0] = "Concrete";
    RunwaySurfaceType[RunwaySurfaceType["Grass"] = 1] = "Grass";
    RunwaySurfaceType[RunwaySurfaceType["WaterFSX"] = 2] = "WaterFSX";
    RunwaySurfaceType[RunwaySurfaceType["GrassBumpy"] = 3] = "GrassBumpy";
    RunwaySurfaceType[RunwaySurfaceType["Asphalt"] = 4] = "Asphalt";
    RunwaySurfaceType[RunwaySurfaceType["ShortGrass"] = 5] = "ShortGrass";
    RunwaySurfaceType[RunwaySurfaceType["LongGrass"] = 6] = "LongGrass";
    RunwaySurfaceType[RunwaySurfaceType["HardTurf"] = 7] = "HardTurf";
    RunwaySurfaceType[RunwaySurfaceType["Snow"] = 8] = "Snow";
    RunwaySurfaceType[RunwaySurfaceType["Ice"] = 9] = "Ice";
    RunwaySurfaceType[RunwaySurfaceType["Urban"] = 10] = "Urban";
    RunwaySurfaceType[RunwaySurfaceType["Forest"] = 11] = "Forest";
    RunwaySurfaceType[RunwaySurfaceType["Dirt"] = 12] = "Dirt";
    RunwaySurfaceType[RunwaySurfaceType["Coral"] = 13] = "Coral";
    RunwaySurfaceType[RunwaySurfaceType["Gravel"] = 14] = "Gravel";
    RunwaySurfaceType[RunwaySurfaceType["OilTreated"] = 15] = "OilTreated";
    RunwaySurfaceType[RunwaySurfaceType["SteelMats"] = 16] = "SteelMats";
    RunwaySurfaceType[RunwaySurfaceType["Bituminous"] = 17] = "Bituminous";
    RunwaySurfaceType[RunwaySurfaceType["Brick"] = 18] = "Brick";
    RunwaySurfaceType[RunwaySurfaceType["Macadam"] = 19] = "Macadam";
    RunwaySurfaceType[RunwaySurfaceType["Planks"] = 20] = "Planks";
    RunwaySurfaceType[RunwaySurfaceType["Sand"] = 21] = "Sand";
    RunwaySurfaceType[RunwaySurfaceType["Shale"] = 22] = "Shale";
    RunwaySurfaceType[RunwaySurfaceType["Tarmac"] = 23] = "Tarmac";
    RunwaySurfaceType[RunwaySurfaceType["WrightFlyerTrack"] = 24] = "WrightFlyerTrack";
    //SURFACE_TYPE_LAST_FSX
    RunwaySurfaceType[RunwaySurfaceType["Ocean"] = 26] = "Ocean";
    RunwaySurfaceType[RunwaySurfaceType["Water"] = 27] = "Water";
    RunwaySurfaceType[RunwaySurfaceType["Pond"] = 28] = "Pond";
    RunwaySurfaceType[RunwaySurfaceType["Lake"] = 29] = "Lake";
    RunwaySurfaceType[RunwaySurfaceType["River"] = 30] = "River";
    RunwaySurfaceType[RunwaySurfaceType["WasteWater"] = 31] = "WasteWater";
    RunwaySurfaceType[RunwaySurfaceType["Paint"] = 32] = "Paint";
    // UNUSED
    // SURFACE_TYPE_ERASE_GRASS
})(RunwaySurfaceType || (RunwaySurfaceType = {}));
var RunwayLightingType;
(function (RunwayLightingType) {
    RunwayLightingType[RunwayLightingType["Unknown"] = 0] = "Unknown";
    RunwayLightingType[RunwayLightingType["None"] = 1] = "None";
    RunwayLightingType[RunwayLightingType["PartTime"] = 2] = "PartTime";
    RunwayLightingType[RunwayLightingType["FullTime"] = 3] = "FullTime";
    RunwayLightingType[RunwayLightingType["Frequency"] = 4] = "Frequency";
})(RunwayLightingType || (RunwayLightingType = {}));
var AirportPrivateType;
(function (AirportPrivateType) {
    AirportPrivateType[AirportPrivateType["Uknown"] = 0] = "Uknown";
    AirportPrivateType[AirportPrivateType["Public"] = 1] = "Public";
    AirportPrivateType[AirportPrivateType["Military"] = 2] = "Military";
    AirportPrivateType[AirportPrivateType["Private"] = 3] = "Private";
})(AirportPrivateType || (AirportPrivateType = {}));
var GpsBoolean;
(function (GpsBoolean) {
    GpsBoolean[GpsBoolean["Unknown"] = 0] = "Unknown";
    GpsBoolean[GpsBoolean["No"] = 1] = "No";
    GpsBoolean[GpsBoolean["Yes"] = 2] = "Yes";
})(GpsBoolean || (GpsBoolean = {}));
var VorClass;
(function (VorClass) {
    VorClass[VorClass["Unknown"] = 0] = "Unknown";
    VorClass[VorClass["Terminal"] = 1] = "Terminal";
    VorClass[VorClass["LowAlt"] = 2] = "LowAlt";
    VorClass[VorClass["HighAlt"] = 3] = "HighAlt";
    VorClass[VorClass["ILS"] = 4] = "ILS";
    VorClass[VorClass["VOT"] = 5] = "VOT";
})(VorClass || (VorClass = {}));
var FacilityType;
(function (FacilityType) {
    FacilityType["Airport"] = "LOAD_AIRPORT";
    FacilityType["Intersection"] = "LOAD_INTERSECTION";
    FacilityType["VOR"] = "LOAD_VOR";
    FacilityType["NDB"] = "LOAD_NDB";
    FacilityType["USR"] = "USR";
    FacilityType["RWY"] = "RWY";
    FacilityType["VIS"] = "VIS";
})(FacilityType || (FacilityType = {}));
var FacilitySearchType;
(function (FacilitySearchType) {
    FacilitySearchType[FacilitySearchType["All"] = 0] = "All";
    FacilitySearchType[FacilitySearchType["Airport"] = 1] = "Airport";
    FacilitySearchType[FacilitySearchType["Intersection"] = 2] = "Intersection";
    FacilitySearchType[FacilitySearchType["Vor"] = 3] = "Vor";
    FacilitySearchType[FacilitySearchType["Ndb"] = 4] = "Ndb";
    FacilitySearchType[FacilitySearchType["Boundary"] = 5] = "Boundary";
    FacilitySearchType[FacilitySearchType["User"] = 6] = "User";
    FacilitySearchType[FacilitySearchType["Visual"] = 7] = "Visual";
    FacilitySearchType[FacilitySearchType["AllExceptVisual"] = 8] = "AllExceptVisual";
})(FacilitySearchType || (FacilitySearchType = {}));
/**
 * A type of airspace boundary.
 */
var BoundaryType;
(function (BoundaryType) {
    BoundaryType[BoundaryType["None"] = 0] = "None";
    BoundaryType[BoundaryType["Center"] = 1] = "Center";
    BoundaryType[BoundaryType["ClassA"] = 2] = "ClassA";
    BoundaryType[BoundaryType["ClassB"] = 3] = "ClassB";
    BoundaryType[BoundaryType["ClassC"] = 4] = "ClassC";
    BoundaryType[BoundaryType["ClassD"] = 5] = "ClassD";
    BoundaryType[BoundaryType["ClassE"] = 6] = "ClassE";
    BoundaryType[BoundaryType["ClassF"] = 7] = "ClassF";
    BoundaryType[BoundaryType["ClassG"] = 8] = "ClassG";
    BoundaryType[BoundaryType["Tower"] = 9] = "Tower";
    BoundaryType[BoundaryType["Clearance"] = 10] = "Clearance";
    BoundaryType[BoundaryType["Ground"] = 11] = "Ground";
    BoundaryType[BoundaryType["Departure"] = 12] = "Departure";
    BoundaryType[BoundaryType["Approach"] = 13] = "Approach";
    BoundaryType[BoundaryType["MOA"] = 14] = "MOA";
    BoundaryType[BoundaryType["Restricted"] = 15] = "Restricted";
    BoundaryType[BoundaryType["Prohibited"] = 16] = "Prohibited";
    BoundaryType[BoundaryType["Warning"] = 17] = "Warning";
    BoundaryType[BoundaryType["Alert"] = 18] = "Alert";
    BoundaryType[BoundaryType["Danger"] = 19] = "Danger";
    BoundaryType[BoundaryType["NationalPark"] = 20] = "NationalPark";
    BoundaryType[BoundaryType["ModeC"] = 21] = "ModeC";
    BoundaryType[BoundaryType["Radar"] = 22] = "Radar";
    BoundaryType[BoundaryType["Training"] = 23] = "Training";
})(BoundaryType || (BoundaryType = {}));
/**
 * A type of airspace boundary altitude maxima.
 */
var BoundaryAltitudeType;
(function (BoundaryAltitudeType) {
    BoundaryAltitudeType[BoundaryAltitudeType["Unknown"] = 0] = "Unknown";
    BoundaryAltitudeType[BoundaryAltitudeType["MSL"] = 1] = "MSL";
    BoundaryAltitudeType[BoundaryAltitudeType["AGL"] = 2] = "AGL";
    BoundaryAltitudeType[BoundaryAltitudeType["Unlimited"] = 3] = "Unlimited";
})(BoundaryAltitudeType || (BoundaryAltitudeType = {}));
/**
 * A type of boundary geometry vector.
 */
var BoundaryVectorType;
(function (BoundaryVectorType) {
    BoundaryVectorType[BoundaryVectorType["None"] = 0] = "None";
    BoundaryVectorType[BoundaryVectorType["Start"] = 1] = "Start";
    BoundaryVectorType[BoundaryVectorType["Line"] = 2] = "Line";
    BoundaryVectorType[BoundaryVectorType["Origin"] = 3] = "Origin";
    BoundaryVectorType[BoundaryVectorType["ArcCW"] = 4] = "ArcCW";
    BoundaryVectorType[BoundaryVectorType["ArcCCW"] = 5] = "ArcCCW";
    BoundaryVectorType[BoundaryVectorType["Circle"] = 6] = "Circle";
})(BoundaryVectorType || (BoundaryVectorType = {}));
/**
 * Wind speed units used by METAR.
 */
var MetarWindSpeedUnits;
(function (MetarWindSpeedUnits) {
    MetarWindSpeedUnits[MetarWindSpeedUnits["Knot"] = 0] = "Knot";
    MetarWindSpeedUnits[MetarWindSpeedUnits["MeterPerSecond"] = 1] = "MeterPerSecond";
    MetarWindSpeedUnits[MetarWindSpeedUnits["KilometerPerHour"] = 2] = "KilometerPerHour";
})(MetarWindSpeedUnits || (MetarWindSpeedUnits = {}));
/** Visibility distance units used by METAR. */
var MetarVisibilityUnits;
(function (MetarVisibilityUnits) {
    MetarVisibilityUnits[MetarVisibilityUnits["Meter"] = 0] = "Meter";
    MetarVisibilityUnits[MetarVisibilityUnits["StatuteMile"] = 1] = "StatuteMile";
})(MetarVisibilityUnits || (MetarVisibilityUnits = {}));
/**
 * METAR cloud layer coverage/sky condition.
 */
var MetarCloudLayerCoverage;
(function (MetarCloudLayerCoverage) {
    MetarCloudLayerCoverage[MetarCloudLayerCoverage["SkyClear"] = 0] = "SkyClear";
    MetarCloudLayerCoverage[MetarCloudLayerCoverage["Clear"] = 1] = "Clear";
    MetarCloudLayerCoverage[MetarCloudLayerCoverage["NoSignificant"] = 2] = "NoSignificant";
    MetarCloudLayerCoverage[MetarCloudLayerCoverage["Few"] = 3] = "Few";
    MetarCloudLayerCoverage[MetarCloudLayerCoverage["Scattered"] = 4] = "Scattered";
    MetarCloudLayerCoverage[MetarCloudLayerCoverage["Broken"] = 5] = "Broken";
    MetarCloudLayerCoverage[MetarCloudLayerCoverage["Overcast"] = 6] = "Overcast";
})(MetarCloudLayerCoverage || (MetarCloudLayerCoverage = {}));
/**
 * METAR significant cloud types.
 */
var MetarCloudLayerType;
(function (MetarCloudLayerType) {
    MetarCloudLayerType[MetarCloudLayerType["Unspecified"] = -1] = "Unspecified";
    MetarCloudLayerType[MetarCloudLayerType["ToweringCumulus"] = 0] = "ToweringCumulus";
    MetarCloudLayerType[MetarCloudLayerType["Cumulonimbus"] = 1] = "Cumulonimbus";
    MetarCloudLayerType[MetarCloudLayerType["AltocumulusCastellanus"] = 2] = "AltocumulusCastellanus";
})(MetarCloudLayerType || (MetarCloudLayerType = {}));
/** METAR phenomenon types. */
var MetarPhenomenonType;
(function (MetarPhenomenonType) {
    MetarPhenomenonType[MetarPhenomenonType["None"] = 0] = "None";
    MetarPhenomenonType[MetarPhenomenonType["Mist"] = 1] = "Mist";
    MetarPhenomenonType[MetarPhenomenonType["Duststorm"] = 2] = "Duststorm";
    MetarPhenomenonType[MetarPhenomenonType["Dust"] = 3] = "Dust";
    MetarPhenomenonType[MetarPhenomenonType["Drizzle"] = 4] = "Drizzle";
    MetarPhenomenonType[MetarPhenomenonType["FunnelCloud"] = 5] = "FunnelCloud";
    MetarPhenomenonType[MetarPhenomenonType["Fog"] = 6] = "Fog";
    MetarPhenomenonType[MetarPhenomenonType["Smoke"] = 7] = "Smoke";
    MetarPhenomenonType[MetarPhenomenonType["Hail"] = 8] = "Hail";
    MetarPhenomenonType[MetarPhenomenonType["SmallHail"] = 9] = "SmallHail";
    MetarPhenomenonType[MetarPhenomenonType["Haze"] = 10] = "Haze";
    MetarPhenomenonType[MetarPhenomenonType["IceCrystals"] = 11] = "IceCrystals";
    MetarPhenomenonType[MetarPhenomenonType["IcePellets"] = 12] = "IcePellets";
    MetarPhenomenonType[MetarPhenomenonType["DustSandWhorls"] = 13] = "DustSandWhorls";
    MetarPhenomenonType[MetarPhenomenonType["Spray"] = 14] = "Spray";
    MetarPhenomenonType[MetarPhenomenonType["Rain"] = 15] = "Rain";
    MetarPhenomenonType[MetarPhenomenonType["Sand"] = 16] = "Sand";
    MetarPhenomenonType[MetarPhenomenonType["SnowGrains"] = 17] = "SnowGrains";
    MetarPhenomenonType[MetarPhenomenonType["Shower"] = 18] = "Shower";
    MetarPhenomenonType[MetarPhenomenonType["Snow"] = 19] = "Snow";
    MetarPhenomenonType[MetarPhenomenonType["Squalls"] = 20] = "Squalls";
    MetarPhenomenonType[MetarPhenomenonType["Sandstorm"] = 21] = "Sandstorm";
    MetarPhenomenonType[MetarPhenomenonType["UnknownPrecip"] = 22] = "UnknownPrecip";
    MetarPhenomenonType[MetarPhenomenonType["VolcanicAsh"] = 23] = "VolcanicAsh";
})(MetarPhenomenonType || (MetarPhenomenonType = {}));
/** METAR phenomenon intensities. */
var MetarPhenomenonIntensity;
(function (MetarPhenomenonIntensity) {
    MetarPhenomenonIntensity[MetarPhenomenonIntensity["Light"] = -1] = "Light";
    MetarPhenomenonIntensity[MetarPhenomenonIntensity["Normal"] = 0] = "Normal";
    MetarPhenomenonIntensity[MetarPhenomenonIntensity["Heavy"] = 1] = "Heavy";
})(MetarPhenomenonIntensity || (MetarPhenomenonIntensity = {}));
[new GeoPoint(0, 0)];
[new GeoCircle(Vec3Math.create(), 0), new GeoCircle(Vec3Math.create(), 0)];
[new GeoPoint(0, 0), new GeoPoint(0, 0)];
[new GeoPoint(0, 0)];

var RunwaySurfaceCategory;
(function (RunwaySurfaceCategory) {
    RunwaySurfaceCategory[RunwaySurfaceCategory["Unknown"] = 1] = "Unknown";
    RunwaySurfaceCategory[RunwaySurfaceCategory["Hard"] = 2] = "Hard";
    RunwaySurfaceCategory[RunwaySurfaceCategory["Soft"] = 4] = "Soft";
    RunwaySurfaceCategory[RunwaySurfaceCategory["Water"] = 8] = "Water";
})(RunwaySurfaceCategory || (RunwaySurfaceCategory = {}));
/**
 * Methods for working with Runways and Runway Designations.
 */
class RunwayUtils {
    /**
     * Gets the letter for a runway designator.
     * @param designator A runway designator.
     * @param lowerCase Whether the letter should be lower case. False by default.
     * @returns The letter for the specified runway designator.
     */
    static getDesignatorLetter(designator, lowerCase = false) {
        const letter = RunwayUtils.RUNWAY_DESIGNATOR_LETTERS[designator];
        return lowerCase
            ? letter.toLowerCase()
            : letter;
    }
    /**
     * Creates an empty one-way runway.
     * @returns an empty one-way runway.
     */
    static createEmptyOneWayRunway() {
        return {
            parentRunwayIndex: -1,
            designation: '',
            direction: 36,
            runwayDesignator: RunwayDesignator.RUNWAY_DESIGNATOR_NONE,
            course: 0,
            elevation: 0,
            elevationEnd: 0,
            gradient: 0,
            latitude: 0,
            longitude: 0,
            length: 0,
            width: 0,
            startThresholdLength: 0,
            endThresholdLength: 0,
            surface: RunwaySurfaceType.Concrete,
            lighting: RunwayLightingType.Unknown
        };
    }
    /**
     * Utility method to return all of the one-way runways from a single airport facility
     * @param airport is the Airport Facility to evaluate
     * @returns all of the one-way runways in the airport facility, sorted.
     */
    static getOneWayRunwaysFromAirport(airport) {
        const runways = [];
        airport.runways.map((r, i) => RunwayUtils.getOneWayRunways(r, i)).forEach(d => {
            runways.push(d[0]);
            runways.push(d[1]);
        });
        runways.sort(RunwayUtils.sortRunways);
        return runways;
    }
    /**
     * Utility method to return two one-way runways from a single runway facility
     * @param runway is the AirportRunway object to evaluate
     * @param index is the index of the AirportRunway in the Facility
     * @returns splitRunways array of OneWayRunway objects
     */
    static getOneWayRunways(runway, index) {
        const splitRunways = [];
        const designations = runway.designation.split('-');
        for (let i = 0; i < designations.length; i++) {
            const runwayNumber = parseInt(designations[i]);
            let designator = RunwayDesignator.RUNWAY_DESIGNATOR_NONE;
            let course = 0;
            let thresholdDistanceFromCenter = 0;
            let thresholdElevation = 0;
            let endThresholdElevation = 0;
            let ilsFrequency;
            let startThresholdLength = 0, endThresholdLength = 0;
            if (i === 0) {
                designator = runway.designatorCharPrimary;
                course = runway.direction;
                thresholdDistanceFromCenter = (runway.length / 2) - runway.primaryThresholdLength;
                thresholdElevation = runway.primaryElevation;
                endThresholdElevation = runway.secondaryElevation;
                ilsFrequency = runway.primaryILSFrequency.freqMHz === 0 ? undefined : runway.primaryILSFrequency;
                startThresholdLength = runway.primaryThresholdLength;
                endThresholdLength = runway.secondaryThresholdLength;
            }
            else if (i === 1) {
                designator = runway.designatorCharSecondary;
                course = NavMath.normalizeHeading(runway.direction + 180);
                thresholdDistanceFromCenter = (runway.length / 2) - runway.secondaryThresholdLength;
                thresholdElevation = runway.secondaryElevation;
                endThresholdElevation = runway.primaryElevation;
                ilsFrequency = runway.secondaryILSFrequency.freqMHz === 0 ? undefined : runway.secondaryILSFrequency;
                startThresholdLength = runway.secondaryThresholdLength;
                endThresholdLength = runway.primaryThresholdLength;
            }
            const designation = RunwayUtils.getRunwayNameString(runwayNumber, designator);
            const coordinates = RunwayUtils.tempGeoPoint
                .set(runway.latitude, runway.longitude)
                .offset(course - 180, UnitType.METER.convertTo(thresholdDistanceFromCenter, UnitType.GA_RADIAN));
            splitRunways.push({
                parentRunwayIndex: index,
                designation,
                direction: runwayNumber,
                runwayDesignator: designator,
                course,
                elevation: thresholdElevation,
                elevationEnd: endThresholdElevation,
                gradient: (endThresholdElevation - thresholdElevation) / (runway.length - startThresholdLength - endThresholdLength) * 100,
                latitude: coordinates.lat,
                longitude: coordinates.lon,
                ilsFrequency,
                length: runway.length,
                width: runway.width,
                startThresholdLength,
                endThresholdLength,
                surface: runway.surface,
                lighting: runway.lighting
            });
        }
        return splitRunways;
    }
    /**
     * Gets a name for a paired runway. Names are formatted as dash-separated pairs of directional (one-way) runway
     * designations, with optional leading zero padding of the runway numbers. If the specified runway is not paired,
     * then the name will be the designation of the primary runway only.
     * @param runway A paired runway.
     * @param padded Whether the runway numbers should be padded with leading zeroes. Defaults to `true`.
     * @returns The name for the specified paired runway.
     */
    static getRunwayPairNameString(runway, padded = true) {
        const pad = padded ? 2 : 0;
        const dashIndex = runway.designation.search('-');
        const primary = `${(dashIndex < 0 ? runway.designation : runway.designation.substring(0, dashIndex)).padStart(pad)}${RunwayUtils.getDesignatorLetter(runway.designatorCharPrimary)}`;
        const secondary = dashIndex < 0 ? '' : `-${runway.designation.substring(dashIndex + 1).padStart(pad)}${RunwayUtils.getDesignatorLetter(runway.designatorCharSecondary)}`;
        return primary + secondary;
    }
    /**
     * Utility method to return the runway name from the number and designator (L/R/C/W)
     * @param runwayNumber is the integer part of a runway name (18, 26, 27, etc)
     * @param designator is the RunwayDesignator enum for the runway
     * @param padded Whether single-char runways should be 0-padded.
     * @param prefix A prefix to put before the runway name.
     * @returns the runway name string
     */
    static getRunwayNameString(runwayNumber, designator, padded = true, prefix = '') {
        let numberText = `${runwayNumber}`;
        if (padded) {
            numberText = numberText.padStart(2, '0');
        }
        return prefix + numberText + RunwayUtils.getDesignatorLetter(designator);
    }
    /**
     * Gets the primary runway number for a paired runway.
     * @param runway A paired runway.
     * @returns The primary runway number for the specified runway.
     */
    static getRunwayNumberPrimary(runway) {
        const dashIndex = runway.designation.search('-');
        if (dashIndex < 0) {
            return parseInt(runway.designation);
        }
        else {
            return parseInt(runway.designation.substring(0, dashIndex));
        }
    }
    /**
     * Gets the secondary runway number for a paired runway.
     * @param runway A paired runway.
     * @returns The secondary runway number for the specified runway, or `undefined` if the runway has no secondary
     * runway.
     */
    static getRunwayNumberSecondary(runway) {
        const dashIndex = runway.designation.search('-');
        if (dashIndex < 0) {
            return undefined;
        }
        else {
            return parseInt(runway.designation.substring(dashIndex + 1));
        }
    }
    /**
     * Gets a one-way runway from an airport that matches a runway designation by number and designator.
     * @param airport The airport facility in which to search for the match.
     * @param runwayNumber A runway number to match.
     * @param runwayDesignator A runway designator to match.
     * @returns The one-way runway which matches the designation, or undefined if no match could be found.
     */
    static matchOneWayRunway(airport, runwayNumber, runwayDesignator) {
        const length = airport.runways.length;
        for (let r = 0; r < length; r++) {
            const runway = airport.runways[r];
            const designation = runway.designation;
            const primaryRunwayNumber = parseInt(designation.split('-')[0]);
            const secondaryRunwayNumber = parseInt(designation.split('-')[1]);
            if (primaryRunwayNumber === runwayNumber && runway.designatorCharPrimary === runwayDesignator) {
                const oneWayRunways = RunwayUtils.getOneWayRunways(runway, r);
                return oneWayRunways[0];
            }
            else if (secondaryRunwayNumber === runwayNumber && runway.designatorCharSecondary === runwayDesignator) {
                const oneWayRunways = RunwayUtils.getOneWayRunways(runway, r);
                return oneWayRunways[1];
            }
        }
        return undefined;
    }
    /**
     * Gets a one-way runway from an airport that matches a runway designation string.
     * @param airport The airport facility in which to search for the match.
     * @param designation A runway designation.
     * @returns The one-way runway which matches the designation, or undefined if no match could be found.
     */
    static matchOneWayRunwayFromDesignation(airport, designation) {
        const length = airport.runways.length;
        for (let i = 0; i < length; i++) {
            const match = RunwayUtils.getOneWayRunways(airport.runways[i], i).find((r) => {
                return (r.designation === designation);
            });
            if (match) {
                return match;
            }
        }
        return undefined;
    }
    /**
     * Gets a one-way runway from an airport that matches a runway ident.
     * @param airport The airport facility in which to search for the match.
     * @param ident A runway ident.
     * @returns The one-way runway which matches the ident, or undefined if no match could be found.
     */
    static matchOneWayRunwayFromIdent(airport, ident) {
        return RunwayUtils.matchOneWayRunwayFromDesignation(airport, ident.substr(2).trim());
    }
    /**
     * Utility method to return the procedures for a given runway.
     * @param procedures The procedures for the airport.
     * @param runway The given runway to find procedures for.
     * @returns A list of approach procedures for the given runway.
     */
    static getProceduresForRunway(procedures, runway) {
        const oneways = new Array();
        // TODO Make the designation splitting logic a common routine too.
        const designations = runway.designation.split('-');
        for (let i = 0; i < designations.length; i++) {
            const runwayNumber = parseInt(designations[i]);
            let runwayName;
            if (i === 0) {
                runwayName = RunwayUtils.getRunwayNameString(runwayNumber, runway.designatorCharPrimary, false, '');
            }
            else {
                runwayName = RunwayUtils.getRunwayNameString(runwayNumber, runway.designatorCharSecondary, false, '');
            }
            oneways.push(runwayName);
        }
        const found = new Array();
        for (const procedure of procedures) {
            if (oneways.includes(procedure.runway.trim())) {
                found.push(procedure);
            }
            else if (procedure.runwayNumber === 0) {
                found.push(procedure);
            }
        }
        return found;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    static getLocFrequency(airport, arg1, arg2) {
        let runway;
        if (typeof arg1 === 'string') {
            const matchedRunway = RunwayUtils.matchOneWayRunwayFromDesignation(airport, arg1);
            if (!matchedRunway) {
                return undefined;
            }
            runway = matchedRunway;
        }
        else if (typeof arg1 === 'number') {
            const matchedRunway = RunwayUtils.matchOneWayRunway(airport, arg1, arg2);
            if (!matchedRunway) {
                return undefined;
            }
            runway = matchedRunway;
        }
        else {
            runway = arg1;
        }
        const runwayDesignation = runway.designation;
        if (runway.ilsFrequency) {
            return runway.ilsFrequency;
        }
        for (let i = 0; i < airport.frequencies.length; i++) {
            // Note: drop the leading zero in the runway designation for the search because some third-party sceneries
            // format the frequency names without the leading zero.
            const match = airport.frequencies[i].name.search(runwayDesignation.replace(/^0/, ''));
            if (match > -1) {
                return airport.frequencies[i];
            }
        }
        return undefined;
    }
    /**
     * Gets the back course frequency for a runway.
     * @param airport The airport to which the query runway belongs.
     * @param runwayNumber The number of the query runway.
     * @param runwayDesignator The designator of the query runway.
     * @returns The bc frequency for the query runway, or undefined if one could not be found.
     */
    static getBcFrequency(airport, runwayNumber, runwayDesignator) {
        const matchedRunway = RunwayUtils.getOppositeOneWayRunway(airport, runwayNumber, runwayDesignator);
        if (!matchedRunway) {
            return undefined;
        }
        return RunwayUtils.getLocFrequency(airport, matchedRunway);
    }
    /**
     * Get the opposite one way runway from a runway number and designator.
     * @param airport The airport to which the query runway belongs.
     * @param runwayNumber The number of the query runway.
     * @param runwayDesignator The designator of the query runway.
     * @returns The opposite one way runway for the query runway, or undefined if one could not be found.
     */
    static getOppositeOneWayRunway(airport, runwayNumber, runwayDesignator) {
        const oppositeRunwayNumber = Math.round(NavMath.normalizeHeading(10 * (runwayNumber + 18)) / 10);
        let oppositeRunwayDesignator = RunwayDesignator.RUNWAY_DESIGNATOR_NONE;
        switch (runwayDesignator) {
            case RunwayDesignator.RUNWAY_DESIGNATOR_LEFT:
                oppositeRunwayDesignator = RunwayDesignator.RUNWAY_DESIGNATOR_RIGHT;
                break;
            case RunwayDesignator.RUNWAY_DESIGNATOR_RIGHT:
                oppositeRunwayDesignator = RunwayDesignator.RUNWAY_DESIGNATOR_LEFT;
                break;
            default:
                oppositeRunwayDesignator = runwayDesignator;
                break;
        }
        return RunwayUtils.matchOneWayRunway(airport, oppositeRunwayNumber, oppositeRunwayDesignator);
    }
    /**
     * A comparer for sorting runways by number, and then by L, C, and R.
     * @param r1 The first runway to compare.
     * @param r2 The second runway to compare.
     * @returns -1 if the first is before, 0 if equal, 1 if the first is after.
     */
    static sortRunways(r1, r2) {
        if (r1.direction === r2.direction) {
            let v1 = 0;
            if (r1.designation.indexOf('L') != -1) {
                v1 = 1;
            }
            else if (r1.designation.indexOf('C') != -1) {
                v1 = 2;
            }
            else if (r1.designation.indexOf('R') != -1) {
                v1 = 3;
            }
            let v2 = 0;
            if (r2.designation.indexOf('L') != -1) {
                v2 = 1;
            }
            else if (r2.designation.indexOf('C') != -1) {
                v2 = 2;
            }
            else if (r2.designation.indexOf('R') != -1) {
                v2 = 3;
            }
            return v1 - v2;
        }
        return r1.direction - r2.direction;
    }
    /**
     * Gets the ICAO string for the runway facility associated with a one-way runway.
     * @param airport The runway's parent airport, or the ICAO of the airport.
     * @param runway A one-way runway.
     * @returns the ICAO string for the runway facility associated with the one-way runway.
     */
    static getRunwayFacilityIcao(airport, runway) {
        const icao = typeof airport === 'string' ? airport : airport.icao;
        return `R  ${icao.substring(7, 11)}RW${runway.designation.padEnd(3, ' ')}`;
    }
    /**
     * Creates a runway waypoint facility from a runway.
     * @param airport The runway's parent airport.
     * @param runway A one-way runway.
     * @returns A runway waypoint facility corresponding to the runway.
     */
    static createRunwayFacility(airport, runway) {
        return {
            icao: RunwayUtils.getRunwayFacilityIcao(airport, runway),
            name: `Runway ${runway.designation}`,
            region: airport.region,
            city: airport.city,
            lat: runway.latitude,
            lon: runway.longitude,
            magvar: airport.magvar,
            runway
        };
    }
    /**
     * Gets an alpha code from a runway number.
     * @param number is the runway number.
     * @returns a letter.
     */
    static getRunwayCode(number) {
        const n = Math.round(number);
        return String.fromCharCode(48 + n + (n > 9 ? 7 : 0));
    }
    /**
     * Gets the runway surface category from a runway or runway surface type.
     * @param runway A runway or runway surface type.
     * @returns The surface category of the specified runway or runway surface type.
     */
    static getSurfaceCategory(runway) {
        const surface = typeof runway === 'object' ? runway.surface : runway;
        if (this.SURFACES_HARD.includes(surface)) {
            return RunwaySurfaceCategory.Hard;
        }
        else if (this.SURFACES_SOFT.includes(surface)) {
            return RunwaySurfaceCategory.Soft;
        }
        else if (this.SURFACES_WATER.includes(surface)) {
            return RunwaySurfaceCategory.Water;
        }
        else {
            return RunwaySurfaceCategory.Unknown;
        }
    }
}
RunwayUtils.RUNWAY_DESIGNATOR_LETTERS = {
    [RunwayDesignator.RUNWAY_DESIGNATOR_NONE]: '',
    [RunwayDesignator.RUNWAY_DESIGNATOR_LEFT]: 'L',
    [RunwayDesignator.RUNWAY_DESIGNATOR_RIGHT]: 'R',
    [RunwayDesignator.RUNWAY_DESIGNATOR_CENTER]: 'C',
    [RunwayDesignator.RUNWAY_DESIGNATOR_WATER]: 'W',
    [RunwayDesignator.RUNWAY_DESIGNATOR_A]: 'A',
    [RunwayDesignator.RUNWAY_DESIGNATOR_B]: 'B',
};
RunwayUtils.SURFACES_HARD = [
    RunwaySurfaceType.Asphalt,
    RunwaySurfaceType.Bituminous,
    RunwaySurfaceType.Brick,
    RunwaySurfaceType.Concrete,
    RunwaySurfaceType.Ice,
    RunwaySurfaceType.Macadam,
    RunwaySurfaceType.Paint,
    RunwaySurfaceType.Planks,
    RunwaySurfaceType.SteelMats,
    RunwaySurfaceType.Tarmac,
    RunwaySurfaceType.Urban,
];
RunwayUtils.SURFACES_SOFT = [
    RunwaySurfaceType.Coral,
    RunwaySurfaceType.Dirt,
    RunwaySurfaceType.Forest,
    RunwaySurfaceType.Grass,
    RunwaySurfaceType.GrassBumpy,
    RunwaySurfaceType.Gravel,
    RunwaySurfaceType.HardTurf,
    RunwaySurfaceType.LongGrass,
    RunwaySurfaceType.OilTreated,
    RunwaySurfaceType.Sand,
    RunwaySurfaceType.Shale,
    RunwaySurfaceType.ShortGrass,
    RunwaySurfaceType.Snow,
    RunwaySurfaceType.WrightFlyerTrack
];
RunwayUtils.SURFACES_WATER = [
    RunwaySurfaceType.WaterFSX,
    RunwaySurfaceType.Lake,
    RunwaySurfaceType.Ocean,
    RunwaySurfaceType.Pond,
    RunwaySurfaceType.River,
    RunwaySurfaceType.WasteWater,
    RunwaySurfaceType.Water
];
RunwayUtils.tempGeoPoint = new GeoPoint(0, 0);

/**
 * Types of subscribable array change event.
 */
var SubscribableArrayEventType;
(function (SubscribableArrayEventType) {
    /** An element was added. */
    SubscribableArrayEventType["Added"] = "Added";
    /** An element was removed. */
    SubscribableArrayEventType["Removed"] = "Removed";
    /** The array was cleared. */
    SubscribableArrayEventType["Cleared"] = "Cleared";
})(SubscribableArrayEventType || (SubscribableArrayEventType = {}));

/**
 * An array-like class to observe changes in a list of objects.
 * @class ArraySubject
 * @template T
 */
class AbstractSubscribableArray {
    constructor() {
        this.notifyDepth = 0;
        /** A function which sends initial notifications to subscriptions. */
        this.initialNotifyFunc = this.initialNotify.bind(this);
        /** A function which responds to when a subscription to this subscribable is destroyed. */
        this.onSubDestroyedFunc = this.onSubDestroyed.bind(this);
    }
    /**
     * Adds a subscription to this array.
     * @param sub The subscription to add.
     */
    addSubscription(sub) {
        if (this.subs) {
            this.subs.push(sub);
        }
        else if (this.singletonSub) {
            this.subs = [this.singletonSub, sub];
            delete this.singletonSub;
        }
        else {
            this.singletonSub = sub;
        }
    }
    /** @inheritdoc */
    sub(handler, initialNotify = false, paused = false) {
        const sub = new HandlerSubscription(handler, this.initialNotifyFunc, this.onSubDestroyedFunc);
        this.addSubscription(sub);
        if (paused) {
            sub.pause();
        }
        else if (initialNotify) {
            sub.initialNotify();
        }
        return sub;
    }
    /** @inheritdoc */
    unsub(handler) {
        let toDestroy = undefined;
        if (this.singletonSub && this.singletonSub.handler === handler) {
            toDestroy = this.singletonSub;
        }
        else if (this.subs) {
            toDestroy = this.subs.find(sub => sub.handler === handler);
        }
        toDestroy === null || toDestroy === void 0 ? void 0 : toDestroy.destroy();
    }
    /**
     * Gets an item from the array.
     * @param index Thex index of the item to get.
     * @returns An item.
     * @throws
     */
    get(index) {
        const array = this.getArray();
        if (index > array.length - 1) {
            throw new Error('Index out of range');
        }
        return array[index];
    }
    /**
     * Tries to get the value from the array.
     * @param index The index of the item to get.
     * @returns The value or undefined if not found.
     */
    tryGet(index) {
        return this.getArray()[index];
    }
    /**
     * Notifies subscriptions of a change in the array.
     * @param index The index that was changed.
     * @param type The type of subject event.
     * @param modifiedItem The item modified by the operation.
     */
    notify(index, type, modifiedItem) {
        let needCleanUpSubs = false;
        this.notifyDepth++;
        if (this.singletonSub) {
            try {
                if (this.singletonSub.isAlive && !this.singletonSub.isPaused) {
                    this.singletonSub.handler(index, type, modifiedItem, this.getArray());
                }
                needCleanUpSubs || (needCleanUpSubs = !this.singletonSub.isAlive);
            }
            catch (error) {
                console.error(`AbstractSubscribableArray: error in handler: ${error}`);
                if (error instanceof Error) {
                    console.error(error.stack);
                }
            }
        }
        else if (this.subs) {
            const subLen = this.subs.length;
            for (let i = 0; i < subLen; i++) {
                try {
                    const sub = this.subs[i];
                    if (sub.isAlive && !sub.isPaused) {
                        sub.handler(index, type, modifiedItem, this.getArray());
                    }
                    needCleanUpSubs || (needCleanUpSubs = !sub.isAlive);
                }
                catch (error) {
                    console.error(`AbstractSubscribableArray: error in handler: ${error}`);
                    if (error instanceof Error) {
                        console.error(error.stack);
                    }
                }
            }
        }
        this.notifyDepth--;
        if (needCleanUpSubs && this.notifyDepth === 0) {
            if (this.singletonSub && !this.singletonSub.isAlive) {
                delete this.singletonSub;
            }
            else if (this.subs) {
                this.subs = this.subs.filter(sub => sub.isAlive);
            }
        }
    }
    /**
     * Notifies a subscription of this array's current state.
     * @param sub The subscription to notify.
     */
    initialNotify(sub) {
        const array = this.getArray();
        sub.handler(0, SubscribableArrayEventType.Added, array, array);
    }
    /**
     * Responds to when a subscription to this array is destroyed.
     * @param sub The destroyed subscription.
     */
    onSubDestroyed(sub) {
        // If we are not in the middle of a notify operation, remove the subscription.
        // Otherwise, do nothing and let the post-notify clean-up code handle it.
        if (this.notifyDepth === 0) {
            if (this.singletonSub === sub) {
                delete this.singletonSub;
            }
            else if (this.subs) {
                const index = this.subs.indexOf(sub);
                if (index >= 0) {
                    this.subs.splice(index, 1);
                }
            }
        }
    }
}

/**
 * Types of changes made to {@link SubscribableSet}.
 */
var SubscribableSetEventType;
(function (SubscribableSetEventType) {
    /** A key was added. */
    SubscribableSetEventType["Added"] = "Added";
    /** A key was deleted. */
    SubscribableSetEventType["Deleted"] = "Deleted";
})(SubscribableSetEventType || (SubscribableSetEventType = {}));

/**
 * An array-like class to observe changes in a list of objects.
 * @class ArraySubject
 * @template T
 */
class ArraySubject extends AbstractSubscribableArray {
    /**
     * Constructs an observable array.
     * @param arr The initial array elements.
     */
    constructor(arr) {
        super();
        this.array = arr;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** The length of this array. */
    get length() {
        return this.array.length;
    }
    /**
     * Creates and returns a new observable array.
     * @static
     * @template AT The type of the array items.
     * @param arr The initial array elements.
     * @returns A new instance of SubjectArray.
     */
    static create(arr = []) {
        return new ArraySubject(arr);
    }
    /**
     * Inserts a new item at the end or the specified index.
     * @param item The item to insert.
     * @param index The optional index to insert the item to. Will add the item at then end if index not given.
     */
    insert(item, index) {
        if (index === undefined || index > this.array.length - 1) {
            index = this.array.length;
            this.array.push(item);
        }
        else {
            this.array.splice(index, 0, item);
        }
        this.notify(index, SubscribableArrayEventType.Added, item);
    }
    /**
     * Inserts items of an array beginning at the specified index.
     * @param [index] The index to begin inserting the array items.
     * @param arr The array to insert.
     */
    insertRange(index = 0, arr) {
        this.array.splice(index, 0, ...arr);
        this.notify(index, SubscribableArrayEventType.Added, arr);
    }
    /**
     * Removes the item at the specified index.
     * @param index The index of the item to remove.
     */
    removeAt(index) {
        const removedItem = this.array.splice(index, 1);
        this.notify(index, SubscribableArrayEventType.Removed, removedItem[0]);
    }
    /**
     * Removes the given item from the array.
     * @param item The item to remove.
     * @returns Returns a boolean indicating if the item was found and removed.
     */
    removeItem(item) {
        const index = this.array.indexOf(item);
        if (index > -1) {
            this.removeAt(index);
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * Replaces all items in the array with the new array.
     * @param arr The array.
     */
    set(arr) {
        this.clear();
        this.insertRange(0, arr);
    }
    /**
     * Clears all data in the array.
     */
    clear() {
        this.array.length = 0;
        this.notify(0, SubscribableArrayEventType.Cleared);
    }
    /**
     * Gets the array.
     * @returns The array.
     */
    getArray() {
        return this.array;
    }
}

/**
 * A object-valued subscribable subject which supports setting individual properties on the object and notifying
 * subscribers of any changes to those properties.
 */
class ObjectSubject {
    /**
     * Constructs an observable object Subject.
     * @param obj The initial object.
     */
    constructor(obj) {
        this.obj = obj;
        this.isSubscribable = true;
        this.isMutableSubscribable = true;
        this.subs = [];
        this.notifyDepth = 0;
        this.initialNotifyFunc = this.initialNotify.bind(this);
        this.onSubDestroyedFunc = this.onSubDestroyed.bind(this);
    }
    /**
     * Creates and returns a new ObjectSubject.
     * @param v The initial value of the subject.
     * @returns An ObjectSubject instance.
     */
    static create(v) {
        return new ObjectSubject(v);
    }
    /**
     * Gets this subject's object.
     * @returns This subject's object.
     */
    get() {
        return this.obj;
    }
    /** @inheritdoc */
    sub(handler, initialNotify = false, paused = false) {
        const sub = new HandlerSubscription(handler, this.initialNotifyFunc, this.onSubDestroyedFunc);
        this.subs.push(sub);
        if (paused) {
            sub.pause();
        }
        else if (initialNotify) {
            sub.initialNotify();
        }
        return sub;
    }
    /** @inheritdoc */
    unsub(handler) {
        const toDestroy = this.subs.find(sub => sub.handler === handler);
        toDestroy === null || toDestroy === void 0 ? void 0 : toDestroy.destroy();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    set(arg1, value) {
        if (typeof arg1 === 'object') {
            for (const prop in arg1) {
                if (prop in this.obj) {
                    this.set(prop, arg1[prop]);
                }
            }
        }
        else {
            const oldValue = this.obj[arg1];
            if (value !== oldValue) {
                this.obj[arg1] = value;
                this.notify(arg1, oldValue);
            }
        }
    }
    /**
     * Notifies subscriptions that one of the properties of this subject's object has changed.
     * @param key The property of the object that changed.
     * @param oldValue The old value of the property that changed.
     */
    notify(key, oldValue) {
        let needCleanUpSubs = false;
        this.notifyDepth++;
        const subLen = this.subs.length;
        for (let i = 0; i < subLen; i++) {
            try {
                const sub = this.subs[i];
                if (sub.isAlive && !sub.isPaused) {
                    sub.handler(this.obj, key, this.obj[key], oldValue);
                }
                needCleanUpSubs || (needCleanUpSubs = !sub.isAlive);
            }
            catch (error) {
                console.error(`ObjectSubject: error in handler: ${error}`);
                if (error instanceof Error) {
                    console.error(error.stack);
                }
            }
        }
        this.notifyDepth--;
        if (needCleanUpSubs && this.notifyDepth === 0) {
            this.subs = this.subs.filter(sub => sub.isAlive);
        }
    }
    /**
     * Notifies a subscription of this subject's current state.
     * @param sub The subscription to notify.
     */
    initialNotify(sub) {
        for (const key in this.obj) {
            const v = this.obj[key];
            sub.handler(this.obj, key, v, v);
        }
    }
    /**
     * Responds to when a subscription to this subscribable is destroyed.
     * @param sub The destroyed subscription.
     */
    onSubDestroyed(sub) {
        // If we are not in the middle of a notify operation, remove the subscription.
        // Otherwise, do nothing and let the post-notify clean-up code handle it.
        if (this.notifyDepth === 0) {
            this.subs.splice(this.subs.indexOf(sub), 1);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    map(fn, equalityFunc, mutateFunc, initialVal) {
        const mapFunc = (inputs, previousVal) => fn(inputs[0], previousVal);
        return mutateFunc
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ? MappedSubject.create(mapFunc, equalityFunc, mutateFunc, initialVal, this)
            : MappedSubject.create(mapFunc, equalityFunc !== null && equalityFunc !== void 0 ? equalityFunc : AbstractSubscribable.DEFAULT_EQUALITY_FUNC, this);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    pipe(to, arg2, arg3) {
        let sub;
        let paused;
        if (typeof arg2 === 'function') {
            sub = new SubscribablePipe(this, to, arg2, this.onSubDestroyedFunc);
            paused = arg3 !== null && arg3 !== void 0 ? arg3 : false;
        }
        else {
            sub = new SubscribablePipe(this, to, this.onSubDestroyedFunc);
            paused = arg2 !== null && arg2 !== void 0 ? arg2 : false;
        }
        this.subs.push(sub);
        if (paused) {
            sub.pause();
        }
        else {
            sub.initialNotify();
        }
        return sub;
    }
}

/* eslint-disable no-inner-declarations */
/** A releative render position. */
var RenderPosition;
(function (RenderPosition) {
    RenderPosition[RenderPosition["Before"] = 0] = "Before";
    RenderPosition[RenderPosition["After"] = 1] = "After";
    RenderPosition[RenderPosition["In"] = 2] = "In";
})(RenderPosition || (RenderPosition = {}));
/**
 * A display component in the component framework.
 * @typedef P The type of properties for this component.
 * @typedef C The type of context that this component might have.
 */
class DisplayComponent {
    /**
     * Creates an instance of a DisplayComponent.
     * @param props The propertis of the component.
     */
    constructor(props) {
        /** The context on this component, if any. */
        this.context = undefined;
        /** The type of context for this component, if any. */
        this.contextType = undefined;
        this.props = props;
    }
    /**
     * A callback that is called before the component is rendered.
     */
    onBeforeRender() { return; }
    /**
     * A callback that is called after the component is rendered.
     * @param node The component's VNode.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onAfterRender(node) { return; }
    /**
     * Destroys this component.
     */
    destroy() { return; }
    /**
     * Gets a context data subscription from the context collection.
     * @param context The context to get the subscription for.
     * @returns The requested context.
     * @throws An error if no data for the specified context type could be found.
     */
    getContext(context) {
        if (this.context !== undefined && this.contextType !== undefined) {
            const index = this.contextType.indexOf(context);
            return this.context[index];
        }
        throw new Error('Could not find the provided context type.');
    }
}
/**
 * A reference to a component or element node.
 */
class NodeReference {
    constructor() {
        /** The internal reference instance. */
        this._instance = null;
    }
    /**
     * The instance of the element or component.
     * @returns The instance of the element or component.
     */
    get instance() {
        if (this._instance !== null) {
            return this._instance;
        }
        throw new Error('Instance was null.');
    }
    /**
     * Sets the value of the instance.
     */
    set instance(val) {
        this._instance = val;
    }
    /**
     * Gets the instance, or null if the instance is not populated.
     * @returns The component or element instance.
     */
    getOrDefault() {
        return this._instance;
    }
}
/**
 * Provides a context of data that can be passed down to child components via a provider.
 */
class Context {
    /**
     * Creates an instance of a Context.
     * @param defaultValue The default value of this context.
     */
    constructor(defaultValue) {
        this.defaultValue = defaultValue;
        /**
         * The provider component that can be set to a specific context value.
         * @param props The props of the provider component.
         * @returns A new context provider.
         */
        this.Provider = (props) => new ContextProvider(props, this);
    }
}
/**
 * A provider component that can be set to a specific context value.
 */
class ContextProvider extends DisplayComponent {
    /**
     * Creates an instance of a ContextProvider.
     * @param props The props on the component.
     * @param parent The parent context instance for this provider.
     */
    constructor(props, parent) {
        super(props);
        this.parent = parent;
    }
    /** @inheritdoc */
    render() {
        var _a;
        const children = (_a = this.props.children) !== null && _a !== void 0 ? _a : [];
        return FSComponent.buildComponent(FSComponent.Fragment, this.props, ...children);
    }
}
/**
 * The FS component namespace.
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
var FSComponent;
(function (FSComponent) {
    /**
     * Valid SVG element tags.
     */
    const svgTags = {
        'circle': true,
        'clipPath': true,
        'color-profile': true,
        'cursor': true,
        'defs': true,
        'desc': true,
        'ellipse': true,
        'g': true,
        'image': true,
        'line': true,
        'linearGradient': true,
        'marker': true,
        'mask': true,
        'path': true,
        'pattern': true,
        'polygon': true,
        'polyline': true,
        'radialGradient': true,
        'rect': true,
        'stop': true,
        'svg': true,
        'text': true
    };
    /**
     * A fragment of existing elements with no specific root.
     * @param props The fragment properties.
     * @returns The fragment children.
     */
    function Fragment(props) {
        return props.children;
    }
    FSComponent.Fragment = Fragment;
    /**
     * Builds a JSX based FSComponent.
     * @param type The DOM element tag that will be built.
     * @param props The properties to apply to the DOM element.
     * @param children Any children of this DOM element.
     * @returns The JSX VNode for the component or element.
     */
    // eslint-disable-next-line no-inner-declarations
    function buildComponent(type, props, ...children) {
        let vnode = null;
        if (typeof type === 'string') {
            let element;
            if (svgTags[type] !== undefined) {
                element = document.createElementNS('http://www.w3.org/2000/svg', type);
            }
            else {
                element = document.createElement(type);
            }
            if (props !== null) {
                for (const key in props) {
                    if (key === 'ref' && props.ref !== undefined) {
                        props.ref.instance = element;
                    }
                    else {
                        const prop = props[key];
                        if (key === 'class' && typeof prop === 'object' && 'isSubscribableSet' in prop) {
                            // Bind CSS classes to a subscribable set
                            prop.sub((set, eventType, modifiedKey) => {
                                if (eventType === SubscribableSetEventType.Added) {
                                    element.classList.add(modifiedKey);
                                }
                                else {
                                    element.classList.remove(modifiedKey);
                                }
                            }, true);
                        }
                        else if (typeof prop === 'object' && 'isSubscribable' in prop) {
                            if (key === 'style' && prop instanceof ObjectSubject) {
                                // Bind CSS styles to an object subject.
                                prop.sub((v, style, newValue) => {
                                    element.style.setProperty(style.toString(), newValue);
                                }, true);
                            }
                            else {
                                // Bind an attribute to a subscribable.
                                prop.sub((v) => {
                                    element.setAttribute(key, v);
                                }, true);
                            }
                        }
                        else if (key === 'class' && typeof prop === 'object') {
                            // Bind CSS classes to an object of key value pairs where the values can be boolean | Subscribable<boolean>
                            for (const className in prop) {
                                if (className.trim().length === 0) {
                                    continue;
                                }
                                const value = prop[className];
                                if (typeof value === 'object' && 'isSubscribable' in value) {
                                    value.sub((showClass) => {
                                        element.classList.toggle(className, !!showClass);
                                    }, true);
                                }
                                else {
                                    element.classList.toggle(className, !!value);
                                }
                            }
                        }
                        else if (key === 'style' && typeof prop === 'object') {
                            // Bind styles to an object of key value pairs
                            for (const style in prop) {
                                if (style.trim().length === 0) {
                                    continue;
                                }
                                const value = prop[style];
                                if (typeof value === 'object' && 'isSubscribable' in value) {
                                    value.sub(newValue => {
                                        element.style.setProperty(style, newValue !== null && newValue !== void 0 ? newValue : '');
                                    }, true);
                                }
                                else {
                                    element.style.setProperty(style, value !== null && value !== void 0 ? value : '');
                                }
                            }
                        }
                        else {
                            element.setAttribute(key, prop);
                        }
                    }
                }
            }
            vnode = {
                instance: element,
                props: props,
                children: null
            };
            vnode.children = createChildNodes(vnode, children);
        }
        else if (typeof type === 'function') {
            if (children !== null && props === null) {
                props = {
                    children: children
                };
            }
            else if (props !== null) {
                props.children = children;
            }
            if (typeof type === 'function' && type.name === Fragment.name) {
                let childNodes = type(props);
                //Handle the case where the single fragment children is an array of nodes passsed down from above
                while (childNodes !== null && childNodes.length === 1 && Array.isArray(childNodes[0])) {
                    childNodes = childNodes[0];
                }
                vnode = {
                    instance: null,
                    props,
                    children: childNodes
                };
            }
            else {
                let instance;
                const pluginSystem = (window._pluginSystem);
                try {
                    instance = type(props);
                }
                catch (_a) {
                    let pluginInstance = undefined;
                    if (pluginSystem !== undefined) {
                        pluginInstance = pluginSystem.onComponentCreating(type, props);
                    }
                    if (pluginInstance !== undefined) {
                        instance = pluginInstance;
                    }
                    else {
                        instance = new type(props);
                    }
                }
                if (props !== null && props.ref !== null && props.ref !== undefined) {
                    props.ref.instance = instance;
                }
                if (instance.contextType !== undefined) {
                    instance.context = instance.contextType.map(c => Subject.create(c.defaultValue));
                }
                if (pluginSystem !== undefined) {
                    pluginSystem.onComponentCreated(instance);
                }
                vnode = {
                    instance,
                    props,
                    children: [instance.render()]
                };
            }
        }
        return vnode;
    }
    FSComponent.buildComponent = buildComponent;
    /**
     * Creates the collection of child VNodes.
     * @param parent The parent VNode.
     * @param children The JSX children to convert to nodes.
     * @returns A collection of child VNodes.
     */
    function createChildNodes(parent, children) {
        let vnodes = null;
        if (children !== null && children !== undefined && children.length > 0) {
            vnodes = [];
            for (const child of children) {
                if (child !== null) {
                    if (child instanceof Array) {
                        const arrayNodes = createChildNodes(parent, child);
                        if (arrayNodes !== null) {
                            vnodes.push(...arrayNodes);
                        }
                    }
                    else if (typeof child === 'object') {
                        if ('isSubscribable' in child) {
                            const node = {
                                instance: child,
                                children: null,
                                props: null,
                                root: undefined,
                            };
                            child.sub((v) => {
                                if (node.root !== undefined) {
                                    // TODO workaround. gotta find a solution for the text node vanishing when text is empty
                                    node.root.nodeValue = (v === '' || v === null || v === undefined)
                                        ? ' '
                                        : v.toString();
                                }
                            });
                            vnodes.push(node);
                        }
                        else {
                            vnodes.push(child);
                        }
                    }
                    else if (typeof child === 'string' || typeof child === 'number') {
                        vnodes.push(createStaticContentNode(child));
                    }
                }
            }
        }
        return vnodes;
    }
    FSComponent.createChildNodes = createChildNodes;
    /**
     * Creates a static content VNode.
     * @param content The content to create a node for.
     * @returns A static content VNode.
     */
    function createStaticContentNode(content) {
        return {
            instance: content,
            children: null,
            props: null
        };
    }
    FSComponent.createStaticContentNode = createStaticContentNode;
    /**
     * Renders a VNode to a DOM element.
     * @param node The node to render.
     * @param element The DOM element to render to.
     * @param position The RenderPosition to put the item in.
     */
    function render(node, element, position = RenderPosition.In) {
        if (node.instance instanceof HTMLElement || node.instance instanceof SVGElement) {
            if (element !== null) {
                insertNode(node, position, element);
            }
        }
        else if (node.children && node.children.length > 0 && element !== null) {
            const componentInstance = node.instance;
            if (componentInstance !== null && componentInstance.onBeforeRender !== undefined) {
                componentInstance.onBeforeRender();
            }
            if (position === RenderPosition.After) {
                for (let i = node.children.length - 1; i >= 0; i--) {
                    if (node.children[i] === undefined || node.children[i] === null) {
                        continue;
                    }
                    insertNode(node.children[i], position, element);
                }
            }
            else {
                for (let i = 0; i < node.children.length; i++) {
                    if (node.children[i] === undefined || node.children[i] === null) {
                        continue;
                    }
                    insertNode(node.children[i], position, element);
                }
            }
            const instance = node.instance;
            if (instance instanceof ContextProvider) {
                visitNodes(node, (n) => {
                    if (n === undefined || n === null) {
                        return false;
                    }
                    const nodeInstance = n.instance;
                    if (nodeInstance !== null && nodeInstance.contextType !== undefined) {
                        const contextSlot = nodeInstance.contextType.indexOf(instance.parent);
                        if (contextSlot >= 0) {
                            if (nodeInstance.context === undefined) {
                                nodeInstance.context = [];
                            }
                            nodeInstance.context[contextSlot].set(instance.props.value);
                        }
                        if (nodeInstance instanceof ContextProvider && nodeInstance !== instance && nodeInstance.parent === instance.parent) {
                            return true;
                        }
                    }
                    return false;
                });
            }
            if (componentInstance !== null && componentInstance.onAfterRender !== undefined) {
                const pluginSystem = (window._pluginSystem);
                componentInstance.onAfterRender(node);
                if (pluginSystem !== undefined) {
                    pluginSystem.onComponentRendered(node);
                }
            }
        }
    }
    FSComponent.render = render;
    /**
     * Inserts a node into the DOM.
     * @param node The node to insert.
     * @param position The position to insert the node in.
     * @param element The element to insert relative to.
     */
    function insertNode(node, position, element) {
        var _a, _b, _c, _d, _e, _f;
        if (node.instance instanceof HTMLElement || node.instance instanceof SVGElement) {
            switch (position) {
                case RenderPosition.In:
                    element.appendChild(node.instance);
                    node.root = (_a = element.lastChild) !== null && _a !== void 0 ? _a : undefined;
                    break;
                case RenderPosition.Before:
                    element.insertAdjacentElement('beforebegin', node.instance);
                    node.root = (_b = element.previousSibling) !== null && _b !== void 0 ? _b : undefined;
                    break;
                case RenderPosition.After:
                    element.insertAdjacentElement('afterend', node.instance);
                    node.root = (_c = element.nextSibling) !== null && _c !== void 0 ? _c : undefined;
                    break;
            }
            if (node.children !== null) {
                for (const child of node.children) {
                    insertNode(child, RenderPosition.In, node.instance);
                }
            }
        }
        else if (typeof node.instance === 'string'
            || (typeof node.instance === 'object'
                && node.instance !== null &&
                'isSubscribable' in node.instance)) {
            let toRender;
            if (typeof node.instance === 'string') {
                toRender = node.instance;
            }
            else {
                toRender = node.instance.get();
                if (toRender === '') {
                    toRender = ' '; // prevent disappearing text node
                }
            }
            switch (position) {
                case RenderPosition.In:
                    element.insertAdjacentHTML('beforeend', toRender);
                    node.root = (_d = element.lastChild) !== null && _d !== void 0 ? _d : undefined;
                    break;
                case RenderPosition.Before:
                    element.insertAdjacentHTML('beforebegin', toRender);
                    node.root = (_e = element.previousSibling) !== null && _e !== void 0 ? _e : undefined;
                    break;
                case RenderPosition.After:
                    element.insertAdjacentHTML('afterend', toRender);
                    node.root = (_f = element.nextSibling) !== null && _f !== void 0 ? _f : undefined;
                    break;
            }
        }
        else if (Array.isArray(node)) {
            if (position === RenderPosition.After) {
                for (let i = node.length - 1; i >= 0; i--) {
                    render(node[i], element, position);
                }
            }
            else {
                for (let i = 0; i < node.length; i++) {
                    render(node[i], element, position);
                }
            }
        }
        else {
            render(node, element, position);
        }
    }
    /**
     * Render a node before a DOM element.
     * @param node The node to render.
     * @param element The element to render boeore.
     */
    function renderBefore(node, element) {
        render(node, element, RenderPosition.Before);
    }
    FSComponent.renderBefore = renderBefore;
    /**
     * Render a node after a DOM element.
     * @param node The node to render.
     * @param element The element to render after.
     */
    function renderAfter(node, element) {
        render(node, element, RenderPosition.After);
    }
    FSComponent.renderAfter = renderAfter;
    /**
     * Remove a previously rendered element.  Currently, this is just a simple
     * wrapper so that all of our high-level "component maniuplation" state is kept
     * in the FSComponent API, but it's not doing anything other than a simple
     * remove() on the element.   This can probably be enhanced.
     * @param element The element to remove.
     */
    function remove(element) {
        if (element !== null) {
            element.remove();
        }
    }
    FSComponent.remove = remove;
    /**
     * Creates a component or element node reference.
     * @returns A new component or element node reference.
     */
    function createRef() {
        return new NodeReference();
    }
    FSComponent.createRef = createRef;
    /**
     * Creates a new context to hold data for passing to child components.
     * @param defaultValue The default value of this context.
     * @returns A new context.
     */
    function createContext(defaultValue) {
        return new Context(defaultValue);
    }
    FSComponent.createContext = createContext;
    /**
     * Visits VNodes with a supplied visitor function within the given children tree.
     * @param node The node to visit.
     * @param visitor The visitor function to inspect VNodes with. Return true if the search should stop at the visited
     * node and not proceed any further down the node's children.
     */
    function visitNodes(node, visitor) {
        if (node === undefined || node === null) {
            return;
        }
        const stopVisitation = visitor(node);
        if (!stopVisitation && node.children !== undefined && node.children !== null) {
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                if (Array.isArray(child)) {
                    for (let childIndex = 0; childIndex < child.length; childIndex++) {
                        visitNodes(child[childIndex], visitor);
                    }
                }
                else {
                    visitNodes(child, visitor);
                }
            }
        }
        return;
    }
    FSComponent.visitNodes = visitNodes;
    /**
     * Parses a space-delimited CSS class string into an array of CSS classes.
     * @param classString A space-delimited CSS class string.
     * @param filter A function which filters parsed classes. For each class, the function should return `true` if the
     * class should be included in the output array and `false` otherwise.
     * @returns An array of CSS classes derived from the specified CSS class string.
     */
    function parseCssClassesFromString(classString, filter) {
        return classString.split(' ').filter(str => str !== '' && (filter === undefined || filter(str)));
    }
    FSComponent.parseCssClassesFromString = parseCssClassesFromString;
    // eslint-disable-next-line jsdoc/require-jsdoc
    function bindCssClassSet(setToBind, classesToSubscribe, reservedClasses) {
        const reservedClassSet = new Set(reservedClasses);
        if (classesToSubscribe.isSubscribableSet === true) {
            return bindCssClassSetToSubscribableSet(setToBind, classesToSubscribe, reservedClassSet);
        }
        else {
            return bindCssClassSetToRecord(setToBind, classesToSubscribe, reservedClassSet);
        }
    }
    FSComponent.bindCssClassSet = bindCssClassSet;
    /**
     * Binds a {@link MutableSubscribableSet} to a subscribable set of CSS classes. CSS classes added to and removed from
     * the subscribed set will also be added to and removed from the bound set, with the exception of a set of reserved
     * classes. The presence or absence of any of the reserved classes in the bound set is not affected by the subscribed
     * set.
     * @param setToBind The set to bind.
     * @param classesToSubscribe A set of CSS classes to which to subscribe.
     * @param reservedClassSet A set of reserved classes.
     * @returns The newly created subscription to the subscribed CSS class set.
     */
    function bindCssClassSetToSubscribableSet(setToBind, classesToSubscribe, reservedClassSet) {
        if (reservedClassSet.size === 0) {
            return classesToSubscribe.sub((set, type, key) => {
                if (type === SubscribableSetEventType.Added) {
                    setToBind.add(key);
                }
                else {
                    setToBind.delete(key);
                }
            }, true);
        }
        else {
            return classesToSubscribe.sub((set, type, key) => {
                if (reservedClassSet.has(key)) {
                    return;
                }
                if (type === SubscribableSetEventType.Added) {
                    setToBind.add(key);
                }
                else {
                    setToBind.delete(key);
                }
            }, true);
        }
    }
    /**
     * Binds a {@link MutableSubscribableSet} to a record of CSS classes. CSS classes toggled in the record will also be
     * added to and removed from the bound set, with the exception of a set of reserved classes. The presence or absence
     * of any of the reserved classes in the bound set is not affected by the subscribed record.
     * @param setToBind The set to bind.
     * @param classesToSubscribe A record of CSS classes to which to subscribe.
     * @param reservedClassSet A set of reserved classes.
     * @returns The newly created subscriptions to the CSS class record.
     */
    function bindCssClassSetToRecord(setToBind, classesToSubscribe, reservedClassSet) {
        const subs = [];
        for (const cssClass in classesToSubscribe) {
            if (reservedClassSet.has(cssClass)) {
                continue;
            }
            const value = classesToSubscribe[cssClass];
            if (typeof value === 'object') {
                subs.push(value.sub(setToBind.toggle.bind(setToBind, cssClass), true));
            }
            else if (value === true) {
                setToBind.add(cssClass);
            }
            else {
                setToBind.delete(cssClass);
            }
        }
        return subs;
    }
    /**
     * Adds CSS classes to a {@link ToggleableClassNameRecord}.
     * @param record The CSS class record to which to add the new classes. The record will be mutated as classes are
     * added.
     * @param classesToAdd The CSS classes to add to the record, as a space-delimited class string, an iterable of
     * individual class names, or a {@link ToggleableClassNameRecord}.
     * @param allowOverwrite Whether to allow the new classes to overwrite existing entries in the CSS class record.
     * Defaults to `true`.
     * @param filter A function which filters the classes to add. For each class, the function should return `true` if
     * the class should be included in the record and `false` otherwise.
     * @returns The mutated CSS class record, after the new classes have been added.
     */
    function addCssClassesToRecord(record, classesToAdd, allowOverwrite = true, filter) {
        if (classesToAdd === '') {
            return record;
        }
        if (typeof classesToAdd === 'string') {
            classesToAdd = FSComponent.parseCssClassesFromString(classesToAdd, filter);
            filter = undefined;
        }
        if (typeof classesToAdd[Symbol.iterator] === 'function') {
            for (const cssClass of classesToAdd) {
                if ((allowOverwrite || record[cssClass] === undefined) && (!filter || filter(cssClass))) {
                    record[cssClass] = true;
                }
            }
        }
        else {
            for (const cssClass in classesToAdd) {
                if ((allowOverwrite || record[cssClass] === undefined) && (!filter || filter(cssClass))) {
                    record[cssClass] = classesToAdd[cssClass];
                }
            }
        }
        return record;
    }
    FSComponent.addCssClassesToRecord = addCssClassesToRecord;
    /**
     * Traverses a VNode tree in depth-first order and destroys the first {@link DisplayComponent} encountered in each
     * branch of the tree.
     * @param root The root of the tree to traverse.
     */
    function shallowDestroy(root) {
        FSComponent.visitNodes(root, node => {
            if (node !== root && node.instance instanceof DisplayComponent) {
                node.instance.destroy();
                return true;
            }
            return false;
        });
    }
    FSComponent.shallowDestroy = shallowDestroy;
    /**
     * An empty callback handler.
     */
    FSComponent.EmptyHandler = () => { return; };
})(FSComponent || (FSComponent = {}));
FSComponent.Fragment;

/**
 * A class that wraps the actual instrumenet implementation and handles the sim's vcockpit lifecycle.
 */
class FsBaseInstrument extends BaseInstrument {
    /**
     * A callback called when the element is attached to the DOM.
     */
    connectedCallback() {
        super.connectedCallback();
        this.fsInstrument = this.constructInstrument();
    }
    /**
     * Update method called by BaseInstrument
     */
    Update() {
        super.Update();
        if (this.fsInstrument) {
            this.fsInstrument.Update();
        }
    }
    /** @inheritdoc */
    onInteractionEvent(_args) {
        if (this.fsInstrument) {
            this.fsInstrument.onInteractionEvent(_args);
        }
    }
    /** @inheritdoc */
    onGameStateChanged(oldState, newState) {
        super.onGameStateChanged(oldState, newState);
        if (this.fsInstrument) {
            this.fsInstrument.onGameStateChanged(oldState, newState);
        }
    }
    /** @inheritdoc */
    onFlightStart() {
        super.onFlightStart();
        if (this.fsInstrument) {
            this.fsInstrument.onFlightStart();
        }
    }
    /** @inheritdoc */
    onSoundEnd(soundEventId) {
        super.onSoundEnd(soundEventId);
        if (this.fsInstrument) {
            this.fsInstrument.onSoundEnd(soundEventId);
        }
    }
    /**
     * Whether or not the instrument is interactive (a touchscreen instrument).
     * @returns True
     */
    get isInteractive() {
        return false;
    }
}

/** A EFB dropdown button */
class EfbSideButton extends DisplayComponent {
    /**
     * The constructor of the BoeingMfdButton, used for formatting button text on creation.
     * @param props The props of the BoeingMfdButton.
     */
    constructor(props) {
        super(props);
        this.root = FSComponent.createRef();
        this.buttonText = [];
        this.isSelected = SubscribableUtils.toSubscribable(this.props.selected, true);
        this.isAlerted = SubscribableUtils.toSubscribable(this.props.isAlerted, true);
        this.isVisible = SubscribableUtils.toSubscribable(this.props.isVisible, true);
        this.isDisabled = SubscribableUtils.toSubscribable(this.props.isDisabled, true);
        if (this.props.children) {
            for (const child of this.props.children) {
                this.buttonText.push(typeof child === 'string' ? FSComponent.buildComponent("span", null, child) : child);
            }
        }
    }
    /** @inheritDoc */
    onAfterRender(node) {
        super.onAfterRender(node);
        if (this.props.onClick) {
            this.root.instance.addEventListener('click', () => this.props.onClick && this.props.onClick());
        }
    }
    /** @inheritDoc */
    render() {
        var _a;
        const customWidthStyleString = this.props.width ? `width: ${this.props.width}px !important;` : '';
        const customHeightStyleString = this.props.height ? `height: ${this.props.height}px !important;` : '';
        const style = `${customWidthStyleString} ${customHeightStyleString}`;
        return (FSComponent.buildComponent("span", { ref: this.root, style: style, class: Object.assign({ 'boeing-efb-button': true, 'boeing-efb-button-selected': this.isSelected.map(x => x === undefined ? false : typeof x === 'boolean' ? x : this.props.name === x), 'boeing-efb-button-disabled': this.isDisabled.map(x => x === true), 'boeing-efb-button-alerted': this.isAlerted.map(x => x === true), 'hidden': this.isVisible.map(x => x === false) }, (((_a = this.props.class) !== null && _a !== void 0 ? _a : []).reduce((previous, current) => {
                previous[current] = true;
                return previous;
            }, {}))) }, ...this.buttonText));
    }
    /** @inheritDoc */
    destroy() {
        this.root.instance.removeEventListener('click', () => null);
    }
}

/** A EFB DropDown Menu button */
class B787EfbDropdownButton extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.root = FSComponent.createRef();
        this.dropDownMenuItemsRef = FSComponent.createRef();
        this.theEntireButtonRef = FSComponent.createRef();
        this.buttonNameRef = FSComponent.createRef();
        this.arrowRef = FSComponent.createRef();
        this.buttonText = Subject.create('');
        this.isButtonPressed = Subject.create(false);
        this.isSelected = SubscribableUtils.toSubscribable(this.props.selected, true);
        this.isAlerted = SubscribableUtils.toSubscribable(this.props.isAlerted, true);
        this.isVisible = SubscribableUtils.toSubscribable(this.props.isVisible, true);
        this.isDisabled = SubscribableUtils.toSubscribable(this.props.isDisabled, true);
    }
    /** @inheritDoc */
    onAfterRender(node) {
        super.onAfterRender(node);
        if (this.props.onClick) {
            this.root.instance.addEventListener('click', () => this.props.onClick && this.props.onClick());
        }
        if (this.props.hasGreenOutline) {
            this.root.instance.style.outline = '3px solid var(--boeing-colors-green)';
        }
        else {
            this.root.instance.style.color = 'var(--boeing-colors-white)';
            this.root.instance.style.webkitTextStroke = '.04em var(--boeing-colors-white)';
        }
        if (this.props.hasArrow) {
            this.arrowRef.instance.classList.remove('hidden');
        }
        if (this.props.isNameOnLeftSide) {
            this.buttonNameRef.instance.classList.add('dropdown-button-name-left');
        }
        else {
            this.buttonNameRef.instance.classList.add('dropdown-button-name-right');
        }
        this.root.instance.addEventListener('click', () => this.handleDropdownClicked());
        this.dropDownMenuItemsRef.instance.addEventListener('click', (v) => this.handleItemPicked(v));
        this.props.itemDropdownItems.sub(this.updateList.bind(this), true);
        //Gets the first item of the list and sets the name to be that
        if (this.props.onFmcLoadedName) {
            this.props.onFmcLoadedName.sub(this.updateAiport.bind(this), true);
        }
        this.buttonText.set(this.props.dropDownDefaultName);
    }
    /**
     * adds to the dom for rendering
     */
    updateList() {
        this.props.itemDropdownItems.getArray().forEach((item) => {
            const listItem = document.createElement('div');
            listItem.innerText = item;
            listItem.classList.add('boeing-efb-dropdown-button');
            listItem.classList.add('boeing-efb-dropdown-item');
            this.dropDownMenuItemsRef.instance.appendChild(listItem);
        });
    }
    /**
     * updates the textbox for the name of the airport origin/dest
     */
    updateAiport() {
        if (this.props.onFmcLoadedName) {
            this.buttonText.set(this.props.onFmcLoadedName.get());
        }
    }
    /**
     * when the user clicks the dropdown menu to show option
     */
    handleDropdownClicked() {
        if (this.isButtonPressed.get()) {
            this.isButtonPressed.set(false);
            this.dropDownMenuItemsRef.instance.classList.add('hidden');
        }
        else {
            this.isButtonPressed.set(true);
            this.dropDownMenuItemsRef.instance.classList.remove('hidden');
        }
    }
    /**
     * When the user picks an item from the dropdown list.
     * @param itemClickedName The item name that was clicked
     */
    handleItemPicked(itemClickedName) {
        this.isButtonPressed.set(false);
        if (itemClickedName.target.textContent !== 'EXIT') {
            this.root.instance.style.color = 'var(--boeing-colors-green)';
            this.root.instance.style.webkitTextStroke = '.04em var(--boeing-colors-green)';
            this.buttonText.set(itemClickedName.target.textContent);
            this.dropDownMenuItemsRef.instance.classList.add('hidden');
        }
        else {
            this.dropDownMenuItemsRef.instance.classList.add('hidden');
        }
    }
    /** @inheritDoc */
    render() {
        var _a;
        const customWidthStyleString = this.props.width ? `width: ${this.props.width}px !important;` : '';
        const customHeightStyleString = this.props.height ? `height: ${this.props.height}px !important;` : '';
        const style = `${customWidthStyleString} ${customHeightStyleString}`;
        return (FSComponent.buildComponent("div", { ref: this.theEntireButtonRef },
            FSComponent.buildComponent("div", { ref: this.buttonNameRef, class: 'button-name' }, this.props.dropdownButtonName),
            FSComponent.buildComponent("span", { ref: this.root, style: style, class: Object.assign({ 'boeing-efb-dropdown-button': true, 'boeing-efb-dropdown-button-selected': this.isSelected.map(x => x === undefined ? false : typeof x === 'boolean' ? x : this.props.name === x), 'boeing-efb-dropdown-button-disabled': this.isDisabled.map(x => x === true), 'boeing-efb-dropdown-button-alerted': this.isAlerted.map(x => x === true), 'hidden': this.isVisible.map(x => x === false) }, (((_a = this.props.class) !== null && _a !== void 0 ? _a : []).reduce((previous, current) => {
                    previous[current] = true;
                    return previous;
                }, {}))) },
                FSComponent.buildComponent("span", null, this.buttonText),
                FSComponent.buildComponent("div", { ref: this.arrowRef, class: 'boeing-efb-dropdown-arrow hidden' },
                    FSComponent.buildComponent("svg", { width: "15px", viewBox: "0 0 20 25" },
                        FSComponent.buildComponent("path", { d: "M 0 0 l 0 25 L 20 12.5 z", fill: "black" })))),
            FSComponent.buildComponent("div", { class: 'dropdown-items hidden', ref: this.dropDownMenuItemsRef })));
    }
    /** @inheritDoc */
    destroy() {
        this.root.instance.removeEventListener('click', () => null);
    }
}

/** A EFB Text Field button */
class B787EfbTextField extends DisplayComponent {
    /**
     * The constructor of the BoringEfbTextFields
     * @param props The props of the BoringEfbTextFields.
     */
    constructor(props) {
        super(props);
        this.root = FSComponent.createRef();
        this.textUnderTextFieldRef = FSComponent.createRef();
        this.bottomText = Subject.create('');
        this.theEntireButtonRef = FSComponent.createRef();
        this.buttonNameRef = FSComponent.createRef();
        this.buttonText = [];
        this.textBox = FSComponent.createRef();
        this.textFieldInput = '';
        this.isSelected = SubscribableUtils.toSubscribable(this.props.selected, true);
        this.isAlerted = SubscribableUtils.toSubscribable(this.props.isAlerted, true);
        this.isVisible = SubscribableUtils.toSubscribable(this.props.isVisible, true);
        this.isDisabled = SubscribableUtils.toSubscribable(this.props.isDisabled, true);
        this.inputId = this.genGuid();
        if (this.props.children) {
            for (const child of this.props.children) {
                this.buttonText.push(typeof child === 'string' ? FSComponent.buildComponent("span", null, child) : child);
            }
        }
    }
    /** @inheritDoc */
    onAfterRender(node) {
        super.onAfterRender(node);
        if (this.props.onClick) {
            this.root.instance.addEventListener('click', () => this.props.onClick && this.props.onClick());
        }
        if (!this.props.hasBottomText) {
            this.textUnderTextFieldRef.instance.classList.add('hidden');
        }
        this.textBox.instance.onkeyup = (e) => this.onKeyboardEvent(e);
        this.textBox.instance.onfocus = (e) => this.onKeyboardFocus(e);
        this.textBox.instance.onblur = (e) => this.onKeyboardBlur(e);
        this.textBox.instance.disabled = true;
        this.root.instance.onclick = () => {
            if (this.props.enableKeyboard) {
                if (this.textBox.instance.disabled) {
                    this.textBox.instance.disabled = false;
                    this.textBox.instance.focus();
                }
                else {
                    this.textBox.instance.disabled = true;
                    this.textBox.instance.blur();
                }
            }
        };
        if (this.props.hasGreenOutline) {
            this.root.instance.style.border = '3px solid var(--boeing-colors-green)';
        }
        if (this.props.isNameOnLeftSide) {
            this.buttonNameRef.instance.classList.add('textfield-button-name-left');
        }
        else {
            this.buttonNameRef.instance.classList.add('textfield-button-name-right');
        }
        if (this.props.valueOnStartUp !== undefined) {
            this.bottomText.set('' + this.props.valueOnStartUp);
        }
        if (this.props.valueOnStartUp) {
            this.props.valueOnStartUp.sub(this.bottomTextCalc.bind(this), true);
        }
    }
    /**
     * Generates a unique id.
     * @returns A unique ID string.
     */
    genGuid() {
        return 'INPT-xxxyxxyy'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    /**
     * An event fired when keyboard focus receives a key event.
     * @param e The keyboard event.
     */
    onKeyboardEvent(e) {
        e.preventDefault();
        this.bottomTextCalc();
    }
    /**
     * An event triggered when keyboard focus is entered.
     * @param e The event that was triggered.
     */
    onKeyboardFocus(e) {
        e.preventDefault();
        this.textBox.instance.value = '';
        this.textBox.instance.focus({ preventScroll: true });
        this.root.instance.style.border = '3px solid var(--boeing-colors-magenta)';
        Coherent.trigger('FOCUS_INPUT_FIELD', this.inputId, '', '', false);
        Coherent.on('mousePressOutsideView', () => {
            this.textBox.instance.blur();
        });
    }
    /**
     * An event triggered when keyboard focus is exited.
     * @param e The event that was triggered.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onKeyboardBlur(e) {
        e.preventDefault();
        this.root.instance.style.border = '3px solid var(--boeing-colors-white)';
        Coherent.trigger('UNFOCUS_INPUT_FIELD', '');
        Coherent.off('mousePressOutsideView');
        this.fillTextFieldWhenBlured();
    }
    /**
     * This is the logic that will fill out the text field when the user goes to the next one
     * it adds in the units of the textfield
     */
    fillTextFieldWhenBlured() {
        var _a, _b, _c;
        if (((_a = this.props.textFieldType) === null || _a === void 0 ? void 0 : _a.toString()) === '0') {
            this.textBox.instance.value = this.textBox.instance.value + ' C';
        }
        if (((_b = this.props.textFieldType) === null || _b === void 0 ? void 0 : _b.toString()) === '1') {
            this.textBox.instance.value = this.textBox.instance.value + ' KT';
        }
        if (((_c = this.props.textFieldType) === null || _c === void 0 ? void 0 : _c.toString()) === '2') {
            this.textBox.instance.value = this.textBox.instance.value + ' HPa';
        }
    }
    /**
     * This is the logic of what shows below the text when entering input from the textfield
     * Text starts blank if not numbers are entered
     * will also become blank if '/' does not have anything after it
     */
    bottomTextCalc() {
        var _a, _b, _c;
        if (((_a = this.props.textFieldType) === null || _a === void 0 ? void 0 : _a.toString()) === '0') {
            this.handleBottomTextForOat();
        }
        if (((_b = this.props.textFieldType) === null || _b === void 0 ? void 0 : _b.toString()) === '1') {
            this.handleBottomTextForWind();
        }
        if (((_c = this.props.textFieldType) === null || _c === void 0 ? void 0 : _c.toString()) === '2') {
            this.handleBottomTextForQNH();
        }
    }
    /**
     * Handles taking care of the bottom text for the the textfield OAT
     */
    handleBottomTextForOat() {
        this.bottomText.set('(' + Math.round(UnitType.CELSIUS.convertTo(Number(this.textBox.instance.value), UnitType.FAHRENHEIT)).toString() + ' F)');
    }
    /**
     * Handles taking care of the bottom text for the the textfield WIND
     */
    handleBottomTextForWind() {
        //TODO this is place holder at the moment since we are in need of the runway data to give the proper bottom text
        //leaving here since its almost done just needs to be replaced with runway data
        const splitted = this.textBox.instance.value.split('/', 2);
        let secondPartString = '';
        let firstPartString = '';
        if (splitted[1] === undefined) {
            secondPartString = ' /0 XW) KT';
        }
        if (Number(splitted[0]) < 0 || splitted[0].includes('t')) {
            firstPartString = ('(' + Math.abs(Number(splitted[0])) + ' TW');
        }
        else {
            firstPartString = ('(' + Math.abs(Number(splitted[0])) + ' HW');
        }
        if (this.textBox.instance.value.endsWith('/')) {
            //settings these to none since nothing should show up if it ends with /
            firstPartString = '';
            secondPartString = '';
        }
        else if (splitted[1] !== undefined) {
            secondPartString = ' /' + splitted[1] + ' XW) KT';
        }
        this.bottomText.set(firstPartString + secondPartString);
    }
    /**
     * Handles taking care of the bottom text for the the textfield QNH
     */
    handleBottomTextForQNH() {
        this.bottomText.set('(' + UnitType.HPA.convertTo(Number(this.textBox.instance.value), UnitType.IN_HG).toFixed(2).toString() + ' IN HG)');
    }
    /** @inheritDoc */
    render() {
        var _a;
        const customWidthStyleString = this.props.width ? `width: ${this.props.width}px !important;` : '';
        const customHeightStyleString = this.props.height ? `height: ${this.props.height}px !important;` : '';
        const style = `${customWidthStyleString} ${customHeightStyleString}`;
        return (FSComponent.buildComponent("div", { class: 'boeing-efb-top-textfield', ref: this.theEntireButtonRef },
            FSComponent.buildComponent("div", { ref: this.buttonNameRef, class: 'button-name' }, this.props.dropdownButtonName),
            FSComponent.buildComponent("span", { ref: this.root, style: style, class: Object.assign({ 'boeing-efb-textfield-button': true, 'boeing-efb-textfield-button-selected': this.isSelected.map(x => x === undefined ? false : typeof x === 'boolean' ? x : this.props.name === x), 'boeing-efb-textfield-button-disabled': this.isDisabled.map(x => x === true), 'boeing-efb-textfield-button-alerted': this.isAlerted.map(x => x === true), 'hidden': this.isVisible.map(x => x === false) }, (((_a = this.props.class) !== null && _a !== void 0 ? _a : []).reduce((previous, current) => {
                    previous[current] = true;
                    return previous;
                }, {}))) },
                FSComponent.buildComponent("input", { class: 'boeing-efb-text-field-keyboard-input', ref: this.textBox })),
            FSComponent.buildComponent("div", { class: 'text-under-text-field', ref: this.textUnderTextFieldRef }, this.bottomText)));
    }
    /** @inheritDoc */
    destroy() {
        this.root.instance.removeEventListener('click', () => null);
    }
}

var TextFieldDataType;
(function (TextFieldDataType) {
    TextFieldDataType[TextFieldDataType["Oat"] = 0] = "Oat";
    TextFieldDataType[TextFieldDataType["Wind"] = 1] = "Wind";
    TextFieldDataType[TextFieldDataType["Qnh"] = 2] = "Qnh";
})(TextFieldDataType || (TextFieldDataType = {}));
/**
 * A Boeing 787-10 EFB Performace Page.
 */
class B787PerformacePage extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.containerRef = FSComponent.createRef();
        this.rwyDropdownRef = FSComponent.createRef();
        this.sendOutputButtonRef = FSComponent.createRef();
        this.bus = new EventBus();
        this.runwaysList = ArraySubject.create([]);
        this.arptList = ArraySubject.create([]);
        this.aprtName = Subject.create('');
        this.runwayName = Subject.create('');
        this.runwayCondition = Subject.create(null);
        this.oat = Subject.create(0);
        this.qnh = Subject.create(0);
        this.rtgList = ArraySubject.create(['THRUST RTG', 'OPTIMUN', 'TO', 'to 1 -10', 'to 2 -20', 'WINDSHEAR', 'EXIT']);
        this.flapList = ArraySubject.create(['FLAP CONFIG', 'OPTIMUN', '5', '10', '15', '17', '18', '20', 'EXIT']);
        this.aiList = ArraySubject.create(['A/I CONFIG', 'OFF', 'ENGINE', 'ENGINE AUTO', 'EXIT']);
        this.imClbList = ArraySubject.create(['IMCLB', 'OPTIMUN', 'OFF']);
        this.intxList = ArraySubject.create([]);
        this.condList = ArraySubject.create(['CONDITION', 'DRY', 'WET', 'STNDING WIND', 'SLUSH', 'CMPCT SNOW', 'DRY SNOW', 'WET SNOW', 'ICE', 'GOOD', 'MEDIUM', 'POOR', 'EXIT']);
    }
    /** @inheritDoc */
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.visible.sub((visible) => {
            this.containerRef.instance.style.visibility = visible ? 'inherit' : 'hidden';
        }, true);
        this.sendOutputButtonRef.instance.addEventListener('click', () => this.handleSendOutputButton());
        this.props.store.runways.sub(this.onAirportSelected.bind(this), true);
    }
    /**
     * Handle when the user selects the Send Output button on the side menu
     */
    handleSendOutputButton() {
        //TODO this is what happens when you press side button
    }
    /**
     * Handles when a new airport is selected and runways change.
     */
    onAirportSelected() {
        //clear lists so no dupes show up
        this.runwaysList.clear();
        this.arptList.clear();
        const listOfRunways = this.props.store.runways.get();
        const runwayLists = [];
        listOfRunways.forEach((item) => {
            runwayLists.push(this.buildRunwayName(item));
        });
        this.aprtName.set(this.props.store.airportOrigin.get().substring(6) + '/' + this.props.store.airportDestination.get().substring(6));
        this.runwayCondition.set(this.props.store.takeoffRunwayCondition.get());
        this.runwaysList.set(runwayLists);
        this.oat.set(this.props.store.takeoffOat.get());
        this.qnh.set(this.props.store.takeoffQnh.get());
        this.runwayName.set(runwayLists[0]);
    }
    /**
     * Builds the runway names for the given airports.
     * @param runway The airport runways.
     * @returns The name of the runway.
     */
    buildRunwayName(runway) {
        const hypenIndex = runway.designation.indexOf('-');
        let runway1 = runway.designation.substring(0, hypenIndex).trim().padStart(2, '0');
        runway1 += RunwayUtils.getDesignatorLetter(runway.designatorCharPrimary);
        return runway1;
    }
    /** @inheritDoc */
    render() {
        return (FSComponent.buildComponent("div", { ref: this.containerRef },
            FSComponent.buildComponent("div", { class: 'efb-title-page' }, "PERFORMACE-TAKEOFF"),
            FSComponent.buildComponent("div", { class: 'efb-left-side', ref: this.sendOutputButtonRef },
                FSComponent.buildComponent(EfbSideButton, null,
                    FSComponent.buildComponent("span", null, "ARPT"),
                    FSComponent.buildComponent("span", null, "INFO")),
                FSComponent.buildComponent(EfbSideButton, null,
                    FSComponent.buildComponent("span", null, "ARPT"),
                    FSComponent.buildComponent("span", null, "INFO")),
                FSComponent.buildComponent(EfbSideButton, null,
                    FSComponent.buildComponent("span", null, "NOTAMS")),
                FSComponent.buildComponent(EfbSideButton, null,
                    FSComponent.buildComponent("span", null, "SHOW"),
                    FSComponent.buildComponent("span", null, "KYBD")),
                FSComponent.buildComponent(EfbSideButton, null,
                    FSComponent.buildComponent("span", null, "WT AND"),
                    FSComponent.buildComponent("span", null, "BALANCE")),
                FSComponent.buildComponent(EfbSideButton, null,
                    FSComponent.buildComponent("span", null, "SHOW"),
                    FSComponent.buildComponent("span", null, "LANDING")),
                FSComponent.buildComponent(EfbSideButton, null,
                    FSComponent.buildComponent("span", null, "COPY"),
                    FSComponent.buildComponent("span", null, "FMC DATA")),
                FSComponent.buildComponent(EfbSideButton, null,
                    FSComponent.buildComponent("span", null, "SEND"),
                    FSComponent.buildComponent("span", null, "OUTPUT"))),
            FSComponent.buildComponent("div", { class: 'efb-right-side' },
                FSComponent.buildComponent(EfbSideButton, null,
                    FSComponent.buildComponent("span", null, "CALC")),
                FSComponent.buildComponent(EfbSideButton, null,
                    FSComponent.buildComponent("span", null, "SHOW"),
                    FSComponent.buildComponent("span", null, "ALL ENGINE")),
                FSComponent.buildComponent(EfbSideButton, null,
                    FSComponent.buildComponent("span", null, "MEL")),
                FSComponent.buildComponent(EfbSideButton, null,
                    FSComponent.buildComponent("span", null, "CDL")),
                FSComponent.buildComponent(EfbSideButton, null,
                    FSComponent.buildComponent("span", null, "OTHER"),
                    FSComponent.buildComponent("span", null, "TODO"))),
            FSComponent.buildComponent("div", { class: 'efb-middle' },
                FSComponent.buildComponent("div", { class: 'efb-middle-top-left-title' }, "GENX-1B74-75"),
                FSComponent.buildComponent("div", { class: 'efb-middle-top-right-box' },
                    FSComponent.buildComponent("div", { class: 'right-side-dropdowns' },
                        FSComponent.buildComponent(B787EfbDropdownButton, { itemDropdownItems: this.rtgList, hasGreenOutline: false, hasArrow: true, dropdownButtonName: 'RTG', isNameOnLeftSide: false, dropDownDefaultName: 'THRUST RTG' }),
                        FSComponent.buildComponent(B787EfbTextField, { hasGreenOutline: true, dropdownButtonName: 'ATM', isNameOnLeftSide: false, hasBottomText: false, enableKeyboard: true }),
                        FSComponent.buildComponent("div", { class: 'right-side-making-space' }),
                        FSComponent.buildComponent(B787EfbDropdownButton, { itemDropdownItems: this.flapList, hasGreenOutline: false, hasArrow: true, dropdownButtonName: 'FLAP', isNameOnLeftSide: false, dropDownDefaultName: 'FLAP CONFIG' }),
                        FSComponent.buildComponent(B787EfbDropdownButton, { itemDropdownItems: this.aiList, hasGreenOutline: false, hasArrow: true, dropdownButtonName: 'A/I', isNameOnLeftSide: false, dropDownDefaultName: 'A/I CONFIG' }),
                        FSComponent.buildComponent(B787EfbDropdownButton, { itemDropdownItems: this.imClbList, hasGreenOutline: false, hasArrow: true, dropdownButtonName: 'ImCLB', isNameOnLeftSide: false, dropDownDefaultName: 'IMCLB' }))),
                FSComponent.buildComponent("div", { class: 'efb-middle-top-left-box' },
                    FSComponent.buildComponent("div", { class: 'left-side-dropdowns' },
                        FSComponent.buildComponent(B787EfbDropdownButton, { itemDropdownItems: this.arptList, hasGreenOutline: true, hasArrow: false, dropdownButtonName: 'ARPT', isNameOnLeftSide: true, dropDownDefaultName: 'AIRPORT SEARCH', onFmcLoadedName: this.aprtName }),
                        FSComponent.buildComponent(B787EfbDropdownButton, { ref: this.rwyDropdownRef, itemDropdownItems: this.runwaysList, hasGreenOutline: true, hasArrow: true, dropdownButtonName: 'RWY', isNameOnLeftSide: true, dropDownDefaultName: 'RUNWAYS', onFmcLoadedName: this.runwayName },
                            FSComponent.buildComponent("span", null, "11L")),
                        FSComponent.buildComponent(B787EfbDropdownButton, { itemDropdownItems: this.intxList, hasGreenOutline: false, hasArrow: false, dropdownButtonName: 'INTX', isNameOnLeftSide: true, dropDownDefaultName: 'NO INTX', isDisabled: true }),
                        FSComponent.buildComponent(B787EfbDropdownButton, { itemDropdownItems: this.condList, hasGreenOutline: false, hasArrow: true, dropdownButtonName: 'COND', isNameOnLeftSide: true, dropDownDefaultName: 'CONDITION', onFmcLoadedName: this.runwayCondition }),
                        FSComponent.buildComponent(B787EfbTextField, { hasGreenOutline: false, dropdownButtonName: 'WIND', isNameOnLeftSide: true, hasBottomText: true, enableKeyboard: true, textFieldType: TextFieldDataType.Wind }),
                        FSComponent.buildComponent(B787EfbTextField, { hasGreenOutline: true, dropdownButtonName: 'OAT', isNameOnLeftSide: true, hasBottomText: true, enableKeyboard: true, textFieldType: TextFieldDataType.Oat, valueOnStartUp: this.oat }),
                        FSComponent.buildComponent(B787EfbTextField, { hasGreenOutline: true, dropdownButtonName: 'QNH', isNameOnLeftSide: true, hasBottomText: true, enableKeyboard: true, textFieldType: TextFieldDataType.Qnh, valueOnStartUp: this.qnh }))),
                FSComponent.buildComponent("div", { class: 'efb-middle-1st-middle-box' },
                    FSComponent.buildComponent("div", { class: 'left-textfield-middle' },
                        FSComponent.buildComponent(B787EfbTextField, { hasGreenOutline: true, dropdownButtonName: 'TOW:', isNameOnLeftSide: true, hasBottomText: false, enableKeyboard: true })),
                    FSComponent.buildComponent("div", { class: 'right-textfield-middle' },
                        FSComponent.buildComponent(B787EfbTextField, { hasGreenOutline: true, dropdownButtonName: 'ZFW:', isNameOnLeftSide: true, hasBottomText: false, enableKeyboard: true }))),
                FSComponent.buildComponent("div", { class: 'efb-middle-2st-middle-box' },
                    FSComponent.buildComponent(B787EfbTextField, { hasGreenOutline: false, dropdownButtonName: 'CG(%):', isNameOnLeftSide: true, hasBottomText: false, width: 100, enableKeyboard: true })),
                FSComponent.buildComponent("div", { class: 'efb-middle-3st-middle-box' }))));
    }
}

/**
 * EFB MAIN MENU page
 */
class EfbMainMenuPage extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.containerRef = FSComponent.createRef();
        this.flightButtonDisabled = Subject.create(false);
        this.flightButtonText = Subject.create('INITIALIZE FLIGHT');
    }
    /** @inheritDoc */
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.visible.sub((visible) => {
            this.containerRef.instance.style.visibility = visible ? 'inherit' : 'hidden';
        }, true);
    }
    /**
     * Handles the INITIALIZE/CLOSE flight button
     * @private
     */
    async handleFlightButton() {
        this.flightButtonDisabled.set(true);
        this.props.communicationsManager.requestFlightInitializationData().then((data) => {
            this.flightButtonDisabled.set(false);
            this.props.store.acceptFlightInitializationData(data);
        }).catch(() => {
            console.error('Flight initialization data request timed out');
            this.flightButtonDisabled.set(false);
        });
    }
    /** @inheritDoc */
    render() {
        return (FSComponent.buildComponent("div", { ref: this.containerRef, class: "efb-main-menu" },
            FSComponent.buildComponent("div", { class: 'efb-title-page' }, "MAIN MENU"),
            FSComponent.buildComponent("div", { class: "efb-main-menu-button-column" },
                FSComponent.buildComponent(EfbSideButton, { width: 300, height: 70, isDisabled: true },
                    FSComponent.buildComponent("span", null, "TERMINAL CHARTS")),
                FSComponent.buildComponent(EfbSideButton, { width: 300, height: 70, isDisabled: true },
                    FSComponent.buildComponent("span", null, "ENROUTE CHARTS")),
                FSComponent.buildComponent("div", { class: "efb-main-menu-blank" }),
                FSComponent.buildComponent("div", { class: "efb-main-menu-blank" }),
                FSComponent.buildComponent(EfbSideButton, { width: 300, height: 70, isDisabled: true },
                    FSComponent.buildComponent("span", null, "PILOT UTILITIES")),
                FSComponent.buildComponent("div", { class: "efb-main-menu-blank" }),
                FSComponent.buildComponent(EfbSideButton, { width: 300, height: 70, isDisabled: true },
                    FSComponent.buildComponent("span", null, "IDENT PAGE")),
                FSComponent.buildComponent(EfbSideButton, { width: 300, height: 70, isDisabled: true },
                    FSComponent.buildComponent("span", null, "SYSTEM PAGE"))),
            FSComponent.buildComponent("div", { class: "efb-main-menu-button-column efb-main-menu-button-column-right" },
                FSComponent.buildComponent(EfbSideButton, { width: 300, height: 70, isDisabled: true },
                    FSComponent.buildComponent("span", null, "DOCUMENTS")),
                FSComponent.buildComponent(EfbSideButton, { width: 300, height: 70, onClick: () => this.props.onPageSelect(EfbPages.Performance) },
                    FSComponent.buildComponent("span", null, "PERFORMANCE")),
                FSComponent.buildComponent("div", { class: "efb-main-menu-blank" }),
                FSComponent.buildComponent("div", { class: "efb-main-menu-blank" }),
                FSComponent.buildComponent(EfbSideButton, { width: 300, height: 70, isDisabled: true },
                    FSComponent.buildComponent("span", null, "VIDEO")),
                FSComponent.buildComponent(EfbSideButton, { width: 300, height: 70, isDisabled: true },
                    FSComponent.buildComponent("span", null, "DATA LOAD")),
                FSComponent.buildComponent("div", { class: "efb-main-menu-blank" }),
                FSComponent.buildComponent(EfbSideButton, { width: 300, height: 70, isDisabled: this.flightButtonDisabled, onClick: () => this.handleFlightButton() },
                    FSComponent.buildComponent("span", null, this.flightButtonText)))));
    }
}

/**
 * EFB data store
 */
class B787EfbStore {
    constructor() {
        this.airportOrigin = Subject.create('');
        this.airportDestination = Subject.create('');
        this.runways = Subject.create([]);
        this.takeoffRunway = Subject.create(null);
        this.takeoffRunwayCondition = Subject.create(null);
        this.takeoffRunwayDisplacement = Subject.create(null);
        this.takeoffOat = Subject.create(null);
        this.takeoffQnh = Subject.create(null);
        this.takeoffGw = Subject.create(null);
    }
    /**
     * Accepts flight initialization data and sets store fields accordingly
     *
     * @param data the flight initialization data
     */
    acceptFlightInitializationData(data) {
        this.airportOrigin.set(data.airportOrigin);
        this.airportDestination.set(data.airportDestination);
        this.runways.set(data.runways);
        this.takeoffRunway.set(data.takeoffRunway);
        this.takeoffRunwayCondition.set(data.rwyCondition);
        this.takeoffRunwayDisplacement.set(data.runwayDisplacement);
        this.takeoffOat.set(data.oat);
        this.takeoffQnh.set(data.qnh);
        this.takeoffGw.set(data.gw);
    }
}

/**
 * EFB <-> FMC communications manager
 */
class EfbCommunicationManager {
    /**
     * Ctor
     * @param bus the event bus
     */
    constructor(bus) {
        this.bus = bus;
        this.commSub = this.bus.getSubscriber();
        this.commPub = this.bus.getPublisher();
        this.setupEventListeners();
    }
    /**
     * Sets up the event listeners for communication
     */
    setupEventListeners() {
        this.commSub.on('fmc_send_flight_initialization_data').handle((data) => {
            if (this.flightInitializationDataRejectTimer) {
                clearTimeout(this.flightInitializationDataRejectTimer);
                this.flightInitializationDataRejectTimer = undefined;
            }
            if (this.flightInitializationDataResolveFn) {
                this.flightInitializationDataResolveFn(data);
                this.flightInitializationDataResolveFn = undefined;
            }
        });
    }
    /**
     * Requests flight initialization data for the FMC
     */
    async requestFlightInitializationData() {
        if (this.flightInitializationDataResolveFn) {
            throw new Error('Cannot request flight initialization data as a request is already pending');
        }
        return new Promise((resolve, reject) => {
            this.flightInitializationDataResolveFn = resolve;
            this.flightInitializationDataRejectTimer = setTimeout(() => {
                this.flightInitializationDataResolveFn = undefined;
                this.flightInitializationDataResolveFn = undefined;
                reject();
            }, 5000);
            this.commPub.pub('efb_request_flight_initialization_data', null, true);
        });
    }
}

var EfbPages;
(function (EfbPages) {
    EfbPages[EfbPages["MainMenu"] = 0] = "MainMenu";
    EfbPages[EfbPages["Performance"] = 1] = "Performance";
})(EfbPages || (EfbPages = {}));
/**
 * A Boeing 787-10 EFB instrument.
 */
class WTB78xEfbInstrument {
    /**
     * Constructor.
     * @param instrument This instrument's parent BaseInstrument.
     */
    constructor(instrument) {
        this.instrument = instrument;
        this.containerRef = FSComponent.createRef();
        this.bus = new EventBus();
        this.backplane = new InstrumentBackplane();
        this.hEventPublisher = new HEventPublisher(this.bus);
        this.visiblePage = Subject.create(EfbPages.MainMenu);
        this.pageVisible = (page) => this.visiblePage.map((it) => it === page);
        this.store = new B787EfbStore();
        this.communicationsManager = new EfbCommunicationManager(this.bus);
        this.backplane.addPublisher('hEvent', this.hEventPublisher);
        this.doInit();
    }
    /**
     * Performs initialization tasks.
     */
    async doInit() {
        FSComponent.render(this.renderComponents(), document.getElementById('Electricity'));
        this.bus.getSubscriber().on('hEvent').handle((event) => {
            if (event.startsWith('WT787_EFB')) {
                const eventSuffix = event.replace('WT787_EFB_plt_', '').replace('WT787_EFB_coplt_', '');
                switch (eventSuffix) {
                    case 'MENU': this.visiblePage.set(EfbPages.MainMenu);
                }
            }
        });
        this.backplane.init();
    }
    /**
     * Renders this instrument's components.
     * @returns This instrument's rendered components, as a VNode.
     */
    renderComponents() {
        return (FSComponent.buildComponent("div", { ref: this.containerRef },
            FSComponent.buildComponent(B787PerformacePage, { bus: this.bus, visible: this.pageVisible(EfbPages.Performance), communicationsManager: this.communicationsManager, store: this.store }),
            FSComponent.buildComponent(EfbMainMenuPage, { bus: this.bus, visible: this.pageVisible(EfbPages.MainMenu), store: this.store, communicationsManager: this.communicationsManager, onPageSelect: (page) => this.visiblePage.set(page) })));
    }
    /** @inheritdoc */
    onGameStateChanged() {
        // noop
    }
    /** @inheritdoc */
    onFlightStart() {
        // noop
    }
    /** @inheritdoc */
    onSoundEnd() {
        // noop
    }
    /** @inheritdoc */
    onInteractionEvent(hEvent) {
        this.hEventPublisher.dispatchHEvent(hEvent[0]);
    }
    /** @inheritdoc */
    Update() {
        this.backplane.onUpdate();
    }
}

/// <reference types="@microsoft/msfs-types/js/common" />
/**
 * A Boeing 787-10 EFB BaseInstrument.
 */
class HSB789_EFB extends FsBaseInstrument {
    /** @inheritdoc */
    get isInteractive() {
        return true;
    }
    /** @inheritdoc */
    constructInstrument() {
        return new WTB78xEfbInstrument(this);
    }
    /** @inheritdoc */
    get templateID() {
        return 'HSB789_EFB';
    }
}
registerInstrument('wtb78x-efb', HSB789_EFB);
