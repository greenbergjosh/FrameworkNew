import DateTimeFormatOptions = Intl.DateTimeFormatOptions
import { isDate } from "lodash/fp"
import { DataType } from "./types"

type DateTimeFormatter = (value: Date) => string

/**
 *
 * @param rawValue
 * @param formatKey
 */
export function formatDate(rawValue: DataType, formatKey?: string): string | null {
  const value = coerceDate(rawValue)
  if (value) {
    const formatter = getDateTimeFormatter(formatKey)
    return formatter(value)
  }
  return null
}

/*
 * https://docs.microsoft.com/en-us/dotnet/standard/base-types/standard-date-and-time-format-strings
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
 * https://www.javascripture.com/DateTimeFormat
 */
export const dateTimeFormats: {
  [key: string]: DateTimeFormatOptions | DateTimeFormatter
} = {
  d: {}, // "short date" -- 6/15/2009
  D: {
    // "long date" -- Monday, June 15, 2009
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  f: {
    // "Full date/time pattern (short time)" -- Monday, June 15, 2009 1:45 PM
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  },
  F: {
    // "Full date/time pattern (long time)" -- Monday, June 15, 2009 1:45:30 PM
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  },
  g: {
    // "General date/time pattern (short time)" -- 6/15/2009 1:45 PM
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  },
  G: {
    // "General date/time pattern (long time)" -- 6/15/2009 1:45:30 PM
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  },
  m: {
    // "Month/day pattern." -- June 15
    month: "long",
    day: "numeric",
  },
  M: {
    // "Month/day pattern." -- June 15
    month: "long",
    day: "numeric",
  },
  o: (d) => d.toISOString(), // round-trip date/time" -- 2009-06-15T13:45:30.0000000-07:00
  // O: {}, // round-trip date/time" },
  r: (d) => d.toUTCString(), // "RFC1123" -- Mon, 15 Jun 2009 20:45:30 GMT
  R: (d) => d.toUTCString(), // "RFC1123" -- Mon, 15 Jun 2009 20:45:30 GMT
  s: (d) => d.toISOString(), // Sortable date/time" -- 2009-06-15T13:45:30
  t: {
    // "Short time" -- 1:45 PM
    hour: "numeric",
    minute: "numeric",
  },
  T: {
    // "Long time" -- 1:45:30 PM
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  },
  u: (d) => d.toISOString(), // Universal sortable date/time" -- 2009-06-15 13:45:30Z
  // U: { dateStyle: "full", timeStyle: "long" }, // "Universal full date/time" -- Monday, June 15, 2009 8:45:30 PM
  y: {
    // "Year month" -- June 2009
    year: "numeric",
    month: "long",
  },
  Y: {
    // "Year month" -- June 2009
    year: "numeric",
    month: "long",
  },
  default: (d) => d.toLocaleString(),
}

/**
 *
 * @param formatKey (e.g., "D")
 */
export function getDateTimeFormatter(formatKey = "default"): DateTimeFormatter {
  const format = dateTimeFormats[formatKey as keyof typeof dateTimeFormats]
  if (typeof format === "function") {
    return format
  }
  return (value) => new Intl.DateTimeFormat("en-US", format).format(value)
}

export function coerceDate(rawValue: DataType): Date | null {
  if (isDate(rawValue)) {
    return rawValue
  }
  if (typeof rawValue === "string") {
    const d = new Date(rawValue)
    return isDate(d) ? d : null
  }
  return null
}
