import classNames from "classnames"
import pluginStyles from "@opg/interface-builder/dist/styles/plugins.scss"
import React from "react"
import styles from "../styles.scss"
import { ComponentRenderer, DataPathContext } from "@opg/interface-builder"
import { EditModeProps } from "../types"
import { TabSetContext } from "../TabSetContext"

export function EditMode(props: EditModeProps): JSX.Element {
  const { activeTabKey } = React.useContext(TabSetContext)

  return (
    <fieldset className={pluginStyles.editModeLabel}>
      <div>
        <strong>Title:</strong> {}
      </div>
      <div className={pluginStyles.componentWrapper}>
        <DataPathContext path="tabs">
          <>
            {/*
             * TABS
             */}
            <div className={styles.tabSet}>
              <ComponentRenderer
                components={props.tabs || []}
                data={props.data}
                getRootUserInterfaceData={props.getRootUserInterfaceData}
                onChangeRootData={props.onChangeRootData}
                onChangeData={props.onChangeData}
                onChangeSchema={() => void 0}
              />
            </div>

            <div className={styles.tabNavDivider}></div>

            {/*
             * TABS CONTENT
             */}
            {props.tabs &&
              props.tabs.map((tab, index) => (
                <DataPathContext path={`${index}.components`} key={`tabset-tab-content-${index}`}>
                  <div className={classNames(styles.tabContent, tab.tabKey === activeTabKey ? styles.active : null)}>
                    <ComponentRenderer
                      components={tab.components}
                      data={props.data}
                      mode={"edit"}
                      getRootUserInterfaceData={props.getRootUserInterfaceData}
                      onChangeData={props.onChangeData}
                      onChangeRootData={props.onChangeRootData}
                      onChangeSchema={() => void 0}
                    />
                  </div>
                </DataPathContext>
              ))}
          </>
        </DataPathContext>
      </div>
    </fieldset>
  )
}
