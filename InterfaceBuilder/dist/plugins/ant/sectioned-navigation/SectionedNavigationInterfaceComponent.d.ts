import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinition, ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
interface NavigationSection {
    title: string;
    components: ComponentDefinition[];
}
export interface ISectionedNavigationInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "sectioned-navigation";
    sections: NavigationSection[];
    defaultActiveKey?: string;
    mode: UserInterfaceProps["mode"];
    onChangeData: UserInterfaceProps["onChangeData"];
    title?: string;
    userInterfaceData?: UserInterfaceProps["data"];
}
interface SectionedNavigationInterfaceComponentDisplayModeProps extends ISectionedNavigationInterfaceComponentProps {
    mode: "display";
}
interface SectionedNavigationInterfaceComponentEditModeProps extends ISectionedNavigationInterfaceComponentProps {
    mode: "edit";
    onChangeSchema?: (newSchema: ComponentDefinition) => void;
    userInterfaceSchema?: ComponentDefinition;
}
declare type SectionedNavigationInterfaceComponentProps = SectionedNavigationInterfaceComponentDisplayModeProps | SectionedNavigationInterfaceComponentEditModeProps;
export interface SectionedNavigationInterfaceComponentState {
    activeKey: string | null;
}
export declare class SectionedNavigationInterfaceComponent extends BaseInterfaceComponent<SectionedNavigationInterfaceComponentProps, SectionedNavigationInterfaceComponentState> {
    static defaultProps: {
        sections: never[];
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    state: {
        activeKey: null;
    };
    componentDidMount(): void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=SectionedNavigationInterfaceComponent.d.ts.map