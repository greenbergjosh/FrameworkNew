import { UserInterfaceContextManager } from "@opg/interface-builder"
import { AppDispatch, AppState } from "../state/store.types"
import { PersistedConfig } from "./GlobalConfig.Config"

export interface AdminUserInterfaceContextManager extends UserInterfaceContextManager<PersistedConfig> {
  executeQuery: AppDispatch["reports"]["executeQuery"]
  executeQueryUpdate: AppDispatch["reports"]["executeQueryUpdate"]
  executeHTTPRequestQuery: AppDispatch["reports"]["executeHTTPRequestQuery"]
  reportDataByQuery: AppState["reports"]["reportDataByQuery"]
  navigation: AppDispatch["navigation"]
}
