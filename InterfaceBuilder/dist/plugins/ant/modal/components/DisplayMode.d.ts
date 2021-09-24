import { ComponentDefinition, ComponentRenderMetaProps, IBaseInterfaceComponent, UserInterfaceProps } from "globalTypes";
export declare function DisplayMode(props: {
    components: ComponentDefinition[];
    getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"];
    setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"];
    mode: UserInterfaceProps["mode"];
    onChangeData: UserInterfaceProps["onChangeData"];
    onChangeSchema: ComponentRenderMetaProps["onChangeSchema"];
    userInterfaceData: UserInterfaceProps["data"];
    userInterfaceSchema?: ComponentDefinition;
    setValue: IBaseInterfaceComponent["setValue"];
    getValue: IBaseInterfaceComponent["getValue"];
    showKey: string;
    title: string;
    valueKey: string;
    footer: {
        components: ComponentDefinition[];
    };
}): JSX.Element;
//# sourceMappingURL=DisplayMode.d.ts.map