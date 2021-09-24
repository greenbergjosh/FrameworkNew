import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinition, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
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
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        formControl: boolean;
        componentDefinition: {
            component: string;
            label: string;
        };
    };
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=DataMapInterfaceComponent.d.ts.map