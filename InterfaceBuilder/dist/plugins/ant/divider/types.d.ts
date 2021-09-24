import { ComponentDefinitionNamedProps } from "globalTypes";
import { DividerProps } from "antd/lib/divider";
export interface DividerInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "divider";
    dashed?: boolean;
    orientation?: DividerProps["type"];
    text?: string;
    textAlignment?: DividerProps["orientation"];
}
//# sourceMappingURL=types.d.ts.map