import { JSONType } from "../data/JSON"

export function deepFreeze<T extends any>(o: T): T {
  Object.freeze(o)

  if (o !== null && typeof o === "object" && !Array.isArray(o)) {
    Object.getOwnPropertyNames(o).forEach((prop) => {
      const value = o[prop]
      if (
        o.hasOwnProperty(prop) &&
        value !== null &&
        (typeof value === "object" || typeof value === "function") &&
        !Object.isFrozen(value)
      ) {
        deepFreeze(value)
      }
    })
  } else if (Array.isArray(o)) {
    o.forEach((value: T[0]) => {
      if (
        value !== null &&
        (typeof value === "object" || typeof value === "function") &&
        !Object.isFrozen(value)
      ) {
        deepFreeze(value)
      }
    })
  }

  return o
}
