import * as iots from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/Date/DateFromISOString"
import { createOptionFromNullable } from "io-ts-types/lib/fp-ts/createOptionFromNullable"
import { lensesFromInterface } from "io-ts-types/lib/monocle-ts/lensesFromInterface"
import { fromEquals } from "fp-ts/lib/Setoid"

export interface Config extends iots.TypeOf<typeof ConfigCodec> {}
export type ConfigType = iots.TypeOf<typeof ConfigTypeCodec>

export const ConfigTypeCodec = iots.union([
  iots.literal("AdminUser"),
  iots.literal("ConnectionString"),
  iots.literal("LBM"),
  iots.literal("SimpleImportExportFtpExportJobConfig"),
  iots.literal("SimpleImportExportFtpImportJobConfig"),
  iots.literal("SimpleImportExportJob"),
  iots.literal("StartupConfig"),
  iots.literal("StartUpConfig"),
  iots.literal("VisitorIdAffiliate"),
  iots.literal("VisitorIdEmailProvider"),
  iots.literal("VisitorIdMd5Provider"),
  iots.literal("VisitorIdPublisher"),
])

export const ConfigCodec = iots.interface({
  Config: createOptionFromNullable(iots.string),
  created: createOptionFromNullable(DateFromISOString),
  Id: iots.string,
  Name: iots.string,
  Type: ConfigTypeCodec,
})

export const ConfigurationArrayCodec = iots.array(ConfigCodec)
export const ConfigLens = lensesFromInterface(ConfigCodec)
export const configTypeSetoid = fromEquals<ConfigType>((a, b) => a === b)
