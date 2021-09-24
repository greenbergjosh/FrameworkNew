import React from "react";
import { ComponentDefinition } from "./components/base/BaseInterfaceComponent";
import { DroppableContextType } from "./dnd";
import { EditUserInterfaceProps, UserInterfaceProps } from "./UserInterface";
interface ComponentRendererProps {
    componentLimit?: number;
    components: ComponentDefinition[];
    data: UserInterfaceProps["data"];
    dragDropDisabled?: boolean;
    mode?: UserInterfaceProps["mode"];
    onChangeData: UserInterfaceProps["onChangeData"];
    onChangeSchema: EditUserInterfaceProps["onChangeSchema"];
    onDrop?: DroppableContextType["onDrop"];
}
export declare const ComponentRendererModeContext: React.Context<"edit" | "display">;
export declare const UI_ROOT = "UI-Root";
export declare const _ComponentRenderer: {
    ({ componentLimit, components, data, dragDropDisabled, mode: propMode, onChangeData, onChangeSchema, onDrop, }: ComponentRendererProps): JSX.Element;
    defaultProps: {
        components: never[];
    };
};
export declare const ComponentRenderer: React.MemoExoticComponent<{
    ({ componentLimit, components, data, dragDropDisabled, mode: propMode, onChangeData, onChangeSchema, onDrop, }: ComponentRendererProps): JSX.Element;
    defaultProps: {
        components: never[];
    };
}>;
export {};
//# sourceMappingURL=ComponentRenderer.d.ts.map