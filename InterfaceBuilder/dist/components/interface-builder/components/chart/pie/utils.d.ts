import { PieDatum } from "@nivo/pie";
import { OrdinalColorsInstruction } from "@nivo/colors";
import { LegendProps } from "@nivo/legends";
import { OtherSliceAggregatorFunction, PieInterfaceComponentProps, SliceLabelValueFunction, SliceLabelValueType } from "components/interface-builder/components/chart/pie/types";
import { JSONRecord } from "components/interface-builder/@types/JSONTypes";
export declare const emptyDataSet: {
    pieDatum: {
        id: string;
        label: string;
        value: number;
    };
    slice: {};
}[];
export declare function getNivoColorScheme(colorScheme: string): OrdinalColorsInstruction<PieDatum>;
export declare function convertToPieDatum({ data, labelNameKey, labelValueType, labelValueKey, labelValueFunction, valueKey, dataIsPreSorted, threshold, otherSliceAggregatorFunction, props, }: {
    data: JSONRecord[];
    labelNameKey: string;
    labelValueType: SliceLabelValueType;
    labelValueKey: string;
    labelValueFunction?: SliceLabelValueFunction;
    valueKey: string;
    dataIsPreSorted: boolean;
    threshold: number;
    otherSliceAggregatorFunction?: OtherSliceAggregatorFunction;
    props: PieInterfaceComponentProps;
}): {
    pieDatum: PieDatum;
    slice: JSONRecord;
}[];
export declare const legends: LegendProps[];
//# sourceMappingURL=utils.d.ts.map