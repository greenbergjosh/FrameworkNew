import { getOr } from "lodash/fp"
import { getgotStorage } from "../getgotStorage"

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
  500: "GetGot is currently under maintenance. Please try again in a few minutes.",
}

export const templateHost = "http://ec2-35-170-186-135.compute-1.amazonaws.com/"

// export let baseAddress = "https://getgotapp.com"
export let baseAddress = "http://142.44.215.16/getgot"
export const setBaseAddress = (address: string) => {
  baseAddress = address
}

export interface IGetGotResponse {
  r: keyof typeof resultCodes
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

  console.debug("api/index.ts", "Fetching", baseAddress, {
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
      error: resultCodes[500],
      r: 500,
    }
  }
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
