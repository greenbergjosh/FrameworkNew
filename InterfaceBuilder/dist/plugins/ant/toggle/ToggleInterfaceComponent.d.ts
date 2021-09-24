import { SwitchProps } from "antd/lib/switch";
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
export interface ToggleInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "toggle";
    defaultValue?: boolean;
    inverted?: boolean;
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData: UserInterfaceProps["data"];
    valueKey: string;
    size: SwitchProps["size"];
}
export declare class ToggleInterfaceComponent extends BaseInterfaceComponent<ToggleInterfaceComponentProps> {
    static defaultProps: {
        valueKey: string;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    handleChange: (checked: boolean) => void;
    isChecked: () => boolean;
    render(): JSX.Element;
}
//# sourceMappingURL=ToggleInterfaceComponent.d.ts.map