import { ComponentDefinition, LayoutDefinition } from "../components/base/BaseInterfaceComponent";
export interface ManageComponentFormProps {
    componentDefinition: ComponentDefinition;
    manageForm: ComponentDefinition | ComponentDefinition[];
    onChangeDefinition: (componentDefinition: ComponentDefinition) => void;
    layoutDefinition: LayoutDefinition;
}
export declare const ManageComponentForm: ({ componentDefinition, manageForm, onChangeDefinition, }: ManageComponentFormProps) => JSX.Element;
//# sourceMappingURL=ManageComponentForm.d.ts.map