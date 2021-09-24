import { JSONArray, JSONRecord } from "../../globalTypes/JSONTypes"

export type CoerceableDataType = "number" | "date" | "duration"
export type DataType = string | number | boolean | Date | JSONRecord | JSONArray | undefined | null
export const DURATION_UNITS = {
  milliseconds: "milliseconds",
  seconds: "seconds",
  minutes: "minutes",
  hours: "hours",
  days: "days",
  weeks: "weeks",
  months: "months",
  years: "years",
  durationLargestUnit: "durationLargestUnit",
  durationMixedUnit: "durationMixedUnit",
}
export type DurationUnits = {
  source: "milliseconds" | "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years"
  target:
    | "milliseconds"
    | "seconds"
    | "minutes"
    | "hours"
    | "days"
    | "weeks"
    | "months"
    | "years"
    | "durationLargestUnit"
    | "durationMixedUnit"
}
