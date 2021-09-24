import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinitionNamedProps, LayoutDefinition } from "../../../globalTypes";
export interface EmptyInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "empty";
    customImage?: string;
    message: string;
    image: "default" | "compact";
}
export declare class EmptyInterfaceComponent extends BaseInterfaceComponent<EmptyInterfaceComponentProps> {
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    constructor(props: EmptyInterfaceComponentProps);
    render(): JSX.Element;
}
//# sourceMappingURL=EmptyInterfaceComponent.d.ts.map