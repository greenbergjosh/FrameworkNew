import moment from "moment";
import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
export interface TimeRangeInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "timeRange";
    defaultRangeValue: string;
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
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