import { EnrichedColumnDefinition } from "@opg/interface-builder"
import { AppSelectors } from "../../../state/store.types"
import * as record from "fp-ts/lib/Record"
import JSON5 from "json5"
import { CustomSummaryType } from "@syncfusion/ej2-react-grids"
import { tryCatch } from "fp-ts/lib/Option"

/**
 * Render a formatted string (that may include HTML) into a cell.
 * User must provide an Remote Config LBM Javascript function that returns html for the cell.
 * @param cellFormatter
 * @param cellFormatterOptions
 * @param configsById
 */
export function getCellFormatter(
  cellFormatter: EnrichedColumnDefinition["cellFormatter"],
  cellFormatterOptions: EnrichedColumnDefinition["cellFormatterOptions"],
  configsById: ReturnType<AppSelectors["globalConfig"]["configsById"]>
): CustomSummaryType | undefined {
  if (!cellFormatter) return
  const remoteConfig = record.lookup(cellFormatter, configsById).toUndefined()
  if (remoteConfig && remoteConfig.config) {
    // Retrieve formatter
    const code = JSON5.parse(remoteConfig.config.getOrElse("")).code
    const formatter = tryCatch(() => new Function(code)()).toNullable()

    // Convert options data-map array to an object
    const options =
      cellFormatterOptions &&
      cellFormatterOptions.reduce((acc: any, item) => {
        return { ...acc, [item.key]: item.value }
      }, {})

    if (typeof formatter === "function") {
      // Partially apply formatter with options
      const expandedFormatter: CustomSummaryType = (data, column) => formatter(data, column, options)

      /*
       * Wrap the LBM with a try-catch because the LBM may have a bug,
       * and also LBMs use column.formatFn(value) which will throw
       * if the value is null.
       */
      return (data, column) => {
        try {
          return expandedFormatter(data, column)
        } catch (e) {
          return ""
        }
      }
    }

    // LBM formatter is not a valid function, so provide a default
    return () => ""
  }
}
