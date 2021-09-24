import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ColumnInterfaceComponentProps } from "./types";
import { LayoutDefinition } from "../../../globalTypes";
export declare class ColumnInterfaceComponent extends BaseInterfaceComponent<ColumnInterfaceComponentProps> {
    static defaultProps: {
        addItemLabel: string;
        columns: never[];
        gutter: number;
        userInterfaceData: {};
        valueKey: string;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    static getDefinitionDefaultValue({ columns }: ColumnInterfaceComponentProps): {};
    getDefaultValue: () => {};
    render(): JSX.Element;
}
//# sourceMappingURL=ColumnInterfaceComponent.d.ts.map