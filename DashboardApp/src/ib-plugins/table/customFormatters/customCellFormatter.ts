import { StandardGridTypes } from "@opg/interface-builder-plugins/lib/syncfusion/table"
import { AppSelectors } from "../../../state/store.types"
import * as record from "fp-ts/lib/Record"
import JSON5 from "json5"
import { tryCatch } from "fp-ts/lib/Option"
import { JSONRecord } from "../../../lib/JSONRecord"

/*
 * cellFormatterQueryParams.queryParams
 * We set a reference pointer to the current query params value.
 * Because the cell formatter is passed to the grid when it is first created,
 * the current query params can't be known since the user hasn't set them yet.
 */
export const cellFormatterQueryParams: { queryParams?: JSONRecord } = { queryParams: {} }

/**
 * Render a formatted string (that may include HTML) into a cell.
 * User must provide an Remote Config LBM Javascript function that returns html for the cell.
 * @param columnType
 * @param formatter
 * @param cellFormatter
 * @param cellFormatterOptions
 * @param configsById
 * @param queryParams
 */
export function getCustomCellFormatter({
  cellFormatter,
  cellFormatterOptions,
  columnType,
  configsById,
  formatter,
  queryParams,
}: {
  cellFormatter: StandardGridTypes.EnrichedColumnDefinition["cellFormatter"]
  cellFormatterOptions: StandardGridTypes.EnrichedColumnDefinition["cellFormatterOptions"]
  columnType: StandardGridTypes.EnrichedColumnDefinition["type"]
  configsById: ReturnType<AppSelectors["globalConfig"]["configsById"]>
  formatter: StandardGridTypes.EnrichedColumnDefinition["formatter"]
  queryParams?: JSONRecord
}): StandardGridTypes.EnrichedColumnDefinition["formatter"] {
  if (!cellFormatter && columnType === "layout") return

  // See note above for cellFormatterQueryParams
  cellFormatterQueryParams.queryParams = queryParams

  if (formatter) {
    // We already have the formatter, and SyncfusionGrid won't take updates once created.
    return
  }

  const remoteConfig = cellFormatter && record.lookup(cellFormatter, configsById).toUndefined()
  if (remoteConfig && remoteConfig.config) {
    // Retrieve formatter
    const { code } = JSON5.parse(remoteConfig.config.getOrElse(""))
    const formatter = tryCatch(() => new Function(code)()).toNullable()

    /*
     * Cell Formatter Options
     * An associative array containing mapped KVP. Used to pass config provided
     * variables to the LBM formatter function. Here we convert options data-map
     * array to an object.
     */
    const options =
      cellFormatterOptions &&
      cellFormatterOptions.reduce((acc: any, item) => {
        return { ...acc, [item.key]: item.value }
      }, {})

    if (typeof formatter === "function") {
      return (column: StandardGridTypes.EnrichedColumnDefinition, data: any) => {
        /*
         * Wrap the LBM with a try-catch because the LBM may have a bug,
         * and also LBMs use column.formatFn(value) which will throw
         * if the value is null.x
         */
        try {
          // Partially apply formatter function with options and query params.
          return formatter(column, data, options, cellFormatterQueryParams.queryParams)
        } catch (e) {
          return ""
        }
      }
    }
  }
}
