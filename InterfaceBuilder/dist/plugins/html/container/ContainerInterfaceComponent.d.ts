import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { LayoutDefinition } from "../../../globalTypes";
import { ContainerInterfaceComponentProps } from "./types";
export declare class ContainerInterfaceComponent extends BaseInterfaceComponent<ContainerInterfaceComponentProps> {
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    render(): JSX.Element | undefined;
}
//# sourceMappingURL=ContainerInterfaceComponent.d.ts.map