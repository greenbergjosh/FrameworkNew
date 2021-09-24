import React from "react";
import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
export interface TextAreaInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "textarea";
    defaultValue?: string;
    onChangeData: UserInterfaceProps["onChangeData"];
    placeholder: string;
    userInterfaceData: UserInterfaceProps["data"];
    valueKey: string;
    autosize?: boolean;
    minRows?: number;
    maxRows?: number;
    maxLength?: number;
}
export declare class TextAreaInterfaceComponent extends BaseInterfaceComponent<TextAreaInterfaceComponentProps> {
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
    constructor(props: TextAreaInterfaceComponentProps);
    handleChange: ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=TextAreaInterfaceComponent.d.ts.map