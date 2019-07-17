import * as Reach from "@reach/router"
import { Option } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import { Lens } from "monocle-ts"
import React from "react"
import { PersistedConfig } from "../data/GlobalConfig.Config"
import { None, Some } from "../data/Option"
import { Dashboard } from "../routes/dashboard"
import { GlobalConfigAdmin } from "../routes/dashboard/routes/global-config"
import { CreateGlobalConfig } from "../routes/dashboard/routes/global-config/routes/create"
import { EditGlobalConfig } from "../routes/dashboard/routes/global-config/routes/edit"
import { ListGlobalConfig } from "../routes/dashboard/routes/global-config/routes/list"
import { ShowGlobalConfig } from "../routes/dashboard/routes/global-config/routes/show"
import { Reports } from "../routes/dashboard/routes/reports"
import ReportView from "../routes/dashboard/routes/reports/routes/report"
import ImportIngestionReportView from "../routes/dashboard/routes/reports/routes/import-ingestion"
import { Summary } from "../routes/dashboard/routes/summary"
import { UserInterfaceTest } from "../routes/dashboard/routes/user-interface-test"
import { Landing } from "../routes/landing"
import { Profile } from "./iam"
import * as Store from "./store.types"
// import { FormEditorTest } from "../routes/dashboard/routes/form-editor-test"
import {
  BusinessApplications,
  BusinessApplicationView,
} from "../routes/dashboard/routes/business-application"

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

  navigate: typeof Reach.navigate
}

// export interface RouteMeta {
//   /** the absolute url */
//   abs: string
//   /** the component to render at this route */
//   component: React.ComponentType<WithRouteProps<any>>
//   context?: Record<string, unknown>
//   /** for possible UI display; provide more info about the route's purpose */
//   description: string
//   /** a name for UI presentation */
//   title: string
//   /** the name of an icon from `antd` */
//   iconType: string
//   /** the url relative to parent's abs url */
//   path: string
//   redirectFrom: Array<string>
//   shouldAppearInSideNav: boolean
//   subroutes: Record<string, RouteMeta>
// }

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
  shouldAppearInSideNav: boolean
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
  Required<Reach.RouteComponentProps> & { children: JSX.Element }

export type RoutesMap = typeof staticRoutesMap

function mkAuthenticatedRoute(ar: AuthenticatedRouteMeta): AuthenticatedRouteMeta {
  return ar
}

function mkUnauthenticatedRoute(ur: UnauthenticatedRouteMeta): UnauthenticatedRouteMeta {
  return ur
}

const Login = mkUnauthenticatedRoute({
  abs: "/login",
  // component: React.lazy(() => import("../routes/landing")), // Landing,
  component: Landing,
  description: "",
  title: "Home",
  iconType: "home",
  path: "login",
  redirectFrom: ["/"],
  requiresAuthentication: false as const,
  shouldAppearInSideNav: false,
  subroutes: {},
})

const DashSummary = mkAuthenticatedRoute({
  abs: "/dashboard/summary",
  // component: React.lazy(() => import("../routes/dashboard/routes/summary")), // Summary,
  component: Summary,
  description: "Customizable highlights dashboard",
  title: "Summary",
  iconType: "dashboard",
  path: "summary",
  redirectFrom: ["/dashboard"],
  requiresAuthentication: true as const,
  shouldAppearInSideNav: true,
  subroutes: {},
})

const DashReports = mkAuthenticatedRoute({
  abs: "/dashboard/reports",
  // component: React.lazy(() => import("../routes/dashboard/routes/reports")), //Reports,
  component: Reports,
  description: "Generate and export reports",
  title: "Reports",
  iconType: "table",
  path: "reports",
  redirectFrom: [],
  requiresAuthentication: true as const,
  shouldAppearInSideNav: false,
  subroutes: {},
})

const DashBusinessApplications = mkAuthenticatedRoute({
  abs: "/dashboard/apps",
  // component: React.lazy(() => import("../routes/dashboard/routes/reports")), //Reports,
  component: BusinessApplications,
  description: "Manage On Point Business Applications",
  title: "Business Applications",
  iconType: "deployment-unit",
  path: "apps",
  redirectFrom: [],
  requiresAuthentication: true as const,
  shouldAppearInSideNav: true,
  subroutes: {},
})

const GlobalConfigList = mkAuthenticatedRoute({
  abs: "/dashboard/global-config",
  // component: React.lazy(() =>
  //   import("../routes/dashboard/routes/global-config/routes/list")
  // ), // ListGlobalConfig,
  component: ListGlobalConfig,
  description: "",
  title: "Global Configs Index",
  iconType: "code",
  path: "/",
  redirectFrom: [],
  requiresAuthentication: true as const,
  shouldAppearInSideNav: false,
  subroutes: {},
})

