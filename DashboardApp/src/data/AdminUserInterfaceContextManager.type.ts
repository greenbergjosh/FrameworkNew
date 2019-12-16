import { UserInterfaceContextManager } from "@opg/interface-builder"
import { AppDispatch, AppState } from "../state/store.types"
import { PersistedConfig } from "./GlobalConfig.Config"

export interface AdminUserInterfaceContextManager
  extends UserInterfaceContextManager<PersistedConfig> {
  executeQuery: AppDispatch["reports"]["executeQuery"]
  reportDataByQuery: AppState["reports"]["reportDataByQuery"]
}
