import React from "react";
import { UserInterfaceProps } from "../../../UserInterface";
import { buttonDisplayType, shapeType, sizeType } from "./download-manage-form";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
export interface DownloadInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "button";
    defaultValue?: string;
    onChangeData: UserInterfaceProps["onChangeData"];
    placeholder: string;
    userInterfaceData: UserInterfaceProps["data"];
    paramsValueKey: string;
    url: string;
    httpMethod: "GET" | "POST";
    useFilenameFromServer: boolean;
    filename: string;
    buttonLabel: string;
    icon: string;
    hideButtonLabel: boolean;
    shape: shapeType;
    size: sizeType;
    displayType: buttonDisplayType;
    block: boolean;
    ghost: boolean;
}
interface DownloadInterfaceComponentState {
    isDownloading: boolean;
}
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
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
    constructor(props: DownloadInterfaceComponentProps);
    handleClick: ({ target }: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=DownloadInterfaceComponent.d.ts.map