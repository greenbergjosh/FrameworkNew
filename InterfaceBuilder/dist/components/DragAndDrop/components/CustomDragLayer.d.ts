import { Identifier } from "dnd-core";
import React from "react";
import { XYCoord } from "react-dnd";
export interface CustomDragLayerProps {
    item?: any;
    itemType?: Identifier | null;
    initialOffset?: XYCoord | null;
    currentOffset?: XYCoord | null;
    isDragging?: boolean;
}
export declare const CustomDragLayer: import("react-dnd").DndComponentClass<React.FC<CustomDragLayerProps>, Pick<CustomDragLayerProps, never>>;
//# sourceMappingURL=CustomDragLayer.d.ts.map