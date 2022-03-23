import { DataSource, ModelDataSource, SettingsDataSource, ViewDataSource } from "types"
import { sanitizeDataSource } from "data/sanitizeDataSource"
import { getDataSourceUrl } from "data/dataSourceUtils"
import { IDataOptions } from "@syncfusion/ej2-pivotview"

/**
 * Convert to viewDataSource by adding an url proxy.
 * @param dataSource
 * @param url
 * @param useProxy
 * @param proxyUrl
 */
export function toViewDataSource({
  dataSource,
  url,
  useProxy,
  proxyUrl,
}: {
  dataSource: SettingsDataSource | ModelDataSource
  proxyUrl?: string
  url?: string
  useProxy?: boolean
}): ViewDataSource {
  const sanitizedDataSource = sanitizeDataSource<DataSource>(dataSource)
  const proxiedUrl = getDataSourceUrl({
    proxyUrl,
    sendRefresh: false,
    url,
    useProxy,
  })
  return {
    ...sanitizedDataSource,
    source: "view",
    url: proxiedUrl,
  }
}

/**
 * Convert modelDataSource to viewDataSource by adding an url proxy.
 * @param modelDataSource
 * @param proxyUrl
 * @param settingsDataSource
 * @param useProxy
 */
export function modelToViewDataSource({
  modelDataSource,
  proxyUrl,
  settingsDataSource,
  useProxy,
}: {
  modelDataSource?: ModelDataSource
  proxyUrl?: string
  settingsDataSource: SettingsDataSource
  useProxy?: boolean
}): ViewDataSource {
  return toViewDataSource({
    dataSource: modelDataSource || settingsDataSource,
    url: settingsDataSource.url,
    useProxy,
    proxyUrl,
  })
}

/**
 * Convert settingsDataSource to viewDataSource by adding an url proxy.
 * @param proxyUrl
 * @param settingsDataSource
 * @param useProxy
 */
export function settingsToViewDataSource({
  proxyUrl,
  settingsDataSource,
  useProxy,
}: {
  proxyUrl?: string
  settingsDataSource: SettingsDataSource
  useProxy?: boolean
}): ViewDataSource {
  return toViewDataSource({ dataSource: settingsDataSource, url: settingsDataSource.url, useProxy, proxyUrl })
}

/**
 * Convert Syncfusion's IDataOptions to ViewDataSource.
 * IDataOptions uses getters on most properties, so dataOptions can't be directly cast to ViewDataSource.
 * @param dataOptions
 */
export function dataOptionsToViewDataSource(dataOptions: IDataOptions): ViewDataSource {
  return sanitizeDataSource<ViewDataSource>(dataOptions as ViewDataSource)
}
