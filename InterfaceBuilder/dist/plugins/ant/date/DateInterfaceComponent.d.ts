import moment from "moment";
import { TimeSettings } from "../_shared/common-include-time-form";
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
export interface DateInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "date-range";
    timeSettings?: TimeSettings;
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData: UserInterfaceProps["data"];
    valueKey: string;
}
interface DateInterfaceComponentState {
}
export declare class DateInterfaceComponent extends BaseInterfaceComponent<DateInterfaceComponentProps, DateInterfaceComponentState> {
    static defaultProps: {
        valueKey: string;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    handleChange: (inputMoment: moment.Moment | null, dateString: string) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=DateInterfaceComponent.d.ts.map