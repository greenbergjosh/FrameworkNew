import React from "react";
import { ComponentDefinition } from "./components/base/BaseInterfaceComponent";
import { DroppableContextType } from "./dnd";
import { EditUserInterfaceProps, UserInterfaceProps } from "./UserInterface";
interface ComponentRendererProps {
    componentLimit?: number;
    components: ComponentDefinition[];
    data: UserInterfaceProps["data"];
    getRootData: () => UserInterfaceProps["data"];
    dragDropDisabled?: boolean;
    mode?: UserInterfaceProps["mode"];
    onChangeData: UserInterfaceProps["onChangeData"];
    onChangeSchema: EditUserInterfaceProps["onChangeSchema"];
    submit?: UserInterfaceProps["submit"];
    onDrop?: DroppableContextType["onDrop"];
}
export declare const ComponentRendererModeContext: React.Context<"display" | "edit">;
export declare const UI_ROOT = "UI-Root";
export declare const _ComponentRenderer: {
    ({ componentLimit, components, data, getRootData, dragDropDisabled, mode: propMode, onChangeData, onChangeSchema, submit, onDrop, }: ComponentRendererProps): JSX.Element;
    defaultProps: {
        components: never[];
    };
};
export declare const ComponentRenderer: React.MemoExoticComponent<{
    ({ componentLimit, components, data, getRootData, dragDropDisabled, mode: propMode, onChangeData, onChangeSchema, submit, onDrop, }: ComponentRendererProps): JSX.Element;
    defaultProps: {
        components: never[];
    };
}>;
export {};
//# sourceMappingURL=ComponentRenderer.d.ts.map