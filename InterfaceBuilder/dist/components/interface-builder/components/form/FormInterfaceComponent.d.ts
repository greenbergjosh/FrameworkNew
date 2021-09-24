import { ColProps } from "antd/lib/grid";
import { UserInterfaceProps } from "../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinition, ComponentDefinitionNamedProps } from "../base/BaseInterfaceComponent";
interface FormColumnLayout {
    labelCol?: ColProps;
    wrapperCol?: ColProps;
}
interface IFormInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "form";
    components?: ComponentDefinition[];
    formColumnLayout?: FormColumnLayout;
    onChangeData: UserInterfaceProps["onChangeData"];
    orientation: "inline" | "horizontal" | "vertical";
    userInterfaceData?: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
}
interface FormInterfaceComponentDisplayModeProps extends IFormInterfaceComponentProps {
    mode: "display";
}
interface FormInterfaceComponentEditModeProps extends IFormInterfaceComponentProps {
    mode: "edit";
    onChangeSchema?: (newSchema: ComponentDefinition) => void;
    userInterfaceSchema?: ComponentDefinition;
}
export declare type FormInterfaceComponentProps = FormInterfaceComponentDisplayModeProps | FormInterfaceComponentEditModeProps;
export declare class FormInterfaceComponent extends BaseInterfaceComponent<FormInterfaceComponentProps> {
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        componentDefinition: {
            component: string;
            label: string;
            components: never[];
        };
    };
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=FormInterfaceComponent.d.ts.map