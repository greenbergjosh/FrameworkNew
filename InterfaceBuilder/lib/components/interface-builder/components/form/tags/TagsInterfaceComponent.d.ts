import { SelectInterfaceComponent, SelectProps } from "../select/SelectInterfaceComponent";
export declare class TagsInterfaceComponent extends SelectInterfaceComponent {
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
}
//# sourceMappingURL=TagsInterfaceComponent.d.ts.map