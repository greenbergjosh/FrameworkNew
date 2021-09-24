import React from "react";
import { DroppablePlaceholderState, DroppableTargetProps, DraggedItemProps } from "components/DragAndDrop";
export interface DroppableContextType {
    droppableId: string;
    onDrop?: (draggedItem: DraggedItemProps, dropTarget: DroppableTargetProps) => void;
    orientation?: "vertical" | "horizontal";
    placeholder: DroppablePlaceholderState | null;
}
export declare const DroppableContext: React.Context<DroppableContextType | null>;
//# sourceMappingURL=DroppableContext.d.ts.map