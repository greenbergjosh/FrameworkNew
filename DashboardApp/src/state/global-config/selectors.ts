import * as GC from "../../data/GlobalConfig.Config"
import * as iots from "io-ts"
import * as record from "fp-ts/lib/Record"
import { GlobalConfigStoreModel } from "./types"
import { array, mapOption, sort, uniq } from "fp-ts/lib/Array"
import { concat, identity, tuple } from "fp-ts/lib/function"
import { JSONFromString } from "io-ts-types"
import { JSONRecordCodec } from "../../data/JSON"
import { NonEmptyString } from "io-ts-types/lib/NonEmptyString"
import { ordString } from "fp-ts/lib/Ord"
import { setoidString } from "fp-ts/lib/Setoid"

const selectors: GlobalConfigStoreModel["selectors"] = (slice, createSelector, hasProps) => ({
  associations(select) {
    return createSelector(
      slice((self) => self.configs),
      select.globalConfig.configsById,
      (state) => select.globalConfig.entityTypeConfigs(state),
      (configs, configsById, entityTypeConfigs) => {
        return configs
          .map((globalConfigItems) => {
            const associationsMap = record.fromFoldable(array)(globalConfigItems.map(toAssociationsTuple), identity)

            record.reduceWithKey(associationsMap, associationsMap, (guid, acc, associations) => {
              associations.references.forEach((id) => {
                record.lookup(id, acc).map((associatedRecord) => associatedRecord.referencedBy.push(guid))
              })
              associations.uses.forEach((id) => {
                record.lookup(id, acc).map((associatedRecord) => associatedRecord.usedBy.push(guid))
              })

              return acc
            })

            globalConfigItems.forEach(({ id, type }) => {
              record.lookup(type, entityTypeConfigs).map(({ id: typeId }) => {
                record.lookup(typeId, associationsMap).map((associations) => {
                  associations.isTypeOf.push(id)
                })
              })
            })

            return associationsMap
          })
          .getOrElse({})

        function toAssociationsTuple(c: GC.PersistedConfig) {
          return tuple(
            c.id,
            GC.Associations({
              isTypeOf: [],
              referencedBy: [],
              references: uniq<NonEmptyString>(setoidString)(c.config.map(extractGuids).getOrElse([])), // String scan config for GUID via regex. Confirm GUID is real. Add to referenes
              usedBy: [],
              uses: uniq<NonEmptyString>(setoidString)(c.config.map(extractUsing).getOrElse([])), // Parse JSON, if .using exists, .using -> .uses
            })
          )
        }

        function extractUsing(config: string): Array<GC.PersistedConfig["id"]> {
          return JSONFromString.decode(config)
            .chain(JSONRecordCodec.decode)
            .chain((rec) => iots.type({ using: iots.array(iots.string) }).decode(rec))
            .map((rec) => rec.using.map((usingItem) => usingItem.toLowerCase()))
            .chain(iots.array(NonEmptyString).decode)
            .getOrElse([])
        }

        function extractGuids(config: string): Array<GC.PersistedConfig["id"]> {
          const guidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi
          const guids = config.match(guidPattern) || []
          return mapOption(guids, (guid) => record.lookup(guid.toLowerCase(), configsById).map((c) => c.id))
        }
      }
    )
  },

  configsByType() {
    return createSelector(
      slice((self) => self.configs),
      (configs) => {
        return configs.map(arrToRecordGroupedByType).getOrElse({})

        function arrToRecordGroupedByType(cs: Array<GC.PersistedConfig>) {
          return record.fromFoldable(array)(
            cs.map((c) => tuple(c.type, [c])),
            concat
          )
        }
      }
    )
  },

  configsById() {
    return createSelector(
      slice((state) => state.configs),
      (cs) =>
        record.fromFoldable(array)(
          cs.getOrElse([]).map((c) => tuple(c.id, c)),
          identity
        )
    )
  },

  configNames() {
    return createSelector(
      slice((self) => self.configs),
      (cs) =>
        cs
          .map((cs) => cs.map((c) => c.name))
          .map((types) => uniq<NonEmptyString>(setoidString)(types))
          .map((types) => sort<NonEmptyString>(ordString)(types))
          .getOrElse([])
    )
  },

  configTypes() {
    return createSelector(
      slice((self) => self.configs),
      (cs) =>
        cs
          .map((cs) => cs.map((c) => c.type))
          .map((types) => uniq(setoidString)(types))
          .map((types) => sort(ordString)(types))
          .getOrElse([])
    )
  },

  entityTypeConfigs(select) {
    return createSelector(select.globalConfig.configsByType, (configsByType) => {
      return record
        .lookup("EntityType", configsByType)
        .map((cs) => cs.map((c) => tuple(c.name, c)))
        .map((kvPairs) => record.fromFoldable(array)(kvPairs, identity))
        .getOrElse({})
    })
  },
})

export default selectors
