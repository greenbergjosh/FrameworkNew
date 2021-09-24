import { DraggedItemProps, DroppableTargetProps } from "../../../dnd";
import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinition, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
export interface ListInterfaceComponentProps extends ComponentDefinitionNamedProps {
    addItemLabel: string;
    allowDelete: boolean;
    allowReorder: boolean;
    component: "list";
    emptyText?: string;
    orientation?: "horizontal" | "vertical";
    /** Interleave:
     * As a list component, this describes in what manner to repeat, if there are multiple components.
     * "none" - There can only be a single component, it alone is repeated every time. (Default)
     * "round-robin" - Every component in the list is rotated through with each addition.
     * "set" - The entire set of components is repeated with each iteration.
     */
    interleave?: "none" | "round-robin" | "set";
    components: ComponentDefinition[];
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData?: UserInterfaceProps["data"];
    valueKey: string;
    preconfigured?: boolean;
    unwrapped?: boolean;
}
export declare class ListInterfaceComponent extends BaseInterfaceComponent<ListInterfaceComponentProps> {
    static defaultProps: {
        addItemLabel: string;
        allowDelete: boolean;
        allowReorder: boolean;
        orientation: string;
        interleave: string;
        unwrapped: boolean;
        userInterfaceData: {};
        valueKey: string;
    };
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        componentDefinition: {
            component: string;
            components: never[];
        };
    };
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    handleAddClick: () => void;
    handleDeleteClick: ({ index }: {
        index: number;
    }) => void;
    handleItemRearrange: (draggedItem: DraggedItemProps, dropTarget: DroppableTargetProps) => void;
    handleChangeData: (index: number) => (newData: object) => void | undefined;
    listId: string;
    render(): JSX.Element;
}
//# sourceMappingURL=ListInterfaceComponent.d.ts.map