import {
  AggregateColumnModel,
  AggregateRowModel,
  AggregateType,
  ColumnModel,
  CustomSummaryType,
} from "@syncfusion/ej2-react-grids"
import { sanitizeText } from "@opg/interface-builder"
import { CustomAggregateFunctions, EnrichedColumnDefinition } from "../types"
import { isEmpty } from "lodash/fp"

export function getCustomAggregateFunction(
  aggregationFunction: EnrichedColumnDefinition["aggregationFunction"],
  customAggregateFunction: EnrichedColumnDefinition["customAggregateFunction"],
  customAggregateId: EnrichedColumnDefinition["customAggregateId"],
  field: EnrichedColumnDefinition["field"],
  customAggregateFunctions: CustomAggregateFunctions
): CustomSummaryType {
  let fn: CustomSummaryType
  if (aggregationFunction === "Custom" && customAggregateFunction && customAggregateId) {
    // Custom function from cache
    fn = customAggregateFunctions[getCustomAggregateFunctionKey(customAggregateId, field)]
  } else {
    // Library provided custom function
    fn = customAggregateFunctions[aggregationFunction!]
  }
  return fn
}

export function getCustomAggregateFunctionKey(
  customAggregateId: EnrichedColumnDefinition["customAggregateId"],
  field: EnrichedColumnDefinition["field"]
): string {
  return `${customAggregateId}_${field}`
}

/**
 * Create an AggregateColumn
 * @param aggregateType
 * @param field
 * @param format
 * @param customAggregateFunction
 */
function getAggregateColumn(
  aggregateType: AggregateType,
  field: ColumnModel["field"],
  format: ColumnModel["format"],
  customAggregateFunction: CustomSummaryType
): AggregateColumnModel {
  const isCustom = aggregateType.startsWith("Custom")
  const defaultedFormat = ["Count", "TrueCount", "FalseCount", "CustomValueCount", "CustomNullCount"].includes(
    aggregateType
  )
    ? "N0"
    : format
  const templateToken = `\${${isCustom ? "Custom" : aggregateType}}`
  const template = `<span title="${sanitizeText(aggregateType)}">${templateToken}</span>`
  return {
    field,
    type: [isCustom ? "Custom" : aggregateType],
    format: defaultedFormat,
    customAggregate: customAggregateFunction,
    footerTemplate: template,
    groupCaptionTemplate: template,
  }
}

/**
 * Create AggregateRows from columns that have aggregate functions
 * @param usableColumns
 * @param customAggregateFunctions
 * @return AggregateRowModel[]
 */
export default function getAggregateRows(
  usableColumns: EnrichedColumnDefinition[],
  customAggregateFunctions: CustomAggregateFunctions
): AggregateRowModel[] {
  const aggregateColumns = usableColumns.reduce((acc, col) => {
    if (col.aggregationFunction) {
      const customAggregateFunction = getCustomAggregateFunction(
        col.aggregationFunction,
        col.customAggregateFunction,
        col.customAggregateId,
        col.field,
        customAggregateFunctions
      )
      const aggregateColumn = getAggregateColumn(
        col.aggregationFunction, // aka: aggregateType
        col.field,
        col.format,
        customAggregateFunction // type: (column, data) => string
      )
      if (aggregateColumn) {
        acc.push(aggregateColumn)
      }
    }
    return acc
  }, [] as AggregateColumnModel[])

  if (!isEmpty(aggregateColumns)) {
    return [{ columns: aggregateColumns }]
  }
  return []
}
