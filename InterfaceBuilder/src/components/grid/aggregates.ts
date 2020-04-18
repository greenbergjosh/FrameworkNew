import { AggregateColumnModel, AggregateRowModel } from "@syncfusion/ej2-react-grids"
import { JSONRecord } from "../interface-builder/@types/JSONTypes"
import { sanitizeText } from "components/interface-builder/lib/sanitize-text"
import { CustomAggregateFunctions, EnrichedColumnDefinition } from "./types"

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
  } else return data
}

/**
 *
 * @param usableColumns
 * @param customAggregateFunctions
 */
export function getAggregates(
  usableColumns: EnrichedColumnDefinition[],
  customAggregateFunctions: CustomAggregateFunctions
) {
  return () =>
    [
      {
        columns: usableColumns.reduce((acc, col) => {
          const column = col as EnrichedColumnDefinition
          const { aggregationFunction } = column
          if (aggregationFunction) {
            const isCustom = aggregationFunction.startsWith("Custom")
            const format = [
              "Count",
              "TrueCount",
              "FalseCount",
              "CustomValueCount",
              "CustomNullCount",
            ].includes(aggregationFunction)
              ? "N0"
              : column.format

            const template = `<span title='${sanitizeText(aggregationFunction)}'>\${${
              isCustom ? "Custom" : aggregationFunction
            }}</span>`
            acc.push({
              field: column.field,
              type: [isCustom ? "Custom" : aggregationFunction],
              format,
              customAggregate: customAggregateFunctions[aggregationFunction],
              footerTemplate: template,
              groupCaptionTemplate: template,
            })
          }
          return acc
        }, [] as AggregateColumnModel[]),
      },
    ] as AggregateRowModel[]
}

/**
 * Custom Average Aggregate
 * @param usableColumns
 * @param columnAverages
 */
export function getCustomAverageAggregate(
  usableColumns: EnrichedColumnDefinition[],
  columnAverages: { [p: string]: number }
) {
  return (data: any, column: AggregateColumnModel) =>
    (!data.requestType && (data.items || Array.isArray(data))
      ? average(
          usableColumns.filter(({ field }) => field === column.field),
          flattenDataItems(data)
        )
      : columnAverages)[column.field || column.columnName || ""]
}

/**
 * Custom Value Count Aggregate
 * @param usableColumns
 * @param columnCounts
 */
export function getCustomValueCountAggregate(
  usableColumns: EnrichedColumnDefinition[],
  columnCounts: { [p: string]: number }
) {
  return (data: any, column: AggregateColumnModel) =>
    (!data.requestType && data.items
      ? count(
          usableColumns.filter(({ field }) => field === column.field),
          flattenDataItems(data)
        )
      : columnCounts)[column.field || column.columnName || ""]
}

/**
 * Custom Null Count Aggregate
 * @param usableColumns
 * @param columnCounts
 */
export function getCustomNullCountAggregate(
  usableColumns: EnrichedColumnDefinition[],
  columnCounts: { [p: string]: number }
) {
  return (data: any, column: AggregateColumnModel) =>
    data.count -
    (!data.requestType && data.items
      ? count(
          usableColumns.filter(({ field }) => field === column.field),
          flattenDataItems(data)
        )
      : columnCounts)[column.field || column.columnName || ""]
}
