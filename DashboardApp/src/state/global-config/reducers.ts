import { GlobalConfigStoreModel } from "./types"
import { snoc } from "fp-ts/lib/Array"

const reducers: GlobalConfigStoreModel["reducers"] = {
  insertLocalConfig: (s, c) => ({
    ...s,
    configs: s.configs.map((cs) => snoc(cs, c)),
  }),
  rmLocalConfigsById: (s, ids) => ({
    ...s,
    configs: s.configs.map((cs) => cs.filter((c) => !ids.includes(c.id))),
  }),
  update: (state, payload) => ({ ...state, ...payload }),
  updateLocalConfig: (s, { id, ...updatedFields }) => ({
    ...s,
    configs: s.configs.map((cs) => cs.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))),
  }),
}

export default reducers
