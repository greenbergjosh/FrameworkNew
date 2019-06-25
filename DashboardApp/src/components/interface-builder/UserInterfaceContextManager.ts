import React from "react"
import { PersistedConfig } from "../../data/GlobalConfig.Config"
import { AppDispatch } from "../../state/store.types"

export interface UserInterfaceContextManager {
  executeQuery: AppDispatch["reports"]["executeQuery"]
  loadByFilter: (predicate: (item: PersistedConfig) => boolean) => PersistedConfig[]
  loadById: (id: PersistedConfig["id"]) => PersistedConfig | null
  loadByURL: (url: string) => unknown[]
}

export const UserInterfaceContext = React.createContext<UserInterfaceContextManager | null>(null)
