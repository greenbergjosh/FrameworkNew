import { SelectableProps } from "components/interface-builder/components/_shared/selectable/types";
import { SelectProps as AntdSelectProps } from "antd/lib/select";
export interface ITagsProps {
    allowClear: boolean;
    placeholder: string;
    multiple?: boolean;
    size: AntdSelectProps["size"];
}
export declare type TagsProps = SelectableProps & ITagsProps;
//# sourceMappingURL=types.d.ts.map