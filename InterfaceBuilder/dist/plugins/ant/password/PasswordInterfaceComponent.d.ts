import React from "react";
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
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
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    constructor(props: PasswordInterfaceComponentProps);
    handleChange: ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=PasswordInterfaceComponent.d.ts.map