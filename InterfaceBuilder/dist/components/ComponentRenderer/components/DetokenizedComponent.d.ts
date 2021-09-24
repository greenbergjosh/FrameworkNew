import { RenderInterfaceComponentProps } from "../types";
import { ComponentDefinition, UserInterfaceProps } from "../../../globalTypes";
export declare function DetokenizedComponent(props: {
    componentDefinition: ComponentDefinition & {
        valueKey?: string;
        defaultValue?: any;
    };
    data: UserInterfaceProps["data"];
    dragDropDisabled?: boolean;
    getRootData: UserInterfaceProps["getRootUserInterfaceData"];
    setRootData: UserInterfaceProps["setRootUserInterfaceData"];
    index: number;
    mode: UserInterfaceProps["mode"];
    onChangeData: UserInterfaceProps["onChangeData"];
    onChangeSchema: RenderInterfaceComponentProps["onChangeSchema"];
    path: string;
    submit?: UserInterfaceProps["submit"];
}): JSX.Element;
//# sourceMappingURL=DetokenizedComponent.d.ts.map