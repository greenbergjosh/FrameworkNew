import * as record from "fp-ts/lib/Record"
import React from "react"
import { useRematch } from "../hooks"
import { store } from "../state/store"
import { AppDispatch, AppSelectors, AppState } from "../state/store.types"
import { AdminUserInterfaceContextManager } from "./AdminUserInterfaceContextManager.type"
import { PersistedConfig } from "../api/GlobalConfigCodecs"

export const AdminUserInterfaceContext = React.createContext<AdminUserInterfaceContextManager | null>(null)

export const createUIContext = (
  dispatch: AppDispatch,
  reportDataByQuery: AppState["reports"]["reportDataByQuery"],
  configs: AppState["globalConfig"]["configs"],
  configsById: ReturnType<AppSelectors["globalConfig"]["configsById"]>
): AdminUserInterfaceContextManager => ({
  navigation: dispatch.navigation,
  executeQuery: dispatch.reports.executeQuery.bind(dispatch.reports),
  executeQueryUpdate: dispatch.reports.executeQueryUpdate.bind(dispatch.reports),
  executeHTTPRequestQuery: dispatch.reports.executeHTTPRequestQuery.bind(dispatch.reports),
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

export interface AdminUserInterfaceContextManagerProviderProps {
  children: (userInterfaceContextManager: AdminUserInterfaceContextManager) => React.ReactElement<any> | null
}

export const AdminUserInterfaceContextManagerProvider = ({
  children,
}: AdminUserInterfaceContextManagerProviderProps) => {
  const [fromStore, dispatch] = useRematch((appState) => ({
    configs: appState.globalConfig.configs,
    configsById: store.select.globalConfig.configsById(appState),
    reportDataByQuery: appState.reports.reportDataByQuery,
  }))

  const userInterfaceContextManager = React.useMemo(
    () => createUIContext(dispatch, fromStore.reportDataByQuery, fromStore.configs, fromStore.configsById),
    [dispatch, fromStore.configs, fromStore.configsById, fromStore.reportDataByQuery]
  )

  return children(userInterfaceContextManager)
}
