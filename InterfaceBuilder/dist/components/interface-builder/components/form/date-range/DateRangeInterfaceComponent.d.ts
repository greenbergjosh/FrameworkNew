import { RangePickerValue } from "antd/lib/date-picker/interface";
import moment from "moment";
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent";
import { DateRangeInterfaceComponentProps, DateRangeInterfaceComponentState, EVENTS } from "./types";
export declare class DateRangeInterfaceComponent extends BaseInterfaceComponent<DateRangeInterfaceComponentProps, DateRangeInterfaceComponentState> {
    static availableEvents: EVENTS[];
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
    static manageForm: (...extend: (Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps> | Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
    static getDefinitionDefaultValue({ defaultRangeValue, endDateKey, startDateKey }: DateRangeInterfaceComponentProps): {};
    static standardRanges(): {
        [range: string]: [moment.Moment, moment.Moment];
    };
    componentDidMount(): void;
    handleChange: (dates: RangePickerValue, dateStrings: [string, string]) => void;
    getDefaultValue: () => {};
    render(): JSX.Element;
}
//# sourceMappingURL=DateRangeInterfaceComponent.d.ts.map