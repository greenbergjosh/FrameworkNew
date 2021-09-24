import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent";
import { LinkInterfaceComponentProps, LinkInterfaceComponentState } from "./types";
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
    componentDidUpdate(prevProps: Readonly<LinkInterfaceComponentProps>): void;
    render(): JSX.Element;
}
//# sourceMappingURL=LinkInterfaceComponent.d.ts.map