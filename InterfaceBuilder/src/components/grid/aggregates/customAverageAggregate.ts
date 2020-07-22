import { CustomAggregateFunction, EnrichedColumnDefinition } from "../types"
import { AggregateColumnModel } from "@syncfusion/ej2-react-grids"
import { average, flattenDataItems } from "../utils"

/**
 * Custom Average Aggregate
 * @param usableColumns
 * @param columnAverages
 */
export default function getCustomAverageAggregate(
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
