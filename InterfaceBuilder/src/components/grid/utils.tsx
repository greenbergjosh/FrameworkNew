import React from "react"
import moment from "moment"
import { tryCatch } from "fp-ts/lib/Either"
import { cloneDeep, merge, sortBy } from "lodash/fp"
import { ColumnModel } from "@syncfusion/ej2-react-grids"
import { evalExpression } from "components/interface-builder/lib/eval-expression"
import { JSONRecord } from "components/interface-builder/@types/JSONTypes"
import { EnrichedColumnDefinition } from "./types"

/**
 * Some data may have to be pre-processed in order not to cause the table to fail to render
 * @param data
 * @param columns
 */
export function getUsableData(data: JSONRecord[], columns: ColumnModel[]) {
  /*
   * Iterate on the data
   */
  return cloneDeep(data).map((dataRow) => {
    /*
     *  Iterate on the columns
     */
    columns.forEach(({ field, type }) => {
      if (field) {
        const value = dataRow[field]
        if (
          (typeof value === "string" || typeof value === "number") &&
          ["date", "dateTime"].includes(type || "")
        ) {
          // Date type columns must appear as JS Date objects, not strings
          dataRow[field] = moment(value).toDate() as any
        } else if (field[0] === "=") {
          const calculationString = field.substring(1)

          const evald = tryCatch(() => {
            const interpolatedCalculationString = sortBy(
              ([key, value]) => key && key.length,
              Object.entries(dataRow)
            ).reduce(
              (acc: string, [key, value]) => acc.replace(key, String(value)),
              calculationString
            )

            return evalExpression(interpolatedCalculationString)
          }).fold(
            (error) => (console.warn("StandardGrid.render", "usableData", field, error), 0) || null,
            (value) => (isNaN(value) || !isFinite(value) ? null : value)
          )

          dataRow[field] = evald
        }
      }
    })

    return dataRow
  })
}

/**
 * Defines the schema of dataSource.
 * Despite this being a bit odd in React, we only get one chance
 * at creating the columns array with the SyncFusion Grid.
 * We memoize it the first time, and then we can never regenerate columns
 * or else we'll get tons of exceptions in the grid.
 * @param columns
 */
export function getUsableColumns(columns: ColumnModel[]) {
  // const destructureFunction = (content: string) => `({${fields.join(", ")}}) => ${content}`
  return cloneDeep(columns).map((column) => {
    const col = column as EnrichedColumnDefinition
    // Intentionally mutating a clone

    // Default should be to NOT allow HTML rendering. That's a terrible practice.
    if (typeof col.disableHtmlEncode === "undefined" || col.disableHtmlEncode === null) {
      col.disableHtmlEncode = !col.allowHTMLText
    }

    // Remove cell padding option
    if (col.removeCellPadding) {
      col.customAttributes = merge({ class: "-remove-cell-padding" }, col.customAttributes || {})
    }

    // DATE COLUMN
    // Managing custom formatting options for Dates
    if (["date", "dateTime"].includes(col.type || "")) {
      col.format =
        col.skeletonFormat === "custom"
          ? { type: col.type, format: col.customFormat }
          : { type: col.type, skeleton: col.skeletonFormat || "short" }
      delete col.type
    }

    // NUMBER COLUMN
    // Managing custom formatting options for number types
    else if (["number"].includes(col.type || "")) {
      col.textAlign = "Right"
      col.headerTextAlign = "Left"
      switch (col.format) {
        case "standard":
          col.format = `N${typeof col.precision === "number" ? col.precision : 2}`
          break
        case "percentage":
          col.format = `P${typeof col.precision === "number" ? col.precision : 2}`
          break
        case "currency":
          col.format = `C${typeof col.precision === "number" ? col.precision : 2}`
          break
        default:
          col.format = undefined
      }
    }

    // SyncFusion seems to read the customFormat, even though it's not documented
    delete col.customFormat

    return col
  })
}
