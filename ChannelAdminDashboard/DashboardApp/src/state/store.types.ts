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
export type ReducerConfigs = { [K in keyof AppModels]: AppModels[K]["reducers"] }
export type EffectConfigs = { [K in keyof AppModels]: AppModels[K]["effects"] }
/**
 * The root state of the store
 */
export type AppState = { [K in keyof AppModels]: AppModels[K]["state"] }
/**
 * The dispatch function / object enhanced and returned by `Rematch.init`
 */
export type AppDispatch = EffectConfigs & ReducerConfigs & Rematch.RematchDispatch

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
  PublicSelectors = Record<string, never>
> {
  state: S
  reducers?: PublicReducers2ReducerConfig<S, R>
  effects?:
    | PublicEffects2EffectConfg<E>
    | ((dispatch: AppDispatch) => PublicEffects2EffectConfg<E>)
  selectors?: AppModelToSelectorFactory<S, AppState, PublicSelectors>
}

type PublicReducers2ReducerConfig<S, Reducers extends object> = {
  [R in keyof Reducers]: Reducers[R] extends (...args: infer Args) => S
    ? (state: S, ...args: Args) => S
    : never
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

export type AppModelToSelectorFactory<
  ModelState extends Record<string, any>,
  RootState extends Record<string, any>,
  PublicSelectors
> = (
  slice: <T>(selfSelectFn: (ownState: ModelState) => T) => (root: RootState) => T,
  createSelector: typeof Reselect["createSelector"]
) => { [K in keyof PublicSelectors]: (rootSelectors: AppSelectors) => PublicSelectors[K] }
