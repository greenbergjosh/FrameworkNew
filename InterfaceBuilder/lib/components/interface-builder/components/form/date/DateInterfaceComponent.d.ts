import moment from "moment";
import { TimeSettings } from "../_shared/common-include-time-form";
import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
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
    handleChange: (inputMoment: moment.Moment | null, dateString: string) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=DateInterfaceComponent.d.ts.map