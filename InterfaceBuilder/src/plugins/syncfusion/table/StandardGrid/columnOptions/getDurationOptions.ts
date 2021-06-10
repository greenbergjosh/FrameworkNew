import { ColumnOptions, EnrichedColumnDefinition } from "../types"
import { JSONRecord } from "globalTypes/JSONTypes"
import moment from "moment"
import { isUndefined } from "lodash/fp"
import { durationFormats, DurationUnits } from "../../../../../lib/valueFormatter"

/**
 * DURATION COLUMN: Managing custom formatting options for Durations
 * https://ej2.syncfusion.com/react/documentation/common/internationalization/#custom-formats
 * @param units
 * @param precision
 */
export function getDurationOptions(units: DurationUnits, precision = 0): ColumnOptions {
  return {
    options: {
      type: "string",
      formatter: (column: EnrichedColumnDefinition, data: JSONRecord) => {
        const value = column.field && data[column.field]

        if (!isUndefined(value) && typeof value === "number") {
          const d = moment.duration(value, units.source)
          const formatter = durationFormats[units.target]
          if (typeof formatter === "function") {
            return formatter(d, precision)
          }
          return durationFormats.default(d, precision)
        }
      },
    },
    keysToDelete: ["units", "type"],
  }
}
