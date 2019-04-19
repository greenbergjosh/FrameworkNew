import * as iots from "io-ts"
import { NonEmptyString } from "io-ts-types/lib/NonEmptyString"
import { createOptionFromNullable } from "io-ts-types/lib/fp-ts/createOptionFromNullable"
import { lensesFromInterface } from "io-ts-types/lib/monocle-ts/lensesFromInterface"
import { fromEquals } from "fp-ts/lib/Setoid"
import { JSONType } from "io-ts-types/lib/JSON/JSONFromString"
import { Overwrite } from "utility-types"
import { Option } from "fp-ts/lib/Option"
import { JSONRecord } from "./JSON"

export type Config = iots.TypeOf<typeof ConfigCodec>
export interface DenormalizedConfig extends Config {
  entityType: JSONRecord
}
export type InProgressDraftConfig = Overwrite<
  CompleteConfigDraft,
  { draftId: string; name: string; type: string }
>
export type CompleteConfigDraft = iots.TypeOf<typeof CompleteConfigDraftCodec>
export type ConfigType = string
export type ConfigLang = iots.TypeOf<typeof ConfigLangCodec>
export type ConfigLangJson = iots.TypeOf<typeof ConfigLangJsonCodec>
export type ConfigLangNonJson = iots.TypeOf<typeof ConfigLangNonJsonCodec>

export interface CreateRemoteConfigParams {
  config: JSONType
  name: string
  type: string
}
export const configLangs = {
  csharp: "csharp",
  javascript: "javascript",
  json: "json",
  typescript: "typescript",
  sql: "sql",
  xml: "xml",
}

//
// ────────────────────────────────────────────────────  ──────────
//   :::::: C O D E C S : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────────
//

export const ConfigLangJsonCodec = iots.literal("json")
export const ConfigLangNonJsonCodec = iots.union([
  iots.literal("csharp"),
  iots.literal("javascript"),
  iots.literal("typescript"),
  iots.literal("sql"),
  iots.literal("xml"),
])
export const ConfigLangCodec = iots.union([ConfigLangJsonCodec, ConfigLangNonJsonCodec])

export const ConfigMetaCodec = iots.type(
  {
    config: iots.null,
    id: iots.string,
    name: iots.string,
    type: iots.string,
  },
  "GlobalConfig.ConfigMeta"
)
export const ConfigCodec = iots.type(
  {
    config: createOptionFromNullable(iots.string),
    id: iots.string,
    name: iots.string,
    type: iots.string,
  },
  "GlobalConfig.Config"
)
export const CompleteConfigDraftCodec = iots.type({
  config: iots.string,
  draftId: NonEmptyString,
  language: ConfigLangCodec,
  name: NonEmptyString,
  type: NonEmptyString,
})

export const ConfigArrayCodec = iots.array(ConfigCodec)
export const ConfigurationMetaArrayCodec = iots.array(ConfigMetaCodec)
export const ConfigLens = lensesFromInterface(ConfigCodec)
export const ConfigMetaLens = lensesFromInterface(ConfigMetaCodec)
export const setoidConfigType = fromEquals<ConfigType>((a, b) => a === b)

//
// ────────────────────────────────────────────────────  ──────────
//   :::::: S E T O I D : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────────
//

export const setoidGlobalConfig = fromEquals<Config>((a, b) => a.id === b.id)
