import { JSONArray, JSONRecord } from "../../globalTypes/JSONTypes"

export type CoerceableDataType = "number" | "date"
export type DataType = string | number | boolean | Date | JSONRecord | JSONArray | undefined | null
