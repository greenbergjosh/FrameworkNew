import { AggregateRowModel, CustomSummaryType } from "@syncfusion/ej2-react-grids";
import { CustomAggregateFunctions, EnrichedColumnDefinition } from "../types";
export declare function getCustomAggregateFunction(aggregationFunction: EnrichedColumnDefinition["aggregationFunction"], customAggregateFunction: EnrichedColumnDefinition["customAggregateFunction"], customAggregateId: EnrichedColumnDefinition["customAggregateId"], field: EnrichedColumnDefinition["field"], customAggregateFunctions: CustomAggregateFunctions): CustomSummaryType;
export declare function getCustomAggregateFunctionKey(customAggregateId: EnrichedColumnDefinition["customAggregateId"], field: EnrichedColumnDefinition["field"]): string;
/**
 * Create AggregateRows from columns that have aggregate functions
 * @param usableColumns
 * @param customAggregateFunctions
 * @return AggregateRowModel[]
 */
export default function getAggregateRows(usableColumns: EnrichedColumnDefinition[], customAggregateFunctions: CustomAggregateFunctions): AggregateRowModel[];
//# sourceMappingURL=getAggregateRows.d.ts.map