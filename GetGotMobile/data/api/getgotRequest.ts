import { getOr } from "lodash/fp"
import { getgotStorage } from "../getgotStorage"
import { API_BASE_URL } from "constants/urls"
import { API_RESULT_CODES } from "constants/resultCodes"

export interface IGetGotResponse {
  r: keyof typeof API_RESULT_CODES
}

export interface GetGotSuccessResponse extends IGetGotResponse {
  r: 0
}

export interface GetGotErrorResponse extends IGetGotResponse {
  r: Exclude<IGetGotResponse["r"], 0>
  error: string
}

export type GetGotResponse = GetGotSuccessResponse | GetGotErrorResponse

export const getgotRequest = async <T extends GetGotSuccessResponse>(
  name: string,
  request: object = {},
  token?: string,
  sid?: string
): Promise<T | GetGotErrorResponse> => {
  if (!sid && !token) {
    token = await getgotStorage.get("authToken")
  }

  const body = {
    p: {
      [name]: request,
    },
  }

  if (token) {
    body["i"] = { t: token }
  }

  if (sid) {
    body["sid"] = sid
  }

  console.debug("api/index.ts", "Fetching", API_BASE_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body,
  })

  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  console.debug("api/index.ts", `getgotRequest fn: ${name} | Waiting on JSON`)

  let json
  try {
    json = await response.clone().json()
  } catch (ex) {
    try {
      console.error(
        "api/index.ts",
        `getgotRequest fn: ${name} | ERROR result:`,
        await response.text()
      )
    } catch (ex) {}
    return {
      error: API_RESULT_CODES[500],
      r: 500,
    }
  }
  console.debug("api/index.ts", `getgotRequest fn: ${name} | result:`, json)

  // This is an error at the network/request level
  if (json.r !== 0) {
    return {
      error: getOr("An unexpected GetGot error occurred.", json.r, API_RESULT_CODES),
      r: json.r,
    }
  }
  // This is an error for the specific [name] function
  if (json[name].r !== 0) {
    return {
      error: getOr(`An unexpected ${name} service error occurred`, json[name].r, API_RESULT_CODES),
      r: json[name].r,
    }
  }

  return json[name] as T
}
