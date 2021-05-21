import { EnrichedColumnDefinition } from "../types"
import { ColumnModel } from "@syncfusion/ej2-react-grids"
import { merge } from "lodash/fp"

/**
 *
 * @param removeCellPadding
 * @param maxWidth
 * @param customFormat
 * @param customAttributes
 * @param useSmallFont
 */
export function getStyleOptions(
  removeCellPadding: EnrichedColumnDefinition["removeCellPadding"],
  maxWidth: EnrichedColumnDefinition["maxWidth"],
  customFormat: EnrichedColumnDefinition["customFormat"],
  customAttributes: EnrichedColumnDefinition["customAttributes"],
  useSmallFont?: boolean
): Partial<ColumnModel> {
  const classNames: string[] = []

  // Remove cell padding option
  if (removeCellPadding) {
    classNames.push("opg-remove-cell-padding")
  }

  // Narrow width columns
  if (maxWidth) {
    // col.headerText = col.headerText && col.headerText.replace(/(\sw\/)|(\/)/g, "$1 $2")
    classNames.push("opg-narrow-header")
  }

  // Small Font
  if (useSmallFont) {
    classNames.push("opg-small-font")
  }
  const newCustomAttributes = merge({ class: classNames }, customAttributes || {})
  return { customAttributes: newCustomAttributes }
}
