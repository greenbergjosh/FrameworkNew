/// <reference types="ckeditor" />
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
export interface InputInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "rich-text-editor";
    defaultValue?: string;
    onChangeData: UserInterfaceProps["onChangeData"];
    placeholder: string;
    userInterfaceData: UserInterfaceProps["data"];
    valueKey: string;
}
export declare class RichTextEditorInterfaceComponent extends BaseInterfaceComponent<InputInterfaceComponentProps> {
    static defaultProps: {
        valueKey: string;
        defaultValue: string;
        placeholder: string;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    constructor(props: InputInterfaceComponentProps);
    handleChange: (evt: CKEDITOR.eventInfo) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=RichTextEditorInterfaceComponent.d.ts.map