import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent";
import { DateAction, DateStepperInterfaceComponentProps, DateStepperInterfaceComponentState } from "./types";
export declare class DateStepperInterfaceComponent extends BaseInterfaceComponent<DateStepperInterfaceComponentProps, DateStepperInterfaceComponentState> {
    static defaultProps: {
        valueKey: string;
        defaultValue: string;
    };
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        formControl: boolean;
        componentDefinition: {
            component: string;
            label: string;
        };
    };
    static manageForm: (...extend: (Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps> | Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
    stepDates: (action: DateAction) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=DateStepperInterfaceComponent.d.ts.map