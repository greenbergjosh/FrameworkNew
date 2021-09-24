import { UserInterfaceProps } from "../../../UserInterface";
import { EditorLang, EditorTheme } from "./code-editor";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
export interface CodeEditorInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "code-editor";
    defaultLanguage: EditorLang;
    defaultTheme: EditorTheme;
    defaultValue?: string;
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
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
    handleChange: ({ value: newValue }: {
        value: string;
    }) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=CodeEditorInterfaceComponent.d.ts.map