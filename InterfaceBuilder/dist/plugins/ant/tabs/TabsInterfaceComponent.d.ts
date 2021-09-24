import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { TabsInterfaceComponentProps } from "../../../plugins/ant/tabs/types";
import { ComponentDefinition, ComponentDefinitionRecursiveProp, LayoutDefinition } from "../../../globalTypes";
export declare class TabsInterfaceComponent extends BaseInterfaceComponent<TabsInterfaceComponentProps> {
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    render(): JSX.Element;
}
//# sourceMappingURL=TabsInterfaceComponent.d.ts.map