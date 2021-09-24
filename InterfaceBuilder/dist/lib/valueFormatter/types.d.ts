import { JSONArray, JSONRecord } from "../../globalTypes/JSONTypes";
export declare type CoerceableDataType = "number" | "date" | "duration";
export declare type DataType = string | number | boolean | Date | JSONRecord | JSONArray | undefined | null;
export declare const DURATION_UNITS: {
    milliseconds: string;
    seconds: string;
    minutes: string;
    hours: string;
    days: string;
    weeks: string;
    months: string;
    years: string;
    durationLargestUnit: string;
    durationMixedUnit: string;
};
export declare type DurationUnits = {
    source: "milliseconds" | "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years";
    target: "milliseconds" | "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years" | "durationLargestUnit" | "durationMixedUnit";
};
//# sourceMappingURL=types.d.ts.map