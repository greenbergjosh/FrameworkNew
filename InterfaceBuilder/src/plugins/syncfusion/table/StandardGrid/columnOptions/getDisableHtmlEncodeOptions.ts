import { EnrichedColumnDefinition } from "../types"
import { ColumnModel } from "@syncfusion/ej2-react-grids"

/**
 *
 * @param disableHtmlEncode
 * @param allowHTMLText
 */
export function getDisableHtmlEncodeOptions(
  disableHtmlEncode: EnrichedColumnDefinition["disableHtmlEncode"],
  allowHTMLText: EnrichedColumnDefinition["allowHTMLText"],
): Partial<ColumnModel> | undefined {
  // Default should be to NOT allow HTML rendering. That's a terrible practice.
  const isDisableHtmlEncode =
    typeof disableHtmlEncode === "undefined" || disableHtmlEncode === null ? !allowHTMLText : disableHtmlEncode
  return {
    disableHtmlEncode: isDisableHtmlEncode,
  }
}
