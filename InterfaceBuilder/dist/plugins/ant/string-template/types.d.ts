import { JSONRecord } from "../../../globalTypes/JSONTypes";
import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes";
export interface StringTemplateInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "string-template";
    components: ComponentDefinition[];
    onChangeData: UserInterfaceProps["onChangeData"];
    preconfigured?: boolean;
    userInterfaceData?: UserInterfaceProps["data"];
    valueKey: string;
    serializeSrc?: string;
    deserializeSrc?: string;
    serialize?: SerializeType;
    deserialize?: DeserializeType;
    showBorder?: boolean;
}
export declare type SerializeType = (value?: JSONRecord | JSONRecord[]) => string | undefined;
export declare type DeserializeType = (value?: string) => (JSONRecord | JSONRecord[]) | undefined;
export interface StringTemplateInterfaceComponentState {
    serialize: SerializeType;
    deserialize: DeserializeType;
    data?: JSONRecord | JSONRecord[];
}
//# sourceMappingURL=types.d.ts.map