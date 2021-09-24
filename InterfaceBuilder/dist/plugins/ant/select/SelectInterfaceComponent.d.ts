import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { SelectProps, SelectState } from "./types";
import { LayoutDefinition } from "../../../globalTypes";
export declare class SelectInterfaceComponent extends BaseInterfaceComponent<SelectProps, SelectState> {
    constructor(props: SelectProps);
    static availableEvents: string[];
    static defaultProps: {
        allowClear: boolean;
        createNewLabel: string;
        defaultValue: undefined;
        multiple: boolean;
        placeholder: string;
        valueKey: string;
        valuePrefix: string;
        valueSuffix: string;
    };
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    static getLayoutDefinition(): LayoutDefinition;
    protected get mode(): "multiple" | "default" | "tags" | "combobox" | "SECRET_COMBOBOX_MODE_DO_NOT_USE" | undefined;
    handleChange: (value: string | string[]) => void;
    private filterOption;
    /****************************************************************
     * Define this component's render for Selectable to call
     * so Selectable can pass in Selectable state and props.
     * Props must implement SelectableChildProps interface.
     */
    private renderSelect;
    render(): JSX.Element;
}
//# sourceMappingURL=SelectInterfaceComponent.d.ts.map