import { EditorLang, EditorTheme } from "./code-editor";
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
export interface CodeEditorInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "code-editor";
    defaultLanguage: EditorLang;
    defaultTheme: EditorTheme;
    defaultValue?: string;
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData: UserInterfaceProps["data"];
    valueKey: string;
}
interface CodeEditorInterfaceComponentState {
    value: boolean;
}
export declare class CodeEditorInterfaceComponent extends BaseInterfaceComponent<CodeEditorInterfaceComponentProps, CodeEditorInterfaceComponentState> {
    static defaultProps: {
        valueKey: string;
        defaultValue: string;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    handleChange: ({ value: newValue }: {
        value: string;
    }) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=CodeEditorInterfaceComponent.d.ts.map