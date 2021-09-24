import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent";
import { SelectProps, SelectState } from "./types";
/******************************
 * Component
 */
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
    static manageForm: (...extend: (Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps> | Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
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