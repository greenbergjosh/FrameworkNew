import React from "react";
import { UserInterfaceProps } from "../../../UserInterface";
import { buttonDisplayType, shapeType, sizeType } from "./button-manage-form";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
interface ConfirmationProps {
    title?: string;
    message?: string;
    okText?: string;
    cancelText?: string;
}
export interface ButtonInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "button";
    requireConfirmation: boolean;
    confirmation?: ConfirmationProps;
    defaultValue?: string;
    onChangeData: UserInterfaceProps["onChangeData"];
    placeholder: string;
    userInterfaceData: UserInterfaceProps["data"];
    valueKey: string;
    buttonLabel: string;
    icon: string;
    hideButtonLabel: boolean;
    shape: shapeType;
    size: sizeType;
    displayType: buttonDisplayType;
    block: boolean;
    ghost: boolean;
}
interface ButtonInterfaceComponentState {
    isShowingConfirmation: boolean;
}
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
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
    constructor(props: ButtonInterfaceComponentProps);
    handleClick: ({ target }: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
    handleCloseConfirmation: ({ target }: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
    handleConfirmationVisibleChange: (visible: boolean) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=ButtonInterfaceComponent.d.ts.map