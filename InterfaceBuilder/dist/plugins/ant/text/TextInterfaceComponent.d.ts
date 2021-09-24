import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { TextInterfaceComponentProps, TextInterfaceComponentState } from "./types";
import { LayoutDefinition } from "../../../globalTypes";
export declare class TextInterfaceComponent extends BaseInterfaceComponent<TextInterfaceComponentProps, TextInterfaceComponentState> {
    static defaultProps: {
        userInterfaceData: {};
        valueKey: string;
        showBorder: boolean;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    render(): JSX.Element;
}
//# sourceMappingURL=TextInterfaceComponent.d.ts.map