import { DividerProps } from "antd/lib/divider";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
export interface DividerInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "divider";
    dashed?: boolean;
    orientation?: DividerProps["type"];
    text?: string;
    textAlignment?: DividerProps["orientation"];
}
export declare class DividerInterfaceComponent extends BaseInterfaceComponent<DividerInterfaceComponentProps> {
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
//# sourceMappingURL=DividerInterfaceComponent.d.ts.map