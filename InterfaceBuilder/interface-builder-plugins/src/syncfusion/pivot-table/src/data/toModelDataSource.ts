import { DataSource, ModelDataSource, SettingsDataSource, ViewDataSource } from "types"
import { sanitizeDataSource } from "./sanitizeDataSource"

/**
 * Convert viewDataSource to modelDataSource by removing the url proxy.
 * @param viewDataSource
 * @param settingsDataSource
 */
export function viewToModelDataSource({
  viewDataSource,
  settingsDataSource,
}: {
  viewDataSource?: ViewDataSource
  settingsDataSource: SettingsDataSource
}): ModelDataSource {
  if (viewDataSource) {
    /*
     * Retrieve model from view,
     * because this PivotTable's config has been saved already.
     */
    const sanitizedDataSource = sanitizeDataSource<DataSource>(viewDataSource)
    sanitizedDataSource.source = "model"
    const modelDataSource = sanitizedDataSource as ModelDataSource
    modelDataSource.url = settingsDataSource.url
    return modelDataSource
  }
  /*
   * Retrieve model from settings,
   * because this PivotTable's config is being created.
   */
  const sanitizedDataSource = sanitizeDataSource<DataSource>(settingsDataSource)
  sanitizedDataSource.source = "model"
  const modelDataSource = sanitizedDataSource as ModelDataSource
  modelDataSource.url = settingsDataSource.url
  return modelDataSource
}
