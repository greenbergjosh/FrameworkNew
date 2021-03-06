import { AbstractBaseInterfaceComponentType, JSONRecord } from "@opg/interface-builder"
import { ParamKVPMapsType } from "./types"

/**
 *
 * @param url
 * @param params
 * @param configOverrides
 */
export async function postData(url = "", params = {}, configOverrides = {}): Promise<{ headers: Headers; data: any }> {
  // Default options are marked with *
  const request: RequestInit = {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *client
    /*
     * Removed body due to "TypeError: Request with GET/HEAD method cannot have body."
     * Otherwise, body data type must match "Content-Type" header
     */
    ...configOverrides,
  }
  const response = await fetch(url, request)
  const data = await response.blob()
  return {
    headers: response.headers,
    data,
  }
}

/**
 *
 * @param useFilenameFromServer
 * @param response
 * @param filename
 */
export function getFilename(
  useFilenameFromServer: boolean,
  response: { headers: Headers; data: Blob },
  filename: string
): string {
  return useFilenameFromServer ? getFilenameFromHeaders(response.headers, filename) : filename
}

function getFilenameFromHeaders(headers: Headers, defaultFilename: string) {
  let filename = ""
  const disposition = headers.get("content-disposition")
  if (disposition && disposition.indexOf("attachment") !== -1) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    const matches = filenameRegex.exec(disposition)
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, "")
    }
  }
  const fixedDefaultFilename = defaultFilename && defaultFilename.length > 0 ? defaultFilename : "download"
  return filename && filename.length > 0 && filename.indexOf(".") > -1 ? filename : fixedDefaultFilename
}

/**
 * Convert param definitions to params hash
 * @param paramKVPMaps
 * @param getValue
 * @param paramsValueKey
 * @deprecated
 */
export function convertParamKVPMapsToParams(
  paramKVPMaps: ParamKVPMapsType,
  getValue: AbstractBaseInterfaceComponentType["prototype"]["getValue"],
  paramsValueKey?: string
): JSONRecord {
  const singleKeyParams = (paramsValueKey && getValue(paramsValueKey)) || {}

  if (!paramKVPMaps || !paramKVPMaps.values || !paramKVPMaps.values.reduce) {
    return { ...singleKeyParams }
  }

  const params = paramKVPMaps.values.reduce((acc, item) => {
    const val = getValue(item.valueKey)
    if (val) acc[item.fieldName] = val
    return acc
  }, {} as JSONRecord)

  return { ...params, ...singleKeyParams }
}
