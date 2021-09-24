import React from "react";
import { ComponentDefinition } from "./components/base/BaseInterfaceComponent";
import { DraggedItemProps, DroppableTargetProps } from "./dnd";
import "./user-interface.scss";
import { UserInterfaceContextManager } from "./UserInterfaceContextManager";
interface IUserInterfaceProps {
    data?: any;
    contextManager?: UserInterfaceContextManager;
    mode: "display" | "edit";
    onChangeData?: (data: UserInterfaceProps["data"]) => void;
    components: ComponentDefinition[];
}
export interface DisplayUserInterfaceProps extends IUserInterfaceProps {
    mode: "display";
}
export interface EditUserInterfaceProps extends IUserInterfaceProps {
    mode: "edit";
    onChangeSchema: (schema: ComponentDefinition[]) => void;
}
export declare type UserInterfaceProps = DisplayUserInterfaceProps | EditUserInterfaceProps;
export interface UserInterfaceState extends DropHelperResult {
    clipboardComponent: null | DraggedItemProps;
    error: null | string;
    fullscreen: boolean;
}
export declare class UserInterface extends React.Component<UserInterfaceProps, UserInterfaceState> {
    state: UserInterfaceState;
    handleDrop: (draggedItem: DraggedItemProps, dropTarget: DroppableTargetProps) => void;
    componentDidCatch(error: Error, info: React.ErrorInfo): void;
    render(): JSX.Element;
}
export interface DropHelperResult {
    components: ComponentDefinition[];
    itemToAdd: null | {
        componentDefinition: Partial<ComponentDefinition>;
        path: string;
        index: number;
    };
    itemToEdit: null | {
        componentDefinition: Partial<ComponentDefinition>;
        path: string;
        index: number;
    };
}
export declare function handleDropHelper(components: ComponentDefinition[], draggedItem: DraggedItemProps, dropTarget: DroppableTargetProps): DropHelperResult;
export {};
//# sourceMappingURL=UserInterface.d.ts.map