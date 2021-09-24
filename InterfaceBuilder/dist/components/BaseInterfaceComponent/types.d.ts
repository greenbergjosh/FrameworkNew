import { JSONRecord } from "../../globalTypes/JSONTypes";
import { BaseInterfaceComponent } from "./BaseInterfaceComponent";
import { ComponentDefinition, ComponentDefinitionNamedProps, ComponentRenderMetaProps, UserInterfaceProps } from "../../globalTypes";
export interface ChangeObject {
    [key: string]: unknown;
}
export declare type DataBindings = {
    [K in keyof ComponentDefinitionNamedProps]: JSONRecord;
};
export declare type BaseInterfaceComponentProps = ComponentDefinition & ComponentRenderMetaProps;
export declare type BaseInterfaceComponentType = typeof BaseInterfaceComponent;
export declare type GetValue = (key: string, userInterfaceData?: UserInterfaceProps["data"], getRootUserInterfaceData?: UserInterfaceProps["getRootUserInterfaceData"]) => string | number | boolean | JSONRecord | JSONRecord[] | null | undefined;
export declare type SetValue = (key: string, value: any, userInterfaceData?: UserInterfaceProps["data"]) => void;
export declare type GetMergedData = (key: string, value: any, userInterfaceData?: UserInterfaceProps["data"]) => {
    mergedData: JSONRecord;
    isTargetingRoot: boolean;
};
export interface IBaseInterfaceComponent {
    getValue: GetValue;
    setValue: SetValue;
    getMergedData: GetMergedData;
}
//# sourceMappingURL=types.d.ts.map