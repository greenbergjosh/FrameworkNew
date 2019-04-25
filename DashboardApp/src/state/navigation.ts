import * as Reach from "@reach/router"
import { Option } from "fp-ts/lib/Option"
import { PersistedConfig } from "../data/GlobalConfig.Config"
import { None, Some } from "../data/Option"
import { Dashboard } from "../routes/dashboard"
import { GlobalConfigAdmin } from "../routes/dashboard/routes/global-config"
import { CreateGlobalConfig } from "../routes/dashboard/routes/global-config/routes/create"
import { EditGlobalConfig } from "../routes/dashboard/routes/global-config/routes/edit"
import { ListGlobalConfig } from "../routes/dashboard/routes/global-config/routes/list"
import { ShowGlobalConfig } from "../routes/dashboard/routes/global-config/routes/show"
import { FormEditorTest } from "../routes/dashboard/routes/form-editor-test"
import { Reports } from "../routes/dashboard/routes/reports"
import { Report } from "../routes/dashboard/routes/reports/routes/report"
import { Summary } from "../routes/dashboard/routes/summary"
import { Landing } from "../routes/landing"
import * as record from "fp-ts/lib/Record"
import { Lens } from "monocle-ts"

import * as Store from "./store.types"

declare module "./store.types" {
  interface AppModels {
    navigation: {
      state: State<RoutesMap>
      reducers: Reducers
      effects: Effects
      selectors: Selectors
    }
  }
}

export interface State<RouteMap extends object> {
  routes: { [K in keyof RouteMap]: RouteMap[K] }
}

export interface Selectors {
  routes(app: Store.AppState): RoutesMap
}

export interface Reducers {}

export interface Effects {
  goToDashboard<LocationState = void>(opts: Option<Reach.NavigateOptions<LocationState>>): void

  showGlobalConfigById(params: {
    id: PersistedConfig["id"]
    navOpts?: Reach.NavigateOptions<object>
  }): void

  goToGlobalConfigs<LocationState = void>(opts: Option<Reach.NavigateOptions<LocationState>>): void

  goToLanding<LocationState = void>(opts: Option<Reach.NavigateOptions<LocationState>>): void
}

export interface RouteMeta {
  /** the absolute url */
  abs: string
  /** the component to render at this route */
  component: React.ComponentType<WithRouteProps<any>>
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
  shouldAppearInSideNav: boolean
  subroutes: Record<string, RouteMeta>
}

export type WithRouteProps<P> = P &
  RouteMeta &
  Required<Reach.RouteComponentProps> & { children: JSX.Element }

export type RoutesMap = typeof staticRoutesMap

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
        subroutes: {},
      },
      "global-config": {
        abs: "/dashboard/global-config",
        component: GlobalConfigAdmin,
        description: "Manage GlobalConfig.Config entries",
        title: "Global Config",
        iconType: "code",
        path: "global-config",
        redirectFrom: [],
        shouldAppearInSideNav: true,
        subroutes: {
          "/": {
            abs: "/dashboard/global-config",
            component: ListGlobalConfig,
            description: "",
            title: "Global Configs Index",
            iconType: "code",
            path: "/",
            redirectFrom: [],
            shouldAppearInSideNav: false,
            subroutes: {},
          },
          create: {
            abs: "/dashboard/global-config/create",
            component: CreateGlobalConfig,
            description: "",
            title: "Create Global Config",
            iconType: "code",
            path: "create",
            redirectFrom: [],
            shouldAppearInSideNav: false,
            subroutes: {},
          },
          ":configId/edit": {
            abs: "/dashboard/global-config/:configId/edit",
            component: EditGlobalConfig,
            description: "",
            title: "Edit Global Config",
            iconType: "code",
            path: ":configId/edit",
            redirectFrom: [],
            shouldAppearInSideNav: false,
            subroutes: {},
          },
          ":configId": {
            abs: "/dashboard/global-config/:configId",
            component: ShowGlobalConfig,
            description: "",
            title: "Global Configs Index",
            iconType: "code",
            path: ":configId",
            redirectFrom: [],
            shouldAppearInSideNav: false,
            subroutes: {},
          },
        },
      },
      "form-editor-test": {
        abs: "/dashboard/form-editor-test",
        component: FormEditorTest,
        description: "Form Editor Test",
        title: "Form Editor Test",
        iconType: "form",
        path: "form-editor-test",
        redirectFrom: [],
        shouldAppearInSideNav: true,
        subroutes: {},
      },
    },
  },
}

export const navigation: Store.AppModel<State<RoutesMap>, Reducers, Effects, Selectors> = {
  state: {
    routes: staticRoutesMap,
  },

  reducers: {},

  effects: () => ({
    goToDashboard: (opts, { navigation: { routes } }) =>
      opts.foldL(
        None(() => Reach.navigate(routes.dashboard.abs)),
        Some((opts) => Reach.navigate(routes.dashboard.abs, opts))
      ),

    showGlobalConfigById: ({ id, navOpts }, { navigation: { routes } }) => {
      Reach.navigate(`${routes.dashboard.subroutes["global-config"].abs}/${id}`, navOpts)
    },

    goToGlobalConfigs: (opts, { navigation: { routes } }) =>
      opts.foldL(
        None(() => Reach.navigate(routes.dashboard.subroutes["global-config"].abs)),
        Some((opts) => Reach.navigate(routes.dashboard.subroutes["global-config"].abs, opts))
      ),

    goToLanding: (opts, { navigation: { routes } }) =>
      opts.foldL(
        None(() => Reach.navigate(routes.login.abs)),
        Some((opts) => Reach.navigate(routes.login.abs, opts))
      ),
  }),

  selectors: (slice, createSelector) => ({
    routes(select) {
      return createSelector(
        (state) => select.globalConfig.configsByType(state),
        (configsByType) => {
          return record
            .lookup("Report", configsByType)
            .map((records) =>
              records.map((report) => ({
                [report.id]: {
                  abs: `/dashboard/reports/${report.id}`,
                  component: Report,
                  description: "",
                  title: report.name as string,
                  iconType: "bar-chart",
                  path: report.id as string,
                  context: { id: report.id as string },
                  redirectFrom: [],
                  shouldAppearInSideNav: true,
                  subroutes: {},
                },
              }))
            )
            .map((routes) =>
              routes.reduce(
                (acc, route) => ({
                  ...acc,
                  ...route,
                }),
                {}
              )
            )
            .map((routesDict) =>
              reportsSubroutes.set({
                ...reportsSubroutes.get(staticRoutesMap),
                ...routesDict,
              })(staticRoutesMap)
            )
            .getOrElse(staticRoutesMap)
        }
      )
    },
  }),
}

//
// ─── LENSES ─────────────────────────────────────────────────────────────────────
//

const reportsSubroutes = Lens.fromPath<RoutesMap>()([
  "dashboard",
  "subroutes",
  "reports",
  "subroutes",
])
