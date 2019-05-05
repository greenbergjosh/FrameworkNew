import { JSONType } from "../data/JSON"
export function prettyPrint(value: unknown): string {
  return JSON.stringify(value, null, 2)
}

export function cheapHash(value: JSONType, ...rest: JSONType[]): string {
  console.log("json.cheapHash", { value, rest })
  return JSON.stringify(value).concat(rest.map((x) => JSON.stringify(x)).join(""))
}
