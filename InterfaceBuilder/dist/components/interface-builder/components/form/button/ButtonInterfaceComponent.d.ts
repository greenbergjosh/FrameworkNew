import React from "react";
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent";
import { ButtonInterfaceComponentProps, ButtonInterfaceComponentState } from "components/interface-builder/components/form/button/types";
export declare class ButtonInterfaceComponent extends BaseInterfaceComponent<ButtonInterfaceComponentProps, ButtonInterfaceComponentState> {
    static defaultProps: {
        valueKey: string;
    };
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
    static availableEvents: string[];
    constructor(props: ButtonInterfaceComponentProps);
    handleClick: (e: React.MouseEvent<HTMLInputElement>) => void;
    handleCloseConfirmation: ({ target }: React.MouseEvent<HTMLInputElement>) => void;
    handleConfirmationVisibleChange: (visible: boolean) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=ButtonInterfaceComponent.d.ts.map