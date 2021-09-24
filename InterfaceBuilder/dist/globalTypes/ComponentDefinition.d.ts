import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT";
import { EventPayloadType } from "../services/EventBus";
import { UserInterfaceProps } from "../globalTypes";
import { DataBindings } from "../components/BaseInterfaceComponent/types";
export interface ComponentDefinitionNamedProps {
    key: string;
    abstract?: boolean;
    component: string;
    defaultValue?: any;
    help?: string;
    hidden?: boolean;
    invisible?: boolean;
    hideLabel?: boolean;
    label?: string;
    preview?: boolean;
    visibilityConditions?: JSONObject;
    bindable?: boolean;
    bindings?: DataBindings;
    getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"];
    setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"];
    [key: string]: unknown;
    onRaiseEvent?: ((eventName: string, eventPayload: EventPayloadType, source: any) => void) | undefined;
    classNames?: string[];
}
export interface ComponentDefinitionRecursiveProp {
    [key: string]: ComponentDefinition[];
}
export interface ComponentRenderMetaProps {
    mode?: UserInterfaceProps["mode"];
    userInterfaceData?: UserInterfaceProps["data"];
    getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"];
    setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"];
    onChangeData?: UserInterfaceProps["onChangeData"];
    onChangeSchema?: (newSchema: ComponentDefinition) => void;
    userInterfaceSchema?: ComponentDefinition;
    submit?: UserInterfaceProps["submit"];
}
/**
 * ComponentDefinition
 */
export declare type ComponentDefinition = ComponentDefinitionNamedProps | (ComponentDefinitionNamedProps & ComponentDefinitionRecursiveProp);
//# sourceMappingURL=ComponentDefinition.d.ts.map