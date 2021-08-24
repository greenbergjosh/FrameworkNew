import React from "react"
import { ComponentDefinition, UserInterface } from "@opg/interface-builder"
import { useRematch } from "../hooks"
import * as record from "fp-ts/lib/Record"
import { store } from "../state/store"
import { tryCatch } from "fp-ts/lib/Option"
import JSON5 from "json5"
import { isEmpty, isEqual, isUndefined } from "lodash/fp"
import { AdminUserInterfaceContextManagerProvider } from "../data/AdminUserInterfaceContextManager"
import { usePrevious } from "../hooks/usePrevious"
import { useLocation } from "@reach/router"

// https://admin.techopg.com/app/admin/global-config/b8a9abe3-aacd-4e05-b14a-3f2703c02b09
const EXECUTE_COMPONENT_ID = "b8a9abe3-aacd-4e05-b14a-3f2703c02b09"

interface PageBeaconProps {
  data: {
    reportId?: string | null
    configId?: string | null
    pageUrl?: string | null
    appName?: string | null
    pageTitle?: string | null
    userName?: string | null
    userEmail?: string | null
  }
  pageReady: boolean
}

export function PageBeacon(props: PageBeaconProps): JSX.Element | null {
  const location = useLocation()
  const prevPage = usePrevious<string>(location.href)
  const [fromStore /*, dispatch*/] = useRematch((appState) => ({
    configsById: store.select.globalConfig.configsById(appState),
    profile: appState.iam.profile,
    loadExecuteConfig: (): ComponentDefinition[] => {
      return record
        .lookup(EXECUTE_COMPONENT_ID, store.select.globalConfig.configsById(appState))
        .chain(({ config }) => tryCatch(() => JSON5.parse(config.getOrElse("{}")).layout as ComponentDefinition[]))
        .getOrElse([])
    },
  }))

  /**
   * Create the beacon payload
   */
  const data = React.useMemo(() => {
    if (!isEmpty(props.data.appName)) {
      return {
        ...props.data,
        pageUrl: location.href,
        userName: fromStore.profile.map((profile) => profile.Name).toUndefined(),
        userEmail: fromStore.profile.map((profile) => profile.Email).toUndefined(),
      }
    }
    return undefined
  }, [fromStore.profile, props.data, location.href])

  /**
   * Should the beacon fire?
   */
  const send = React.useMemo(() => {
    const isInitialPage = isUndefined(prevPage)
    const isChangingPages = !isInitialPage && !isEqual(prevPage, location.href)
    return !isChangingPages
  }, [location.href, prevPage])

  return (
    <AdminUserInterfaceContextManagerProvider>
      {(userInterfaceContextManager) => (
        <>
          {send ? (
            <UserInterface
              contextManager={userInterfaceContextManager}
              data={data}
              getRootUserInterfaceData={() => data}
              onChangeRootData={() => void 0}
              onChangeData={() => void 0}
              mode="display"
              components={fromStore.loadExecuteConfig()}
            />
          ) : null}
        </>
      )}
    </AdminUserInterfaceContextManagerProvider>
  )
}
