import React from "react";
import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
export interface PasswordInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "password";
    defaultValue?: string;
    onChangeData: UserInterfaceProps["onChangeData"];
    placeholder: string;
    userInterfaceData: UserInterfaceProps["data"];
    valueKey: string;
    hasShowPasswordToggle?: boolean;
}
export declare class PasswordInterfaceComponent extends BaseInterfaceComponent<PasswordInterfaceComponentProps> {
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
    constructor(props: PasswordInterfaceComponentProps);
    handleChange: ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=PasswordInterfaceComponent.d.ts.map