import { tryCatch } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import JSON5 from "json5"
import React from "react"
import { useRematch } from "../../hooks"
import { globalConfig } from "../../state/global-config"
import { store } from "../../state/store"
import { ComponentDefinition, UserInterface } from "@opg/interface-builder"
import {
  BusinessApplicationConfig,
  BusinessApplicationId,
  BusinessApplicationPageId,
  BusinessApplicationPageConfig,
} from "./business-application.types"
import { AdminUserInterfaceContextManagerProvider } from "../../data/AdminUserInterfaceContextManager"

export interface BusinessApplicationProps {
  applicationId: BusinessApplicationId
  pageId?: BusinessApplicationPageId
  businessApplicationConfig: BusinessApplicationConfig
  businessApplicationPageConfig?: BusinessApplicationPageConfig
  title: string
}

/** Rendering of a business application page */
export const BusinessApplicationPage = ({
  applicationId,
  pageId,
  businessApplicationConfig,
  businessApplicationPageConfig,
  title,
}: BusinessApplicationProps): JSX.Element => {
  const [fromStore, dispatch] = useRematch((s) => ({
    configsById: store.select.globalConfig.configsById(s),
    globalConfigPath: s.navigation.routes.dashboard.subroutes["global-config"].abs,
    reportPath: s.navigation.routes.dashboard.subroutes["reports"].abs,
  }))

  console.log("BusinessApplication.render", {
    applicationId,
    businessApplicationConfig,
    businessApplicationPageConfig,
  })

  return (
    <AdminUserInterfaceContextManagerProvider>
      {(userInterfaceContextManager) => (
        <UserInterface
          mode="display"
          components={(businessApplicationPageConfig && businessApplicationPageConfig.layout) || []}
          data={[]}
        />
      )}
    </AdminUserInterfaceContextManagerProvider>
    // <div>
    //   <span>Global Config Page: {fromStore.globalConfigPath}</span>
    //   <pre>{JSON.stringify(businessApplicationConfig, null, 2)}</pre>
    // </div>
  )

  // return <UserInterface components={[] as ComponentDefinition[]} mode="display" />
}
