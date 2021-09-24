import React from "react";
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { separator } from "./codec";
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
export interface BulkTextInputInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "bulk-text-input";
    defaultValue: string;
    onChangeData: UserInterfaceProps["onChangeData"];
    placeholder: string;
    userInterfaceData: UserInterfaceProps["data"];
    valueKey: string;
    autosize?: boolean;
    minRows?: number;
    maxRows?: number;
    itemSeparator: separator;
    newlinePlaceholder: string;
    commaPlaceholder: string;
}
export declare class BulkTextInputInterfaceComponent extends BaseInterfaceComponent<BulkTextInputInterfaceComponentProps> {
    static defaultProps: {
        valueKey: string;
        defaultValue: string;
        placeholder: string;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    constructor(props: BulkTextInputInterfaceComponentProps);
    handleChange: ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=BulkTextInputInterfaceComponent.d.ts.map