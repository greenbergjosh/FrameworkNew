import moment from "moment"
import { isString, toNumber } from "lodash/fp"
import { DataType } from "./types"

type DurationFormatter = (value: moment.Duration, precision?: number) => string

/**
 *
 * @param rawValue
 * @param formatKey
 */
export function formatDuration(rawValue: DataType, formatKey?: string): string | null {
  const formatter = getDurationFormatter(formatKey)
  return formatter(moment.duration(toNumber(rawValue)))
}

export const durationFormats: {
  [key: string]: DurationFormatter
} = {
  milliseconds: (d: moment.Duration, p = 2) => format(d.asMilliseconds(), "ms", p),
  seconds: (d: moment.Duration, p = 2) => format(d.asSeconds(), "sec", p),
  minutes: (d: moment.Duration, p = 2) => format(d.asMinutes(), "min", p),
  hours: (d: moment.Duration, p = 2) => format(d.asHours(), "hours", p),
  days: (d: moment.Duration, p = 2) => format(d.asDays(), "days", p),
  weeks: (d: moment.Duration, p = 2) => format(d.asWeeks(), "weeks", p),
  months: (d: moment.Duration, p = 2) => format(d.asMonths(), "months", p),
  years: (d: moment.Duration, p = 2) => format(d.asYears(), "years", p),
  durationLargestUnit: (d: moment.Duration) => d.humanize(),
  durationMixedUnit: (d: moment.Duration, p = 2) => getMixedPhrase(d, p),
  default: (d: moment.Duration) => d.humanize(),
}

export function isDuration(formatKey = "default"): boolean {
  const keys = [
    "milliseconds",
    "seconds",
    "minutes",
    "hours",
    "days",
    "weeks",
    "months",
    "years",
    "durationLargestUnit",
    "durationMixedUnit",
  ]
  const key = keys.find((key) => formatKey.startsWith(key))
  return isString(key)
}

/**
 *
 * @param formatKey (e.g., "P2")
 */
export function getDurationFormatter(formatKey = "default"): DurationFormatter {
  const regex =
    /(?<units>milliseconds|seconds|minutes|hours|days|weeks|months|years|durationLargestUnit|durationMixedUnit)(?<precision>\d{0,2})/gm
  const match = regex.exec(formatKey)
  if (!match) {
    return durationFormats.default
  }

  const key: keyof typeof durationFormats | undefined = match.groups && match.groups.units
  const precision = match.groups && toNumber(match.groups.precision)
  const format: DurationFormatter | undefined = key ? durationFormats[key] : undefined

  if (typeof format === "function") {
    return (duration) => format(duration, precision)
  }
  return durationFormats.default
}

function format(duration: number, units: string, precision: number): string {
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
