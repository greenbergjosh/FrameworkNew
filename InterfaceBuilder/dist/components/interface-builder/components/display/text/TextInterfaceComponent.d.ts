import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent";
import { TextInterfaceComponentProps, TextInterfaceComponentState } from "./types";
export declare class TextInterfaceComponent extends BaseInterfaceComponent<TextInterfaceComponentProps, TextInterfaceComponentState> {
    static defaultProps: {
        userInterfaceData: {};
        valueKey: string;
        showBorder: boolean;
    };
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        description: string;
        componentDefinition: {
            component: string;
            components: never[];
        };
    };
    static manageForm: (...extend: (Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps> | Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
    render(): JSX.Element;
}
//# sourceMappingURL=TextInterfaceComponent.d.ts.map