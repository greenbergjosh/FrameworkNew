import { ComponentDefinition, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
export interface ManageComponentFormProps {
    componentDefinition: ComponentDefinition;
    manageForm: ComponentDefinition | ComponentDefinition[];
    onChangeDefinition: (componentDefinition: ComponentDefinition) => void;
    layoutDefinition: LayoutDefinition;
    getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"];
    setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"];
}
export declare const Settings: ({ componentDefinition, manageForm, onChangeDefinition, getRootUserInterfaceData, setRootUserInterfaceData, }: ManageComponentFormProps) => JSX.Element;
//# sourceMappingURL=Settings.d.ts.map