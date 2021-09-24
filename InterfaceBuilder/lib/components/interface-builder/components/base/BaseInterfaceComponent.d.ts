import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT";
import React from "react";
import { UserInterfaceProps } from "../../UserInterface";
export interface LayoutDefinition {
    /** A grouping of the component in the component selection */
    category: string;
    /** A unique name for this component */
    name: string;
    /** The display text of this component */
    title: string;
    /** The AntDesign icon name of this component */
    icon?: string;
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
    hideLabel?: boolean;
    label?: string;
    visibilityConditions?: JSONObject;
}
export interface ComponentDefinitionRecursiveProp {
    [key: string]: ComponentDefinition[];
}
export declare type ComponentDefinition = ComponentDefinitionNamedProps | ComponentDefinitionNamedProps & ComponentDefinitionRecursiveProp;
export interface ComponentRenderMetaProps {
    mode?: UserInterfaceProps["mode"];
    userInterfaceData?: any;
    onChangeData?: (newData: ChangeObject) => void;
    onChangeSchema?: (newSchema: ComponentDefinition) => void;
    userInterfaceSchema?: ComponentDefinition;
}
export declare type BaseInterfaceComponentProps = ComponentDefinition & ComponentRenderMetaProps;
export declare type BaseInterfaceComponentType = typeof BaseInterfaceComponent;
export declare abstract class BaseInterfaceComponent<T extends BaseInterfaceComponentProps, Y = {}> extends React.Component<T, Y> {
    static getLayoutDefinition(): LayoutDefinition;
    static getDefintionDefaultValue(componentDefinition: ComponentDefinition & {
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
}
export declare function getDefaultsFromComponentDefinitions(componentDefinitions: ComponentDefinition[]): {};
//# sourceMappingURL=BaseInterfaceComponent.d.ts.map