import { Option, tryCatch } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import JSON5 from "json5"
import { ComponentDefinition } from "@opg/interface-builder"
import { PersistedConfig } from "../data/GlobalConfig.Config"
import { ROOT_CONFIG_COMPONENTS } from "../routes/dashboard/routes/global-config"
import { AppSelectors } from "../state/store.types"

export const determineLayoutComponents = (
  configsById: ReturnType<AppSelectors["globalConfig"]["configsById"]>,
  configsByType: ReturnType<AppSelectors["globalConfig"]["configsByType"]>,
  entityTypeConfig: Option<PersistedConfig>
) => {
  // First check in the manual overrides
  const layoutMappingRecords = record.lookup("LayoutMapping", configsByType)
  // TODO: Traverse up the type-of relationship to find if a parent type has layout assignments
  const collectedLayoutOverrides = layoutMappingRecords
    .map((layoutMappings) =>
      layoutMappings.reduce(
        (result, layoutMapping) => {
          const configOption = tryCatch(() => JSON5.parse(layoutMapping.config.getOrElse("{}")))

          configOption.map(({ layout, entityTypes, configs }) => {
            if (layout) {
              const entityTypesLower =
                entityTypes && entityTypes.map((entityType: string) => entityType.toLowerCase())
              if (
                entityTypesLower &&
                entityTypeConfig
                  .map(({ id }) => entityTypesLower.includes(id.toLowerCase()))
                  .getOrElse(false)
              ) {
                result.byEntityType.push(layout)
              }
            }
          })

          return result
        },
        { byEntityType: [] as string[], byConfigId: [] as string[] }
      )
    )
    .toNullable()

  // Were there any LayoutMapping assignments for this item?
  if (collectedLayoutOverrides) {
    if (collectedLayoutOverrides.byConfigId.length) {
      // TODO: Eventually merge these layouts, perhaps?
      const layout = record
        .lookup(collectedLayoutOverrides.byConfigId[0].toLowerCase(), configsById)
        .chain(({ config }) =>
          tryCatch(() => JSON5.parse(config.getOrElse("{}")).layout as ComponentDefinition[])
        )
        .toNullable()

      if (layout) {
        return layout
      }
    } else if (collectedLayoutOverrides.byConfigId.length) {
    }
  }

  return entityTypeConfig
    .map((parentType) => {
      return tryCatch(() => JSON5.parse(parentType.config.getOrElse("{}")).layout).getOrElse(
        ROOT_CONFIG_COMPONENTS
      )
    })
    .getOrElse(ROOT_CONFIG_COMPONENTS) as ComponentDefinition[]
}
