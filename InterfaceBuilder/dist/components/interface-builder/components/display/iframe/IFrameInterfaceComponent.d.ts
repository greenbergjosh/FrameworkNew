import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinition, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
export interface IFrameInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "iframe";
    components: ComponentDefinition[];
    onChangeData: UserInterfaceProps["onChangeData"];
    preconfigured?: boolean;
    userInterfaceData?: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
    src: string;
    height?: number;
    bordered?: boolean;
}
export declare class IFrameInterfaceComponent extends BaseInterfaceComponent<IFrameInterfaceComponentProps> {
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
//# sourceMappingURL=IFrameInterfaceComponent.d.ts.map