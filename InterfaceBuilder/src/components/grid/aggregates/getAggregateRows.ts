import {
  AggregateColumnModel,
  AggregateRowModel,
  ColumnModel,
  AggregateType,
  CustomSummaryType,
} from "@syncfusion/ej2-react-grids"
import { sanitizeText } from "components/interface-builder/lib/sanitize-text"
import { CustomAggregateFunctions, EnrichedColumnDefinition } from "components/grid/types"

export function getCustomAggregateFunction(
  usableColumn: EnrichedColumnDefinition,
  customAggregateFunctions: CustomAggregateFunctions
): CustomSummaryType {
  let customAggregateFunction: CustomSummaryType
  if (
    usableColumn.aggregationFunction === "Custom" &&
    usableColumn.customAggregateFunction &&
    usableColumn.customAggregateId
  ) {
    // Config provided custom function
    customAggregateFunction = customAggregateFunctions[getCustomAggregateFunctionKey(usableColumn)]
  } else {
    // Library provided custom function
    customAggregateFunction = customAggregateFunctions[usableColumn.aggregationFunction!]
  }
  return customAggregateFunction
}

export function getCustomAggregateFunctionKey(column: EnrichedColumnDefinition) {
  return `${column.customAggregateId}_${column.field}`
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
  const defaultedFormat = [
    "Count",
    "TrueCount",
    "FalseCount",
    "CustomValueCount",
    "CustomNullCount",
  ].includes(aggregateType)
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
      let customAggregateFunction = getCustomAggregateFunction(col, customAggregateFunctions)
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

  return [{ columns: aggregateColumns }]
}
