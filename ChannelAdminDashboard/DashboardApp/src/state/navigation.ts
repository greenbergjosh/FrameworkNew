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
      state: State<typeof staticRoutesMap>
      reducers: Reducers
      effects: Effects
      selectors: Selectors
    }
  }
}

export interface State<RouteMap extends object> {
  routes: { [K in keyof RouteMap]: RouteMap[K] }
}

export interface Selectors {}

export interface Reducers {}

export interface Effects {
  goToLanding<LocationState = void>(opts: Option<Reach.NavigateOptions<LocationState>>): void

  goToDashboard<LocationState = void>(opts: Option<Reach.NavigateOptions<LocationState>>): void
}

export interface RouteMeta {
  /** the absolute url */
  abs: string
  /** the component to render at this route */
  component: React.ComponentType<WithRouteProps<any>>
  /** for possible UI display; provide more info about the route's purpose */
  description: string
  /** a name for UI presentation */
  title: string
  /** the name of an icon from `antd` */
  iconType: string
  /** the url relative to parent's abs url */
  path: string
  redirectFrom: Array<string>
  shouldAppearInSideNav: boolean
  subroutes: Record<string, RouteMeta>
}

export type WithRouteProps<P> = P &
  RouteMeta &
  Required<Reach.RouteComponentProps> & { children: JSX.Element }

const staticRoutesMap = {
  login: {
    abs: "/login",
    component: Landing,
    description: "",
    title: "Home",
    iconType: "home",
    path: "login",
    redirectFrom: ["/"],
    shouldAppearInSideNav: false,
    subroutes: {},
  },

  dashboard: {
    abs: "/dashboard",
    component: Dashboard,
    description: "",
    title: "Dashboard",
    iconType: "dashboard",
    path: "dashboard",
    redirectFrom: [],
    shouldAppearInSideNav: false,
    subroutes: {
      summary: {
        abs: "/dashboard/summary",
        component: Summary,
        description: "Customizable highlights dashboard",
        title: "Summary",
        iconType: "dashboard",
        path: "summary",
        redirectFrom: ["/dashboard"],
        shouldAppearInSideNav: true,
        subroutes: {},
      },
      reports: {
        abs: "/dashboard/reports",
        component: Reports,
        description: "Create, read, update, delete reports",
        title: "Reports",
        iconType: "table",
        path: "reports",
        redirectFrom: [],
        shouldAppearInSideNav: true,
        subroutes: {
          ":reportId": {
            abs: "/dashboard/reports/:reportId",
            component: Report,
            description: "",
            title: "Visitor ID",
            iconType: "bar-chart",
            path: ":reportId",
            redirectFrom: [],
            shouldAppearInSideNav: true,
            subroutes: {},
          },
        },
      },
      "global-configs": {
        abs: "/dashboard/global-configs",
        component: GlobalConfigAdmin,
        description: "Manage GlobalConfig.Config entries",
        title: "Global Configs",
        iconType: "code",
        path: "global-configs",
        redirectFrom: [],
        shouldAppearInSideNav: true,
        subroutes: {
          ":configId": {
            abs: "/dashboard/global-configs/:configId",
            component: ConfigEditor,
            description: "",
            title: "Editor",
            iconType: "code",
            path: ":configId",
            redirectFrom: [],
            shouldAppearInSideNav: false,
            subroutes: {},
          },
        },
      },
    },
  },
}

export const navigation: Store.AppModel<
  State<typeof staticRoutesMap>,
  Reducers,
  Effects,
  Selectors
> = {
  state: {
    routes: staticRoutesMap,
  },

  reducers: {},

  effects: () => ({
    goToDashboard: (opts, { navigation: { routes } }) =>
      opts.foldL(
        () => Reach.navigate(routes.dashboard.abs),
        (opts) => Reach.navigate(routes.dashboard.abs, opts)
      ),

    goToLanding: (opts, { navigation: { routes } }) =>
      opts.foldL(
        () => Reach.navigate(routes.login.abs),
        (opts) => Reach.navigate(routes.login.abs, opts)
      ),
  }),

  selectors: () => ({}),
}
