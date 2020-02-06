import { wrapAuth } from "../util/wrap-auth"
import e from "express"

export const dispatchFunctions = (
  token: string | undefined,
  functions: { [functionName: string]: JSONObject }
) => {
  return {
    r: 0,
    ...Object.entries(functions).reduce((acc, [name, args]) => {
      const functionOrData = serverResponses[name]
      if (isServerFunction(functionOrData)) {
        try {
          acc[name] = functionOrData(args) || { r: 0 }
        } catch (ex) {
          acc[name] = { r: 100, __nodeMessage: "Failed during function invocation. Message: " + ex }
        }
      } else if (typeof functionOrData !== "undefined") {
        acc[name] = functionOrData
      } else if (typeof functionOrData === "undefined") {
        acc[name] = { r: 100, __nodeMessage: "No function or value was defined for " + name }
      }

      return acc
    }, {} as JSONObject),
  }
}

type ServerFunction = (args?: JSONType) => JSONType | void
function isServerFunction(thing: ServerFunction | JSONType): thing is ServerFunction {
  return typeof thing === "function"
}

const unauthenticatedResponses: { [key: string]: ServerFunction | JSONType } = {
  login(args) {
    return {
      foo: "bar",
    }
  },
}
const authenticatedResponses: { [key: string]: ServerFunction } = {
  getFeed(args) {
    return {
      bar: "baz",
    }
  },
}
const serverResponses: { [key: string]: ServerFunction | JSONType } = {
  ...unauthenticatedResponses,
  ...wrapAuth(authenticatedResponses),
}
