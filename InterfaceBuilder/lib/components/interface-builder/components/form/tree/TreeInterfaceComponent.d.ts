import { UserInterfaceProps } from "../../../UserInterface";
import "./tree-interface-component.scss";
import { AntTreeNodeDropEvent, AntTreeNodeMouseEvent, AntTreeNodeSelectedEvent, TreeNodeNormal } from "antd/lib/tree/Tree";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps, ComponentDefinition } from "../../base/BaseInterfaceComponent";
declare type EntryType = "standard" | "leaf" | "parent";
export interface TreeInterfaceComponentProps extends ComponentDefinitionNamedProps {
    addLabel: string;
    addLeafLabel: string;
    addParentLabel: string;
    allowAdd?: boolean;
    allowAddLeaves?: boolean;
    allowAddParents?: boolean;
    allowDetails?: boolean;
    allowNestInLeaves?: boolean;
    allowSelectParents?: boolean;
    component: "tree";
    components: ComponentDefinition[];
    detailsOrientation?: "left" | "right" | "below";
    emptyText: string;
    modifiable?: boolean;
    onChangeData: UserInterfaceProps["onChangeData"];
    selectable?: boolean;
    selectedKey?: string;
    userInterfaceData?: UserInterfaceProps["data"];
    valueKey: string;
}
export declare class TreeInterfaceComponent extends BaseInterfaceComponent<TreeInterfaceComponentProps> {
    static defaultProps: {
        addLabel: string;
        addLeafLabel: string;
        addParentLabel: string;
        emptyText: string;
    };
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        componentDefinition: {
            component: string;
        };
    };
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    addEntry: (type: EntryType) => () => void;
    handleDragOver: (event: AntTreeNodeMouseEvent) => void;
    handleDrop: (event: AntTreeNodeDropEvent) => void;
    handleSelect: (selectedKeys: string[], event: AntTreeNodeSelectedEvent) => void;
    handleDelete: (item: TreeNodeNormal) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=TreeInterfaceComponent.d.ts.map