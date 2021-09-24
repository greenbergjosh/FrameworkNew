import React from "react";
import { ComponentModifierProps } from "components/ComponentRenderer";
import { DraggableChildProps } from "components/DragAndDrop";
import { ComponentDefinition, LayoutDefinition, UserInterfaceProps } from "../../globalTypes";
export declare const DraggableWrapper: React.FC<ComponentModifierProps & {
    dragDropDisabled?: boolean;
    index: number;
    layoutDefinition: LayoutDefinition;
    mode: UserInterfaceProps["mode"];
    path: string;
    children: (props: DraggableChildProps & {
        componentDefinition: ComponentDefinition;
    }) => JSX.Element;
}>;
//# sourceMappingURL=DraggableWrapper.d.ts.map