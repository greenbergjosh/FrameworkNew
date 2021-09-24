import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps, ComponentDefinition } from "../../base/BaseInterfaceComponent";
export interface CardInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "card";
    components: ComponentDefinition[];
    onChangeData: UserInterfaceProps["onChangeData"];
    preconfigured?: boolean;
    userInterfaceData?: UserInterfaceProps["data"];
    bordered?: boolean;
    extra?: string;
    hoverable?: boolean;
    inset?: boolean;
    size?: "small" | "default";
    title?: string;
}
export declare class CardInterfaceComponent extends BaseInterfaceComponent<CardInterfaceComponentProps> {
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        componentDefinition: {
            component: string;
            components: never[];
        };
    };
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    render(): JSX.Element;
}
//# sourceMappingURL=CardInterfaceComponent.d.ts.map