import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent";
import { TableInterfaceComponentProps, TableInterfaceComponentState } from "./types";
export declare class TableInterfaceComponent extends BaseInterfaceComponent<TableInterfaceComponentProps, TableInterfaceComponentState> {
    constructor(props: TableInterfaceComponentProps);
    static defaultProps: {
        userInterfaceData: {};
        valueKey: string;
        showBorder: boolean;
    };
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
    static manageForm: (...extend: (Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps> | Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
    componentDidUpdate(prevProps: Readonly<TableInterfaceComponentProps>): void;
    render(): JSX.Element;
}
//# sourceMappingURL=TableInterfaceComponent.d.ts.map