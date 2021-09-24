import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinition, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
export interface DataDictionaryInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "data-dictionary";
    defaultValue?: any;
    keyLabel?: string;
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
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
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        formControl: boolean;
        componentDefinition: {
            component: string;
        };
    };
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=DataDictionaryInterfaceComponent.d.ts.map