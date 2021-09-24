import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinition, ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
export interface IFrameInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "iframe";
    components: ComponentDefinition[];
    onChangeData: UserInterfaceProps["onChangeData"];
    preconfigured?: boolean;
    userInterfaceData?: UserInterfaceProps["data"];
    src: string;
    height?: number;
    bordered?: boolean;
}
export declare class IFrameInterfaceComponent extends BaseInterfaceComponent<IFrameInterfaceComponentProps> {
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    render(): JSX.Element;
}
//# sourceMappingURL=IFrameInterfaceComponent.d.ts.map