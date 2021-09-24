import { InputProps } from "antd/lib/input";
import React from "react";
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
export interface InputInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "input";
    defaultValue?: string;
    onChangeData: UserInterfaceProps["onChangeData"];
    placeholder?: string;
    userInterfaceData: UserInterfaceProps["data"];
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
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
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