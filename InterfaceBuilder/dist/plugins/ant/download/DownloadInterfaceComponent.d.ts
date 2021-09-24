import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { DownloadInterfaceComponentProps, DownloadInterfaceComponentState } from "../../../plugins/ant/download/types";
import { LayoutDefinition } from "../../../globalTypes";
export declare class DownloadInterfaceComponent extends BaseInterfaceComponent<DownloadInterfaceComponentProps, DownloadInterfaceComponentState> {
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    constructor(props: DownloadInterfaceComponentProps);
    handleClick: () => void;
    render(): JSX.Element;
}
//# sourceMappingURL=DownloadInterfaceComponent.d.ts.map