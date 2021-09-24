import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { LinkInterfaceComponentProps, LinkInterfaceComponentState } from "./types";
import { LayoutDefinition } from "../../../globalTypes";
export declare class LinkInterfaceComponent extends BaseInterfaceComponent<LinkInterfaceComponentProps, LinkInterfaceComponentState> {
    constructor(props: LinkInterfaceComponentProps);
    static defaultProps: {
        userInterfaceData: {};
        valueKey: string;
        showBorder: boolean;
        useLinkLabelKey: boolean;
        linkLabel: string;
        linkLabelKey: string;
        api: string;
        linkType: string;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    componentDidMount(): void;
    componentDidUpdate(prevProps: Readonly<LinkInterfaceComponentProps>): void;
    render(): JSX.Element;
}
//# sourceMappingURL=LinkInterfaceComponent.d.ts.map