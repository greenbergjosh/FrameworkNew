import { BaseInterfaceComponent } from "components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinition, ComponentDefinitionNamedProps, ComponentDefinitionRecursiveProp, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
interface PreviewModeProps {
    componentDefinition: ComponentDefinitionNamedProps | (ComponentDefinitionNamedProps & ComponentDefinitionRecursiveProp);
    onChangeData: UserInterfaceProps["onChangeData"];
    onChangeSchema: ((newComponentDefinition: ComponentDefinition) => void) | undefined;
    userInterfaceData: UserInterfaceProps["data"];
    layoutDefinition: LayoutDefinition;
    getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"];
    setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"];
    mode: UserInterfaceProps["mode"];
    submit: (() => void) | undefined;
    Component: typeof BaseInterfaceComponent;
}
export declare function PreviewMode(props: PreviewModeProps): JSX.Element;
export {};
//# sourceMappingURL=PreviewMode.d.ts.map