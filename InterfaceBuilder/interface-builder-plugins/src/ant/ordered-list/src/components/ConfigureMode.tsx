import classNames from "classnames"
import React from "react"
import styles from "../styles.scss"
import { Badge, Card, Icon } from "antd"
import { ComponentDefinition, ComponentRenderer, DataPathContext, JSONRecord } from "@opg/interface-builder"
import { ConfigureModeProps } from "../types"

export function ConfigureMode({
  components,
  data,
  getRootUserInterfaceData,
  onChangeRootData,
  hasLastItemComponents,
  lastItemComponents = [],
  onChange,
  preconfigured,
}: ConfigureModeProps): JSX.Element {
  /* *************************************
   *
   * EVENT HANDLERS
   */

  function handleChangeData(nextData: JSONRecord): void {
    onChange(nextData)
  }

  function handleChangeSchema(newSchema: ComponentDefinition[]) {
    console.warn(
      "RepeaterInterfaceComponent > ConfigureMode.onChangeSchema!",
      "TODO: Cannot alter schema inside ComponentRenderer in Repeater",
      { newSchema }
    )
  }

  /* *************************************
   *
   * RENDER
   */

  return (
    <ol className={styles.repeater}>
      <DataPathContext path="components">
        <li className={classNames(styles.repeaterItem, styles.topClearance, styles.configMode)}>
          <Card size="small">
            <ComponentRenderer
              components={components}
              data={data}
              getRootUserInterfaceData={getRootUserInterfaceData}
              onChangeRootData={onChangeRootData}
              dragDropDisabled={!!preconfigured}
              onChangeData={handleChangeData}
              onChangeSchema={handleChangeSchema}
            />
          </Card>
        </li>
      </DataPathContext>
      {/*
       * Drag target for Last Item components when enabled.
       */}
      {hasLastItemComponents ? (
        <DataPathContext path="lastItemComponents">
          <li className={classNames(styles.repeaterItem, styles.configMode)}>
            <Badge count={<Icon type="lock" />} className={styles.repeaterItemBadge}>
              <Card
                size="small"
                title="Last Item (fixed)"
                headStyle={{ backgroundColor: "#f5fbff", border: "dashed 1px #95d7ff", color: "#40a9ff" }}>
                <ComponentRenderer
                  components={lastItemComponents}
                  data={data}
                  getRootUserInterfaceData={getRootUserInterfaceData}
                  onChangeRootData={onChangeRootData}
                  dragDropDisabled={!!preconfigured}
                  onChangeData={handleChangeData}
                  onChangeSchema={handleChangeSchema}
                />
              </Card>
            </Badge>
          </li>
        </DataPathContext>
      ) : null}
    </ol>
  )
}
