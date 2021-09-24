import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
import { UserInterfaceProps } from "components/interface-builder/UserInterface";
export interface EmptyInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "empty";
    customImage?: string;
    message: string;
    image: "default" | "compact";
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
}
export declare class EmptyInterfaceComponent extends BaseInterfaceComponent<EmptyInterfaceComponentProps> {
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        componentDefinition: {
            component: string;
            label: string;
        };
    };
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
    constructor(props: EmptyInterfaceComponentProps);
    render(): JSX.Element;
}
//# sourceMappingURL=EmptyInterfaceComponent.d.ts.map