import { array } from "fp-ts/lib/Array"
import { identity, tuple } from "fp-ts/lib/function"
import * as record from "fp-ts/lib/Record"
import { JSONFromString } from "io-ts-types"
import { Left, Right } from "../data/Either"
import { PersistedConfig } from "../data/GlobalConfig.Config"
import { JSONArray, JSONRecord } from "../data/JSON"
import { None, Some } from "../data/Option"
import { QueryConfig, QueryConfigCodec, ReportConfigCodec } from "../data/Report"
import * as Store from "./store.types"
import { none } from "fp-ts/lib/Option"
import { languages } from "monaco-editor"

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

export interface Partner {
  id: number,
  partner: string,
  record_type: string,
  rows_processed: number,
}

export interface State {
  selectedPartner: JSONRecord
}

export interface Reducers {
  updateSelectedPartner(payload: Partial<State["selectedPartner"]>): State
}

export interface Effects {
  setSelectedPartner(selectedPartner: JSONRecord): void
}

export interface Selectors {}

export const importIngestionReport: Store.AppModel<State, Reducers, Effects, Selectors> = {
  state: {
    selectedPartner: {},
  },

  reducers: {
    updateSelectedPartner: (s, p) => ({
      ...s,
      selectedPartner: { ...s.selectedPartner, ...p },
    }),
  },

  effects: (dispatch) => ({
    setSelectedPartner(selectedPartner) {
      dispatch.importIngestionReport.updateSelectedPartner(selectedPartner)
      //TODO: update raw, import, export data
      console.log("importIngestionReport", this)
    },
  }),

  selectors: (slice, createSelector) => ({}),
}
