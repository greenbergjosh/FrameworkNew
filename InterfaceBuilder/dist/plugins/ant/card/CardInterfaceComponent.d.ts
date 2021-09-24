import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { CardInterfaceComponentProps } from "./types";
import { ComponentDefinition, LayoutDefinition } from "../../../globalTypes";
export declare class CardInterfaceComponent extends BaseInterfaceComponent<CardInterfaceComponentProps> {
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    render(): JSX.Element;
}
//# sourceMappingURL=CardInterfaceComponent.d.ts.map