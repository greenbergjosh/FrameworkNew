import { SelectableProps } from "../_shared/selectable/types";
import { SelectProps as AntdSelectProps } from "antd/lib/select";
export interface IRadioProps {
    allowClear: boolean;
    placeholder: string;
    multiple?: boolean;
    size: AntdSelectProps["size"];
    buttonStyle: "solid" | "outline";
    buttonType: "radio" | "button";
}
export declare type RadioProps = SelectableProps & IRadioProps;
//# sourceMappingURL=types.d.ts.map