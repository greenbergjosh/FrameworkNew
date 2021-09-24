/// <reference types="@welldone-software/why-did-you-render" />
import React from "react";
import { EventPayloadType } from "../../services/EventBus";
import { ComponentDefinition, LayoutDefinition } from "../../globalTypes";
import { BaseInterfaceComponentProps, GetMergedData, GetValue, SetValue } from "./types";
/**
 * BaseInterfaceComponent
 *
 * Events:
 * @static availableEvents: string[] - Add event names to raise in the component to this array
 * @method raiseEvent - Raise events by calling this method with an event name and a payload
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
     * Returns data with a value merged at the provided key path
     * @param key
     * @param value
     * @param userInterfaceData
     */
    getMergedData: GetMergedData;
    /**
     * Gets the value from local or root UI data.
     * Provide the "root." keyword at the beginning of the valueKey to use root UI data.
     * @param key
     * @param userInterfaceData -- Optional, provide if using a different source such as from prevProps
     * @param getRootUserInterfaceData -- Optional, provide if using a different source such as from prevProps
     */
    getValue: GetValue;
    /**
     * Sets the value in local or root UI parentRowData.
     * Provide the "$root." keyword at the beginning of the valueKey to use root UI parentRowData.
     * @param key
     * @param value
     * @param userInterfaceData
     */
    setValue: SetValue;
    anyPropsChanged(prevProps: Readonly<BaseInterfaceComponentProps>, propsToCheck: Array<string>): boolean;
    static availableEvents: string[];
    /**
     *
     * @param eventName
     * @param eventPayload
     */
    raiseEvent(eventName: string, eventPayload: EventPayloadType): void;
}
//# sourceMappingURL=BaseInterfaceComponent.d.ts.map