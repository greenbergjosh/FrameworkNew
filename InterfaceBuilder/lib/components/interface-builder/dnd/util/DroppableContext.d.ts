import React from "react";
export interface DroppablePlaceholderState {
    index: number;
    width: number;
    x: number;
    y: number;
}
export interface DraggedItemProps {
    draggableId: string;
    index: number;
    item: unknown;
    parentDroppableId: string | null;
    type: string | symbol;
}
export interface DroppableTargetProps {
    disabled: boolean;
    droppableId: string;
    dropIndex: number;
    type: string | symbol;
}
export interface DroppableContextType {
    droppableId: string;
    onDrop?: (draggedItem: DraggedItemProps, dropTarget: DroppableTargetProps) => void;
    orientation?: "vertical" | "horizontal";
    placeholder: DroppablePlaceholderState | null;
}
export declare const DroppableContext: React.Context<DroppableContextType | null>;
//# sourceMappingURL=DroppableContext.d.ts.map