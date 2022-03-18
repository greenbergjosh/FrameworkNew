import { isEmpty } from "lodash/fp"

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

export function getDataSourceUrl({
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
