import { sanitizeDataSource } from "lib/syncfusionUtils"
import { DataSource, ModelDataSource, SettingsDataSource, ViewDataSource } from "types"
import { isEmpty } from "lodash/fp"

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

function toViewDataSource({
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
    headers: {
      "content-type": "application/json",
    },
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

export function concatPath(segments: string[]): string {
  let path = ""
  segments.forEach((segment) => {
    if (isEmpty(path)) {
      // The first segment
      path = segment
      return
    }
    if (isEmpty(segment)) {
      // Segment is empty, do nothing and move to the next segment
      return
    }
    // Append the segment
    path = `${path}.${segment}`
  })
  return path
}
