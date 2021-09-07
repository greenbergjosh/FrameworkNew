export interface JSONRecord {
  [k: string]: JSONType | undefined
}
export interface JSONArray extends Array<JSONType> {}
export type JSONType = null | string | number | boolean | JSONArray | JSONRecord
