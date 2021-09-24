import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { DataInjectorInterfaceComponentProps, DataInjectorInterfaceComponentState, EVENTS } from "./types";
import { JSONRecord } from "../../../globalTypes/JSONTypes";
import { LayoutDefinition } from "../../../globalTypes";
export declare class DataInjectorInterfaceComponent extends BaseInterfaceComponent<DataInjectorInterfaceComponentProps, DataInjectorInterfaceComponentState> {
    static availableEvents: EVENTS[];
    static defaultProps: {
        userInterfaceData: {};
        valueKey: string;
        outboundValueKey: string;
        showBorder: boolean;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    componentDidMount(): void;
    componentDidUpdate(prevProps: Readonly<DataInjectorInterfaceComponentProps>): void;
    /**
     * Display mode method to put stored values into the model
     */
    updateValue: () => void;
    getValueByType: () => JSONRecord | string | boolean | number | null;
    /**
     * Edit mode change event handler
     * @param userInterfaceData
     */
    handleChange: (userInterfaceData: any) => void;
    render(): JSX.Element | null;
}
//# sourceMappingURL=DataInjectorInterfaceComponent.d.ts.map