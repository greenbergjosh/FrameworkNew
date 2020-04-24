/* From Query.tsx */
import { PersistedConfig } from "../../../../data/GlobalConfig.Config"
import JSON5 from "json5"
import { QueryConfigCodec } from "../../../../data/Report"
import { reporter } from "io-ts-reporters"
import { ExecuteInterfaceComponentState } from "../types"
import { Right } from "../../../../data/Either"

export function getQueryConfig(queryGlobalConfig: PersistedConfig) {
  const unparsedConfig = queryGlobalConfig.config.getOrElse("")
  const parsedConfig = JSON5.parse(unparsedConfig)
  const queryConfig = QueryConfigCodec.decode(parsedConfig)
  return queryConfig.fold(
    (errors) => {
      console.error(
        "ExecuteInterfaceComponent.remoteQuery_getQueryConfig",
        "Invalid Query",
        reporter(queryConfig)
      )
      return ({
        loadStatus: "error",
        loadError: "Query was invalid. Check developer tools for details.",
      } as unknown) as Readonly<Partial<ExecuteInterfaceComponentState>>
    },
    Right((queryConfig) => {
      // console.log(
      //   "ExecuteInterfaceComponent.remoteQuery_getQueryConfig",
      //   "queryConfig",
      //   queryConfig
      // )
      return ({
        queryConfig,
      } as unknown) as Readonly<Partial<ExecuteInterfaceComponentState>>
    })
  )
}

export function hasContext(context: any): boolean {
  if (context) {
    return true
  }
  console.warn(
    "ExecuteInterfaceComponent.hasContext",
    "Query cannot load any data without a UserInterfaceContext in the React hierarchy"
  )
  return false
}
