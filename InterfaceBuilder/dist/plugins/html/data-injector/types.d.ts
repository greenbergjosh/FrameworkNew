import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes";
import { JSONRecord } from "../../../globalTypes/JSONTypes";
export interface DataInjectorInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "data-injector";
    components: ComponentDefinition[];
    onChangeData: UserInterfaceProps["onChangeData"];
    preconfigured?: boolean;
    userInterfaceData?: UserInterfaceProps["data"];
    valueKey: string;
    outboundValueKey: string;
    jsonValue: string | JSONRecord;
    booleanValue: boolean;
    numberValue: number;
    stringValue: string;
    dataType: "json" | "number" | "string" | "boolean";
    height: number;
}
export interface DataInjectorInterfaceComponentState {
    text: string;
}
export declare enum EVENTS {
    VALUE_CHANGED = "valueChanged"
}
//# sourceMappingURL=types.d.ts.map