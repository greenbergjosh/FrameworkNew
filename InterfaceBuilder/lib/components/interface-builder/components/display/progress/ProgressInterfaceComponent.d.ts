import { ProgressProps } from "antd/lib/progress/progress";
import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
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
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        componentDefinition: {
            component: string;
        };
    };
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=ProgressInterfaceComponent.d.ts.map