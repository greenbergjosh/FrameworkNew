import axios, { AxiosResponse, AxiosRequestConfig, AxiosError } from "axios"
import { Option } from "fp-ts/lib/Option"
import { Either, left } from "fp-ts/lib/Either"
import { Task } from "fp-ts/lib/Task"
import { identity } from "fp-ts/lib/function"

export type Method = "GET" | "POST" | "PUT" | "DELETE"

export interface Request<a> {
  method: Method
  headers: { [key: string]: string }
  url: string
  body?: unknown
  expect: Expect<a>
  timeout: Option<number>
  withCredentials: boolean
}

export type Expect<a> = (value: unknown) => Either<string, a>

export class BadUrl {
  public readonly _tag: "BadUrl" = "BadUrl"
  public constructor(public readonly value: string) {}
}

export class Timeout {
  public readonly _tag: "Timeout" = "Timeout"
}

export class NetworkError {
  public readonly _tag: "NetworkError" = "NetworkError"
  public constructor(public readonly value: string) {}
}

export class BadStatus {
  public readonly _tag: "BadStatus" = "BadStatus"
  public constructor(public readonly response: Response<string>) {}
}

export class BadPayload {
  public readonly _tag: "BadPayload" = "BadPayload"
  public constructor(public readonly value: string, public readonly response: Response<string>) {}
}

export type HttpError = BadUrl | Timeout | NetworkError | BadStatus | BadPayload

export interface Response<body> {
  url: string
  status: {
    code: number
    message: string
  }
  headers: { [key: string]: string }
  body: body
}

export function toTask<a>(req: Request<a>): Task<Either<HttpError, a>> {
  return new Task(() =>
    getPromiseAxiosResponse({
      method: req.method,
      headers: req.headers,
      url: req.url,
      data: req.body,
      timeout: req.timeout.fold(undefined, identity),
      withCredentials: req.withCredentials,
    })
      .then((res) => axiosResponseToEither(res, req.expect))
      .catch((e) => axiosErrorToEither<a>(e))
  )
}

// export function expectJson<a>(decoder: Decoder<a>): Expect<a> {
//   return decoder.decode
// }

// export function get<a>(url: string, decoder: Decoder<a>): Request<a> {
//   return {
//     method: "GET",
//     headers: {},
//     url,
//     body: undefined,
//     expect: expectJson(decoder),
//     timeout: none,
//     withCredentials: false,
//   }
// }

// export function post<a>(url: string, body: unknown, decoder: Decoder<a>): Request<a> {
//   return {
//     method: "POST",
//     headers: {},
//     url,
//     body,
//     expect: expectJson(decoder),
//     timeout: none,
//     withCredentials: false,
//   }
// }

// --------------- HELPERS -------------------
function axiosResponseToResponse(res: AxiosResponse): Response<string> {
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

function axiosResponseToEither<a>(res: AxiosResponse, expect: Expect<a>): Either<HttpError, a> {
  return expect(res.data).mapLeft((errors) => new BadPayload(errors, axiosResponseToResponse(res)))
}

function axiosErrorToEither<a>(e: AxiosError): Either<HttpError, a> {
  if (e.response != null) {
    const res = e.response
    switch (res.status) {
      case 404:
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return left(new BadUrl(res.config.url!))
      default:
        return left(new BadStatus(axiosResponseToResponse(res)))
    }
  }

  return e.code === "ECONNABORTED" ? left(new Timeout()) : left(new NetworkError(e.message))
}

function getPromiseAxiosResponse(config: AxiosRequestConfig): Promise<AxiosResponse> {
  return axios(config)
}
