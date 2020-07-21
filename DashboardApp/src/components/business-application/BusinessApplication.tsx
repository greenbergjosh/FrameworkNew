import { tryCatch } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import JSON5 from "json5"
import React from "react"
import { useRematch } from "../../hooks"
import { NavigationGroupWithChildren, NavigationItem } from "../../state/navigation"
import { store } from "../../state/store"
import { AppSelectors } from "../../state/store.types"
import { BusinessApplicationPage } from "./components/BusinessApplicationPage"
import { DefaultBusinessApplication } from "./components/DefaultBusinessApplication"
import {
  BusinessApplicationConfig,
  BusinessApplicationId,
  BusinessApplicationPageConfig,
  BusinessApplicationPageId,
  BusinessAppNavigationItem,
} from "./types"

export interface BusinessApplicationProps {
  applicationId: BusinessApplicationId
  pageId?: BusinessApplicationPageId
  title: string
}

export const DEFAULT_BUSINESS_APPLICATION_CONFIG: BusinessApplicationConfig = {
  administered_types: [],
  application_config: [],
  description: "",
  export_config: [],
  ingest_config: [],
  owner: [],
  report: [],
  navigation: [],
}

/** Page style rendering of a business application */
export const BusinessApplication = ({ applicationId, pageId, title }: BusinessApplicationProps): JSX.Element => {
  const [fromStore, dispatch] = useRematch((s) => ({
    configsById: store.select.globalConfig.configsById(s),
    globalConfigPath: s.navigation.routes.dashboard.subroutes["global-config"].abs,
    businessApplicationPath: s.navigation.routes.dashboard.subroutes.apps.abs,
  }))

  const { businessApplicationRecord, businessApplicationConfig } = BusinessApplication.getAppConfig(
    applicationId,
    fromStore.configsById
  )

  const businessApplicationPageRecord = record.lookup((pageId || "").toLowerCase(), fromStore.configsById)
  const businessApplicationPageConfig = businessApplicationPageRecord
    .chain((appRecord) =>
      appRecord.config.chain((cfg) => {
        try {
          JSON5.parse(cfg)
        } catch (e) {
          console.error("BusinessApplication.getAppConfig", "Error parsing JSON", cfg, e)
        }
        return tryCatch(() => JSON5.parse(cfg))
      })
    )
    .getOrElse({}) as BusinessApplicationPageConfig

  console.log("BusinessApplication.render", {
    businessApplicationRecord,
    businessApplicationConfig,
    businessApplicationPageRecord,
    businessApplicationPageConfig,
  })

  return businessApplicationConfig.navigation.length === 0 || !pageId ? (
    <DefaultBusinessApplication
      applicationId={applicationId}
      businessApplicationConfig={businessApplicationConfig}
      title={title}
    />
  ) : (
    <BusinessApplicationPage
      applicationId={applicationId}
      pageId={pageId}
      businessApplicationConfig={businessApplicationConfig}
      businessApplicationPageConfig={businessApplicationPageConfig}
      title={title}
    />
  )
}

BusinessApplication.getAppConfig = (
  applicationId: string,
  configsById: ReturnType<AppSelectors["globalConfig"]["configsById"]>
) => {
  const businessApplicationRecord = record.lookup(applicationId.toLowerCase(), configsById)
  const businessApplicationConfig = {
    ...DEFAULT_BUSINESS_APPLICATION_CONFIG,
    ...(businessApplicationRecord
      .chain((appRecord) =>
        appRecord.config.chain((cfg) => {
          try {
            JSON5.parse(cfg)
          } catch (e) {
            console.error("BusinessApplication.getAppConfig", "Error parsing JSON", cfg, e)
          }
          return tryCatch(() => JSON5.parse(cfg))
        })
      )
      .getOrElse({}) as Partial<BusinessApplicationConfig>),
  }
  console.log("BusinessApplication.getAppConfig", {
    applicationId,
    businessApplicationRecord,
    businessApplicationConfig,
    configsById,
  })

  return { businessApplicationRecord, businessApplicationConfig }
}

BusinessApplication.generateNavigation = (
  applicationId: string,
  configsById: ReturnType<AppSelectors["globalConfig"]["configsById"]>
) => {
  const { businessApplicationRecord, businessApplicationConfig } = BusinessApplication.getAppConfig(
    applicationId,
    configsById
  )

  console.log("BusinessApplication.generateNavigation", {
    applicationId,
    businessApplicationConfig,
  })

  return businessApplicationConfig.navigation.length === 0
    ? null
    : {
        title: businessApplicationRecord.fold(null, ({ name }) => name),
        routes: appNavigationToRoutes(applicationId, businessApplicationConfig.navigation),
      }
}

const appNavigationToRoutes = (
  applicationId: string,
  navigation: BusinessAppNavigationItem[]
): (NavigationItem | NavigationGroupWithChildren)[] =>
  navigation.map((navItem) =>
    navItem.isLeaf
      ? ({
          active: true,
          // description: navItem.description
          // icon: navItem.icon
          name: navItem.title,
          id: navItem.key,
          type: "Navigation.Item",
          url: `${/*businessApplicationPath*/ "/dashboard/apps"}/${applicationId}/${navItem.page}`,
        } as NavigationItem)
      : ({
          active: true,
          // description: navItem.description
          // icon: navItem.icon
          name: navItem.title,
          id: navItem.key,
          type: "Navigation.Group",
          children: appNavigationToRoutes(applicationId, navItem.children),
        } as NavigationGroupWithChildren)
  )
