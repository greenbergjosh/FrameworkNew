import React from "react"
import { PersistedConfig } from "../../data/GlobalConfig.Config"
import { AppDispatch, AppModels } from "../../state/store.types"

export interface UserInterfaceContextManager {
  executeQuery: AppDispatch["reports"]["executeQuery"]
  reportDataByQuery: AppModels["reports"]["state"]["reportDataByQuery"]
  loadByFilter: (predicate: (item: PersistedConfig) => boolean) => PersistedConfig[]
  loadById: (id: PersistedConfig["id"]) => PersistedConfig | null
  loadByURL: (url: string) => unknown[]
}

export const UserInterfaceContext = React.createContext<UserInterfaceContextManager | null>(null)
