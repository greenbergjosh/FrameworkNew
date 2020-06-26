// eslint-disable-next-line @typescript-eslint/ban-types
export const evalExpression = <T extends Object = any>(expression: string, ...args: any[]): T => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const constructedFnOrData: T | ((...args: any[]) => T) = Function(`"use strict";return (${expression})`)()
  if (typeof constructedFnOrData === "function" && constructedFnOrData instanceof Function) {
    return constructedFnOrData(...args)
  }
  return constructedFnOrData
}
