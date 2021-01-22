import { EnrichedColumnDefinition } from "components/grid/types"
import { ColumnModel } from "@syncfusion/ej2-react-grids"
import { cloneDeep, merge, omit } from "lodash/fp"

/**
 * Defines the schema of columns. Add custom cell formatters, row detail templates, and aggregate functions.
 * Despite this being a bit odd in React, we only get one chance
 * at creating the columns array with the SyncFusion Grid.
 * We memoize it the first time, and then we can never regenerate columns
 * or else we'll get tons of exceptions in the grid.
 * @param data
 * @param columns
 * @param useSmallFont
 */
export function getUsableColumns(
  columns: EnrichedColumnDefinition[],
  useSmallFont?: boolean
): EnrichedColumnDefinition[] {
  return columns.map(
    (column): EnrichedColumnDefinition => {
      const disableHtmlEncodeOptions = getDisableHtmlEncodeOptions(column.disableHtmlEncode, column.allowHTMLText)
      const styleOptions = getStyleOptions(
        column.removeCellPadding,
        column.maxWidth,
        column.customFormat,
        column.customAttributes,
        useSmallFont
      )
      const dateOptions = getDateOptions(column.type, column.skeletonFormat, column.customFormat)
      const booleanOptions = getBooleanOptions(column.type)
      const numberOptions = getNumberOptions(column.type, column.format, column.precision)
      const customCellFormatter = { disableHtmlEncode: false, formatter: column.formatter }

      /*
       * SyncFusion seems to read "customFormat" when present, even though it's not documented.
       * So we delete the property; otherwise, it will produce undesired results.
       */
      const fixedColumn = omit(
        [...dateOptions.keysToDelete, "customFormat"],
        cloneDeep(column)
      ) as EnrichedColumnDefinition

      return {
        ...fixedColumn,
        ...disableHtmlEncodeOptions,
        ...styleOptions,
        ...booleanOptions,
        ...numberOptions,
        ...customCellFormatter,
      }
    }
  )
}

/**
 *
 * @param disableHtmlEncode
 * @param allowHTMLText
 */
function getDisableHtmlEncodeOptions(
  disableHtmlEncode: EnrichedColumnDefinition["disableHtmlEncode"],
  allowHTMLText: EnrichedColumnDefinition["allowHTMLText"]
): Partial<ColumnModel> | undefined {
  // Default should be to NOT allow HTML rendering. That's a terrible practice.
  const isDisableHtmlEncode =
    typeof disableHtmlEncode === "undefined" || disableHtmlEncode === null ? !allowHTMLText : disableHtmlEncode
  return {
    disableHtmlEncode: isDisableHtmlEncode,
  }
}

/**
 *
 * @param removeCellPadding
 * @param maxWidth
 * @param customFormat
 * @param customAttributes
 * @param useSmallFont
 */
function getStyleOptions(
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

/**
 * DATE COLUMN: Managing custom formatting options for Dates
 * @param type
 * @param skeletonFormat
 * @param customFormat
 */
function getDateOptions(
  type: EnrichedColumnDefinition["type"],
  skeletonFormat: EnrichedColumnDefinition["skeletonFormat"],
  customFormat: EnrichedColumnDefinition["customFormat"]
): { options: Partial<ColumnModel>; keysToDelete: string[] } {
  if (["date", "dateTime"].includes(type || "")) {
    const format =
      skeletonFormat === "custom" ? { type, format: customFormat } : { type, skeleton: skeletonFormat || "short" }
    return { options: { format }, keysToDelete: ["type"] }
  }
  return { options: {}, keysToDelete: [] }
}

/**
 * BOOLEAN COLUMN: Managing custom formatting options for Booleans
 * @param type
 */
function getBooleanOptions(type: EnrichedColumnDefinition["type"]): Partial<ColumnModel> | undefined {
  if (["boolean"].includes(type || "")) {
    return { displayAsCheckBox: true }
  }
}

/**
 * NUMBER COLUMN: Managing custom formatting options for number types
 * @param type
 * @param format
 * @param precision
 */
function getNumberOptions(
  type: EnrichedColumnDefinition["type"],
  format: EnrichedColumnDefinition["format"],
  precision: EnrichedColumnDefinition["precision"]
): Partial<ColumnModel> | undefined {
  if (["number"].includes(type || "")) {
    let newFormat
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
    return { textAlign: "Right", headerTextAlign: "Left", format: newFormat }
  }
}
