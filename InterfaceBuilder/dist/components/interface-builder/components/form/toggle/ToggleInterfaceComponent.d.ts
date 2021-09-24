import { SwitchProps } from "antd/lib/switch";
import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
export interface ToggleInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "toggle";
    defaultValue?: boolean;
    inverted?: boolean;
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData?: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
    valueKey: string;
    size: SwitchProps["size"];
}
export declare class ToggleInterfaceComponent extends BaseInterfaceComponent<ToggleInterfaceComponentProps> {
    static defaultProps: {
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
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
    handleChange: (checked: boolean) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=ToggleInterfaceComponent.d.ts.map