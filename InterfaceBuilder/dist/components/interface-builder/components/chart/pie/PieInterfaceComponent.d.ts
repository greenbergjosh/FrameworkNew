import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent";
import { PieInterfaceComponentProps, PieInterfaceComponentState } from "./types";
export declare class PieInterfaceComponent extends BaseInterfaceComponent<PieInterfaceComponentProps, PieInterfaceComponentState> {
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
    constructor(props: PieInterfaceComponentProps);
    componentDidUpdate(prevProps: Readonly<PieInterfaceComponentProps>): void;
    componentDidMount(): void;
    private createTooltipFunction;
    render(): JSX.Element;
}
//# sourceMappingURL=PieInterfaceComponent.d.ts.map