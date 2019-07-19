import * as record from "fp-ts/lib/Record"
import React from "react"
import { PersistedConfig } from "../../data/GlobalConfig.Config"
import { AppDispatch, AppSelectors, AppState } from "../../state/store.types"

export interface UserInterfaceContextManager {
  executeQuery: AppDispatch["reports"]["executeQuery"]
  reportDataByQuery: AppState["reports"]["reportDataByQuery"]
  loadByFilter: (predicate: (item: PersistedConfig) => boolean) => PersistedConfig[]
  loadById: (id: PersistedConfig["id"]) => PersistedConfig | null
  loadByURL: (url: string) => unknown[]
}

export const UserInterfaceContext = React.createContext<UserInterfaceContextManager | null>(null)

export const createUIContext = (
  dispatch: AppDispatch,
  reportDataByQuery: AppState["reports"]["reportDataByQuery"],
  configs: AppState["globalConfig"]["configs"],
  configsById: ReturnType<AppSelectors["globalConfig"]["configsById"]>
) =>
  ({
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
  } as UserInterfaceContextManager)
