import React from "react";
import { ComponentModifierProps } from "../ComponentRenderer";
import { EditPanelWithToolsProps } from "../EditPanel/types";
import { UserInterfaceProps } from "../../globalTypes";
import { DraggedItemProps } from "components/DragAndDrop";
interface EditPanelWrapperProps extends ComponentModifierProps, Omit<EditPanelWithToolsProps, "draggableItem"> {
    userInterfaceData: UserInterfaceProps["data"];
    index: number;
    draggableItem?: DraggedItemProps;
    isDragging?: boolean;
}
export declare const EditPanelWrapper: React.FC<EditPanelWrapperProps>;
export {};
//# sourceMappingURL=EditPanelWrapper.d.ts.map