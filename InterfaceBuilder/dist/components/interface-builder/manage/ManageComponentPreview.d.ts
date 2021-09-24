import { BaseInterfaceComponent, ComponentDefinition, LayoutDefinition } from "../components/base/BaseInterfaceComponent";
import { UserInterfaceProps } from "components/interface-builder/UserInterface";
export interface ManageComponentPreviewProps {
    Component: typeof BaseInterfaceComponent;
    componentDefinition: ComponentDefinition;
    layoutDefinition: LayoutDefinition;
    userInterfaceData: UserInterfaceProps["data"];
}
export declare const ManageComponentPreview: ({ Component, componentDefinition, layoutDefinition, userInterfaceData, }: ManageComponentPreviewProps) => JSX.Element;
//# sourceMappingURL=ManageComponentPreview.d.ts.map