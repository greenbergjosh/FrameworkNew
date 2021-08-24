import React from "react"
import { ComponentDefinition, UserInterface } from "@opg/interface-builder"
import { useRematch } from "../hooks"
import * as record from "fp-ts/lib/Record"
import { store } from "../state/store"
import { tryCatch } from "fp-ts/lib/Option"
import JSON5 from "json5"
import { isEmpty, isEqual } from "lodash/fp"
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
  const [lastPageUrlBeaconed, setLastPageUrlBeaconed] = React.useState<string | undefined>()
  const [wasChangingPages, setWasChangingPages] = React.useState(false)
  const [fromStore /*, dispatch*/] = useRematch((appState) => ({
    configsById: store.select.globalConfig.configsById(appState),
    profile: appState.iam.profile,
    loadExecuteConfig: (): ComponentDefinition[] => {
      return record
        .lookup(EXECUTE_COMPONENT_ID, fromStore.configsById)
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

  const prevPage = usePrevious<string>(location.href)

  /**
   * Is this a page transition or have we arrived?
   */
  React.useEffect(() => {
    if (prevPage !== undefined) {
      setWasChangingPages(prevPage !== location.href)
    }
  }, [prevPage, location.href])

  /**
   * Determine if the beacon should be fired
   */
  const send = React.useMemo(() => {
    const isSamePage = isEqual(prevPage, location.href)
    const isDoneChangingPages = isSamePage && wasChangingPages
    const isInitial = isInitialPage(prevPage, wasChangingPages, location.href)
    const isPageBeaconed = location.href === lastPageUrlBeaconed

    if (props.pageReady && !isPageBeaconed && (isDoneChangingPages || isInitial)) {
      setLastPageUrlBeaconed(location.href)
      return true
    }

    return false
  }, [data, props.pageReady, location.href, prevPage, wasChangingPages, lastPageUrlBeaconed])

  /**
   * Render
   */
  return React.useMemo(() => {
    if (send) {
      console.log("PageBeacon emitted", data)
    }
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
  }, [send, data, fromStore])
}

/**
 * Is this the first page that we have landed on?
 * @param prevPage
 * @param wasChangingPages
 * @param currentLocation
 */
function isInitialPage(prevPage: string | undefined, wasChangingPages: boolean, currentLocation: string): boolean {
  const isNew = prevPage === undefined
  const isSamePage = isEqual(prevPage, currentLocation)
  return isNew || (!wasChangingPages && isSamePage)
}
