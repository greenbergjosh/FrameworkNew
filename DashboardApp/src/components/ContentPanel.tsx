import React from "react"
import { useRematch } from "../hooks"
import { store } from "../state/store"
import { Helmet } from "react-helmet"
import { Button, Icon, PageHeader, Tooltip } from "antd"
import { Link, Router } from "@reach/router"
import { AdminUserInterfaceContextManagerProvider } from "../contexts/AdminUserInterfaceContextManager"
import { ComponentDefinition, UserInterface } from "@opg/interface-builder"
import BreadcrumbNav from "./BreadcrumbNav"
import { ContentPanelProps } from "../themes/types"
import { AppPageConfig, AppPaths } from "../state/apps"
import { PageBeacon } from "./PageBeacon"

function RouteRenderer(
  props: {
    path: string
    components: ComponentDefinition[]
    appPageConfig: AppPageConfig
    appPaths: AppPaths
  } & ContentPanelProps
) {
  return (
    <AdminUserInterfaceContextManagerProvider>
      {(userInterfaceContextManager) => (
        <>
          <UserInterface
            {...props}
            contextManager={userInterfaceContextManager}
            keyPrefix={`${props.appPaths.appRootPath}/${props.appPaths.pagePathSegments.join("/")}/`}
            mode="display"
          />
          <PageBeacon
            data={{
              reportId: null,
              appName: props.appConfig.title,
              pageTitle: props.appPageConfig.title,
            }}
            pageReady={props.appConfig.title !== "..."}
          />
        </>
      )}
    </AdminUserInterfaceContextManagerProvider>
  )
}

export const ContentPanel = (props: ContentPanelProps): JSX.Element => {
  const [fromStore /*, dispatch*/] = useRematch((appState) => ({
    globalConfigPath: appState.navigation.routes.globalConfig.abs,
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
            {appPageConfig.id ? (
              <Tooltip
                title={
                  <Link to={`${globalConfigPath}/${appPageConfig.id}`}>
                    <Button type="link" icon="edit" size="small">
                      Edit Page
                    </Button>
                  </Link>
                }>
                {appPageConfig.title}
              </Tooltip>
            ) : (
              <>{appPageConfig.title}</>
            )}
          </>
        }
        subTitle={appPageConfig.description}
      />
      <Router>
        <RouteRenderer
          components={(appPageConfig && appPageConfig.layout) || []}
          data={props.data}
          getRootUserInterfaceData={props.getRootUserInterfaceData}
          onChangeRootData={props.onChangeRootData}
          onChangeData={props.onChangeData}
          appPageConfig={appPageConfig}
          appPaths={appPaths}
          path={"*"}
          appConfig={props.appConfig}
        />
      </Router>
    </div>
  )
}
