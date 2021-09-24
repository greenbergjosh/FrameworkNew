import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
export interface CheckboxInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "checkbox";
    defaultValue?: boolean;
    onChangeData: UserInterfaceProps["onChangeData"];
    placeholder: string;
    userInterfaceData: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
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
    constructor(props: CheckboxInterfaceComponentProps);
    handleChange: ({ target: { checked } }: CheckboxChangeEvent) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=CheckboxInterfaceComponent.d.ts.map