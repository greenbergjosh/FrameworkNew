import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes";
declare type LinkType = "link" | "default" | "ghost" | "primary" | "dashed" | "danger" | undefined;
export interface LinkInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "text";
    components: ComponentDefinition[];
    onChangeData: UserInterfaceProps["onChangeData"];
    preconfigured?: boolean;
    userInterfaceData?: UserInterfaceProps["data"];
    valueKey: string;
    useLinkLabelKey: boolean;
    linkLabel: string;
    linkLabelKey: string;
    uri: string;
    useUriTokens: boolean;
    linkType: LinkType;
    onClick?: (uri: string) => void;
}
export interface LinkInterfaceComponentState {
    linkLabel: string;
    uri: string;
}
export interface LinkDisplayProps {
    linkLabel: string;
    uri: string;
    disabled: boolean;
    onClick?: (uri: string) => void;
    linkType: LinkType;
}
export {};
//# sourceMappingURL=types.d.ts.map