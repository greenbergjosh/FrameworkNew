import { UserInterfaceProps } from "components/interface-builder/UserInterface";
import { DateAction, DateValuesType, DateFormat } from "./types";
export declare const next: DateAction;
export declare const prev: DateAction;
export declare const today: DateAction;
export declare function stepSingleDateValue(dateKey: string, userInterfaceData: UserInterfaceProps["data"], action: DateAction, dateFormat?: DateFormat): DateValuesType;
export declare function stepDateRangeValues(startDateKey: string, endDateKey: string, userInterfaceData: UserInterfaceProps["data"], action: DateAction, dateFormat?: DateFormat): DateValuesType;
//# sourceMappingURL=utils.d.ts.map