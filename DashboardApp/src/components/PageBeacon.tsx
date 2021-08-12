import React from "react"
import { ComponentDefinition } from "@opg/interface-builder/src/globalTypes/index"
import { ComponentRenderer } from "@opg/interface-builder"
import { useRematch } from "../hooks"
import * as record from "fp-ts/lib/Record"
import { store } from "../state/store"
import { tryCatch } from "fp-ts/lib/Option"
import JSON5 from "json5"
import { isEqual } from "lodash/fp"

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
  const [sent, setSent] = React.useState(false)
  const [prevData, setPrevData] = React.useState<PageBeaconProps["data"]>({})
  const [fromStore /*dispatch*/] = useRematch((appState) => ({
    configsById: store.select.globalConfig.configsById(appState),
    profile: appState.iam.profile,
    loadExecuteConfig: (): ComponentDefinition[] => {
      return record
        .lookup(EXECUTE_COMPONENT_ID, fromStore.configsById)
        .chain(({ config }) => tryCatch(() => JSON5.parse(config.getOrElse("{}")).layout as ComponentDefinition[]))
        .getOrElse([])
    },
  }))

  if (!props.pageReady) {
    return null
  }
  if (sent) {
    // Fire the beacon if this is a new page
    if (isEqual(props.data, prevData)) {
      return null
    }
  }
  setSent(true)
  setPrevData(props.data)
  const data = {
    ...props.data,
    pageUrl: window.location.href,
    userName: fromStore.profile.map((profile) => profile.Name).toUndefined(),
    userEmail: fromStore.profile.map((profile) => profile.Email).toUndefined(),
  }
  console.log("PageBeacon emitted", data)

  return (
    <ComponentRenderer
      key={"page-beacon"}
      components={fromStore.loadExecuteConfig()}
      data={data}
      getRootUserInterfaceData={() => void 0}
      onChangeRootData={() => void 0}
      dragDropDisabled
      onChangeData={() => void 0}
      onChangeSchema={() => void 0}
    />
  )
}
