import { ComponentDefinitionNamedProps } from "components/interface-builder/components/base/BaseInterfaceComponent";
import { UserInterfaceProps } from "components/interface-builder/UserInterface";
import { buttonDisplayType, shapeType, sizeType } from "components/interface-builder/components/form/button/button-manage-form";
export declare type ParamKVPMapsType = {
    values: {
        sourceKey: string;
        targetKey: string;
    }[];
};
interface ConfirmationProps {
    title?: string;
    message?: string;
    okText?: string;
    cancelText?: string;
}
export interface ButtonInterfaceComponentProps extends ComponentDefinitionNamedProps {
    paramKVPMaps: ParamKVPMapsType;
    component: "button";
    requireConfirmation: boolean;
    confirmation?: ConfirmationProps;
    defaultValue?: string;
    onChangeData: UserInterfaceProps["onChangeData"];
    placeholder: string;
    userInterfaceData: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
    buttonLabel: string;
    icon: string;
    hideButtonLabel: boolean;
    shape: shapeType;
    size: sizeType;
    displayType: buttonDisplayType;
    block: boolean;
    ghost: boolean;
    disabled: boolean;
    loading: boolean;
}
export interface ButtonInterfaceComponentState {
    isShowingConfirmation: boolean;
}
export {};
//# sourceMappingURL=types.d.ts.map