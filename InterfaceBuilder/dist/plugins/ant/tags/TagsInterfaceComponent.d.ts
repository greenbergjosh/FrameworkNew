import { SelectInterfaceComponent } from "../select/SelectInterfaceComponent";
import { TagsProps } from "./types";
import { LayoutDefinition } from "../../../globalTypes";
export declare class TagsInterfaceComponent extends SelectInterfaceComponent {
    constructor(props: TagsProps);
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
    protected get mode(): "default" | "multiple" | "tags" | "combobox" | "SECRET_COMBOBOX_MODE_DO_NOT_USE" | undefined;
}
//# sourceMappingURL=TagsInterfaceComponent.d.ts.map