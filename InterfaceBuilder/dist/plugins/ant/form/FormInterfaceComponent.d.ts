import { ColProps } from "antd/lib/grid";
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinition, ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
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
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=FormInterfaceComponent.d.ts.map