import React from "react";
import { ConnectDragSource } from "react-dnd";
import { DraggableContextProps, DraggedItemProps, DroppableContextType } from "./util";
export interface DraggableInnerProps extends DraggableContextProps {
    children: (props: DraggableChildProps) => JSX.Element;
    connectDragSource: ConnectDragSource;
    data: unknown;
    draggableId: string;
    draggableItem: DraggedItemProps;
    editable?: boolean;
    index: number;
    innerRef: React.RefObject<HTMLDivElement>;
    isDragging: boolean;
    makeRoomForPlaceholder: boolean;
    orientation?: DroppableContextType["orientation"];
    parentDroppableId: string | null;
    title: string;
    type: string | symbol;
}
export interface DraggableChildProps {
    data: unknown;
    isDragging: boolean;
}
export interface DraggableProps extends DraggableContextProps {
    children: (props: DraggableChildProps) => JSX.Element;
    data: unknown;
    draggableId: string;
    editable?: boolean;
    index: number;
    title: string;
    type: string | symbol;
}
export declare const Draggable: React.MemoExoticComponent<({ canCopy, canDelete, canEdit, canPaste, children, data, draggableId, editable, index, onCopy, onDelete, onEdit, onPaste, title, type, }: DraggableProps) => JSX.Element>;
//# sourceMappingURL=Draggable.d.ts.map