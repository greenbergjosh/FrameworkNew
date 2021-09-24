import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent";
import { RepeaterInterfaceComponentProps } from "./types";
import { JSONRecord } from "components/interface-builder/@types/JSONTypes";
export declare class RepeaterInterfaceComponent extends BaseInterfaceComponent<RepeaterInterfaceComponentProps> {
    static defaultProps: {
        addItemLabel: string;
        allowDelete: boolean;
        allowReorder: boolean;
        orientation: string;
        userInterfaceData: {};
        valueKey: string;
    };
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
    static manageForm: (...extend: (Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps> | Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
    handleChange: (nextState: JSONRecord | JSONRecord[], subpath?: string | undefined) => void;
    render(): JSX.Element | undefined;
}
//# sourceMappingURL=RepeaterInterfaceComponent.d.ts.map