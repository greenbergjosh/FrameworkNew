import React from "react";
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
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
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    constructor(props: TextAreaInterfaceComponentProps);
    handleChange: ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=TextAreaInterfaceComponent.d.ts.map