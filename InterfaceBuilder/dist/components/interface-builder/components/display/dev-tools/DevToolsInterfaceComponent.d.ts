import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent";
import { DevToolsInterfaceComponentProps, DevToolsInterfaceComponentState } from "./types";
export declare class DevToolsInterfaceComponent extends BaseInterfaceComponent<DevToolsInterfaceComponentProps, DevToolsInterfaceComponentState> {
    constructor(props: DevToolsInterfaceComponentProps);
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
    componentDidMount(): void;
    componentDidUpdate(prevProps: Readonly<DevToolsInterfaceComponentProps>): void;
    handleChange: (userInterfaceData: any) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=DevToolsInterfaceComponent.d.ts.map