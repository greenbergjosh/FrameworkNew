import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent";
import { ListInterfaceComponentProps } from "./types";
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
    static manageForm: (...extend: (Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps> | Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
    listId: string;
    render(): JSX.Element;
}
//# sourceMappingURL=ListInterfaceComponent.d.ts.map