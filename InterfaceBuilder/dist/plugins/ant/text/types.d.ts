import { CSSProperties } from "react";
import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes";
export interface TextInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "text";
    components: ComponentDefinition[];
    onChangeData: UserInterfaceProps["onChangeData"];
    preconfigured?: boolean;
    userInterfaceData?: UserInterfaceProps["data"];
    valueKey: string;
    banner?: boolean;
    center?: boolean;
    closable?: boolean;
    description?: string;
    headerSize?: string;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    marginTop?: number;
    showIcon?: boolean;
    stringTemplate: string;
    textType: "text" | "paragraph" | "code" | "title" | "success" | "info" | "warning" | "error";
    useTokens: boolean;
}
export interface TextInterface extends TextInterfaceComponentProps {
    data: any;
}
export interface TextInterfaceComponentState {
    text: string | null;
}
export declare type TitleSizeType = 1 | 2 | 3 | 4 | undefined;
export interface TextDisplayProps {
    text: string | null;
    style: CSSProperties;
    size?: TitleSizeType;
}
export interface AlertDisplayProps extends TextDisplayProps {
    banner?: boolean;
    closable?: boolean;
    description?: string;
    showIcon?: boolean;
}
//# sourceMappingURL=types.d.ts.map