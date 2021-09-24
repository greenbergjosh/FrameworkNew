import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { RepeaterInterfaceComponentProps } from "./types";
import { JSONRecord } from "../../../globalTypes/JSONTypes";
import { LayoutDefinition } from "../../../globalTypes";
export declare class RepeaterInterfaceComponent extends BaseInterfaceComponent<RepeaterInterfaceComponentProps> {
    static defaultProps: {
        addItemLabel: string;
        allowDelete: boolean;
        allowReorder: boolean;
        orientation: string;
        userInterfaceData: {};
        valueKey: string;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    handleChange: (nextState: JSONRecord | JSONRecord[], subpath?: string | undefined) => void;
    render(): JSX.Element | undefined;
}
//# sourceMappingURL=RepeaterInterfaceComponent.d.ts.map