import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinition, ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
export interface SectionDefinition {
    title: string;
    components: ComponentDefinition[];
}
export interface ICollapseInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "collapse";
    sections: SectionDefinition[];
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData?: UserInterfaceProps["data"];
    accordion?: boolean;
}
interface CollapseInterfaceComponentDisplayModeProps extends ICollapseInterfaceComponentProps {
    mode: "display";
}
interface CollapseInterfaceComponentEditModeProps extends ICollapseInterfaceComponentProps {
    mode: "edit";
    onChangeSchema?: (newSchema: ComponentDefinition) => void;
    userInterfaceSchema?: ComponentDefinition;
}
declare type CollapseInterfaceComponentProps = CollapseInterfaceComponentDisplayModeProps | CollapseInterfaceComponentEditModeProps;
export declare class CollapseInterfaceComponent extends BaseInterfaceComponent<CollapseInterfaceComponentProps> {
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=CollapseInterfaceComponent.d.ts.map