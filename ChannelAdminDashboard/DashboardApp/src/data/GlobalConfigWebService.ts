import * as iots from "io-ts"
import { NonEmptyString } from "io-ts-types/lib/NonEmptyString"
import { assertNever } from "../lib/assert-never"
import { PersistedConfigCodec } from "./GlobalConfig.Config"

export type ResponseCode = iots.TypeOf<typeof ResponseCodeCodec>

export const globalConfigWebServiceErrors = {
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

export const responsePayloadCodecs = {
  delete: iots.type({
    "config:delete": iots.type({
      r: ResponseCodeCodec,
    }),
  }),

  get: iots.type({
    "config:get": iots.union([
      iots.type({
        r: iots.literal(0),
        configs: iots.array(PersistedConfigCodec),
      }),
      iots.type({
        r: ErrorCodeCodec,
      }),
    ]),
  }),

  insert: iots.union([
    iots.type({
      "config:insert": iots.type({
        r: ErrorCodeCodec,
      }),
    }),
    iots.type({
      "config:insert": iots.type({
        r: iots.literal(0),
        configs: iots.array(
          iots.type({
            id: NonEmptyString,
            name: NonEmptyString,
          })
        ),
      }),
    }),
  ]),

  update: iots.type({
    "config:update": iots.type({
      r: ResponseCodeCodec,
    }),
  }),
}

export function mkGlobalConfigApiError<T>(r: Exclude<ResponseCode, 0>): GlobalConfigApiResponse<T> {
  switch (r) {
    case 1: return ServerException({reason: globalConfigWebServiceErrors[1]})
    case 2: return ServerException({reason: globalConfigWebServiceErrors[2]})
    case 100: return ServerException({reason: globalConfigWebServiceErrors[100]})
    case 101: return Unauthorized()
    case 106: return ServerException({reason: globalConfigWebServiceErrors[106]})
    // case 106: return DuplicateConfigName()
    default: return assertNever(r)
  } // prettier-ignore
}
export type GlobalConfigApiResponse<T> = <R>(variants: {
  OK: (payload: T) => R
  ServerException: (err: { reason: string }) => R
  Unauthorized: () => R
}) => R

export function OK<T>(v: T): GlobalConfigApiResponse<T> {
  return ({ OK: f }) => f(v)
}
export function ServerException<T>(err: { reason: string }): GlobalConfigApiResponse<T> {
  return ({ ServerException: f }) => f(err)
}
export function Unauthorized<T>(): GlobalConfigApiResponse<T> {
  return ({ Unauthorized: f }) => f()
}
