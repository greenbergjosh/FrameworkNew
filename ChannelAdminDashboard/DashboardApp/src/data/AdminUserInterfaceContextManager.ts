import * as record from "fp-ts/lib/Record"
import React from "react"
import { PersistedConfig } from "./GlobalConfig.Config"
import { AppDispatch, AppSelectors, AppState } from "../state/store.types"
import { UserInterfaceContextManager } from "@opg/interface-builder"

export interface AdminUserInterfaceContextManager
  extends UserInterfaceContextManager<PersistedConfig> {
  executeQuery: AppDispatch["reports"]["executeQuery"]
  reportDataByQuery: AppState["reports"]["reportDataByQuery"]
}

export const AdminUserInterfaceContext = React.createContext<AdminUserInterfaceContextManager | null>(
  null
)

export const createUIContext = (
  dispatch: AppDispatch,
  reportDataByQuery: AppState["reports"]["reportDataByQuery"],
  configs: AppState["globalConfig"]["configs"],
  configsById: ReturnType<AppSelectors["globalConfig"]["configsById"]>
): AdminUserInterfaceContextManager => ({
  executeQuery: dispatch.reports.executeQuery.bind(dispatch.reports),
  reportDataByQuery,
  loadByFilter: (predicate: (item: PersistedConfig) => boolean): PersistedConfig[] => {
    return configs.map((cfgs) => cfgs.filter(predicate)).toNullable() || []
  },
  loadById: (id: string) => {
    return record.lookup(id, configsById).toNullable()
  },
  loadByURL: (url: string) => {
    return [] // axios
  },
})
