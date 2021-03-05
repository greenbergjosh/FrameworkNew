import React, { useState } from "react"
import { useRematch } from "../hooks"
import { store } from "../state/store"
import { Helmet } from "react-helmet"
import { Button, PageHeader, Tooltip, Icon } from "antd"
import * as Reach from "@reach/router"
import { AdminUserInterfaceContextManagerProvider } from "../data/AdminUserInterfaceContextManager"
import { UserInterface } from "@opg/interface-builder"
import BreadcrumbNav from "./BreadcrumbNav"
import { ContentPanelProps } from "../themes/types"

export const ContentPanel = (props: ContentPanelProps): JSX.Element => {
  /*
   * For now, the user interacts with state, but it is not persisted.
   */
  const [data, setData] = useState({})

  const [fromStore, dispatch] = useRematch((appState) => ({
    configsById: store.select.globalConfig.configsById(appState),
    configsByType: store.select.globalConfig.configsByType(appState),
    globalConfigPath: appState.navigation.routes.dashboard.subroutes["global-config"].abs,
    appPageConfig: store.select.apps.appPageConfig(appState),
    appPaths: appState.apps.appPaths,
  }))

  const { appPageConfig, appPaths, globalConfigPath } = fromStore

  return (
    <div style={{ padding: "8px 30px 30px 30px" }}>
      <Helmet>
        <title>{appPageConfig.title} | Channel Admin | OPG</title>
      </Helmet>
      <BreadcrumbNav
        appConfig={props.appConfig}
        currentUri={appPageConfig.uri}
        appRootPath={appPaths.appRootPath}
        pagePath={props.pagePath}
      />
      <PageHeader
        style={{ padding: "16px 0 20px 0" }}
        title={
          <>
            {appPageConfig.icon && <Icon type={appPageConfig.icon} style={{ marginRight: 10 }} />}
            {appPageConfig.title}
            {appPageConfig.id && (
              <Tooltip title="Edit Page">
                <Reach.Link to={`${globalConfigPath}/${appPageConfig.id}`}>
                  <Button type="link" icon="edit" size="small" />
                </Reach.Link>
              </Tooltip>
            )}
          </>
        }
        subTitle={appPageConfig.description}
      />
      <AdminUserInterfaceContextManagerProvider>
        {(userInterfaceContextManager) => (
          <UserInterface
            mode="display"
            contextManager={userInterfaceContextManager}
            components={(appPageConfig && appPageConfig.layout) || []}
            data={data}
            onChangeData={(newData) => setData(newData)}
          />
        )}
      </AdminUserInterfaceContextManagerProvider>
    </div>
  )
}
