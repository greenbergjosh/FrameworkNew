import { EnrichedColumnDefinition } from "../types"
import { cloneDeep, omit } from "lodash/fp"
import { getNumberOptions } from "./getNumberOptions.js"
import { getBooleanOptions } from "./getBooleanOptions.js"
import { getCustomCellFormatterOptions } from "./getCustomCellFormatterOptions.js"
import { getDateOptions } from "./getDateOptions"
import { getStyleOptions } from "./getStyleOptions.js"
import { getDisableHtmlEncodeOptions } from "./getDisableHtmlEncodeOptions.js"
import { getDurationOptions } from "./getDurationOptions.js"

/**
 * Defines the schema of columns. Add custom cell formatters, row detail templates, and aggregate functions.
 * Despite this being a bit odd in React, we only get one chance
 * at creating the columns array with the SyncFusion Grid.
 * We memoize it the first time, and then we can never regenerate columns
 * or else we'll get tons of exceptions in the grid.
 *
 * For Types see:
 * node_modules/@syncfusion/ej2-grids/src/grid/models/column.d.ts
 * node_modules/@syncfusion/ej2-base/src/internationalization.d.ts
 *
 * @param columns
 * @param useSmallFont
 */
export function getUsableColumns(
  columns: EnrichedColumnDefinition[],
  useSmallFont?: boolean
): EnrichedColumnDefinition[] {
  return columns.map(
    (column): EnrichedColumnDefinition => {
      /*
       * Common options
       */
      const disableHtmlEncodeOptions = getDisableHtmlEncodeOptions(column.disableHtmlEncode, column.allowHTMLText)
      const styleOptions = getStyleOptions(
        column.removeCellPadding,
        column.maxWidth,
        column.customFormat,
        column.customAttributes,
        useSmallFont
      )
      const customCellFormatterOptions = getCustomCellFormatterOptions(column.formatter)

      /*
       * Type Specific Options
       */
      let typeOptions
      switch (column.type) {
        case "date":
          typeOptions = getDateOptions("date", column.skeletonFormat, column.customFormat)
          break
        case "dateTime":
          typeOptions = getDateOptions("dateTime", column.skeletonFormat, column.customFormat)
          break
        case "duration":
          typeOptions = getDurationOptions(column.units, column.precision)
          break
        case "boolean":
          typeOptions = getBooleanOptions()
          break
        case "number":
          typeOptions = getNumberOptions(column.format, column.precision)
          break
        default:
          typeOptions = { options: {}, keysToDelete: [] }
      }

      /*
       * Merge and return ColumnDefinition
       */
      const fixedColumn = omit(
        [...typeOptions.keysToDelete, ...customCellFormatterOptions.keysToDelete],
        cloneDeep(column)
      ) as EnrichedColumnDefinition
      return {
        ...fixedColumn,
        ...disableHtmlEncodeOptions,
        ...styleOptions,
        ...typeOptions.options,
        ...customCellFormatterOptions.options,
      }
    }
  )
}
