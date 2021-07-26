import { ComponentDefinition, UserInterfaceProps } from "globalTypes"
import React from "react"
import { ComponentRenderer } from "components/ComponentRenderer"
import classNames from "classnames"
import styles from "../../tab-set/styles.scss"

export function TabContent(props: {
  activeTabKey: string | null
  components: ComponentDefinition[]
  data: UserInterfaceProps["data"]
  disabled: boolean
  onChangeData: ((data: UserInterfaceProps["data"]) => void) | undefined
  onChangeRootData: (newData: UserInterfaceProps["data"]) => void
  onChangeSchema: (newSchema: ComponentDefinition[]) => void
  rootUserInterfaceData: () => UserInterfaceProps["data"]
  tabKey: string
  title?: string
}): JSX.Element | null {
  const isActive = props.tabKey === props.activeTabKey

  return (
    <div className={classNames(styles.tabContent, isActive && styles.active)}>
      <ComponentRenderer
        components={props.components}
        data={props.data}
        getRootUserInterfaceData={props.rootUserInterfaceData}
        onChangeData={props.onChangeData}
        onChangeRootData={props.onChangeRootData}
        onChangeSchema={props.onChangeSchema}
      />
    </div>
  )
}
