import { ComponentDefinition, ComponentDefinitionNamedProps, ComponentDefinitionRecursiveProp, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
import { BaseInterfaceComponent } from "components/BaseInterfaceComponent/BaseInterfaceComponent";
interface ModeProps {
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
interface ErrorModeProps extends ModeProps {
    dragDropDisabled: boolean | undefined;
    index: number;
    path: string;
    error: string | null;
}
export declare function ErrorMode(props: ErrorModeProps): JSX.Element;
export {};
//# sourceMappingURL=ErrorMode.d.ts.map