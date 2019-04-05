import * as Reach from "@reach/router"

import * as Store from "./store.types"
import { Landing } from "../routes/landing"
import { Dashboard } from "../routes/dashboard"
import { Summary } from "../routes/dashboard/routes/summary"
import { Reports } from "../routes/dashboard/routes/reports"
import { Report } from "../routes/dashboard/routes/reports/routes/report"
import { GlobalConfigAdmin } from "../routes/dashboard/routes/global-config-admin"
import { Option } from "fp-ts/lib/Option"
import { ConfigEditor } from "../routes/dashboard/routes/global-config-admin/routes/config-editor"

declare module "./store.types" {
  interface AppModels {
    navigation: {
      state: State
      reducers: Reducers
      effects: Effects
      selectors: Selectors
    }
  }
}

export interface State {
  routes: Array<RouteMeta<any>>
}

export interface Selectors {}

export interface Reducers {}

export interface Effects {
  goToLanding<LocationState = void>(
    opts: Option<Reach.NavigateOptions<LocationState>>
  ): void

  goToDashboard<LocationState = void>(
    opts: Option<Reach.NavigateOptions<LocationState>>
  ): void
}

export interface RouteMeta<ComponentProps> {
  /** the absolute url */
  abs: string
  /** the component to render at this route */
  component: React.ComponentType<WithRouteProps<ComponentProps>>
  /** a name for UI presentation */
  displayName: string
  /** the name of an icon from `antd` */
  iconType: string
  /** the url relative to parent's abs url */
  rel: string
  shouldAppearInSideNav: boolean
  subroutes: Array<RouteMeta<any>>
}

// export interface RouteProps extends RouteMeta, Required<Reach.RouteComponentProps> {
//   children: Array<JSX.Element>
// }

export type WithRouteProps<P> = P &
  RouteMeta<P> &
  Required<Reach.RouteComponentProps> & { children: JSX.Element }

const home: RouteMeta<PropsFromComponent<typeof Landing>> = {
  abs: "/",
  component: Landing,
  displayName: "Home",
  iconType: "home",
  rel: "/",
  shouldAppearInSideNav: false,
  subroutes: [],
}

const dashboard: RouteMeta<PropsFromComponent<typeof Dashboard>> = {
  abs: "/dashboard",
  component: Dashboard,
  displayName: "Dashboard",
  iconType: "dashboard",
  rel: "dashboard",
  shouldAppearInSideNav: false,
  subroutes: [
    {
      abs: "/dashboard",
      component: Summary,
      displayName: "Summary",
      iconType: "dashboard",
      rel: "/",
      shouldAppearInSideNav: true,
      subroutes: [],
    },
    {
      abs: "/dashboard/reports",
      component: Reports,
      displayName: "Reports",
      iconType: "table",
      rel: "reports",
      shouldAppearInSideNav: true,
      subroutes: [
        {
          abs: "/dashboard/reports/visitorId",
          component: Report,
          displayName: "Visitor ID",
          iconType: "bar-chart",
          rel: "visitorId",
          shouldAppearInSideNav: true,
          subroutes: [],
        },
        {
          abs: "/dashboard/reports/test",
          component: Report,
          displayName: "Test Report",
          iconType: "bar-chart",
          rel: "test",
          shouldAppearInSideNav: true,
          subroutes: [],
        },
      ],
    },
    {
      abs: "/dashboard/global-configs",
      component: GlobalConfigAdmin,
      displayName: "Global Configs",
      iconType: "code",
      rel: "global-configs",
      shouldAppearInSideNav: true,
      subroutes: [
        {
          abs: "/dashboard/global-configs/:configId",
          component: ConfigEditor,
          displayName: "Editor",
          iconType: "code",
          rel: ":configId",
          shouldAppearInSideNav: false,
          subroutes: [],
        },
      ],
    },
  ],
}

export const navigation: Store.AppModel<State, Reducers, Effects, Selectors> = {
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
      opts.foldL(
        () => Reach.navigate(home.abs),
        (opts) => Reach.navigate(home.abs, opts)
      ),
  }),

  selectors: () => ({}),
}
