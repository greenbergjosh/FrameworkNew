import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinition, ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
export interface DataMapInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "data-map";
    count?: number;
    defaultValue: any[];
    keyComponent: ComponentDefinition;
    multiple?: boolean;
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData: UserInterfaceProps["data"];
    valueComponent: ComponentDefinition;
    valueKey: string;
}
interface DataMapInterfaceComponentState {
}
export declare class DataMapInterfaceComponent extends BaseInterfaceComponent<DataMapInterfaceComponentProps, DataMapInterfaceComponentState> {
    static defaultProps: {
        keyComponent: {
            hideLabel: boolean;
            label: string;
            component: string;
            valueKey: string;
        };
        multiple: boolean;
        valueComponent: {
            hideLabel: boolean;
            label: string;
            component: string;
            valueKey: string;
        };
        valueKey: string;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=DataMapInterfaceComponent.d.ts.map