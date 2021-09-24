import { ComponentDefinition, ComponentDefinitionNamedProps } from "components/interface-builder/components/base/BaseInterfaceComponent";
import { UserInterfaceProps } from "components/interface-builder/UserInterface";
export interface DevToolsInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "text";
    components: ComponentDefinition[];
    onChangeData: UserInterfaceProps["onChangeData"];
    preconfigured?: boolean;
    userInterfaceData?: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
    valueKey: string;
    height: number;
}
export interface DevToolsInterfaceComponentState {
    showDataViewer: boolean;
}
//# sourceMappingURL=types.d.ts.map