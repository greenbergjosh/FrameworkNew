import React from "react";
import { ConnectDropTarget } from "react-dnd";
import { DroppableContextType, DroppablePlaceholderState } from "./util";
import "./dnd.module.scss";
export interface DroppableInnerProps {
    allowDrop?: boolean;
    canDrop: boolean;
    children: DroppableProps["children"];
    connectDropTarget: ConnectDropTarget;
    disabled?: DroppableProps["disabled"];
    droppableId: DroppableProps["droppableId"];
    innerRef: React.RefObject<HTMLDivElement>;
    isOver: boolean;
    onDrop?: DroppableProps["onDrop"];
    orientation?: DroppableContextType["orientation"];
    placeholderText?: DroppableProps["placeholderText"];
    placeholder: DroppablePlaceholderState | null;
    setPlaceholder: (placeholder: DroppablePlaceholderState | null) => void;
    type: DroppableProps["type"];
}
export interface DroppableChildProps {
    isOver: boolean;
}
export interface DroppableProps {
    allowDrop?: boolean;
    children: (props: DroppableChildProps) => JSX.Element | JSX.Element[];
    data?: any;
    disabled?: boolean;
    droppableId: string;
    onDrop?: DroppableContextType["onDrop"];
    orientation?: DroppableContextType["orientation"];
    placeholderText?: string;
    type: string | symbol;
}
export declare const Droppable: React.MemoExoticComponent<({ allowDrop, children, disabled, droppableId, onDrop, orientation, placeholderText, type, }: DroppableProps) => JSX.Element>;
//# sourceMappingURL=Droppable.d.ts.map