import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent";
import { MapInterfaceComponentProps, MapInterfaceComponentState } from "./types";
export declare class MapInterfaceComponent extends BaseInterfaceComponent<MapInterfaceComponentProps, MapInterfaceComponentState> {
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        componentDefinition: {
            component: string;
            label: string;
        };
    };
    static manageForm: (...extend: (Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps> | Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
    constructor(props: MapInterfaceComponentProps);
    componentDidUpdate(prevProps: Readonly<MapInterfaceComponentProps>): void;
    render(): JSX.Element;
}
//# sourceMappingURL=MapInterfaceComponent.d.ts.map