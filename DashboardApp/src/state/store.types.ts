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

/**
 * The root state of the store
 */
export type AppState = { [K in keyof AppModels]: AppModels[K]["state"] }
/**
 * The dispatch function / object enhanced and returned by `Rematch.init`
 */
export type AppDispatch = PublicEffects & PublicReducers & Rematch.RematchDispatch

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
 * [[Props]] and [[PropseMappedFromState]] and finally merges in
 * the `dispatch` prop with the [[AppDispatch]] type
 *
 * @example
 * React.SFC<OwnProps, ReturnType<typeof mapStateToProps>
 */
export type Connect<
  Props extends Record<string, any>,
  PropsMappedFromState extends Record<string, any>
> = Props & PropsMappedFromState & { dispatch: AppDispatch }

/**
 * A utility type for annotating the type/interface of
 * a rematch model config, enabling typechecking and
 * autocompletion againt the interfaces already defined
 * and registered
 */
export interface AppModel<S, R, E, PublicSelectors = {}> {
  state: S
  reducers: R
  effects: E | ((dispatch: AppDispatch) => E)
  selectors?: AppModelToSelectorFactory<S, AppState, PublicSelectors>
}

/**
 * ---- AppModelWithSelectors<S, R, E, PublicSelectors> -----
 *
 * A utility type for annotating the type/interface of
 * a rematch model config that implements some selectors,
 * enabling typechecking and autocompletion againt the
 * interfaces already defined and registered
 */
export interface AppModelWithSelectors<
  S,
  R extends Record<string, (...args: any[]) => S>,
  E extends Record<string, (...args: any[]) => any>,
  PublicSelectors
> {
  state: S
  reducers: R
  effects: (dispatch: AppDispatch) => E | E
  selectors: AppModelToSelectorFactory<S, AppState, PublicSelectors>
}

export type AppModelToSelectorFactory<
  ModelState extends Record<string, any>,
  RootState extends Record<string, any>,
  PublicSelectors
> = (
  slice: <T>(selfSelectFn: (ownState: ModelState) => T) => (root: AppState) => T,
  createSelector: typeof Reselect["createSelector"]
) => { [K in keyof PublicSelectors]: (rootSelectors: AppSelectors) => PublicSelectors[K] }

export type PrivateEffect2Public<PrivateEff extends (...args: any[]) => any> = PrivateEff extends (
  payload?: infer P
) => infer R
  ? (payload?: P) => R
  : PrivateEff extends () => infer R
  ? () => R
  : PrivateEff extends (payload: infer P) => infer R
  ? (payload: P) => R
  : PrivateEff extends (payload: void, root: any) => infer R
  ? () => R
  : PrivateEff extends (payload: infer P, root: any, meta?: infer M) => infer R
  ? (payload: P, meta?: M) => R
  : PrivateEff extends (payload: infer P, root: any) => infer R
  ? (payload: P) => R
  : PrivateEff extends (payload: infer P, root: any, meta: infer M) => infer R
  ? (payload: P, meta: M) => R
  : never

export type PrivateEffects2Public<PrivateEffs> = {
  [K in keyof PrivateEffs]: PrivateEffs[K] extends (...args: any[]) => any
    ? PrivateEffect2Public<PrivateEffs[K]>
    : never
}

export type PrivateReducer2Public<
  PrivateReducer extends (...args: any[]) => any
> = PrivateReducer extends () => any
  ? () => void
  : PrivateReducer extends (state: any) => any
  ? () => void
  : PrivateReducer extends (state: any, payload: infer P) => any
  ? (payload: P) => void
  : never

export type ReducerConfigs = { [K in keyof AppModels]: AppModels[K]["reducers"] }
export type EffectConfigs = { [K in keyof AppModels]: AppModels[K]["effects"] }
export type PublicEffects = { [K in keyof EffectConfigs]: PrivateEffects2Public<EffectConfigs[K]> }
export type PublicReducers = {
  [K in keyof ReducerConfigs]: ReducerConfig2PublicReducers<ReducerConfigs[K]>
}
export type _PublicReducers = { [K in keyof ReducerConfigs]: ReducerConfigs[K] }

type ReducerConfig2PublicReducers<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? PrivateReducer2Public<T[K]> : never
}
