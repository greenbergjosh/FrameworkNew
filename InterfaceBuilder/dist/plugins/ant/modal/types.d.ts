import { ComponentDefinition, ComponentDefinitionNamedProps, ComponentRenderMetaProps, UserInterfaceProps } from "globalTypes";
export interface ModalInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "modal";
    components: ComponentDefinition[];
    footer: {
        components: ComponentDefinition[];
    };
    content: {
        components: ComponentDefinition[];
    };
    mode: UserInterfaceProps["mode"];
    onChangeData: UserInterfaceProps["onChangeData"];
    onChangeSchema: ComponentRenderMetaProps["onChangeSchema"];
    userInterfaceData: ComponentRenderMetaProps["userInterfaceData"];
    userInterfaceSchema?: ComponentDefinition;
    valueKey: string;
    showKey: string;
    title: string;
}
//# sourceMappingURL=types.d.ts.map