const GlobalConfigCreate = mkAuthenticatedRoute({
  abs: "/dashboard/global-config/create",
  // component: React.lazy(() =>
  //   import("../routes/dashboard/routes/global-config/routes/create")
  // ), // CreateGlobalConfig,
  component: CreateGlobalConfig,
  description: "",
  title: "Create Global Config",
  iconType: "code",
  path: "create",
  redirectFrom: [],
  requiresAuthentication: true as const,
  shouldAppearInSideNav: false,
  subroutes: {},
})

const GlobalConfigEdit = mkAuthenticatedRoute({
  abs: "/dashboard/global-config/:configId/edit",
  // component: React.lazy(() =>
  //   import("../routes/dashboard/routes/global-config/routes/edit")
  // ), // EditGlobalConfig,
  component: EditGlobalConfig,
  description: "",
  title: "Edit Global Config",
  iconType: "code",
  path: ":configId/edit",
  redirectFrom: [],
  requiresAuthentication: true as const,
  shouldAppearInSideNav: false,
  subroutes: {},
})

const GlobalConfigShow = mkAuthenticatedRoute({
  abs: "/dashboard/global-config/:configId",
  // component: React.lazy(() =>
  //   import("../routes/dashboard/routes/global-config/routes/show")
  // ), // ShowGlobalConfig,
  component: ShowGlobalConfig,
  description: "",
  title: "Global Configs Index",
  iconType: "code",
  path: ":configId",
  redirectFrom: [],
  requiresAuthentication: true as const,
  shouldAppearInSideNav: false,
  subroutes: {},
})

// const FormEditorSandbox = mkAuthenticatedRoute({
//   abs: "/dashboard/form-editor-test",
//   // component: React.lazy(() => import("../routes/dashboard/routes/form-editor-test")), // FormEditorTest,
//   component: FormEditorTest,
//   description: "Form Editor Test",
//   title: "Form Editor Test",
//   iconType: "form",
//   path: "form-editor-test",
//   redirectFrom: [],
//   requiresAuthentication: true as const,
//   shouldAppearInSideNav: true,
//   subroutes: {},
// })

const UserInterfaceSandbox = mkAuthenticatedRoute({
  abs: "/dashboard/user-interface-test",
  component: UserInterfaceTest,
  description: "User Interface Test",
  title: "User Interface Test",
  iconType: "form",
  path: "user-interface-test",
  redirectFrom: [],
  requiresAuthentication: true as const,
  shouldAppearInSideNav: true,
  subroutes: {},
})

