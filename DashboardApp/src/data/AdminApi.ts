import * as iots from "io-ts"
import { NonEmptyString } from "io-ts-types/lib/NonEmptyString"
import { assertNever } from "../lib/assert-never"
import { PersistedConfigCodec } from "./GlobalConfig.Config"
import { JSONRecordCodec } from "./JSON"

export type ResponseCode = iots.TypeOf<typeof ResponseCodeCodec>
export type AuthLoginPayload = iots.TypeOf<typeof authLoginPayloadCodec>

export const adminApiErrors = {
  1: "Unhandled server-side exception",
  2: "Server resource failure",
  100: "Unhandle server-side function exception",
  101: "Config `Name` violates UNIQUE constraint",
  106: "Unauthorized to access resource",
}

export const ErrorCodeCodec = iots.union([
  iots.literal(1),
  iots.literal(2),
  iots.literal(100),
  iots.literal(101),
  iots.literal(106),
])
export const ResponseCodeCodec = iots.union([iots.literal(0), ErrorCodeCodec])

export const ErrorPayload = iots.type({
  r: ErrorCodeCodec,
})

export const requestInfoCodec = iots.union([
  ErrorPayload,
  iots.type({
    r: iots.literal(0),
    requestRsId: iots.string,
    requestRsTimestamp: iots.string,
  }),
])

export const authLoginPayloadCodec = iots.type({
  Email: NonEmptyString,
  Id: iots.nullType,
  ImageUrl: iots.string,
  LoginToken: iots.string,
  Name: iots.string,
  Phone: iots.literal(""),
})

export const authUserDetailsPayloadCodec = iots.type({
  handle: iots.string,
  id: NonEmptyString,
  image: iots.string,
  name: iots.string,
  primaryemail: NonEmptyString,
  t: NonEmptyString,
})

export const authResponsePayloadCodec = {
  login: iots.type({
    "auth:login": iots.union([
      ErrorPayload,
      iots.type({
        r: iots.literal(0),
        result: authLoginPayloadCodec,
      }),
    ]),
    requestInfo: requestInfoCodec,
  }),
  userDetails: iots.type({
    "auth:userDetails": iots.union([
      ErrorPayload,
      iots.type({
        r: iots.literal(0),
        result: authUserDetailsPayloadCodec,
      }),
    ]),
    requestInfo: requestInfoCodec,
  }),
}

export const globalConfigResponsePayloadCodec = {
  delete: iots.type({
    "config:delete": iots.type({
      r: ResponseCodeCodec,
    }),
    requestInfo: requestInfoCodec,
  }),

  get: iots.type({
    "config:get": iots.union([
      iots.type({
        r: iots.literal(0),
        result: iots.array(PersistedConfigCodec),
      }),
      ErrorPayload,
    ]),
    requestInfo: requestInfoCodec,
  }),

  insert: iots.union([
    iots.type({
      "config:insert": ErrorPayload,
      requestInfo: requestInfoCodec,
    }),
    iots.type({
      "config:insert": iots.type({
        r: iots.literal(0),
        result: iots.array(
          iots.type({
            id: NonEmptyString,
            name: NonEmptyString,
          })
        ),
      }),
      requestInfo: requestInfoCodec,
    }),
  ]),

  update: iots.type({
    "config:update": iots.type({
      r: ResponseCodeCodec,
    }),
    requestInfo: requestInfoCodec,
  }),
}

export const reportResponsePayloadCodecs = {
  get: (query: string) =>
    iots.type({
      [query]: iots.union([
        iots.type({
          r: iots.literal(0),
          result: iots.array(JSONRecordCodec),
        }),
        ErrorPayload,
      ]),
    }),
  update: (query: string) =>
    iots.type({
      [query]: iots.type({
        r: iots.literal(0),
        result: iots.type({
          result: iots.literal("success"),
        }),
      }),
    }),
}

export const genericArrayPayloadCodec = iots.array(JSONRecordCodec)

export const genericRecordOrArrayPayloadCodec = iots.union([JSONRecordCodec, iots.array(JSONRecordCodec)])

export function mkAdminApiError<T>(r: Exclude<ResponseCode, 0>): ApiResponse<T> {
  switch (r) {
    case 1: return ServerException({reason: adminApiErrors[1]})
    case 2: return ServerException({reason: adminApiErrors[2]})
    case 100: return ServerException({reason: adminApiErrors[100]})
    case 101: return Unauthorized()
    case 106: return ServerException({reason: adminApiErrors[106]})
    // case 106: return DuplicateConfigName()
    default: return assertNever(r)
  } // prettier-ignore
}
export type ApiResponse<T> = <R>(variants: {
  OK: (payload: T) => R
  ServerException: (err: { reason: string }) => R
  Unauthorized: () => R
}) => R

export function OK<T>(v: T): ApiResponse<T> {
  return ({ OK: f }) => f(v)
}
export function ServerException<T>(err: { reason: string }): ApiResponse<T> {
  return ({ ServerException: f }) => f(err)
}
export function Unauthorized<T>(): ApiResponse<T> {
  return ({ Unauthorized: f }) => f()
}

export interface KeyValuePair {
  key: string
  value: string
}
export interface KeyValuePairConfig {
  items: KeyValuePair[]
}
