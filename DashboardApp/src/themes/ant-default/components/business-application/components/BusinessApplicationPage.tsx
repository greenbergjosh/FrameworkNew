import React, { useState } from "react"
import { useRematch } from "../../../../../hooks"
import { store } from "../../../../../state/store"
import { UserInterface } from "@opg/interface-builder"
import { BusinessApplicationProps } from "../types"
import { AdminUserInterfaceContextManagerProvider } from "../../../../../data/AdminUserInterfaceContextManager"
import { Button, PageHeader } from "antd"
import * as Reach from "@reach/router"
import { Helmet } from "react-helmet"

export const BusinessApplicationPage = ({
  applicationId,
  pageId,
  businessApplicationConfig,
  businessApplicationPageConfig,
}: BusinessApplicationProps): JSX.Element => {
  /*
   * Not sure what Patrick had in mind here,
   * but it seems likely that he meant to persist the users
   * interaction with the app.
   */
  const [fromStore, dispatch] = useRematch((appState) => ({
    configsById: store.select.globalConfig.configsById(appState),
    globalConfigPath: appState.navigation.routes.dashboard.subroutes["global-config"].abs,
    reportPath: appState.navigation.routes.dashboard.subroutes.reports.abs,
  }))
  /*
   * For now, the user interacts with state
   * but it is not persisted.
   */
  const [data, setData] = useState({})

  console.log("BusinessApplicationPage.render", {
    applicationId,
    businessApplicationConfig,
    businessApplicationPageConfig,
  })

  const { hasWhiteBackground = false, hasPadding = false } = businessApplicationPageConfig || {}
  const backgroundColor = hasWhiteBackground ? "white" : "none"
  const padding = hasPadding ? 30 : undefined

  return (
    <div>
      <Helmet>
        <title>{businessApplicationPageConfig.title} | Channel Admin | OPG</title>
      </Helmet>
      <PageHeader
        extra={
          applicationId && (
            <Button.Group size="small">
              <Button>
                <Reach.Link to={`${fromStore.globalConfigPath}/${pageId}`}>View Config</Reach.Link>
              </Button>
            </Button.Group>
          )
        }
        style={{ padding: "15px" }}
        title={businessApplicationPageConfig.title}
        subTitle={businessApplicationPageConfig.description}
      />
      <AdminUserInterfaceContextManagerProvider>
        {(userInterfaceContextManager) => (
          <div style={{ backgroundColor, padding }}>
            <UserInterface
              mode="display"
              contextManager={userInterfaceContextManager}
              components={(businessApplicationPageConfig && businessApplicationPageConfig.layout) || []}
              data={data}
              onChangeData={(newData) => setData(newData)}
            />
          </div>
        )}
      </AdminUserInterfaceContextManagerProvider>
    </div>
    // <div>
    //   <span>Global Config Page: {fromStore.globalConfigPath}</span>
    //   <pre>{JSON.stringify(businessApplicationConfig, null, 2)}</pre>
    // </div>
  )

  // return <UserInterface components={[] as ComponentDefinition[]} mode="display" />
}
