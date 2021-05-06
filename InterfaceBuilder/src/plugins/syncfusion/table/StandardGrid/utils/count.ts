import { EnrichedColumnDefinition } from "../../StandardGrid/types"
import { JSONRecord } from "../../../../../globalTypes/JSONTypes"

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
            (column.type === "datetime" && rowValue) ||
            (column.type === "duration" && rowValue)
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
