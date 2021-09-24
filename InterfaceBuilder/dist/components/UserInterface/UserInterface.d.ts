/// <reference types="@welldone-software/why-did-you-render" />
import React from "react";
import { UserInterfaceState } from "./types";
import { DraggedItemProps, DroppableTargetProps } from "../DragAndDrop";
import "./userInterface.module.scss";
import { UserInterfaceProps } from "../../globalTypes";
export declare class UserInterface extends React.Component<UserInterfaceProps, UserInterfaceState> {
    state: UserInterfaceState;
    handleDrop: (draggedItem: DraggedItemProps, dropTarget: DroppableTargetProps) => void;
    componentDidCatch(error: Error, info: React.ErrorInfo): void;
    handleComponentMenuCollapse: (collapsed: boolean) => void;
    handleSiderToggleClick: () => void;
    getRootData: () => any;
    setRootData: (newData: UserInterfaceProps["data"]) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=UserInterface.d.ts.map