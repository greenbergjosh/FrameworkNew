import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinition, ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
export interface DataDictionaryInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "data-dictionary";
    defaultValue?: any;
    keyLabel?: string;
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData: UserInterfaceProps["data"];
    valueComponent: [ComponentDefinition];
    valueKey: string;
}
interface DataDictionaryInterfaceComponentState {
}
export declare class DataDictionaryInterfaceComponent extends BaseInterfaceComponent<DataDictionaryInterfaceComponentProps, DataDictionaryInterfaceComponentState> {
    static defaultProps: {
        keyLabel: string;
        valueComponent: {
            hideLabel: boolean;
            label: string;
            component: string;
            valueKey: string;
        }[];
        valueKey: string;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=DataDictionaryInterfaceComponent.d.ts.map