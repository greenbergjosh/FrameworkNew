export const appRoutes = {
  globalConfig: {
    abs: "/app/admin/global-config",
    component: null,
    description: "Manage GlobalConfig.Config entries",
    title: "Global Config",
    iconType: "code",
    path: "global-config",
    redirectFrom: [],
    requiresAuthentication: true as const,
    subroutes: {
      "/": {
        abs: "/app/admin/global-config",
        component: null,
        description: "",
        title: "Global Configs Index",
        iconType: "code",
        path: "/",
        redirectFrom: [],
        requiresAuthentication: true as const,
        subroutes: {},
      },
      create: {
        abs: "/app/admin/global-config/create",
        component: null,
        description: "",
        title: "Create Global Config",
        iconType: "code",
        path: "create",
        redirectFrom: [],
        requiresAuthentication: true as const,
        subroutes: {},
      },
      ":configId/edit": {
        abs: "/app/admin/global-config/:configId/edit",
        component: null,
        description: "",
        title: "Edit Global Config",
        iconType: "code",
        path: ":configId/edit",
        redirectFrom: [],
        requiresAuthentication: true as const,
        subroutes: {},
      },
      ":configId": {
        abs: "/app/admin/global-config/:configId",
        component: null,
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
}