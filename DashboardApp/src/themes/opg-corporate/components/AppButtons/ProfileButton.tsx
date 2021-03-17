import React from "react"
import { ProfileMenu } from "./ProfileMenu"
import { useRematch } from "../../../../hooks"
import { ClickParam } from "antd/lib/menu"

export function ProfileButton(): JSX.Element {
  const [fromStore, dispatch] = useRematch((appState) => ({
    profile: appState.iam.profile,
  }))

  const handleClick = (evt: ClickParam): void => {
    if (evt.key === "logout") {
      dispatch.iam.logout()
    } else if (evt.key === "refreshGlobalConfigs") {
      dispatch.globalConfig.loadRemoteConfigs()
    }
  }

  return (
    <>
      {fromStore.profile
        .map((profile) => <ProfileMenu key={profile.Email} onClick={handleClick} profile={profile} />)
        .getOrElse(<></>)}
    </>
  )
}
