import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT";
import React from "react";
import { UserInterfaceProps } from "../../UserInterface";
import { EventPayloadType } from "../../../../services/event-bus";
import { IconProps } from "antd/lib/icon";
export interface LayoutDefinition {
    /** A grouping of the component in the component selection */
    category: string;
    /** A unique name for this component */
    name: string;
    /** The display text of this component */
    title: string;
    /** A description of this component */
    description?: string | {
        __html: string;
    };
    /** The AntDesign icon name of this component */
    icon?: string;
    /** An SVG icon component to use instead of AntDesign icons */
    iconComponent?: IconProps["component"];
    /** Whether or not this component is a form control */
    formControl?: boolean;
    /** The initial ComponentDefinition when creating an instance of this */
    componentDefinition: Partial<ComponentDefinition>;
}
export interface ChangeObject {
    [key: string]: unknown;
}
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
    [key: string]: unknown;
    onRaiseEvent?: ((eventName: string, eventPayload: EventPayloadType, source: any) => void) | undefined;
}
export interface ComponentDefinitionRecursiveProp {
    [key: string]: ComponentDefinition[];
}
export declare type ComponentDefinition = ComponentDefinitionNamedProps | (ComponentDefinitionNamedProps & ComponentDefinitionRecursiveProp);
export interface ComponentRenderMetaProps {
    mode?: UserInterfaceProps["mode"];
    userInterfaceData?: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
    onChangeData?: (newData: ChangeObject) => void;
    onChangeSchema?: (newSchema: ComponentDefinition) => void;
    userInterfaceSchema?: ComponentDefinition;
    submit?: UserInterfaceProps["submit"];
}
export declare type BaseInterfaceComponentProps = ComponentDefinition & ComponentRenderMetaProps;
export declare type BaseInterfaceComponentType = typeof BaseInterfaceComponent;
/**
 * BaseInterfaceComponent
 *
 * Events:
 * @static availableEvents: string[] - Add event names to raise in the component to this array
 * @method raiseEvent - Raise events by calling this method with an event name and a payload
 *
 * TODO: Create an eventManager HOC to provide an onRaiseEvent prop for all components
 */
export declare abstract class BaseInterfaceComponent<T extends BaseInterfaceComponentProps, Y = {}> extends React.Component<T, Y> {
    private _componentId;
    get componentId(): string;
    static getLayoutDefinition(): LayoutDefinition;
    static getDefinitionDefaultValue(componentDefinition: ComponentDefinition & {
        valueKey?: string;
        defaultValue?: any;
    }): {
        [key: string]: any;
    };
    static manageForm(...extend: ComponentDefinition[]): ComponentDefinition[];
    static getManageFormDefaults(): {
        [key: string]: any;
    };
    getDefaultValue(): unknown;
    /**
     * Gets the value from local or root UI data.
     * Provide the "root." keyword at the beginning of the valueKey to use root UI data.
     * @param valueKey
     * @param userInterfaceData -- Optional, provide if using a different source such as from prevProps
     * @param getRootUserInterfaceData -- Optional, provide if using a different source such as from prevProps
     */
    getValue(valueKey: string, userInterfaceData?: UserInterfaceProps["data"], getRootUserInterfaceData?: () => UserInterfaceProps["data"]): any;
    anyPropsChanged(prevProps: Readonly<BaseInterfaceComponentProps>, propsToCheck: Array<string>): boolean;
    static availableEvents: string[];
    raiseEvent(eventName: string, eventPayload: EventPayloadType): void;
}
export declare function getDefaultsFromComponentDefinitions(componentDefinitions: ComponentDefinition[]): {};
//# sourceMappingURL=BaseInterfaceComponent.d.ts.map