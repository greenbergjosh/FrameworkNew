import { formatNumber } from "./formatNumber"
import { formatDate } from "./formatDate"
import { formatDuration, isDuration } from "./formatDuration"
import { isArray, isDate } from "lodash/fp"
import { CoerceableDataType, DataType, DurationUnits } from "./types"

export type { DurationUnits }
export { durationFormats } from "./formatDuration"

/**
 *
 * @param coerceToType
 * @param rawFormat (e.g., "P2")
 * @param rawValue
 */
export function formatValue(rawValue: DataType, rawFormat?: string, coerceToType?: CoerceableDataType): string | null {
  switch (coerceToType) {
    case "number":
      if (isDuration(rawFormat)) {
        return formatDuration(rawValue, rawFormat)
      }
      return formatNumber(rawValue, rawFormat)
    case "date":
      return formatDate(rawValue, rawFormat)
    case "duration":
      return formatDuration(rawValue, rawFormat)
  }

  switch (typeof rawValue) {
    case "boolean":
      return rawValue.toString()
    case "number":
      if (isDuration(rawFormat)) {
        return formatDuration(rawValue, rawFormat)
      }
      return formatNumber(rawValue, rawFormat)
    case "object":
      // Could be JSONRecord, Array, Date
      if (isArray(rawValue)) {
        return rawValue.join(", ")
      }
      if (isDate(rawValue)) {
        return formatDate(rawValue, rawFormat)
      }
      break
    case "string":
      // Could be date, string, number, boolean, etc. -- check format for expected type
      return rawValue
  }

  return null
}
