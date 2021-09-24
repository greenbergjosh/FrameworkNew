import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinition, ComponentDefinitionNamedProps, ComponentDefinitionRecursiveProp } from "../../base/BaseInterfaceComponent";
export interface TabsInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "tabs";
    defaultActiveKey: string;
    onChangeData: UserInterfaceProps["onChangeData"];
    tabs?: ComponentDefinition[];
    userInterfaceData?: UserInterfaceProps["data"];
}
export declare class TabsInterfaceComponent extends BaseInterfaceComponent<TabsInterfaceComponentProps> {
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        componentDefinition: {
            component: string;
        };
    };
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    render(): JSX.Element;
}
//# sourceMappingURL=TabsInterfaceComponent.d.ts.map