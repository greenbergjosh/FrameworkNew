import { AggregateType, ColumnModel } from "@syncfusion/ej2-react-grids"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"

export interface EnrichedColumnDefinition extends ColumnModel {
  allowHTMLText?: boolean
  aggregationFunction?: AggregateType
  customFormat?: string // Custom date or numeric format, typically
  skeletonFormat: "short" | "medium" | "long" | "full" | "custom"
  precision?: number // integer
  visibilityConditions?: JSONObject // JSON Logic
}
