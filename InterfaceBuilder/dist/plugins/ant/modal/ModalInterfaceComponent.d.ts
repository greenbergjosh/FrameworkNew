import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { LayoutDefinition } from "../../../globalTypes";
import { ModalInterfaceComponentProps } from "./types";
export declare class ModalInterfaceComponent extends BaseInterfaceComponent<ModalInterfaceComponentProps> {
    static defaultProps: {
        userInterfaceData: {};
        valueKey: string;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    render(): JSX.Element;
}
//# sourceMappingURL=ModalInterfaceComponent.d.ts.map