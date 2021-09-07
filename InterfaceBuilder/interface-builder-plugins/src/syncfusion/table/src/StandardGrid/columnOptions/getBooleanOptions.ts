import { ColumnModel } from "@syncfusion/ej2-react-grids"
import { ColumnOptions } from "../types"

/**
 * BOOLEAN COLUMN: Managing custom formatting options for Booleans
 */
export function getBooleanOptions(): ColumnOptions {
  const displayAsCheckBox: ColumnModel["displayAsCheckBox"] = true
  return { options: { displayAsCheckBox }, keysToDelete: [] }
}
