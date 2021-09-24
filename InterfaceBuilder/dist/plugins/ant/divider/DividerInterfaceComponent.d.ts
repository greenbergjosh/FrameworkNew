import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { LayoutDefinition } from "../../../globalTypes";
import { DividerInterfaceComponentProps } from "./types";
export declare class DividerInterfaceComponent extends BaseInterfaceComponent<DividerInterfaceComponentProps> {
    static defaultProps: {
        defaultValue: number;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    render(): JSX.Element;
}
//# sourceMappingURL=DividerInterfaceComponent.d.ts.map