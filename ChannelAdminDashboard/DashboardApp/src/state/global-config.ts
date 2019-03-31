import { tryCatch2v } from "fp-ts/lib/Either"
import { filter } from "fp-ts/lib/Array"
import { identity } from "fp-ts/lib/function"
import * as iots from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/Date/DateFromISOString"
import { createOptionFromNullable } from "io-ts-types/lib/fp-ts/createOptionFromNullable"

import GlobalConfig from "../mock-data/global-config.json"
import * as Store from "./store.types"

declare module "./store.types" {
  interface AppModels {
    globalConfig: {
      state: State
      reducers: Reducers
      effects: Effects
      selectors: Selectors
    }
  }
}

export interface State {
  configs: Array<Configuration>
}

export interface Reducers {}

export interface Effects {}

export interface Selectors {
  ofTypeLBM(state: Store.AppState): Array<LBMConfig>
}

export type Configuration = iots.TypeOf<typeof ConfigurationCodec>
export type AdminUserConfig = iots.TypeOf<typeof AdminUserConfigCodec>
export type ConnectionStringConfig = iots.TypeOf<typeof ConnectionStringConfigCodec>
export type LBMConfig = iots.TypeOf<typeof LBMConfigCodec>
export type SimpleImportExportFtpExportJobConfig = iots.TypeOf<typeof SimpleImportExportFtpExportJobConfigCodec>
export type SimpleImportExportFtpImportJobConfig = iots.TypeOf<typeof SimpleImportExportFtpImportJobConfigCodec>
export type SimpleImportExportJobConfig = iots.TypeOf<typeof SimpleImportExportJobConfigCodec>
export type StartupConfig = iots.TypeOf<typeof StartupConfigCodec>
export type StartUpConfig = iots.TypeOf<typeof StartUpConfigCodec>
export type VisitorIdAffiliateConfig = iots.TypeOf<typeof VisitorIdAffiliateConfigCodec>
export type VisitorIdEmailProviderConfig = iots.TypeOf<typeof VisitorIdEmailProviderConfigCodec>
export type VisitorIdMd5ProviderConfig = iots.TypeOf<typeof VisitorIdMd5ProviderConfigCodec>
export type VisitorIdPublisherConfig = iots.TypeOf<typeof VisitorIdPublisherConfigCodec>

const AdminUserConfigCodec = iots.interface({
  Config: createOptionFromNullable(iots.UnknownRecord),
  created: createOptionFromNullable(DateFromISOString),
  Id: iots.string,
  Name: iots.string,
  Type: iots.literal("AdminUser"),
})

const ConnectionStringConfigCodec = iots.interface({
  Config: createOptionFromNullable(iots.UnknownRecord),
  created: createOptionFromNullable(DateFromISOString),
  Id: iots.string,
  Name: iots.string,
  Type: iots.literal("ConnectionString"),
})

const LBMConfigCodec = iots.interface({
  Config: createOptionFromNullable(iots.string), // this is actual C# source code
  created: createOptionFromNullable(DateFromISOString),
  Id: iots.string,
  Name: iots.string,
  Type: iots.literal("LBM"),
})

const SimpleImportExportFtpExportJobConfigCodec = iots.interface({
  Config: createOptionFromNullable(iots.UnknownRecord),
  created: createOptionFromNullable(DateFromISOString),
  Id: iots.string,
  Name: iots.string,
  Type: iots.literal("SimpleImportExportFtpExportJobConfig"),
})

const SimpleImportExportFtpImportJobConfigCodec = iots.interface({
  Config: createOptionFromNullable(iots.UnknownRecord),
  created: createOptionFromNullable(DateFromISOString),
  Id: iots.string,
  Name: iots.string,
  Type: iots.literal("SimpleImportExportFtpImportJobConfig"),
})

const SimpleImportExportJobConfigCodec = iots.interface({
  Config: createOptionFromNullable(iots.UnknownRecord),
  created: createOptionFromNullable(DateFromISOString),
  Id: iots.string,
  Name: iots.string,
  Type: iots.literal("SimpleImportExportJob"),
})

const StartupConfigCodec = iots.interface({
  Config: createOptionFromNullable(iots.UnknownRecord),
  created: createOptionFromNullable(DateFromISOString),
  Id: iots.string,
  Name: iots.string,
  Type: iots.literal("StartupConfig"),
})

const StartUpConfigCodec = iots.interface({
  Config: createOptionFromNullable(iots.UnknownRecord),
  created: createOptionFromNullable(DateFromISOString),
  Id: iots.string,
  Name: iots.string,
  Type: iots.literal("StartUpConfig"),
})

const VisitorIdAffiliateConfigCodec = iots.interface({
  Config: createOptionFromNullable(iots.UnknownRecord),
  created: createOptionFromNullable(DateFromISOString),
  Id: iots.string,
  Name: iots.string,
  Type: iots.literal("VisitorIdAffiliate"),
})

const VisitorIdEmailProviderConfigCodec = iots.interface({
  Config: createOptionFromNullable(iots.UnknownRecord),
  created: createOptionFromNullable(DateFromISOString),
  Id: iots.string,
  Name: iots.string,
  Type: iots.literal("VisitorIdEmailProvider"),
})

const VisitorIdMd5ProviderConfigCodec = iots.interface({
  Config: createOptionFromNullable(iots.UnknownRecord),
  created: createOptionFromNullable(DateFromISOString),
  Id: iots.string,
  Name: iots.string,
  Type: iots.literal("VisitorIdMd5Provider"),
})

const VisitorIdPublisherConfigCodec = iots.interface({
  Config: createOptionFromNullable(iots.UnknownRecord),
  created: createOptionFromNullable(DateFromISOString),
  Id: iots.string,
  Name: iots.string,
  Type: iots.literal("VisitorIdPublisher"),
})

const ConfigurationCodec = iots.taggedUnion("Type", [
  AdminUserConfigCodec,
  ConnectionStringConfigCodec,
  LBMConfigCodec,
  SimpleImportExportFtpExportJobConfigCodec,
  SimpleImportExportFtpImportJobConfigCodec,
  SimpleImportExportJobConfigCodec,
  StartupConfigCodec,
  StartUpConfigCodec,
  VisitorIdAffiliateConfigCodec,
  VisitorIdEmailProviderConfigCodec,
  VisitorIdMd5ProviderConfigCodec,
  VisitorIdPublisherConfigCodec,
])

const ConfigurationArrayCodec = iots.array(ConfigurationCodec)

export const globalConfig: Store.AppModel<State, Reducers, Effects, Selectors> = {
  state: {
    configs: ConfigurationArrayCodec.decode(
      GlobalConfig.Config.map((c) => ({
        ...c,
        Config: c.Config ? tryCatch2v(() => JSON.parse(c.Config), () => c.Config).fold(identity, identity) : null,
      }))
    ).getOrElse([]),
  },

  reducers: {},

  effects: {},

  selectors: (slice, createSelector) => ({
    ofTypeLBM() {
      return createSelector(
        slice((state) => state.configs),
        (configs) => filter(configs, (c): c is LBMConfig => c.Type === "LBM")
      )
    },
  }),
}
