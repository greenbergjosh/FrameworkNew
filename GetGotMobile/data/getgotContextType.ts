export interface GetGotContextType {
  reset: () => void
}

export interface GetGotRootDataContextType extends GetGotContextType {}

export type GetGotResetAction = FSA<"reset">

export const getgotResetAction: GetGotResetAction = {
  type: "reset",
}
