import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { TableInterfaceComponentProps, TableInterfaceComponentState } from "./types";
import { LayoutDefinition } from "../../../globalTypes";
export declare class TableInterfaceComponent extends BaseInterfaceComponent<TableInterfaceComponentProps, TableInterfaceComponentState> {
    constructor(props: TableInterfaceComponentProps);
    static defaultProps: {
        userInterfaceData: {};
        valueKey: string;
        showBorder: boolean;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    componentDidUpdate(prevProps: Readonly<TableInterfaceComponentProps>): void;
    render(): JSX.Element;
}
//# sourceMappingURL=TableInterfaceComponent.d.ts.map