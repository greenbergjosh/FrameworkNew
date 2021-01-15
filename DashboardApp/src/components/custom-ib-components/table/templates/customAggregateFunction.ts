import { EnrichedColumnDefinition } from "@opg/interface-builder"
import { AppSelectors } from "../../../../state/store.types"
import * as record from "fp-ts/lib/Record"
import { tryCatch } from "fp-ts/lib/Option"
import JSON5 from "json5"
import { CustomAggregateFunction } from "@opg/interface-builder/dist/components/grid/types"

/**
 * Render a formatted string (that may include HTML) into a summary row cell.
 * User must provide an Remote Config LBM Javascript function that returns html for the cell.
 * @param customAggregateId
 * @param configsById
 * @return string - Aggregate "summary" row cell
 */
export function getCustomAggregateFunction(
  customAggregateId: EnrichedColumnDefinition["customAggregateId"],
  configsById: ReturnType<AppSelectors["globalConfig"]["configsById"]>
): CustomAggregateFunction | undefined {
  if (!customAggregateId) return
  const remoteConfig = record.lookup(customAggregateId, configsById).toUndefined()
  if (remoteConfig) {
    const code = tryCatch(() => JSON5.parse(remoteConfig.config.getOrElse("{}")).code).toNullable()
    if (code) {
      return tryCatch(() => new Function(code)()).toNullable()
    }
  }
}
