import React from "react"
import styles from "../styles.scss"
import { EditModeProps } from "../types"
import { TabSetContext } from "@opg/interface-builder-plugins/lib/html/tab-set/TabSetContext"

export function EditMode(props: EditModeProps): JSX.Element | null {
  const { activeTabKey, setActiveTabKey } = React.useContext(TabSetContext)

  const checked = React.useMemo(() => {
    return activeTabKey === props.tabKey
  }, [activeTabKey, props.tabKey])

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    if (evt.target.checked) {
      setActiveTabKey(props.tabKey)
    }
  }

  return (
    <>
      <input
        className={styles.tabRadio}
        type="radio"
        id={`tab-${props.componentId}`}
        name={`tab-group-${props.componentId}`}
        checked={checked}
        onChange={handleChange}
      />
      <label className={styles.tabLabel} htmlFor={`tab-${props.componentId}`}>
        {props.title || "Tab"}
      </label>
    </>
  )
}
