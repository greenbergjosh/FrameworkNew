import { JSONRecord } from "../../../globalTypes/JSONTypes";
import { EnrichedColumnDefinition } from "./StandardGrid/types";
import { ComponentDefinition, ComponentDefinitionNamedProps, IBaseInterfaceComponent, UserInterfaceProps } from "../../../globalTypes";
interface ColumnSortOptions {
    allowSorting?: boolean;
    sortDirection?: "Ascending" | "Descending";
    sortOrder?: number;
}
interface ColumnGroupOptions {
    allowGrouping?: boolean;
    groupOrder?: number;
}
export declare type SortableGroupableColumnModel = EnrichedColumnDefinition & ColumnSortOptions & ColumnGroupOptions;
export interface ITableInterfaceComponentProps extends ComponentDefinitionNamedProps {
    abstract?: boolean;
    columns: SortableGroupableColumnModel[];
    component: "table";
    showToolbar?: boolean;
    useSmallPager?: boolean;
    defaultCollapseAll?: boolean;
    autoFitColumns?: boolean;
    useSmallFont?: boolean;
    enableAltRow?: boolean;
    enableVirtualization?: boolean;
    height?: number;
    defaultPageSize?: number | string;
    loadingKey?: string;
    mode: UserInterfaceProps["mode"];
    onChangeData: UserInterfaceProps["onChangeData"];
    rowDetails?: ComponentDefinition[];
    userInterfaceData?: UserInterfaceProps["data"];
    valueKey: string;
}
export interface TableInterfaceComponentState {
    loading: boolean;
}
export interface TableInterfaceComponentDisplayModeProps extends ITableInterfaceComponentProps {
    mode: "display";
}
export interface TableInterfaceComponentEditModeProps extends ITableInterfaceComponentProps {
    mode: "edit";
    onChangeSchema?: (newSchema: ComponentDefinition) => void;
    userInterfaceSchema?: ComponentDefinition;
}
export declare type TableInterfaceComponentProps = TableInterfaceComponentDisplayModeProps | TableInterfaceComponentEditModeProps;
export declare function visiblityConditionType(type: string): JSONRecord;
export interface TableProps {
    getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"];
    setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"];
    getValue: IBaseInterfaceComponent["getValue"];
    onChangeSchema?: (newSchema: ComponentDefinition) => void;
    rowDetails?: ComponentDefinition[];
    setValue: IBaseInterfaceComponent["setValue"];
    userInterfaceData: UserInterfaceProps["data"];
    userInterfaceSchema?: ComponentDefinition;
    valueKey: string;
}
export interface DisplayTableProps extends TableProps {
    autoFitColumns?: boolean;
    columns: EnrichedColumnDefinition[];
    defaultCollapseAll?: boolean;
    defaultPageSize?: number | string;
    enableAltRow?: boolean;
    enableVirtualization?: boolean;
    height?: number;
    preview?: boolean;
    showToolbar?: boolean;
    useSmallFont?: boolean;
    useSmallPager?: boolean;
}
export interface AbstractTableProps extends TableProps {
}
export interface EditTableProps extends TableProps {
}
export {};
//# sourceMappingURL=types.d.ts.map