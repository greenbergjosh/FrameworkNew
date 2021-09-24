import React from "react";
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent";
import { DownloadInterfaceComponentProps, DownloadInterfaceComponentState } from "components/interface-builder/components/form/download/types";
export declare class DownloadInterfaceComponent extends BaseInterfaceComponent<DownloadInterfaceComponentProps, DownloadInterfaceComponentState> {
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        formControl: boolean;
        componentDefinition: {
            component: string;
        };
    };
    static manageForm: (...extend: (Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps> | Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
    constructor(props: DownloadInterfaceComponentProps);
    handleClick: ({ target }: React.MouseEvent<HTMLInputElement>) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=DownloadInterfaceComponent.d.ts.map