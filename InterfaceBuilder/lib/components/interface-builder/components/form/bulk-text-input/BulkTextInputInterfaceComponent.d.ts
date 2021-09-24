import React from "react";
import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
import { separator } from "./codec";
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
    constructor(props: BulkTextInputInterfaceComponentProps);
    handleChange: ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=BulkTextInputInterfaceComponent.d.ts.map