export function deepFreeze<T extends any>(o: T): T {
  Object.freeze(o)

  if (o !== null && typeof o === "object" && !Array.isArray(o)) {
    Object.getOwnPropertyNames(o).forEach((prop) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const value = o[prop]
      if (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-prototype-builtins
        o.hasOwnProperty(prop) &&
        value !== null &&
        (typeof value === "object" || typeof value === "function") &&
        !Object.isFrozen(value)
      ) {
        deepFreeze(value)
      }
    })
  } else if (Array.isArray(o)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    o.forEach((value: T[0]) => {
      if (value !== null && (typeof value === "object" || typeof value === "function") && !Object.isFrozen(value)) {
        deepFreeze(value)
      }
    })
  }

  return o
}
