import { BaseInterfaceComponent } from "../../BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinition, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
export interface ManageComponentPreviewProps {
    Component: typeof BaseInterfaceComponent;
    componentDefinition: ComponentDefinition;
    layoutDefinition: LayoutDefinition;
    userInterfaceData: UserInterfaceProps["data"];
}
export declare const Preview: ({ Component, componentDefinition, layoutDefinition, userInterfaceData, }: ManageComponentPreviewProps) => JSX.Element;
//# sourceMappingURL=Preview.d.ts.map