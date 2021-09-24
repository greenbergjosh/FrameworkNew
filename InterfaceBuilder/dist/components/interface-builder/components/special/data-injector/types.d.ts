import { ComponentDefinition, ComponentDefinitionNamedProps } from "components/interface-builder/components/base/BaseInterfaceComponent";
import { UserInterfaceProps } from "components/interface-builder/UserInterface";
export interface DataInjectorInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "data-injector";
    components: ComponentDefinition[];
    onChangeData: UserInterfaceProps["onChangeData"];
    preconfigured?: boolean;
    userInterfaceData?: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
    valueKey: string;
    jsonValue: string;
    booleanValue: boolean;
    numberValue: number;
    stringValue: string;
    dataType: "json" | "number" | "string" | "boolean";
}
export interface DataInjectorInterfaceComponentState {
    text: string;
}
export declare enum EVENTS {
    VALUE_CHANGED = "valueChanged"
}
//# sourceMappingURL=types.d.ts.map