import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { MapInterfaceComponentProps, MapInterfaceComponentState } from "./types";
import { LayoutDefinition } from "../../../globalTypes";
export declare class MapInterfaceComponent extends BaseInterfaceComponent<MapInterfaceComponentProps, MapInterfaceComponentState> {
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    constructor(props: MapInterfaceComponentProps);
    componentDidUpdate(prevProps: Readonly<MapInterfaceComponentProps>): void;
    render(): JSX.Element;
}
//# sourceMappingURL=MapInterfaceComponent.d.ts.map