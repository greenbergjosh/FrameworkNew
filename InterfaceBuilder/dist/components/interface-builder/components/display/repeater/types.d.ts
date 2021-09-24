import { ComponentDefinition, ComponentDefinitionNamedProps } from "components/interface-builder/components/base/BaseInterfaceComponent";
import { UserInterfaceProps } from "components/interface-builder/UserInterface";
import { JSONRecord } from "components/interface-builder/@types/JSONTypes";
export declare type OrientationType = "horizontal" | "vertical";
export interface RepeaterInterfaceComponentProps extends ComponentDefinitionNamedProps {
    addItemLabel: string;
    allowDelete: boolean;
    allowReorder: boolean;
    component: "repeater";
    components: ComponentDefinition[];
    emptyText?: string;
    hasInitialRecord?: boolean;
    hasLastItemComponents?: boolean;
    lastItemComponents?: ComponentDefinition[];
    onChangeData: UserInterfaceProps["onChangeData"];
    orientation?: OrientationType;
    preconfigured?: boolean;
    userInterfaceData?: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
    valueKey: string;
    readonly: boolean;
}
export interface ModeProps {
    components: ComponentDefinition[];
    hasInitialRecord?: boolean;
    hasLastItemComponents?: boolean;
    lastItemComponents?: ComponentDefinition[];
    orientation?: OrientationType;
    data: JSONRecord[];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
    onChange: (data: JSONRecord | JSONRecord[], subpath?: string) => void | undefined;
}
export interface ConfigureModeProps extends ModeProps {
    preconfigured?: boolean;
}
export interface DisplayModeProps extends ModeProps {
    addItemLabel: string;
    description?: string;
    readonly: boolean;
}
export interface RepeaterProps {
    components: ComponentDefinition[];
    data: JSONRecord[];
    hasInitialRecord?: boolean;
    hasLastItemComponents?: boolean;
    lastItemComponents?: ComponentDefinition[];
    onChange: (data: JSONRecord | JSONRecord[], subpath?: string) => void;
    orientation?: OrientationType;
    userInterfaceData?: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
    readonly: boolean;
}
export interface RepeaterItemProps {
    components: ComponentDefinition[];
    itemData: JSONRecord;
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
    hasNextSibling: boolean;
    index: number;
    isDraggable: boolean;
    onAddRow: (index: number) => void;
    onChange: (index: number, itemData: JSONRecord) => void;
    onDelete: (index: number) => void;
    onMoveDown: (index: number) => void;
    onMoveUp: (index: number) => void;
    readonly: boolean;
}
//# sourceMappingURL=types.d.ts.map