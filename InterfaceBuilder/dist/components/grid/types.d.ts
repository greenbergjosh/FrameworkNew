/// <reference types="react" />
import { AggregateType, ColumnModel, CustomSummaryType, GridComponent, GroupSettingsModel, PageSettingsModel, SortSettingsModel } from "@syncfusion/ej2-react-grids";
import { JSONRecord } from "components/interface-builder/@types/JSONTypes";
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT";
export interface StandardGridComponentProps {
    allowAdding?: boolean;
    allowDeleting?: boolean;
    allowEditing?: boolean;
    autoFitColumns?: boolean;
    useSmallFont?: boolean;
    enableAltRow?: boolean;
    enableVirtualization?: boolean;
    height?: number;
    columns: EnrichedColumnDefinition[];
    contextData?: JSONRecord;
    data: JSONRecord[];
    defaultCollapseAll?: boolean;
    detailTemplate?: string | Function | any;
    groupSettings?: GroupSettingsModel;
    pageSettings?: PageSettingsModel;
    sortSettings?: SortSettingsModel;
    ref?: React.RefObject<GridComponent>;
}
declare type DataMapOption = {
    key: string;
    value: string;
};
/**
 * NOTE:
 * Syncfusion grid does not type or document that "template" accepts React JSX Elements.
 * So we omit the original property and redefine it below.
 */
export interface EnrichedColumnDefinition extends Omit<ColumnModel, "template"> {
    allowHTMLText?: boolean;
    aggregationFunction?: AggregateType;
    customAggregateId?: string;
    customAggregateFunction?: CustomAggregateFunction;
    customAggregateOptions?: DataMapOption[];
    customFormat?: string;
    removeCellPadding?: boolean;
    skeletonFormat: "short" | "medium" | "long" | "full" | "custom";
    precision?: number;
    visibilityConditions?: JSONObject;
    cellFormatter?: string;
    cellFormatterOptions?: DataMapOption[];
    template: ColumnModel["template"] | ((rowData: JSONRecord) => JSX.Element | null);
}
export declare type CustomAggregateFunctions = {
    [key: string]: CustomSummaryType;
};
export declare type CustomAggregateFunction = (usableColumns: EnrichedColumnDefinition[], columnCounts: {
    [p: string]: number;
}, options?: any) => CustomSummaryType;
export {};
//# sourceMappingURL=types.d.ts.map