import { SliderValue } from "antd/lib/slider";
import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
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
    static getDefintionDefaultValue({ defaultRangeValueType, defaultRangeLowerValue, defaultRangeUpperValue, lowerBound, upperBound, endKey, startKey, }: NumberRangeInterfaceComponentProps): {};
    handleChange: (value: SliderValue) => void;
    getDefaultValue: () => {};
    getValues: () => [number, number];
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=NumberRangeInterfaceComponent.d.ts.map