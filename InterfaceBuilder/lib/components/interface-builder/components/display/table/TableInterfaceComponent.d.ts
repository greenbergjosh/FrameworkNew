import { UserInterfaceProps } from "../../../UserInterface";
import { ColumnModel } from "@syncfusion/ej2-react-grids";
import { BaseInterfaceComponent, ComponentDefinition, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
interface ColumnSortOptions {
    allowSorting?: boolean;
    sortDirection?: "Ascending" | "Descending";
    sortOrder?: number;
}
interface ColumnGroupOptions {
    allowGrouping?: boolean;
    groupOrder?: number;
}
declare type ColumnConfig = ColumnModel & ColumnSortOptions & ColumnGroupOptions;
interface ITableInterfaceComponentProps extends ComponentDefinitionNamedProps {
    abstract?: boolean;
    allowAdding?: boolean;
    allowDeleting?: boolean;
    allowEditing?: boolean;
    columns: ColumnConfig[];
    component: "table";
    loadingKey?: string;
    mode: UserInterfaceProps["mode"];
    onChangeData: UserInterfaceProps["onChangeData"];
    rowDetails?: ComponentDefinition[];
    userInterfaceData?: UserInterfaceProps["data"];
    valueKey: string;
}
interface TableInterfaceComponentDisplayModeProps extends ITableInterfaceComponentProps {
    mode: "display";
}
interface TableInterfaceComponentEditModeProps extends ITableInterfaceComponentProps {
    mode: "edit";
    onChangeSchema?: (newSchema: ComponentDefinition) => void;
    userInterfaceSchema?: ComponentDefinition;
}
declare type TableInterfaceComponentProps = TableInterfaceComponentDisplayModeProps | TableInterfaceComponentEditModeProps;
export declare class TableInterfaceComponent extends BaseInterfaceComponent<TableInterfaceComponentProps> {
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        componentDefinition: {
            component: string;
            columns: never[];
            rowDetails: never[];
        };
    };
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=TableInterfaceComponent.d.ts.map