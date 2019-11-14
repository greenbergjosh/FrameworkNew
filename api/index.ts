import { getOr } from "lodash/fp"
import { getgotStorage } from "../storage/getgotStorage"

export const resultCodes = {
  0: "Success",
  1: "Unhandled exception",
  2: "Server resource exception - Some external resource such as the DB or required API is down",
  50: "Bad or missing SID - this should never be shown as such",
  100: "Function unhandled exception",
  101: "Incorrect confirmation code",
  102: "Badly formatted contact",
  103: "Sending message to contact is not supported",
  104: "Password rule violation",
  105: "Handle rule violation",
  106: "Invalid login",
  107: "Account exists",
  108: "Exhausted unique handle attempts",
  109: "Contact not found",
  110: "Name already used in context",
  111: "Invalid promotion payload",
}

let baseAddress = "https://getgotapp.com"
export const setBaseAddress = (address: string) => {
  baseAddress = address
}

export interface GetGotResponse {
  r: keyof (typeof resultCodes)
}

export interface GetGotSuccessResponse extends GetGotResponse {
  r: 0
}

export interface GetGotErrorResponse extends GetGotResponse {
  r: Exclude<GetGotResponse["r"], 0>
  error: string
}

export const getgotRequest = async <T extends GetGotSuccessResponse>(
  name: string,
  request: object = {},
  token?: string
): Promise<T | GetGotErrorResponse> => {
  const storedToken = await getgotStorage.get("authToken")
  const body = {
    i: { t: token || storedToken },
    p: {
      [name]: request,
    },
  }

  console.debug("Fetching", baseAddress, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body,
  })

  const response = await fetch(baseAddress, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  const json = await response.json()
  console.debug("api/index.ts", `getgotRequest fn: ${name} | result:`, json)

  // This is an error at the network/request level
  if (json.r !== 0) {
    return {
      error: getOr("An unexpected GetGot error occurred.", json.r, resultCodes),
      r: json.r,
    }
  }
  // This is an error for the specific [name] function
  if (json[name].r !== 0) {
    return {
      error: getOr(`An unexpected ${name} service error occurred`, json[name].r, resultCodes),
      r: json[name].r,
    }
  }

  return json[name] as T
}
