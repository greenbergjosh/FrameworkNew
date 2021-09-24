import { ColumnOptions, EnrichedColumnDefinition } from "../types"

/**
 * CUSTOM CELL FORMATTER COLUMN
 * @param formatter
 */
export function getCustomCellFormatterOptions(formatter: EnrichedColumnDefinition["formatter"]): ColumnOptions {
  const options: ColumnOptions["options"] = { disableHtmlEncode: false }
  if (typeof formatter === "function") {
    options.formatter = formatter
  }
  /*
   * SyncFusion seems to read "customFormat" when present, even though it's not documented.
   * So we delete the property; otherwise, it will produce undesired results.
   */
  return { options, keysToDelete: ["customFormat"] }
}
