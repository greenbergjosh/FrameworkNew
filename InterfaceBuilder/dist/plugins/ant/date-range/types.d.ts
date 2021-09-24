import { TimeSettings } from "../../../plugins/ant/_shared/common-include-time-form";
import { ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes";
export interface DateRangeInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "date-range";
    defaultRangeValue: string;
    timeSettings?: TimeSettings;
    onChangeData: UserInterfaceProps["onChangeData"];
    startDateKey: string;
    endDateKey: string;
    userInterfaceData: UserInterfaceProps["data"];
}
export interface DateRangeInterfaceComponentState {
}
export declare enum EVENTS {
    VALUE_CHANGED = "valueChanged"
}
//# sourceMappingURL=types.d.ts.map