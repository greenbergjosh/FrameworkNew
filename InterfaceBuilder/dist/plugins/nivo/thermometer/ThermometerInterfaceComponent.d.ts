import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ThermometerInterfaceComponentProps, ThermometerInterfaceComponentState } from "./types";
import { LayoutDefinition } from "../../../globalTypes";
export declare class ThermometerInterfaceComponent extends BaseInterfaceComponent<ThermometerInterfaceComponentProps, ThermometerInterfaceComponentState> {
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    constructor(props: ThermometerInterfaceComponentProps);
    componentDidUpdate(prevProps: Readonly<ThermometerInterfaceComponentProps>): void;
    render(): JSX.Element;
}
//# sourceMappingURL=ThermometerInterfaceComponent.d.ts.map