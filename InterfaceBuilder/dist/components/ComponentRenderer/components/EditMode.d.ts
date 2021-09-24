import { BaseInterfaceComponent } from "components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinition, ComponentDefinitionNamedProps, ComponentDefinitionRecursiveProp, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
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
interface EditModeProps extends ModeProps {
    dragDropDisabled: boolean | undefined;
    index: number;
    path: string;
}
export declare function EditMode(props: EditModeProps): JSX.Element;
export {};
//# sourceMappingURL=EditMode.d.ts.map