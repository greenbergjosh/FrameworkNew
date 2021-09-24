import { AggregateType, ColumnModel } from "@syncfusion/ej2-react-grids";
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT";
export interface EnrichedColumnDefinition extends ColumnModel {
    allowHTMLText?: boolean;
    aggregationFunction?: AggregateType;
    customFormat?: string;
    removeCellPadding?: boolean;
    skeletonFormat: "short" | "medium" | "long" | "full" | "custom";
    precision?: number;
    visibilityConditions?: JSONObject;
}
//# sourceMappingURL=grid-types.d.ts.map