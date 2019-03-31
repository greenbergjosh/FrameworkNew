import * as Reach from "@reach/router"

import * as Store from "./store.types"
import { Landing } from "../routes/landing"
import { Dashboard } from "../routes/dashboard"
import { Summary } from "../routes/dashboard/routes/summary"
import { Reports } from "../routes/dashboard/routes/reports"
import { Report } from "../routes/dashboard/routes/reports/routes/report"
import { LbmEditor } from "../routes/dashboard/routes/lbm-editor"
import { Option } from "fp-ts/lib/Option"

declare module "./store.types" {
  interface AppModels {
    navigation: {
      state: State
      reducers: Reducers
      effects: Effects
    }
  }
}

export interface State {
  routes: Array<RouteMeta>
}

export interface Reducers {}

export interface Effects {
  goToLanding<LocationState = void>(
    opts: Option<Reach.NavigateOptions<LocationState>>,
    rootState: Store.AppState
  ): void
  goToDashboard<LocationState = void>(
    opts: Option<Reach.NavigateOptions<LocationState>>,
    rootState: Store.AppState
  ): void
}

export interface RouteMeta {
  /** the absolute url */
  abs: string
  /** the component to render at this route */
  component: React.ComponentType<RouteProps>
  /** a name for UI presentation */
  displayName: string
  /** the name of an icon from `antd` */
  iconType: string
  /** the url relative to parent's abs url */
  rel: string
  subroutes: Array<RouteMeta>
}

export interface RouteProps extends RouteMeta, Reach.RouteComponentProps {
  children: Array<JSX.Element>
}

const home: RouteMeta = {
  abs: "/",
  component: Landing,
  displayName: "Home",
  iconType: "home",
  rel: "/",
  subroutes: [],
}

const dashboard: RouteMeta = {
  abs: "/dashboard",
  component: Dashboard,
  displayName: "Dashboard",
  iconType: "dashboard",
  rel: "dashboard",
  subroutes: [
    {
      abs: "/dashboard",
      component: Summary,
      displayName: "Summary",
      iconType: "dashboard",
      rel: "/",
      subroutes: [],
    },
    {
      abs: "/dashboard/reports",
      component: Reports,
      displayName: "Reports",
      iconType: "table",
      rel: "reports",
      subroutes: [
        {
          abs: "/dashboard/reports/visitorId",
          component: Report,
          displayName: "Visitor ID",
          iconType: "bar-chart",
          rel: "visitorId",
          subroutes: [],
        },
        {
          abs: "/dashboard/reports/test",
          component: Report,
          displayName: "Test Report",
          iconType: "bar-chart",
          rel: "test",
          subroutes: [],
        },
      ],
    },
    {
      abs: "/dashboard/lbm-editor",
      component: LbmEditor,
      displayName: "LBM Editor",
      iconType: "code",
      rel: "lbm-editor",
      subroutes: [],
    },
  ],
}

export const navigation: Store.AppModel<State, Reducers, Effects> = {
  state: {
    routes: [home, dashboard],
  },

  reducers: {},

  effects: () => ({
    goToDashboard: (opts) =>
      opts.foldL(
        () => Reach.navigate(dashboard.abs),
        (opts) => Reach.navigate(dashboard.abs, opts)
      ),
    goToLanding: (opts) =>
      opts.foldL(() => Reach.navigate(home.abs), (opts) => Reach.navigate(home.abs, opts)),
  }),
}
