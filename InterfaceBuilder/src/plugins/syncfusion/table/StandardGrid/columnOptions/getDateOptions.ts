import { ColumnOptions, EnrichedColumnDefinition } from "../types"
import { DateFormatOptions } from "@syncfusion/ej2-base"
import { ColumnModel } from "@syncfusion/ej2-grids"

/**
 * DATE COLUMN: Managing custom formatting options for Dates
 * https://ej2.syncfusion.com/react/documentation/common/internationalization/#custom-formats
 * @param type
 * @param skeletonFormat
 * @param customFormat
 */
export function getDateOptions(
  type: ColumnModel["type"],
  skeletonFormat: EnrichedColumnDefinition["skeletonFormat"],
  customFormat: EnrichedColumnDefinition["customFormat"]
): ColumnOptions {
  if (skeletonFormat === "custom") {
    const format: DateFormatOptions = { type, format: customFormat }
    return { options: { format }, keysToDelete: [] }
  }
  const format: DateFormatOptions = { type, skeleton: skeletonFormat || "short" }
  return {
    options: { format },
    keysToDelete: ["skeletonFormat", "type"],
  }
}
