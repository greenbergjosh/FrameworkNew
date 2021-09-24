import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
export interface CheckboxInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "checkbox";
    defaultValue?: boolean;
    onChangeData: UserInterfaceProps["onChangeData"];
    placeholder: string;
    userInterfaceData: UserInterfaceProps["data"];
    valueKey: string;
    disabled: boolean;
}
interface CheckboxInterfaceComponentState {
    value: boolean;
}
export declare class CheckboxInterfaceComponent extends BaseInterfaceComponent<CheckboxInterfaceComponentProps, CheckboxInterfaceComponentState> {
    static defaultProps: {
        valueKey: string;
        defaultValue: boolean;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    constructor(props: CheckboxInterfaceComponentProps);
    handleChange: ({ target: { checked } }: CheckboxChangeEvent) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=CheckboxInterfaceComponent.d.ts.map