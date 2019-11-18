export interface GetGotContextType {
  reset: () => void
}

export interface GetGotRootDataContextType extends GetGotContextType {}

export interface GetGotResetAction {
  type: "reset"
}

export const getgotResetAction: GetGotResetAction = {
  type: "reset",
}
