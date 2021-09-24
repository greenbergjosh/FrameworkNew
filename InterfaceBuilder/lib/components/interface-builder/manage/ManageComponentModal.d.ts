import { ComponentDefinition } from "../components/base/BaseInterfaceComponent";
export interface ManageComponentModalProps {
    componentDefinition: null | Partial<ComponentDefinition>;
    onCancel: () => void;
    onConfirm: (componentDefinition: ComponentDefinition) => void;
}
export declare const ManageComponentModal: ({ componentDefinition: propComponentDefinition, onCancel, onConfirm, }: ManageComponentModalProps) => JSX.Element;
//# sourceMappingURL=ManageComponentModal.d.ts.map