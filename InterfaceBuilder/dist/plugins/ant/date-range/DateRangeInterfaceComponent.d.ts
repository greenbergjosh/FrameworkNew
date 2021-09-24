import { RangePickerValue } from "antd/lib/date-picker/interface";
import moment from "moment";
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { DateRangeInterfaceComponentProps, DateRangeInterfaceComponentState, EVENTS } from "./types";
import { LayoutDefinition } from "../../../globalTypes";
export declare class DateRangeInterfaceComponent extends BaseInterfaceComponent<DateRangeInterfaceComponentProps, DateRangeInterfaceComponentState> {
    static availableEvents: EVENTS[];
    static defaultProps: {
        startDateKey: string;
        endDateKey: string;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
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