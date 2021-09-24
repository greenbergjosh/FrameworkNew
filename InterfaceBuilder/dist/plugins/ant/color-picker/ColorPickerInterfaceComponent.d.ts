import React from "react";
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { LayoutDefinition } from "../../../globalTypes";
import { RgbaColor } from "react-colorful";
import { ColorPickerInterfaceComponentProps, ColorPickerInterfaceComponentState } from "plugins/ant/color-picker/types";
export declare class ColorPickerInterfaceComponent extends BaseInterfaceComponent<ColorPickerInterfaceComponentProps, ColorPickerInterfaceComponentState> {
    static defaultProps: {
        valueKey: string;
        defaultValue: string;
        placeholder: string;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    constructor(props: ColorPickerInterfaceComponentProps);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Readonly<ColorPickerInterfaceComponentProps>): void;
    /**
     * Public method for external clients to trigger a reset
     * @public
     */
    reset(): void;
    handleInputChange: ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => void;
    handlePickerChange: (rgbaColor: RgbaColor) => void;
    hide: () => void;
    handleVisibleChange: (visible: boolean) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=ColorPickerInterfaceComponent.d.ts.map