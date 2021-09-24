import { EnrichedColumnDefinition } from "../types";
import { AggregateColumnModel } from "@syncfusion/ej2-react-grids";
/**
 * Custom Null Count Aggregate
 * @param usableColumns
 * @param columnCounts
 */
export default function getCustomNullCountAggregate(usableColumns: EnrichedColumnDefinition[], columnCounts: {
    [p: string]: number;
}): (data: any, column: AggregateColumnModel) => number;
//# sourceMappingURL=customNullCountAggregate.d.ts.map