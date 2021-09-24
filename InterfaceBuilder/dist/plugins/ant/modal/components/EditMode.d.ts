import { ComponentDefinition, ComponentRenderMetaProps, UserInterfaceProps } from "globalTypes";
export declare function EditMode(props: {
    components: ComponentDefinition[];
    getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"];
    setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"];
    mode: UserInterfaceProps["mode"];
    onChangeData: UserInterfaceProps["onChangeData"];
    onChangeSchema: ComponentRenderMetaProps["onChangeSchema"];
    title: string;
    userInterfaceData: UserInterfaceProps["data"];
    userInterfaceSchema?: ComponentDefinition;
    footer: {
        components: ComponentDefinition[];
    };
}): JSX.Element;
//# sourceMappingURL=EditMode.d.ts.map