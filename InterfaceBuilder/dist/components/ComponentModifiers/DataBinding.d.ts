import React from "react";
import { ComponentModifierProps, RenderInterfaceComponentProps } from "../ComponentRenderer/types";
import { ComponentDefinition, UserInterfaceProps } from "../../globalTypes";
/**
 *
 * @param props: {
 *   @property componentDefinition -- The component being data bound (bindings are here)
 *   @property onChangeData
 *   @property onChangeSchema
 *   @property userInterfaceData -- The page model that bindings will reference
 * }
 * @constructor
 */
export declare const DataBinding: React.FC<ComponentModifierProps & {
    onChangeData: UserInterfaceProps["onChangeData"];
    onChangeSchema: RenderInterfaceComponentProps["onChangeSchema"];
    userInterfaceData: UserInterfaceProps["data"];
    children: (props: unknown & {
        boundComponentDefinition: ComponentDefinition;
    }) => JSX.Element;
    getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"];
}>;
//# sourceMappingURL=DataBinding.d.ts.map