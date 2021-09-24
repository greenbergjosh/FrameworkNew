import { InputProps } from "antd/lib/input";
import React from "react";
import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
export interface InputInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "input";
    defaultValue?: string;
    onChangeData: UserInterfaceProps["onChangeData"];
    placeholder?: string;
    userInterfaceData: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
    valueKey: string;
    maxLength: number;
    size: InputProps["size"];
}
export declare class InputInterfaceComponent extends BaseInterfaceComponent<InputInterfaceComponentProps> {
    static defaultProps: {
        valueKey: string;
        defaultValue: string;
        placeholder: string;
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
    constructor(props: InputInterfaceComponentProps);
    /**
     * Public method for external clients to trigger a submit
     * @public
     */
    reset(): void;
    handleChange: ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=InputInterfaceComponent.d.ts.map