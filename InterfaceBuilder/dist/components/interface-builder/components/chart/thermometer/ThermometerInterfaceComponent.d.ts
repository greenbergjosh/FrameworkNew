import React from "react";
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent";
import { ThermometerInterfaceComponentProps, ThermometerInterfaceComponentState } from "./types";
export declare class ThermometerInterfaceComponent extends BaseInterfaceComponent<ThermometerInterfaceComponentProps, ThermometerInterfaceComponentState> {
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        iconComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
        componentDefinition: {
            component: string;
            label: string;
        };
    };
    static manageForm: (...extend: (Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps> | Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
    constructor(props: ThermometerInterfaceComponentProps);
    componentDidUpdate(prevProps: Readonly<ThermometerInterfaceComponentProps>, prevState: Readonly<{}>): void;
    render(): JSX.Element;
}
//# sourceMappingURL=ThermometerInterfaceComponent.d.ts.map