import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent";
import { DataInjectorInterfaceComponentProps, DataInjectorInterfaceComponentState, EVENTS } from "./types";
import { JSONRecord } from "components/interface-builder/@types/JSONTypes";
export declare class DataInjectorInterfaceComponent extends BaseInterfaceComponent<DataInjectorInterfaceComponentProps, DataInjectorInterfaceComponentState> {
    static availableEvents: EVENTS[];
    static defaultProps: {
        userInterfaceData: {};
        valueKey: string;
        showBorder: boolean;
    };
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        description: string;
        componentDefinition: {
            component: string;
            components: never[];
        };
    };
    static manageForm: (...extend: (Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps> | Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
    componentDidMount(): void;
    componentDidUpdate(prevProps: Readonly<DataInjectorInterfaceComponentProps>): void;
    updateValue: () => void;
    getValueByType: () => JSONRecord | string | boolean | number;
    render(): JSX.Element | null;
}
//# sourceMappingURL=DataInjectorInterfaceComponent.d.ts.map