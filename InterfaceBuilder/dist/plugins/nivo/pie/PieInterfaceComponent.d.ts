import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { PieInterfaceComponentProps, PieInterfaceComponentState } from "./types";
import { LayoutDefinition } from "../../../globalTypes";
export declare class PieInterfaceComponent extends BaseInterfaceComponent<PieInterfaceComponentProps, PieInterfaceComponentState> {
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    constructor(props: PieInterfaceComponentProps);
    componentDidUpdate(prevProps: Readonly<PieInterfaceComponentProps>): void;
    componentDidMount(): void;
    private createTooltipFunction;
    render(): JSX.Element;
}
//# sourceMappingURL=PieInterfaceComponent.d.ts.map