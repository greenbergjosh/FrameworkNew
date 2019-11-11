export const evalExpression = <T extends Object = any>(expression: string, ...args: any[]): T => {
  //   console.log("evalExpression", `"use strict";return (${expression})`)
  const constructedFnOrData: T | ((...args: any[]) => T) = Function(
    `"use strict";return (${expression})`
  )()
  if (typeof constructedFnOrData === "function" && constructedFnOrData instanceof Function) {
    return constructedFnOrData(...args)
  } else {
    return constructedFnOrData
  }
}
