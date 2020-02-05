import * as iots from "io-ts"
import { JSONFromString } from "io-ts-types/lib/JSON/JSONFromString"
import { Left, Right } from "./Either"
import { Option, none, some } from "fp-ts/lib/Option"

export interface JSONRecord {
  [k: string]: JSONType | undefined
}
export interface JSONArray extends Array<JSONType> {}
export type JSONType = null | string | number | boolean | JSONArray | JSONRecord

export const JSONTypeCodec = iots.recursion<JSONType, JSONType, unknown, iots.Type<JSONType>>(
  "JSONType",
  (self) =>
    iots.union([
      iots.null,
      iots.string,
      iots.number,
      iots.boolean,
      iots.array(self),
      iots.record(iots.string, iots.union([self, iots.undefined])),
    ])
)

export const JSONRecordCodec = iots.record(iots.string, JSONTypeCodec)

export const JSONArrayCodec = iots.array(JSONTypeCodec)

export function fromStrToJSONRec(configStr: string): Option<JSONRecord> {
  return JSONFromString.decode(configStr)
    .chain((jsonVal) => JSONRecordCodec.decode(jsonVal))
    .fold(Left(() => none), Right((jsonRec) => some(jsonRec)))
}
