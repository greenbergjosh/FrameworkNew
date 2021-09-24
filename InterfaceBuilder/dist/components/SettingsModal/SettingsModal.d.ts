import { ComponentDefinition, UserInterfaceProps } from "../../globalTypes";
export interface ManageComponentModalProps {
    componentDefinition: null | Partial<ComponentDefinition>;
    onCancel: () => void;
    onConfirm: (componentDefinition: ComponentDefinition) => void;
    getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"];
    setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"];
    userInterfaceData: UserInterfaceProps["data"];
}
export declare const SettingsModal: ({ componentDefinition: propComponentDefinition, onCancel, onConfirm, getRootUserInterfaceData, setRootUserInterfaceData, userInterfaceData, }: ManageComponentModalProps) => JSX.Element;
//# sourceMappingURL=SettingsModal.d.ts.map