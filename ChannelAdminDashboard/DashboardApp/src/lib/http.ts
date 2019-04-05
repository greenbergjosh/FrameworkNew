import axios, { AxiosResponse, AxiosRequestConfig, AxiosError } from "axios"
import { Option } from "fp-ts/lib/Option"
import { Either, left } from "fp-ts/lib/Either"
import { identity } from "fp-ts/lib/function"
import { Type } from "io-ts"
import { failure } from "io-ts/lib/PathReporter"

export type Method = "GET" | "POST" | "PUT" | "DELETE"

// export class BadUrl {
//   public readonly _tag: "BadUrl" = "BadUrl"
//   public constructor(public readonly value: string) {}
// }

// export class Timeout {
//   public readonly _tag: "Timeout" = "Timeout"
// }

// export class NetworkError {
//   public readonly _tag: "NetworkError" = "NetworkError"
//   public constructor(public readonly value: string) {}
// }

// export class BadStatus {
//   public readonly _tag: "BadStatus" = "BadStatus"
//   public constructor(public readonly response: HttpResponse<string>) {}
// }

// export class BadPayload {
//   public readonly _tag: "BadPayload" = "BadPayload"
//   public constructor(
//     public readonly value: string,
//     public readonly response: HttpResponse<string>
//   ) {}
// }

export function BadStatus(response: HttpResponse<string>): HttpError {
  return (onBadStatus, onBadPayload, onBadUrl, onNetworkError, onTimeout) => {
    return onBadStatus(response)
  }
}
export function BadPayload(value: string, response: HttpResponse<string>): HttpError {
  return (onBadStatus, onBadPayload, onBadUrl, onNetworkError, onTimeout) => {
    return onBadPayload(value, response)
  }
}
export function BadUrl(value: string): HttpError {
  return (onBadStatus, onBadPayload, onBadUrl, onNetworkError, onTimeout) => {
    return onBadUrl(value)
  }
}
export function NetworkError(value: string): HttpError {
  return (onBadStatus, onBadPayload, onBadUrl, onNetworkError, onTimeout) => {
    return onNetworkError(value)
  }
}
export function Timeout(req: HttpRequest<unknown>): HttpError {
  return (onBadStatus, onBadPayload, onBadUrl, onNetworkError, onTimeout) => {
    return onTimeout(req)
  }
}

export type HttpError = <R>(
  onBadStatus: (res: HttpResponse<string>) => R,
  onBadPayload: (message: string, res: HttpResponse<string>) => R,
  onBadUrl: (message: string) => R,
  onNetworkError: (message: string) => R,
  onTimeout: (req: HttpRequest<unknown>) => R
) => R

// export type HttpError = BadUrl | Timeout | NetworkError | BadStatus | BadPayload

export interface HttpRequest<A> {
  method: Method
  headers: { [key: string]: string }
  url: string
  body?: unknown
  expect: Type<A, any, unknown>
  timeout: Option<number>
  withCredentials: boolean
}

export interface HttpResponse<Body> {
  url: string
  status: {
    code: number
    message: string
  }
  headers: { [key: string]: string }
  body: Body
}

export function request<A>(req: HttpRequest<A>): Promise<Either<HttpError, A>> {
  return getPromiseAxiosResponse({
    method: req.method,
    headers: req.headers,
    url: req.url,
    data: req.body,
    timeout: req.timeout.fold(undefined, identity),
    withCredentials: req.withCredentials,
  })
    .then((res) => axiosResponseToEither(res, req.expect))
    .catch((e) => axiosErrorToEither<A>(e))
}

// --------------- HELPERS -------------------
function axiosResponseToResponse(res: AxiosResponse): HttpResponse<string> {
  return {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url: res.config.url!,
    status: {
      code: res.status,
      message: res.statusText,
    },
    headers: res.headers,
    body: res.request.responseText,
  }
}

function axiosResponseToEither<A>(
  res: AxiosResponse,
  expect: Type<A, any, unknown>
): Either<HttpError, A> {
  // console.log("res data >>>>>>", res.data)
  return expect
    .decode(res.data)
    .mapLeft((errors) => failure(errors).join("\n"))
    .mapLeft((errMsg) => BadPayload(errMsg, axiosResponseToResponse(res)))
}

function axiosErrorToEither<A>(e: AxiosError): Either<HttpError, A> {
  if (e.response != null) {
    const res = e.response
    switch (res.status) {
      case 404:
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return left(BadUrl(res.config.url!))
      default:
        return left(BadStatus(axiosResponseToResponse(res)))
    }
  }

  return e.code === "ECONNABORTED"
    ? left(Timeout(e.request))
    : left(NetworkError(e.message))
}

function getPromiseAxiosResponse(config: AxiosRequestConfig): Promise<AxiosResponse> {
  return axios(config)
}
