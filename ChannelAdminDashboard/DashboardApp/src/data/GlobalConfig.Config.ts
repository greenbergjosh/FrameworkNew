import { Either } from "fp-ts/lib/Either"
import { fromEquals } from "fp-ts/lib/Setoid"
import * as iots from "io-ts"
import { createOptionFromNullable } from "io-ts-types/lib/fp-ts/createOptionFromNullable"
import { JSONType } from "io-ts-types/lib/JSON/JSONFromString"
import { lensesFromInterface } from "io-ts-types/lib/monocle-ts/lensesFromInterface"
import { NonEmptyString } from "io-ts-types/lib/NonEmptyString"
import { failure } from "io-ts/lib/PathReporter"

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
}

export const ConfigLangJsonCodec = iots.literal("json")
export const ConfigLangNonJsonCodec = iots.union([
  iots.literal("csharp"),
  iots.literal("javascript"),
  iots.literal("typescript"),
  iots.literal("sql"),
  iots.literal("xml"),
])
export const ConfigLangCodec = iots.union([ConfigLangJsonCodec, ConfigLangNonJsonCodec])

//
// ────────────────────────────────────────────────────────────────────────  ──────────
//   :::::: P E R S I S T E D   C O N F I G : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────────────────────────────
//
export type PersistedConfig = iots.TypeOf<typeof PersistedConfigCodec>
export const PersistedConfigCodec = iots.type(
  {
    config: createOptionFromNullable(iots.string),
    id: NonEmptyString,
    name: NonEmptyString,
    type: NonEmptyString,
  },
  "PersistedConfig"
)

export type PersistedConfigArray = iots.TypeOf<typeof PersistedConfigArrayCodec>
export const PersistedConfigArrayCodec = iots.array(PersistedConfigCodec)
export const PersistedConfigLens = lensesFromInterface(PersistedConfigCodec)
export const setoidPersistedConfig = fromEquals<PersistedConfig>((a, b) => a.id === b.id)
export const setoidConfigType = fromEquals<ConfigType>((a, b) => a === b)

//
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────  ──────────
//   :::::: IN PROGRESS UPDATE DRAFT : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//

export type InProgressRemoteUpdateDraft = iots.TypeOf<typeof InProgressRemoteUpdateDraftCodec>
export const InProgressRemoteUpdateDraftCodec = iots.type({
  id: NonEmptyString,
  config: iots.string,
  name: iots.string,
  type: iots.string,
})
//
// ──────────────────────────────────────────────────────────────────────────────────────────────────────────  ──────────
//   :::::: COMPLETE UPDATE DRAFT  : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
export type CompleteRemoteUpdateDraft = iots.TypeOf<typeof CompleteRemoteUpdateDraftCodec>
export const CompleteRemoteUpdateDraftCodec = iots.type({
  id: NonEmptyString,
  config: NonEmptyString,
  name: NonEmptyString,
  type: NonEmptyString,
})

export function mkCompleteRemoteUpdateDraft(
  draft: InProgressRemoteUpdateDraft
): Either<Array<string>, CompleteRemoteUpdateDraft> {
  return CompleteRemoteUpdateDraftCodec.decode(draft).mapLeft(failure)
}

//
// ────────────────────────────────────────────────────────────────────────────────────────────────────  ──────────
//   :::::: IN PROGRESS CREATE DRAFT : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
//
export interface InProgressLocalDraft {
  config: string
  name: string
  type: string
}

//
// ────────────────────────────────────────────────────────────────────────────────────────────────  ──────────
//   :::::: COMPLETE CREATE DRAFT : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────────────────────────────────────────────────────
//
export type CompleteLocalDraft = iots.TypeOf<typeof CompleteLocalDraftCodec>
export const CompleteLocalDraftCodec = iots.type({
  config: NonEmptyString,
  name: NonEmptyString,
  type: NonEmptyString,
})

export function mkCompleteLocalDraft(
  draft: InProgressLocalDraft
): Either<Array<string>, CompleteLocalDraft> {
  return CompleteLocalDraftCodec.decode(draft).mapLeft(failure)
}
