import { EnrichedColumnDefinition } from "../types";
import { AggregateColumnModel } from "@syncfusion/ej2-react-grids";
/**
 * Custom Average Aggregate
 * @param usableColumns
 * @param columnAverages
 */
export default function getCustomAverageAggregate(usableColumns: EnrichedColumnDefinition[], columnAverages: {
    [p: string]: number;
}): (data: any, column: AggregateColumnModel) => number;
//# sourceMappingURL=customAverageAggregate.d.ts.map