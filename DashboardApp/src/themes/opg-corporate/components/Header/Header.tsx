import { AppState } from "../../../../state/store.types"
import { Effects as IamEffects } from "../../../../state/iam/iam"
import { Effects as GlobalConfigEffects } from "../../../../state/global-config/global-config"
import { Layout, Typography } from "antd"
import styles from "../../theme.module.scss"
import React from "react"
import { ClickParam } from "antd/lib/menu"
import { AppsMenu } from "./AppsMenu"
import { ProfileMenu } from "./ProfileMenu"
import { AppConfig } from "../../../../state/apps"
import { AppViewButtons } from "./AppViewButtons"
import { useRematch } from "../../../../hooks"

interface HeaderProps {
  appConfig: AppConfig
  appRootPath: string
  loadRemoteConfigs: GlobalConfigEffects["loadRemoteConfigs"] //dispatch.globalConfig.loadRemoteConfigs
  logout: IamEffects["logout"] // dispatch.iam.logout
}

export function Header({ appConfig, appRootPath, loadRemoteConfigs, logout }: HeaderProps): JSX.Element {
  const [fromStore, dispatch] = useRematch((appState) => ({
    profile: appState.iam.profile,
  }))

  const handleClick = (evt: ClickParam): void => {
    if (evt.key === "logout") {
      logout()
    } else if (evt.key === "refreshGlobalConfigs") {
      loadRemoteConfigs()
    }
  }

  return (
    <>
      <Layout.Header className={styles.header}>
        <Typography.Text type="secondary" className={styles.appDescription} ellipsis={true}>
          {appConfig.description}
        </Typography.Text>

        <div className={styles.headerRightPanel}>
          <AppViewButtons
            appRootPath={appRootPath}
            appTitle={appConfig.title}
            appUri={appConfig.uri}
            views={appConfig.views}
          />

          <AppsMenu />

          <img
            alt="OnPoint Global"
            src={require("../../../../images/on_point_tm_logo.svg")}
            height={32}
            style={{ marginRight: 24, marginLeft: 24 }}
          />

          {fromStore.profile
            .map((profile) => <ProfileMenu key={profile.Email} onClick={handleClick} profile={profile} />)
            .getOrElse(<></>)}
        </div>
      </Layout.Header>
    </>
  )
}
