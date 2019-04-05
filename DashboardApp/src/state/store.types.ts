import * as Rematch from "@rematch/core"
import * as Reselect from "reselect"

/**
 * ------------ APP MODELS --------------
 *
 * Each model's interface should be registered here using the
 * same key/property as is used in the Rematch.init function.
 *
 * When a model definition is registered here, the rest of
 * this file will incorporate that model into [[AppState]],
 * [[AppDispatch]], and (if applicable) [[AppSelectors]], which
 * enable type checking and autocompletion for all the rematch /
 * redux related code.
 *
 */
export interface AppModels {}

export type AppModelConfigs = {
  [K in keyof AppModels]: AppModel<
    AppModels[K]["state"],
    AppModels[K]["reducers"],
    AppModels[K]["effects"],
    AppModels[K]["selectors"]
  >
}
export type AppReducers = { [K in keyof AppModels]: AppModels[K]["reducers"] }
export type AppEffects = { [K in keyof AppModels]: AppModels[K]["effects"] }
/**
 * groups all selectors by model name, creating the interface for [[store.select]]
 */
export type AppSelectors = {
  [K in keyof AppModels]: AppModels[K] extends {
    selectors: object
  }
    ? AppModels[K]["selectors"]
    : void
}
/**
 * The root state of the store
 */
export type AppState = { [K in keyof AppModels]: AppModels[K]["state"] }
/**
 * The dispatch function / object enhanced and returned by `Rematch.init`
 */
export type AppDispatch = AppEffects & AppReducers & Rematch.RematchDispatch

/**
 * This utility type makes it easier to annotate the Props
 * type parameter in `React.Component<P,S>` or `React.FunctionComponent<P>`
 * for components that are connected the the store. It merges
 * [[Props]] and [[PropsMappedFromState]] and finally merges in
 * the `dispatch` prop with the [[AppDispatch]] type
 *
 * @example
 * React.SFC<OwnProps, ReturnType<typeof mapStateToProps>
 */
export type Connect<
  Props extends Record<string, unknown>,
  PropsMappedFromState extends Record<string, unknown>
> = Props & PropsMappedFromState & { dispatch: AppDispatch }

/**
 * A utility type for annotating the type/interface of
 * a rematch model config, enabling typechecking and
 * autocompletion againt the interfaces already defined
 * and registered
 */
export interface AppModel<
  S,
  R extends object,
  E extends object,
  PublicSelectors extends object
> {
  state: S
  reducers: {
    [K in keyof R]: R[K] extends () => void
      ? (state: S) => void
      : R[K] extends (payload: infer P) => void
      ? (state: S, payload: P) => void
      : never
  }
  effects:
    | PublicEffects2EffectConfg<E>
    | ((dispatch: AppDispatch) => PublicEffects2EffectConfg<E>)
  selectors: AppModelToSelectorFactory<S, PublicSelectors>
}

type PublicEffects2EffectConfg<Effects extends object> = {
  [K in keyof Effects]: Effects[K] extends (payload: infer P, meta: infer M) => infer R
    ? (payload: P, rootState: AppState, meta: M) => R
    : Effects[K] extends (payload: infer P) => infer R
    ? (payload: P, rootState: AppState) => R
    : Effects[K] extends () => infer R
    ? (_: void, rootState: AppState) => R
    : never
}

export type AppModelToSelectorFactory<ModelState, PublicSelectors> = (
  slice: <T>(selfSelectFn: (ownState: ModelState) => T) => (root: AppState) => T,
  createSelector: typeof Reselect["createSelector"]
) => { [K in keyof PublicSelectors]: (rootSelectors: AppSelectors) => PublicSelectors[K] }
