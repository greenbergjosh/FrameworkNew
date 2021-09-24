import moment from "moment";
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
export interface TimeRangeInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "timeRange";
    defaultRangeValue: string;
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData: UserInterfaceProps["data"];
    startTimeKey: string;
    endTimeKey: string;
    size?: "small" | "default" | "large" | undefined;
    startTimePlaceholder: string;
    endTimePlaceholder: string;
}
export declare class TimeRangeInterfaceComponent extends BaseInterfaceComponent<TimeRangeInterfaceComponentProps> {
    static defaultProps: {
        startTimeKey: string;
        endTimeKey: string;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    static getDefinitionDefaultValue({ endTimeKey, startTimeKey }: TimeRangeInterfaceComponentProps): {};
    constructor(props: TimeRangeInterfaceComponentProps);
    private setUIDataByKey;
    handleStartTimeChange: (time: moment.Moment, timeString: string) => void;
    handleEndTimeChange: (time: moment.Moment, timeString: string) => void;
    getTimeValue: (timeKey: string) => moment.Moment | undefined;
    getDefaultValue: () => moment.Moment;
    render(): JSX.Element;
}
//# sourceMappingURL=TimeRangeInterfaceComponent.d.ts.map