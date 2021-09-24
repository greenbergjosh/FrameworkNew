import { PieDatum } from "@nivo/pie";
import { LegendProps } from "@nivo/legends";
import { OtherSliceAggregatorFunction, PieInterfaceComponentProps, SliceLabelValueFunction, SliceLabelValueType } from "../../../plugins/nivo/pie/types";
import { JSONRecord } from "../../../globalTypes/JSONTypes";
export declare const emptyDataSet: {
    pieDatum: {
        id: string;
        label: string;
        value: number;
    };
    slice: {};
}[];
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