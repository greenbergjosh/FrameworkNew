import { ComponentDefinitionNamedProps, UserInterfaceProps } from "globalTypes";
import { InputProps } from "antd/lib/input";
import { RgbaColor } from "react-colorful";
export interface ColorPickerInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "color-picker";
    defaultValue?: string;
    onChangeData: UserInterfaceProps["onChangeData"];
    placeholder?: string;
    userInterfaceData: UserInterfaceProps["data"];
    valueKey: string;
    size: InputProps["size"];
}
export interface ColorPickerInterfaceComponentState {
    visible: boolean;
    colorSpace: "hex" | "rgba";
    colorString: string;
    rgbaColor: RgbaColor;
}
//# sourceMappingURL=types.d.ts.map