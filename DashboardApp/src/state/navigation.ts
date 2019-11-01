import * as Reach from "@reach/router"
import { Option, some, tryCatch } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import * as iots from "io-ts"
import { reporter } from "io-ts-reporters"
import * as iotst from "io-ts-types"
import { NonEmptyString } from "io-ts-types/lib/NonEmptyString"
import JSON5 from "json5"
import { groupBy, sortBy } from "lodash/fp"
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
import ImportIngestionReportView from "../routes/dashboard/routes/reports/routes/import-ingestion"
import ReportView from "../routes/dashboard/routes/reports/routes/report"
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

export type NavigationGroupAutomaticChildType = iots.TypeOf<
  typeof NavigationGroupAutomaticChildTypeCodec
>
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
  automaticChildTypes: iots.union([
    iots.undefined,
    iots.array(NavigationGroupAutomaticChildTypeCodec),
  ]),
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
  primaryNavigation(app: Store.AppState): (NavigationItem | NavigationGroupWithChildren)[]
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
            subroutes: {},
          },
        },
      },
      apps: {
        abs: "/dashboard/apps",
        component: BusinessApplications,
        description: "Manage On Point Business Applications",
        title: "Business Applications",
        iconType: "deployment-unit",
        path: "apps",
        redirectFrom: [],
        requiresAuthentication: true as const,
        subroutes: {
          ":id": {
            abs: `/dashboard/apps/:id`,
            component: BusinessApplicationView,
            description: "",
            title: "Business App",
            iconType: "appstore",
            path: `:id`,
            redirectFrom: [],
            requiresAuthentication: true as const,
            subroutes: {
              ":pageId": {
                abs: `/dashboard/apps/:id/:pageId`,
                component: BusinessApplicationView,
                description: "",
                title: "Business App Page",
                iconType: "appstore",
                path: `:pageId`,
                redirectFrom: [],
                requiresAuthentication: true as const,
                subroutes: {},
              },
            },
          },
        },
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
      // FIXME Remove the casting and correct the types
      return Reach.navigate(String(path), navOptions as Reach.NavigateOptions<{}>)
    },
  }),

  selectors: (slice, createSelector) => ({
    // navigationGroups
    primaryNavigation(select) {
      return createSelector(
        (state) => select.globalConfig.configsByType(state),
        (state) => select.globalConfig.configsById(state),
        (configsByType, configsById) => {
          const groupedItems = groupBy(
            "group",
            findAndMergeValidConfigs("Navigation.Item", configsByType, NavigationItemCodec)
          )
          const groupedGroups = groupBy(
            "group",
            findAndMergeValidConfigs("Navigation.Group", configsByType, NavigationGroupCodec)
          )

          const topLevelNavigation = sortBy(
            ["ordinal", "name"],
            [...(groupedItems["undefined"] || []), ...(groupedGroups["undefined"] || [])]
          )

          const automaticChildTypeToNavigationItem = (
            automaticChildType: NavigationGroupAutomaticChildType
          ): NavigationItem[] => {
            const childTypeRecords = record.lookup(automaticChildType.type, configsByType).foldL(
              () =>
                record
                  .lookup(automaticChildType.type, configsById)
                  .chain((entityTypeConfig) => record.lookup(entityTypeConfig.name, configsByType))
                  .getOrElse([]),
              (result) => result
            )

            console.log(
              "navigation.automaticChildTypeToNavigationItem",
              automaticChildType,
              childTypeRecords
            )

            return childTypeRecords.map((record) => ({
              active: true,
              description: "",
              group: undefined,
              icon: automaticChildType.icon,
              id: record.id,
              name: record.name,
              ordinal: automaticChildType.ordinal,
              type: "Navigation.Item",
              url: automaticChildType.path
                ? automaticChildType.path.includes("{id}")
                  ? automaticChildType.path.replace("{id}", record.id)
                  : automaticChildType.path.endsWith("/")
                  ? `${automaticChildType.path}${record.id}`
                  : `${automaticChildType.path}/${record.id}`
                : record.id,
            }))
          }

          const resolveNavigationGroupChildren = (
            navigationGroup: NavigationGroup
          ): NavigationGroupWithChildren => {
            return {
              ...navigationGroup,
              children: sortBy(
                ["ordinal", "name"],
                [
                  ...(groupedItems[navigationGroup.id] || []),
                  ...(groupedGroups[navigationGroup.id] || []).map(resolveNavigationGroupChildren),
                  ...(navigationGroup.automaticChildTypes || []).flatMap(
                    automaticChildTypeToNavigationItem
                  ),
                ]
              ),
            }
          }

          const returnMap = topLevelNavigation.map((navEntry) =>
            navEntry.type === "Navigation.Item"
              ? navEntry
              : resolveNavigationGroupChildren(navEntry)
          )

          return returnMap
        }
      )
    },
    routes(select) {
      return createSelector(
        (state) => select.globalConfig.configsByType(state),
        (configsByType) => {
          return staticRoutesMap
          // return record
          //   .lookup("BusinessApplication", configsByType)
          //   .map((records) =>
          //     records.map((businessApplication) => ({
          //       [businessApplication.id]: {
          //         abs: `/dashboard/apps/${businessApplication.id}`,
          //         component: BusinessApplicationView,
          //         description: "",
          //         title: businessApplication.name as string,
          //         iconType: "appstore",
          //         path: `${businessApplication.id}/:pageId`,
          //         context: { id: businessApplication.id as string },
          //         redirectFrom: [],
          //         subroutes: {},
          //       },
          //     }))
          //   )
          //   .map((routes) =>
          //     routes.reduce(
          //       (acc, route) => ({
          //         ...acc,
          //         ...route,
          //       }),
          //       {}
          //     )
          //   )
          //   .map((routesDict) =>
          //     appsSubroutes.set({
          //       ...appsSubroutes.get(staticRoutesMap),
          //       ...routesDict,
          //     })(staticRoutesMap)
          //   )
          //   .getOrElse(staticRoutesMap)
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

const findAndMergeValidConfigs = <T>(
  type: string,
  configsByType: ReturnType<Store.AppSelectors["globalConfig"]["configsByType"]>,
  Codec: iots.Type<T, any, unknown>
) =>
  record
    .lookup(type, configsByType)
    .fold([], (foundRecords) =>
      foundRecords.map((foundRecord) => {
        const decodedRecord = Codec.decode({
          ...foundRecord,
          ...tryCatch(() => JSON5.parse(foundRecord.config.getOrElse("{}"))).getOrElse({}),
        })
        return decodedRecord.fold(
          () => {
            console.warn(
              "navigation.findAndMergeValidConfigs",
              `Failed to parse ${type}`,
              foundRecord,
              reporter(decodedRecord)
            )
            return null
          },
          (dr) => dr
        )
      })
    )
    .reduce(
      (acc, navEntry) => {
        if (navEntry) {
          //@ts-ignore
          delete navEntry.config
          acc.push(navEntry)
        }
        return acc
      },
      [] as T[]
    )
