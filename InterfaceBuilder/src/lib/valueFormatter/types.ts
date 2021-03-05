import { JSONArray, JSONRecord } from "components/interface-builder/@types/JSONTypes"

export type CoerceableDataType = "number" | "date"
export type DataType = string | number | boolean | Date | JSONRecord | JSONArray | undefined | null
