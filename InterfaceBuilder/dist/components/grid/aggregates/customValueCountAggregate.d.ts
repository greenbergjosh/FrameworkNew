import { EnrichedColumnDefinition } from "../types";
import { AggregateColumnModel } from "@syncfusion/ej2-react-grids";
/**
 * Custom Value Count Aggregate
 * @param usableColumns
 * @param columnCounts
 */
export default function getCustomValueCountAggregate(usableColumns: EnrichedColumnDefinition[], columnCounts: {
    [p: string]: number;
}): (data: any, column: AggregateColumnModel) => number;
//# sourceMappingURL=customValueCountAggregate.d.ts.map