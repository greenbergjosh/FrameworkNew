import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes";
export interface DevToolsInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "text";
    components: ComponentDefinition[];
    onChangeData: UserInterfaceProps["onChangeData"];
    preconfigured?: boolean;
    userInterfaceData?: UserInterfaceProps["data"];
    valueKey: string;
    height: number;
}
export interface DevToolsInterfaceComponentState {
    showDataViewer: boolean;
}
//# sourceMappingURL=types.d.ts.map