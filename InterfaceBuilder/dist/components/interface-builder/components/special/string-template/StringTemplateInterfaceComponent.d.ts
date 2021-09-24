import React from "react";
import { BaseInterfaceComponent, ComponentDefinition } from "../../base/BaseInterfaceComponent";
import { StringTemplateInterfaceComponentProps, StringTemplateInterfaceComponentState } from "./types";
export declare class StringTemplateInterfaceComponent extends BaseInterfaceComponent<StringTemplateInterfaceComponentProps, StringTemplateInterfaceComponentState> {
    constructor(props: StringTemplateInterfaceComponentProps);
    static defaultProps: {
        userInterfaceData: {};
        valueKey: string;
        showBorder: boolean;
    };
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        description: string;
        iconComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
        componentDefinition: {
            component: string;
            components: never[];
        };
    };
    static manageForm: (...extend: (Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps> | Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    componentDidMount(): void;
    handleChangeData: (nextState: object) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=StringTemplateInterfaceComponent.d.ts.map