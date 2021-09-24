import { BaseInterfaceComponent } from "components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinition, ComponentDefinitionNamedProps, ComponentDefinitionRecursiveProp, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
interface DisplayModeProps {
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
export declare function DisplayMode(props: DisplayModeProps): JSX.Element;
export {};
//# sourceMappingURL=DisplayMode.d.ts.map