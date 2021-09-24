import * as Table from "@opg/interface-builder-plugins/lib/syncfusion/table"
import { AppSelectors } from "../../../../state/store.types"
import * as record from "fp-ts/lib/Record"
import { tryCatch } from "fp-ts/lib/Option"
import JSON5 from "json5"

/**
 * Render a formatted string (that may include HTML) into a summary row cell.
 * User must provide an Remote Config LBM Javascript function that returns html for the cell.
 * @param customAggregateId
 * @param configsById
 * @param aggregationFunction
 * @return string - Aggregate "summary" row cell
 */
export function getCustomAggregateFunction(
  customAggregateId: Table.StandardGridTypes.EnrichedColumnDefinition["customAggregateId"],
  configsById: ReturnType<AppSelectors["globalConfig"]["configsById"]>,
  aggregationFunction: Table.StandardGridTypes.EnrichedColumnDefinition["aggregationFunction"]
): Table.CustomAggregateFunction | undefined {
  if (!customAggregateId || aggregationFunction !== "Custom") return
  const remoteConfig = record.lookup(customAggregateId, configsById).toUndefined()
  if (remoteConfig) {
    const code = tryCatch(() => JSON5.parse(remoteConfig.config.getOrElse("{}")).code).toNullable()
    if (code) {
      const fn = tryCatch(() => new Function(code)()).toNullable()
      if (typeof fn === "function") {
        return fn
      }
    }
  }
}