const staticRoutesMap = {
  login: {
    abs: "/login",
    // component: React.lazy(() => import("../routes/landing")), // Landing,
    component: Landing,
    description: "",
    title: "Home",
    iconType: "home",
    path: "login",
    redirectFrom: ["/"],
    requiresAuthentication: false as const,
    shouldAppearInSideNav: false,
    subroutes: {},
  },

  dashboard: {
    abs: "/dashboard",
    // component: React.lazy(() => import("../routes/dashboard")), // Dashboard,
    component: Dashboard,
    description: "",
    title: "Dashboard",
    iconType: "dashboard",
    path: "dashboard",
    redirectFrom: [],
    requiresAuthentication: true as const,
    shouldAppearInSideNav: false,
    subroutes: {
      summary: {
        abs: "/dashboard/summary",
        // component: React.lazy(() => import("../routes/dashboard/routes/summary")), // Summary,
        component: Summary,
        description: "Customizable highlights dashboard",
        title: "Summary",
        iconType: "dashboard",
        path: "summary",
        redirectFrom: ["/dashboard"],
        requiresAuthentication: true as const,
        shouldAppearInSideNav: true,
        subroutes: {},
      },
      reports: {
        abs: "/dashboard/reports",
        // component: React.lazy(() => import("../routes/dashboard/routes/reports")), //Reports,
        component: Reports,
        description: "Generate and export reports",
        title: "Reports",
        iconType: "table",
        path: "reports",
        redirectFrom: [],
        requiresAuthentication: true as const,
        shouldAppearInSideNav: false,
        subroutes: {
          reports: {
            abs: "/dashboard/reports/:reportId",
            component: ReportView,
            description: "Application Report",
            title: "Reports",
            iconType: "bar-chart",
            path: ":reportId",
            redirectFrom: [],
            requiresAuthentication: true as const,
            shouldAppearInSideNav: false,
            subroutes: {},
          },
          "import-ingestion": {
            abs: "/dashboard/reports/import-ingestion",
            component: ImportIngestionReportView,
            description: "Import Ingestion Live Report",
            title: "Import Ingestion",
            iconType: "bar-chart",
            path: "import-ingestion",
            redirectFrom: [],
            requiresAuthentication: true as const,
            shouldAppearInSideNav: false,
            subroutes: {},
          },
        },
      },
      apps: {
        abs: "/dashboard/apps",
        // component: React.lazy(() => import("../routes/dashboard/routes/reports")), //Reports,
        component: BusinessApplications,
        description: "Manage On Point Business Applications",
        title: "Business Applications",
        iconType: "deployment-unit",
        path: "apps",
        redirectFrom: [],
        requiresAuthentication: true as const,
        shouldAppearInSideNav: true,
        subroutes: {},
      },
      "global-config": {
        abs: "/dashboard/global-config",
        // component: React.lazy(() => import("../routes/dashboard/routes/global-config")), //GlobalConfigAdmin,
        component: GlobalConfigAdmin,
        description: "Manage GlobalConfig.Config entries",
        title: "Global Config",
        iconType: "code",
        path: "global-config",
        redirectFrom: [],
        requiresAuthentication: true as const,
        shouldAppearInSideNav: true,
        subroutes: {
          "/": {
            abs: "/dashboard/global-config",
            // component: React.lazy(() =>
            //   import("../routes/dashboard/routes/global-config/routes/list")
            // ), // ListGlobalConfig,
            component: ListGlobalConfig,
            description: "",
            title: "Global Configs Index",
            iconType: "code",
            path: "/",
            redirectFrom: [],
            requiresAuthentication: true as const,
            shouldAppearInSideNav: false,
            subroutes: {},
          },
          create: {
            abs: "/dashboard/global-config/create",
            // component: React.lazy(() =>
            //   import("../routes/dashboard/routes/global-config/routes/create")
            // ), // CreateGlobalConfig,
            component: CreateGlobalConfig,
            description: "",
            title: "Create Global Config",
            iconType: "code",
            path: "create",
            redirectFrom: [],
            requiresAuthentication: true as const,
            shouldAppearInSideNav: false,
            subroutes: {},
          },
          ":configId/edit": {
            abs: "/dashboard/global-config/:configId/edit",
            // component: React.lazy(() =>
            //   import("../routes/dashboard/routes/global-config/routes/edit")
            // ), // EditGlobalConfig,
            component: EditGlobalConfig,
            description: "",
            title: "Edit Global Config",
            iconType: "code",
            path: ":configId/edit",
            redirectFrom: [],
            requiresAuthentication: true as const,
            shouldAppearInSideNav: false,
            subroutes: {},
          },
          ":configId": {
            abs: "/dashboard/global-config/:configId",
            // component: React.lazy(() =>
            //   import("../routes/dashboard/routes/global-config/routes/show")
            // ), // ShowGlobalConfig,
            component: ShowGlobalConfig,
            description: "",
            title: "Global Configs Index",
            iconType: "code",
            path: ":configId",
            redirectFrom: [],
            requiresAuthentication: true as const,
            shouldAppearInSideNav: false,
            subroutes: {},
          },
        },
      },
      // "form-editor-test": {
      //   abs: "/dashboard/form-editor-test",
      //   // component: React.lazy(() => import("../routes/dashboard/routes/form-editor-test")), // FormEditorTest,
      //   component: FormEditorTest,
      //   description: "Form Editor Test",
      //   title: "Form Editor Test",
      //   iconType: "form",
      //   path: "form-editor-test",
      //   redirectFrom: [],
      //   requiresAuthentication: true as const,
      //   shouldAppearInSideNav: false,
      //   subroutes: {},
      // },
      "user-interface-test": {
        abs: "/dashboard/user-interface-test",
        component: UserInterfaceTest,
        description: "User Interface Test",
        title: "User Interface Test",
        iconType: "form",
        path: "user-interface-test",
        redirectFrom: [],
        requiresAuthentication: true as const,
        shouldAppearInSideNav: false,
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

    navigate(path, rootState, navOptions) {
      return Reach.navigate(path, navOptions)
    },
  }),

  selectors: (slice, createSelector) => ({
    routes(select) {
      return createSelector(
        (state) => select.globalConfig.configsByType(state),
        (configsByType) => {
          return record
            .lookup("BusinessApplication", configsByType)
            .map((records) =>
              records.map((businessApplication) => ({
                [businessApplication.id]: {
                  abs: `/dashboard/apps/${businessApplication.id}`,
                  component: BusinessApplicationView,
                  description: "",
                  title: businessApplication.name as string,
                  iconType: "appstore",
                  path: businessApplication.id as string,
                  context: { id: businessApplication.id as string },
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
              appsSubroutes.set({
                ...appsSubroutes.get(staticRoutesMap),
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
const appsSubroutes = Lens.fromPath<RoutesMap>()(["dashboard", "subroutes", "apps", "subroutes"])
