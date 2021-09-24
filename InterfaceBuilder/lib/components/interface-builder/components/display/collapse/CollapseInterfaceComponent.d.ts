import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps, ComponentDefinition } from "../../base/BaseInterfaceComponent";
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
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        componentDefinition: {
            component: string;
            sections: never[];
        };
    };
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=CollapseInterfaceComponent.d.ts.map