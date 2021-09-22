import { AggregateColumnModel } from "@syncfusion/ej2-react-grids"
import { count, flattenDataItems } from "../utils"
import { EnrichedColumnDefinition } from "../types"

/**
 * Custom Null Count Aggregate
 * @param usableColumns
 * @param columnCounts
 */
export default function getCustomNullCountAggregate(
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
