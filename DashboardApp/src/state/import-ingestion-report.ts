import { JSONRecord } from "../data/JSON"
import * as Store from "./store.types"

declare module "./store.types" {
  interface AppModels {
    importIngestionReport: {
      state: State
      reducers: Reducers
      effects: Effects
      selectors: Selectors
    }
  }
}

export interface IngestionStatus {
  last_id_processed: number
  rows_processed: number
  runtime: number
  succeeded: boolean
  table_name: string
}

export interface PartnerStatus {
  id: string
  has_exports: boolean
  name: string
  Tables: { [key: string]: { type?: string } }
}

export interface State {
  selectedPartner: PartnerStatus | null
}

export interface Reducers {
  updateSelectedPartner(payload: PartnerStatus | null): State
}

export interface Effects {
  // setSelectedPartner(selectedPartner: PartnerStatus | null): void
}

export interface Selectors {}

export const importIngestionReport: Store.AppModel<State, Reducers, Effects, Selectors> = {
  state: {
    selectedPartner: null,
  },

  reducers: {
    updateSelectedPartner: (s, p) => ({
      ...s,
      selectedPartner: p,
    }),
  },

  effects: (dispatch) => ({
    // setSelectedPartner(selectedPartner) {
    //   dispatch.importIngestionReport.updateSelectedPartner(selectedPartner)
    //   //TODO: update raw, import, export data
    //   console.log("importIngestionReport", this)
    // },
  }),

  selectors: (slice, createSelector) => ({}),
}
