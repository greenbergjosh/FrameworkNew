import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { RadioProps } from "./types";
import { RadioChangeEvent } from "antd/lib/radio";
import { LayoutDefinition } from "../../../globalTypes";
export declare class RadioInterfaceComponent extends BaseInterfaceComponent<RadioProps> {
    constructor(props: RadioProps);
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
    handleChange: (e: RadioChangeEvent) => void;
    /****************************************************************
     * Define this component's render for Selectable to call
     * so Selectable can pass in Selectable state and props.
     * Props must implement SelectableChildProps interface.
     */
    private renderRadio;
    render(): JSX.Element;
}
//# sourceMappingURL=RadioInterfaceComponent.d.ts.map