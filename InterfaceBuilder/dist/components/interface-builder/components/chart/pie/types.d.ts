import { ComponentDefinitionNamedProps } from "components/interface-builder/components/base/BaseInterfaceComponent";
import { UserInterfaceProps } from "components/interface-builder/UserInterface";
import { PieDatum } from "@nivo/pie";
import { JSONRecord } from "components/interface-builder/@types/JSONTypes";
export declare type SliceLabelValueType = "default" | "key" | "function";
export interface PieInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "pie";
    valueKey: string;
    userInterfaceData: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
    colorScheme: string;
    donut: boolean;
    enableRadialLabels: boolean;
    enableSliceLabels: boolean;
    showLegend: boolean;
    sliceLabelKey: string;
    sliceValueKey: string;
    sliceLabelValueType: SliceLabelValueType;
    sliceLabelValueKey: string;
    sliceLabelValueFunctionSrc?: string;
    sliceLabelValueFunction?: SliceLabelValueFunction;
    useTooltipFunction: boolean;
    tooltipFunctionSrc?: string;
    tooltipFunction?: SliceTooltipFunction;
    sliceGap: number;
    threshold: number;
    otherAggregatorFunctionSrc?: string;
    otherAggregatorFunction?: OtherSliceAggregatorFunction;
    preSorted: boolean;
}
export interface PieInterfaceComponentState {
    pieData: {
        pieDatum: PieDatum;
        slice: JSONRecord;
    }[];
    loading: boolean;
    tooltipFunction: any | undefined;
}
export declare type SliceLabelValueFunction = (slice: JSONRecord, props: PieInterfaceComponentProps) => string;
export declare type SliceTooltipFunction = (slice: JSONRecord, props: PieInterfaceComponentProps) => string;
export declare type OtherSliceAggregatorFunction = (slices: JSONRecord[], props: PieInterfaceComponentProps) => JSONRecord;
//# sourceMappingURL=types.d.ts.map