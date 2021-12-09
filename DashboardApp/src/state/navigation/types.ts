import * as Store from "../store.types"
import * as iots from "io-ts"
import { NonEmptyString } from "io-ts-types/lib/NonEmptyString"
import React from "react"
import * as Reach from "@reach/router"
import { Profile } from "../iam/types"
import { routes } from "./routes"

export type NavigationGroupAutomaticChildType = iots.TypeOf<typeof NavigationGroupAutomaticChildTypeCodec>
const NavigationGroupAutomaticChildTypeCodec = iots.type({
  icon: iots.union([iots.undefined, iots.string]),
  ordinal: iots.union([iots.undefined, iots.number]),
  path: iots.union([iots.undefined, iots.string]),
  type: NonEmptyString,
})
export type NavigationGroup = iots.TypeOf<typeof NavigationGroupCodec>
export const NavigationGroupCodec = iots.type({
  id: NonEmptyString,
  name: NonEmptyString,
  type: iots.literal("Navigation.Group"),

  active: iots.boolean,
  automaticChildTypes: iots.union([iots.undefined, iots.array(NavigationGroupAutomaticChildTypeCodec)]),
  description: iots.union([iots.undefined, iots.string]),
  group: iots.union([iots.undefined, iots.array(NonEmptyString)]),
  icon: iots.union([iots.undefined, iots.string]),
  ordinal: iots.union([iots.undefined, iots.number]),
})
export type NavigationGroupWithChildren = NavigationGroup & {
  children: (NavigationItem | NavigationGroupWithChildren)[]
}
export type NavigationItem = iots.TypeOf<typeof NavigationItemCodec>
export const NavigationItemCodec = iots.type({
  id: NonEmptyString,
  name: NonEmptyString,
  type: iots.literal("Navigation.Item"),

  active: iots.boolean,
  description: iots.union([iots.undefined, iots.string]),
  group: iots.union([iots.undefined, iots.array(NonEmptyString)]),
  icon: iots.union([iots.undefined, iots.string]),
  ordinal: iots.union([iots.undefined, iots.number]),
  url: iots.union([iots.undefined, iots.string]),
})
declare module "../store.types" {
  interface AppModels {
    navigation: {
      state: State<RoutesMap>
      reducers: Reducers
      effects: Effects
      selectors: Selectors
    }
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export interface State<RouteMap extends object> {
  routes: { [K in keyof RouteMap]: RouteMap[K] }
}

export interface Selectors {
  routes(app: Store.AppState): RoutesMap
}

export interface Reducers {}

export interface Effects {
  navigate: typeof Reach.navigate
}

export interface IRouteMeta {
  /** the absolute url */
  abs: string
  context?: Record<string, unknown>
  /** for possible UI display; provide more info about the route's purpose */
  description: string
  /** a name for UI presentation */
  title: string
  /** the name of an icon from `antd` */
  iconType: string
  /** the url relative to parent's abs url */
  path: string
  redirectFrom: Array<string>
  subroutes: Record<string, RouteMeta>
}

export interface AuthenticatedRouteMeta extends IRouteMeta {
  requiresAuthentication: true
  component: React.ComponentType<WithAuthenticatedRouteProps<any>>
}

export interface UnauthenticatedRouteMeta extends IRouteMeta {
  requiresAuthentication: false
  component: React.ComponentType<WithUnauthenticatedRouteProps<any>>
}

export type RouteMeta = AuthenticatedRouteMeta | UnauthenticatedRouteMeta
export type WithAuthenticatedRouteProps<P> = P &
  AuthenticatedRouteMeta &
  Required<Reach.RouteComponentProps> & { profile: Profile; children: JSX.Element }
export type WithUnauthenticatedRouteProps<P> = P &
  AuthenticatedRouteMeta &
  Required<Reach.RouteComponentProps> & { children: JSX.Element }
export type WithRouteProps<P> = P &
  RouteMeta &
  Required<Reach.RouteComponentProps> & { "*"?: string; children: JSX.Element }
export type RoutesMap = typeof routes
