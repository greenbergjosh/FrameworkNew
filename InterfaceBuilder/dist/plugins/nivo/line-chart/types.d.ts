import { LineProps, Serie } from "@nivo/line";
import { LinearScale, PointScale } from "@nivo/scales";
import { DataFormatter } from "@nivo/core";
import { ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes";
export declare type ScaleType = PointScale | LinearScale;
export interface LineChartInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "line-chart";
    valueKey: string;
    userInterfaceData: UserInterfaceProps["data"];
    areaBaselineValue?: number;
    areaOpacity?: number;
    colorScheme: string;
    curve?: LineProps["curve"];
    enableArea?: boolean;
    enableGridX?: boolean;
    enableGridY?: boolean;
    enablePointLabel?: boolean;
    enablePoints?: boolean;
    height: number;
    lineWidth?: number;
    pointBorderWidth?: number;
    pointSize?: number;
    showLegend?: boolean;
    tooltipFunction?: SerieTooltipFunction;
    tooltipFunctionSrc?: string;
    useTooltipFunction: boolean;
    width: number;
    xFormat?: string | DataFormatter;
    xScaleType: ScaleType["type"];
    yFormat?: string | DataFormatter;
    yScaleType: ScaleType["type"];
}
export interface LineChartInterfaceComponentState {
    lineChartData: Serie[];
    loading: boolean;
    tooltipFunction: any | undefined;
}
export declare type SerieTooltipFunction = (serie: Serie, props: LineChartInterfaceComponentProps) => string;
//# sourceMappingURL=types.d.ts.map