import { ComponentDefinition } from "../components/base/BaseInterfaceComponent";
import { UserInterfaceProps } from "components/interface-builder/UserInterface";
export interface ManageComponentModalProps {
    componentDefinition: null | Partial<ComponentDefinition>;
    onCancel: () => void;
    onConfirm: (componentDefinition: ComponentDefinition) => void;
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
    userInterfaceData: UserInterfaceProps["data"];
}
export declare const ManageComponentModal: ({ componentDefinition: propComponentDefinition, onCancel, onConfirm, getRootUserInterfaceData, userInterfaceData, }: ManageComponentModalProps) => JSX.Element;
//# sourceMappingURL=ManageComponentModal.d.ts.map