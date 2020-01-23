declare type JSONObject = {
  [key: string]: JSONType
}
interface JSONArray extends Array<JSONType> {}
declare type JSONType = null | string | number | boolean | JSONArray | JSONObject
