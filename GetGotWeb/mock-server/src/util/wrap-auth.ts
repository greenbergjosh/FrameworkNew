export const wrapAuth = <T extends Function>(functionMap: { [key: string]: T }) => {
  return Object.entries(functionMap).reduce((acc, [key, fn]) => {
    if (typeof fn === "function") {
      acc[key] = (((token: string, args?: unknown) => {
        if (!token) {
          return {
            r: 106,
            __nodeMessage: "Function was rejected because there was no auth token",
          }
        } else {
          return fn(args)
        }
      }) as unknown) as T
    } else {
      acc[key] = fn
    }
    return acc
  }, {} as { [key: string]: T })
}
