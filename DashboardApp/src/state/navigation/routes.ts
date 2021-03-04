import { Landing } from "../../views/login"
import { Dashboard } from "../../themes/ant-default"
import { Summary } from "../../themes/ant-default/views/summary"
import { SummaryView } from "../../themes/ant-default/views/summary/routes/SummaryView"
import { Reports } from "../../themes/ant-default/views/reports"
import ReportView from "../../themes/ant-default/views/reports/routes/report"
import ImportIngestionReportView from "../../themes/ant-default/views/reports/routes/import-ingestion"
import { BusinessApplications, BusinessApplicationView } from "../../themes/ant-default/views/business-application"
import { GlobalConfigAdmin } from "../../themes/ant-default/views/global-config"
import { ListGlobalConfig } from "../../themes/ant-default/views/global-config/routes/list"
import { CreateGlobalConfig } from "../../themes/ant-default/views/global-config/routes/create"
import { EditGlobalConfig } from "../../themes/ant-default/views/global-config/routes/edit"
import { ShowGlobalConfig } from "../../themes/ant-default/views/global-config/routes/show"
import { ThemeLoader } from "../../themes/ThemeLoader"

export const routes = {
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
        subroutes: {
          "/": {
            abs: "/dashboard/summary",
            component: SummaryView,
            description: "",
            title: "Summary",
            iconType: "dashboard",
            path: "/",
            redirectFrom: [],
            requiresAuthentication: true as const,
            subroutes: {},
          },
        },
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
    },
  },

  rootPath: {
    abs: `/app`,
    component: ThemeLoader,
    description: "",
    title: "App",
    iconType: "appstore",
    path: `/app`,
    redirectFrom: [],
    requiresAuthentication: true as const,
    subroutes: {},
  },

  appHome: {
    abs: `/app`,
    component: ThemeLoader,
    description: "",
    title: "App",
    iconType: "appstore",
    path: `/app/:appUri/*pagePath`,
    redirectFrom: [],
    requiresAuthentication: true as const,
    subroutes: {},
  },
}
