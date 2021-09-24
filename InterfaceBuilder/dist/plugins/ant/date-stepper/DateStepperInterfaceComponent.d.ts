import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { DateAction, DateStepperInterfaceComponentProps, DateStepperInterfaceComponentState } from "./types";
import { LayoutDefinition } from "../../../globalTypes";
export declare class DateStepperInterfaceComponent extends BaseInterfaceComponent<DateStepperInterfaceComponentProps, DateStepperInterfaceComponentState> {
    static defaultProps: {
        valueKey: string;
        defaultValue: string;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    stepDates: (action: DateAction) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=DateStepperInterfaceComponent.d.ts.map