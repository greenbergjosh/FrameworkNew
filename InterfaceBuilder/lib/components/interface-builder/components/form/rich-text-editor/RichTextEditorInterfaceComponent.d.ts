/// <reference types="ckeditor" />
import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
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
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        formControl: boolean;
        componentDefinition: {
            component: string;
            label: string;
        };
    };
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
    constructor(props: InputInterfaceComponentProps);
    handleChange: (evt: CKEDITOR.eventInfo) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=RichTextEditorInterfaceComponent.d.ts.map