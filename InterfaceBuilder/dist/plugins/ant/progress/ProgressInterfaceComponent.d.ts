import { ProgressProps } from "antd/lib/progress/progress";
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
interface ProgressStatuses {
    active?: string;
    exception?: string;
    normal?: string;
    success?: string;
}
export interface ProgressInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "progress";
    valueKey: string;
    calculatePercent: boolean;
    hideInfo?: boolean;
    forceStatus: ProgressProps["status"] | "useAPI";
    maxValueKey: string;
    smallLine: boolean;
    statuses?: ProgressStatuses;
    statusKey?: string;
    successPercent?: number;
    type: "line" | "circle" | "dashboard";
    userInterfaceData: UserInterfaceProps["data"];
    width?: number;
}
export declare class ProgressInterfaceComponent extends BaseInterfaceComponent<ProgressInterfaceComponentProps> {
    static defaultProps: {
        defaultValue: number;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=ProgressInterfaceComponent.d.ts.map