import { ComponentDefinition, LayoutDefinition } from "../components/base/BaseInterfaceComponent";
import { UserInterfaceProps } from "components/interface-builder/UserInterface";
export interface ManageComponentFormProps {
    componentDefinition: ComponentDefinition;
    manageForm: ComponentDefinition | ComponentDefinition[];
    onChangeDefinition: (componentDefinition: ComponentDefinition) => void;
    layoutDefinition: LayoutDefinition;
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
}
export declare const ManageComponentForm: ({ componentDefinition, manageForm, onChangeDefinition, getRootUserInterfaceData, }: ManageComponentFormProps) => JSX.Element;
//# sourceMappingURL=ManageComponentForm.d.ts.map