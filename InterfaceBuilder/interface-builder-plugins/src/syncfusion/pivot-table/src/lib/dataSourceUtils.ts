import { DataSourceSettingsModel } from "@syncfusion/ej2-pivotview/src/pivotview/model/datasourcesettings-model"
import { cloneDeep } from "lodash/fp"

/**
 * Add a proxy to data source settings when defined.
 * @param persistedDataSourceSettings
 * @param useProxy
 * @param proxyUrl
 */
export function getProxiedDataSourceSettings({
  persistedDataSourceSettings,
  useProxy,
  proxyUrl,
}: {
  persistedDataSourceSettings: DataSourceSettingsModel
  refreshSession: boolean
  useProxy?: boolean
  proxyUrl?: string
}): DataSourceSettingsModel {
  const proxiedDataSourceUrl = getDataSourceUrl({
    sendRefresh: false,
    useProxy,
    url: persistedDataSourceSettings.url,
    proxyUrl,
  })
  const dataSourceSettings = cloneDeep(persistedDataSourceSettings)
  dataSourceSettings.url = proxiedDataSourceUrl
  return dataSourceSettings
}

/**
 * Remove proxy from data source settings.
 * @param dataSourceSettings
 * @param originalUrl
 */
export function getPersistableDataSourceSettings(dataSourceSettings: DataSourceSettingsModel, originalUrl?: string) {
  const persistableDataSourceSettings = cloneDeep(dataSourceSettings)
  persistableDataSourceSettings.url = originalUrl
  return persistableDataSourceSettings
}

/**
 * Send signal to refresh session
 * @param refreshSessionUrl
 */
export async function refreshSession({
  useProxy,
  url,
  proxyUrl,
}: {
  useProxy?: boolean
  url?: string
  proxyUrl?: string
}): Promise<{ ok: boolean; statusText: string }> {
  const init: RequestInit | undefined = {
    method: "POST",
    headers: {},
    body: "",
    redirect: "error",
  }
  const refreshSessionUrl = getDataSourceUrl({ sendRefresh: true, useProxy, url, proxyUrl })
  try {
    return await fetch(refreshSessionUrl, init)
  } catch (e) {
    console.warn(e)
    let message = "Unknown reason"
    if (typeof e === "string") {
      message = e
    } else if (e instanceof Error) {
      message = e.message
    }
    return Promise.resolve({ ok: false, statusText: message })
  }
}

function getDataSourceUrl({
  sendRefresh,
  useProxy,
  url,
  proxyUrl,
}: {
  sendRefresh: boolean
  useProxy?: boolean
  url?: string
  proxyUrl?: string
}) {
  const refresh = sendRefresh ? "&refresh=1" : ""
  if (useProxy) {
    const encodedUrl = url ? encodeURI(url) : ""
    return `${proxyUrl}?url=${encodedUrl}${refresh}`
  }
  return `${url}${refresh}`
}
