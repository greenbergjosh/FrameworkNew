import { SliderValue } from "antd/lib/slider";
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
interface LabelValue {
    label?: string;
    value?: number;
}
export interface NumberRangeInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "number-range";
    defaultRangeValueType: "none" | "full" | "partial";
    defaultRangeLowerValue?: number;
    defaultRangeUpperValue?: number;
    lowerBound?: number;
    upperBound?: number;
    marks?: LabelValue[];
    orientation?: "horizontal" | "vertical";
    onChangeData: UserInterfaceProps["onChangeData"];
    startKey: string;
    endKey: string;
    userInterfaceData: UserInterfaceProps["data"];
}
interface NumberRangeInterfaceComponentState {
}
export declare class NumberRangeInterfaceComponent extends BaseInterfaceComponent<NumberRangeInterfaceComponentProps, NumberRangeInterfaceComponentState> {
    static defaultProps: {
        startKey: string;
        endKey: string;
        orientation: string;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    static getDefinitionDefaultValue({ defaultRangeValueType, defaultRangeLowerValue, defaultRangeUpperValue, lowerBound, upperBound, endKey, startKey, }: NumberRangeInterfaceComponentProps): {};
    handleChange: (value: SliderValue) => void;
    getDefaultValue: () => {};
    getValues: () => [number, number];
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=NumberRangeInterfaceComponent.d.ts.map