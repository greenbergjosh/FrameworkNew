import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { LineChartInterfaceComponentProps, LineChartInterfaceComponentState } from "./types";
import { LayoutDefinition } from "../../../globalTypes";
export declare class LineChartInterfaceComponent extends BaseInterfaceComponent<LineChartInterfaceComponentProps, LineChartInterfaceComponentState> {
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    constructor(props: LineChartInterfaceComponentProps);
    componentDidUpdate(prevProps: Readonly<LineChartInterfaceComponentProps>): void;
    componentDidMount(): void;
    private createTooltipFunction;
    render(): JSX.Element;
}
//# sourceMappingURL=LineChartInterfaceComponent.d.ts.map