import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { DevToolsInterfaceComponentProps, DevToolsInterfaceComponentState } from "./types";
import { LayoutDefinition } from "../../../globalTypes";
export declare class DevToolsInterfaceComponent extends BaseInterfaceComponent<DevToolsInterfaceComponentProps, DevToolsInterfaceComponentState> {
    constructor(props: DevToolsInterfaceComponentProps);
    static defaultProps: {
        userInterfaceData: {};
        valueKey: string;
        showBorder: boolean;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    handleChange: (userInterfaceData: any) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=DevToolsInterfaceComponent.d.ts.map