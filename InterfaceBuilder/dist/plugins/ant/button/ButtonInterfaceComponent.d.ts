import React from "react";
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ButtonInterfaceComponentProps, ButtonInterfaceComponentState } from "../../../plugins/ant/button/types";
import { LayoutDefinition } from "../../../globalTypes";
export declare class ButtonInterfaceComponent extends BaseInterfaceComponent<ButtonInterfaceComponentProps, ButtonInterfaceComponentState> {
    static defaultProps: {
        valueKey: string;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    static availableEvents: string[];
    constructor(props: ButtonInterfaceComponentProps);
    handleClick: (e: React.MouseEvent<HTMLInputElement>) => void;
    handleCloseConfirmation: ({ target }: React.MouseEvent<HTMLInputElement>) => void;
    handleConfirmationVisibleChange: (visible: boolean) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=ButtonInterfaceComponent.d.ts.map