import { RangePickerValue } from "antd/lib/date-picker/interface";
import moment from "moment";
import { TimeSettings } from "../_shared/common-include-time-form";
import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
export interface DateRangeInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "date-range";
    defaultRangeValue: string;
    timeSettings?: TimeSettings;
    onChangeData: UserInterfaceProps["onChangeData"];
    startDateKey: string;
    endDateKey: string;
    userInterfaceData: UserInterfaceProps["data"];
}
interface DateRangeInterfaceComponentState {
}
export declare class DateRangeInterfaceComponent extends BaseInterfaceComponent<DateRangeInterfaceComponentProps, DateRangeInterfaceComponentState> {
    static defaultProps: {
        startDateKey: string;
        endDateKey: string;
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
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
    static getDefintionDefaultValue({ defaultRangeValue, endDateKey, startDateKey, }: DateRangeInterfaceComponentProps): {};
    static standardRanges(): {
        [range: string]: [moment.Moment, moment.Moment];
    };
    handleChange: (dates: RangePickerValue, dateStrings: [string, string]) => void;
    getDefaultValue: () => {};
    getValues: () => any[];
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=DateRangeInterfaceComponent.d.ts.map