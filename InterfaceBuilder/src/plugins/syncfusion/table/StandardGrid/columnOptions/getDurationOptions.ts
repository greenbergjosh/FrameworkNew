import { ColumnOptions, EnrichedColumnDefinition } from "../types"
import { JSONRecord } from "globalTypes/JSONTypes"
import moment from "moment"
import { isUndefined } from "lodash/fp"

/**
 * DURATION COLUMN: Managing custom formatting options for Durations
 * https://ej2.syncfusion.com/react/documentation/common/internationalization/#custom-formats
 * @param units
 * @param precision
 */
export function getDurationOptions(units: EnrichedColumnDefinition["units"], precision = 0): ColumnOptions {
  return {
    options: {
      type: "string",
      formatter: (column: EnrichedColumnDefinition, data: JSONRecord) => {
        const value = column.field && data[column.field]
        let formattedValue = ""

        if (!isUndefined(value) && typeof value === "number") {
          const d = moment.duration(value, units.source)
          switch (units.target) {
            case "durationMixed":
              formattedValue = getMixedPhrase(d, precision)
              break
            case "durationLargestUnit":
              formattedValue = d.humanize()
              break
            case "years":
              formattedValue = format(d.asYears(), "years", precision)
              break
            case "months":
              formattedValue = format(d.asMonths(), "months", precision)
              break
            case "weeks":
              formattedValue = format(d.asWeeks(), "weeks", precision)
              break
            case "days":
              formattedValue = format(d.asDays(), "days", precision)
              break
            case "hours":
              formattedValue = format(d.asHours(), "hours", precision)
              break
            case "minutes":
              formattedValue = format(d.asMinutes(), "min", precision)
              break
            case "seconds":
              formattedValue = format(d.asSeconds(), "sec", precision)
              break
            case "milliseconds":
              formattedValue = format(d.asMilliseconds(), "ms", precision)
              break
          }
          return formattedValue
        }
      },
    },
    keysToDelete: ["units", "type"],
  }
}

function format(duration: number, units: string, precision: number) {
  const n = round(duration, precision)
  const ls = n.toLocaleString()
  return `${ls} ${units}`
}

function round(n: number, precision: number): number {
  const p = 10 ** precision
  return Math.round((n + Number.EPSILON) * p) / p
}

function getMixedPhrase(d: moment.Duration, precision: number): string {
  let a: string[] = []
  d.seconds() > 0 ? a.unshift(`${d.seconds()}s`) : void 0
  d.minutes() > 0 ? a.unshift(`${d.minutes()}m`) : void 0
  d.hours() > 0 ? a.unshift(`${d.hours()}h`) : void 0
  d.days() > 0 ? a.unshift(`${d.days()}d`) : void 0
  const hasDHMS = precision > 2 || precision === 0
  d.months() > 0 ? a.unshift(`${d.months()} months${a.length > 0 && hasDHMS ? "," : ""}`) : void 0
  d.years() > 0 ? a.unshift(`${d.years()} years${a.length > 0 ? "," : ""}`) : void 0
  if (precision > 0) {
    a = a.slice(0, precision)
  }
  return a.join(" ")
}
