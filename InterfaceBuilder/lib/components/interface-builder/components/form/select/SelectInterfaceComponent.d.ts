import { SelectProps as AntdSelectProps } from "antd/lib/select";
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent";
import { TSEnum } from "../../../@types/ts-enum";
import { SelectableProps } from "../../_shared/selectable";
/******************************
 * Interfaces, Types, Enums
 */
export interface SelectState {
}
export interface ISelectProps {
    allowClear: boolean;
    placeholder: string;
    multiple?: boolean;
}
export declare type SelectProps = SelectableProps & ISelectProps;
export declare const MODES: TSEnum<AntdSelectProps["mode"]>;
/******************************
 * Component
 */
export declare class SelectInterfaceComponent extends BaseInterfaceComponent<SelectProps, SelectState> {
    constructor(props: SelectProps);
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
    protected get mode(): string | undefined;
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