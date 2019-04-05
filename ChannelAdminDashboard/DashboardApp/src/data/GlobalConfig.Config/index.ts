import * as iots from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/Date/DateFromISOString"
import { createOptionFromNullable } from "io-ts-types/lib/fp-ts/createOptionFromNullable"
import { lensesFromInterface } from "io-ts-types/lib/monocle-ts/lensesFromInterface"
import { fromEquals } from "fp-ts/lib/Setoid"

export type Config = iots.TypeOf<typeof ConfigCodec>
export type ConfigMeta = iots.TypeOf<typeof ConfigMetaCodec>
export type ConfigType = string

export const ConfigMetaCodec = iots.type(
  {
    config: iots.null,
    // created: createOptionFromNullable(DateFromISOString),
    id: iots.string,
    name: iots.string,
    type: iots.string,
  },
  "GlobalConfig.ConfigMeta"
)

export const ConfigCodec = iots.type(
  {
    config: createOptionFromNullable(iots.string),
    // created: createOptionFromNullable(DateFromISOString),
    id: iots.string,
    name: iots.string,
    type: iots.string,
  },
  "GlobalConfig.Config"
)

export const ConfigurationArrayCodec = iots.array(ConfigCodec)
export const ConfigurationMetaArrayCodec = iots.array(ConfigMetaCodec)
export const ConfigLens = lensesFromInterface(ConfigCodec)
export const ConfigMetaLens = lensesFromInterface(ConfigMetaCodec)
export const setoidConfigType = fromEquals<ConfigType>((a, b) => a === b)
