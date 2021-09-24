import { ComponentDefinitionNamedProps } from "components/interface-builder/components/base/BaseInterfaceComponent";
import { UserInterfaceProps } from "components/interface-builder/UserInterface";
import { ButtonProps } from "antd/lib/button";
import { Moment } from "moment";
export declare type DateFormat = "iso-8601" | "locale" | "gmt" | undefined;
export interface DateStepperInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "date-stepper";
    valueKeys: string[];
    isDateRange: boolean;
    dateKey: string;
    startDateKey: string;
    dateFormat: DateFormat;
    endDateKey: string;
    size: ButtonProps["size"];
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
    submit: UserInterfaceProps["submit"];
    executeImmediately: boolean;
}
export interface DateStepperInterfaceComponentState {
}
export declare type DateAction = (date: Moment, dateFormat: DateFormat, bound: "start" | "end" | "none") => string;
export declare type DateValuesType = {
    [p: string]: string;
};
//# sourceMappingURL=types.d.ts.map