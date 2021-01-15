import moment from "moment"
import { tryCatch } from "fp-ts/lib/Either"
import { cloneDeep, merge, sortBy, isEmpty } from "lodash/fp"
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
    if (isEmpty(dataRow)) {
      return {}
    }
    /*
     *  Iterate on the columns
     */
    columns.forEach(({ field, type }) => {
      if (field) {
        const value = dataRow[field]
        if ((typeof value === "string" || typeof value === "number") && ["date", "dateTime"].includes(type || "")) {
          // Date type columns must appear as JS Date objects, not strings
          dataRow[field] = moment(value).toDate() as any
        } else if (field[0] === "=") {
          const calculationString = field.substring(1)

          const evald = tryCatch(() => {
            const interpolatedCalculationString = sortBy(
              ([key, value]) => key && key.length,
              Object.entries(dataRow)
            ).reduce((acc: string, [key, value]) => acc.replace(key, String(value)), calculationString)

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
export function getUsableColumns(columns: ColumnModel[], useSmallFont?: boolean) {
  // const destructureFunction = (content: string) => `({${fields.join(", ")}}) => ${content}`
  /* #################################################################
   *
   * ITERATING THROUGH COLUMNS
   * Add any per-column logic here so we only traverse columns once.
   *
   * #################################################################
   */
  return cloneDeep(columns).map((column) => {
    const col = column as EnrichedColumnDefinition
    const classNames: string[] = []
    // Intentionally mutating a clon e

    // Default should be to NOT allow HTML rendering. That's a terrible practice.
    if (typeof col.disableHtmlEncode === "undefined" || col.disableHtmlEncode === null) {
      col.disableHtmlEncode = !col.allowHTMLText
    }

    // Remove cell padding option
    if (col.removeCellPadding) {
      classNames.push("opg-remove-cell-padding")
    }

    // Narrow width columns
    if (col.maxWidth) {
      // col.headerText = col.headerText && col.headerText.replace(/(\sw\/)|(\/)/g, "$1 $2")
      classNames.push("opg-narrow-header")
    }

    // Small Font
    if (useSmallFont) {
      classNames.push("opg-small-font")
    }

    // Add CSS Classes
    col.customAttributes = merge({ class: classNames }, col.customAttributes || {})

    // DATE COLUMN
    // Managing custom formatting options for Dates
    if (["date", "dateTime"].includes(col.type || "")) {
      col.format =
        col.skeletonFormat === "custom"
          ? { type: col.type, format: col.customFormat }
          : { type: col.type, skeleton: col.skeletonFormat || "short" }
      delete col.type
    }

    // BOOLEAN COLUMN
    // Managing custom formatting options for Booleans
    if (["boolean"].includes(col.type || "")) {
      col.displayAsCheckBox = true
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

/**
 *
 * @param columns
 * @param data
 */
export const count = (columns: EnrichedColumnDefinition[], data: JSONRecord[]) => {
  return columns.reduce((acc, column) => {
    if (column.field) {
      data.forEach((row) => {
        if (column.field) {
          const rowValue = row[column.field]
          if (
            (column.type === "number" && typeof rowValue === "number" && !isNaN(rowValue)) ||
            (column.type === "string" && typeof rowValue === "string" && rowValue) ||
            (column.type === "boolean" && typeof rowValue === "boolean") ||
            (column.type === "date" && rowValue) ||
            (column.type === "datetime" && rowValue)
          ) {
            if (!acc[column.field]) {
              acc[column.field] = 0
            }
            acc[column.field]++
          }
        }
      })
    }

    return acc
  }, {} as { [key: string]: number })
}

/**
 *
 * @param columns
 * @param data
 * @param counts
 */
export const average = (
  columns: EnrichedColumnDefinition[],
  data: JSONRecord[],
  counts?: { [key: string]: number }
) => {
  const dataCounts = counts || count(columns, data)

  return columns.reduce((acc, column) => {
    if (column.field) {
      data.forEach((row) => {
        if (column.field) {
          const rowValue = row[column.field]
          if (typeof rowValue === "number" && !isNaN(rowValue)) {
            if (!acc[column.field]) {
              acc[column.field] = 0
            }
            acc[column.field] += rowValue / dataCounts[column.field]
          }
        }
      })
    }

    return acc
  }, {} as { [key: string]: number })
}

/**
 *
 * @param data
 */
export const flattenDataItems = (data: any[] | { items: any[] } | any) => {
  if (Array.isArray(data) || Array.isArray(data.items)) {
    return (Array.isArray(data) ? data : data.items).flatMap(flattenDataItems)
  }
  return data
}
