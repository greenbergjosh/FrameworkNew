import React from "react"
import styles from "../styles.scss"
import { ComponentRenderer, DataPathContext, UserInterfaceProps } from "@opg/interface-builder"
import { DisplayModeProps, ITab } from "../types"
import { isNull, isUndefined } from "lodash/fp"
import { TabSetContext } from "../TabSetContext"

export function DisplayMode(props: DisplayModeProps): JSX.Element {
  const { activeTabKey, setActiveTabKey, availableTabs, isUserInteracting } = React.useContext(TabSetContext)
  const hiddenTabsRef = React.useRef<{ [key: string]: ITab }>({})
  const availableTabsRef = React.useRef<{ [key: string]: ITab }>({})

  /**
   *
   */
  //TODO: Fix: availableTabs isn't used except as a dependency, but it breaks without availableTabs
  React.useEffect(() => {
    if (isUserInteracting || !props.defaultActiveTabKey) {
      return
    }

    // Count the tabs rendered so far
    const hiddenCnt = Object.keys(hiddenTabsRef.current).length
    const availableCnt = Object.keys(availableTabsRef.current).length
    const isAllTabsRendered = hiddenCnt + availableCnt === (props.tabs && props.tabs.length)

    if (isAllTabsRendered) {
      const isDefaultTabAvailable = !!availableTabsRef.current[props.defaultActiveTabKey]
      if (isDefaultTabAvailable) {
        // Set the default tab defined by user
        setActiveTabKey(props.defaultActiveTabKey)
      } else {
        // Fallback to first available tab
        setActiveTabKey(Object.keys(availableTabsRef.current)[0])
      }
    }
  }, [props.defaultActiveTabKey, props.tabs, setActiveTabKey, availableTabs, isUserInteracting])

  /**
   * Get the active tab's content
   * TODO: Don't render inactive tab content that hasn't been visited
   *  to save on tab-set load time. But we still render the tab
   *  container either way.
   */
  const activeTabContent = React.useMemo<ITab[]>(() => {
    if (isUndefined(activeTabKey) || isNull(activeTabKey)) {
      return []
    }
    const tab = props.tabs && props.tabs.find((t) => t.tabKey === activeTabKey)
    if (isUndefined(tab)) {
      return []
    }
    return [{ ...tab, renderSection: "content" }]
  }, [activeTabKey, props.tabs])

  /**
   * Track tabs visibility as they are rendered
   */
  const handleVisibilityChange: UserInterfaceProps["onVisibilityChange"] = (mode, tabDef, uiData) => {
    const t = tabDef as ITab
    if (mode === "visible") {
      availableTabsRef.current = { ...availableTabsRef.current, [t.tabKey]: t }
      delete hiddenTabsRef.current[t.tabKey]
    } else {
      hiddenTabsRef.current = { ...hiddenTabsRef.current, [t.tabKey]: t }
      delete availableTabsRef.current[t.tabKey]
    }
  }

  return (
    <div className={styles.tabSet}>
      <DataPathContext path="tabs">
        <>
          {/* ***********************
           *
           * TABS
           */}
          <ComponentRenderer
            components={props.tabs || []}
            data={props.data}
            getRootUserInterfaceData={props.getRootUserInterfaceData}
            onChangeRootData={props.onChangeRootData}
            onChangeData={props.onChangeData}
            onChangeSchema={() => void 0}
            onVisibilityChange={handleVisibilityChange}
          />

          <div className={styles.tabNavDivider}></div>

          {/* ***********************
           *
           * TAB CONTENT
           */}
          <DataPathContext path="components">
            <ComponentRenderer
              components={activeTabContent}
              data={props.data}
              getRootUserInterfaceData={props.getRootUserInterfaceData}
              onChangeData={props.onChangeData}
              onChangeRootData={props.onChangeRootData}
              onChangeSchema={() => void 0}
            />
          </DataPathContext>
        </>
      </DataPathContext>
    </div>
  )
}
