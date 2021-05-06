import { ColumnOptions, EnrichedColumnDefinition } from "../types"
import { ColumnModel } from "@syncfusion/ej2-react-grids"

/**
 * NUMBER COLUMN: Managing custom formatting options for number types
 * https://ej2.syncfusion.com/react/documentation/common/internationalization/#number-formatting
 * @param format
 * @param precision
 */
export function getNumberOptions(
  format: EnrichedColumnDefinition["format"],
  precision: EnrichedColumnDefinition["precision"],
): ColumnOptions {
  let newFormat: ColumnModel["format"]
  switch (format) {
    case "standard":
      newFormat = `N${typeof precision === "number" ? precision : 2}`
      break
    case "percentage":
      newFormat = `P${typeof precision === "number" ? precision : 2}`
      break
    case "currency":
      newFormat = `C${typeof precision === "number" ? precision : 2}`
      break
    default:
      newFormat = undefined
  }
  return { options: { textAlign: "Right", headerTextAlign: "Left", format: newFormat }, keysToDelete: [] }
}
