import React from "react"
import styles from "../../tab-set/styles.scss"
import { TabSetContext } from "../../tab-set/TabSetContext"
import { DisplayModeProps } from "../types"

export function DisplayMode(props: DisplayModeProps): JSX.Element | null {
  const { activeTabKey, setActiveTabKey, addAvailableTab, setUserInteracting } = React.useContext(TabSetContext)

  React.useEffect(() => {
    // NOTE: Hidden tabs are not rendered
    if (activeTabKey === props.tabKey && props.invisible) {
      setActiveTabKey(null)
      return
    }
    if (!props.invisible) {
      addAvailableTab(props.tabKey)
    }
  }, [props.tabKey, props.invisible, addAvailableTab])

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    if (evt.target.checked) {
      setActiveTabKey(props.tabKey)
    }
    setUserInteracting()
  }

  return (
    <>
      <input
        className={styles.tabRadio}
        type="radio"
        id={`tab-${props.componentId}`}
        name={`tab-group-${props.componentId}`}
        checked={activeTabKey === props.tabKey}
        onChange={handleChange}
      />
      <label className={styles.tabLabel} htmlFor={`tab-${props.componentId}`}>
        {props.title || "Tab"}
      </label>
    </>
  )
}
