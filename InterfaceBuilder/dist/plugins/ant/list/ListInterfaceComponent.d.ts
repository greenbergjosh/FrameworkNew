import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ListInterfaceComponentProps } from "./types";
import { LayoutDefinition } from "../../../globalTypes";
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
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    listId: string;
    render(): JSX.Element;
}
//# sourceMappingURL=ListInterfaceComponent.d.ts.map