export import NumberFormatOptions = Intl.NumberFormatOptions
import { toNumber } from "lodash/fp"
import { DataType } from "./types"

type NumberFormatter = (value: number, precision?: number) => string

/**
 *
 * @param rawValue
 * @param formatKey
 */
export function formatNumber(rawValue: DataType, formatKey?: string): string | null {
  const formatter = getNumberFormatter(formatKey)
  return formatter(toNumber(rawValue))
}

/*
 * https://docs.microsoft.com/en-us/dotnet/standard/base-types/standard-numeric-format-strings
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
 * https://v8.dev/features/intl-numberformat
 * https://www.javascripture.com/NumberFormat
 */
export const numberFormats: {
  [key: string]: NumberFormatOptions | NumberFormatter
} = {
  C: { style: "currency", currency: "USD" },
  c: { style: "currency", currency: "USD" },
  D: { style: "decimal" },
  d: { style: "decimal" },
  E: { notation: "engineering" }, // exponential
  e: { notation: "engineering" }, // exponential
  F: (n, p) => n.toFixed(p), // "fixed-point" -- handled by .toFixed(16)
  f: (n, p) => n.toFixed(p), // "fixed-point" -- handled by .toFixed(16)
  G: { style: "decimal" }, // general
  g: { style: "decimal" }, // general
  N: { style: "decimal" }, // number
  n: { style: "decimal" }, // number
  P: { style: "percent" },
  p: { style: "percent" },
  // R: { style: "round-trip" },
  // r: { style: "round-trip" },
  X: (n) => n.toString(16), // "hexadecimal" -- handled by .toString(16)
  x: (n) => n.toString(16), // "hexadecimal" -- handled by .toString(16)
  default: (n) => n.toLocaleString(),
}

/**
 *
 * @param formatKey (e.g., "P2")
 */
export function getNumberFormatter(formatKey = "default"): NumberFormatter {
  const key = formatKey.substring(0, 1) as keyof typeof numberFormats
  const format: Partial<NumberFormatOptions> | NumberFormatter | undefined = numberFormats[key]
  const precision = toNumber(formatKey.substring(1))

  if (typeof format === "function") {
    return format
  }
  const fractionalDigitsMinMax =
    precision > 0 ? { minimumFractionDigits: precision, maximumFractionDigits: precision } : undefined
  const opt = { ...format, ...fractionalDigitsMinMax }
  return (value) => new Intl.NumberFormat("en-US", opt).format(value)
}
