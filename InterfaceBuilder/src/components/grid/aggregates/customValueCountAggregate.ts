import { EnrichedColumnDefinition } from "../types"
import { AggregateColumnModel } from "@syncfusion/ej2-react-grids"
import { count, flattenDataItems } from "../utils"

/**
 * Custom Value Count Aggregate
 * @param usableColumns
 * @param columnCounts
 */
export default function getCustomValueCountAggregate(
  usableColumns: EnrichedColumnDefinition[],
  columnCounts: { [p: string]: number },
) {
  return (data: any, column: AggregateColumnModel) =>
    (!data.requestType && data.items
      ? count(
        usableColumns.filter(({ field }) => field === column.field),
        flattenDataItems(data),
      )
      : columnCounts)[column.field || column.columnName || ""]
}
