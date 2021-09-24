import React from "react";
import { ComponentModifierProps, RenderInterfaceComponentProps } from "../../ComponentRenderer/types";
import { UserInterfaceProps } from "../../../globalTypes";
/**
 *
 * @param props: {
 *   @property componentDefinition -- The component's current property control (bindable indicated here)
 *   @property onChangeData
 *   @property onChangeSchema
 *   @property userInterfaceData -- The component being configured (bindings saved here)
 * }
 * @constructor
 */
export declare const EditDataBinding: React.FC<ComponentModifierProps & {
    onChangeData: UserInterfaceProps["onChangeData"];
    onChangeSchema: RenderInterfaceComponentProps["onChangeSchema"];
    userInterfaceData: UserInterfaceProps["data"];
    mode: UserInterfaceProps["mode"];
}>;
//# sourceMappingURL=EditDataBinding.d.ts.map