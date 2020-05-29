import { ComponentDefinition, getDefaultsFromComponentDefinitions } from "../../../base/BaseInterfaceComponent"
import classNames from "classnames"
import { List } from "./List"
import { Button, Empty } from "antd"
import React from "react"
import { DisplayModeProps, InterleaveType } from "../types"
import { get, set } from "lodash/fp"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"

export function DisplayMode({
  data,
  components,
  interleave,
  onChangeData,
  userInterfaceData,
  valueKey,
  orientation,
  unwrapped,
  addItemLabel,
  description,
}: DisplayModeProps) {
  const finalComponents = repeatedInterleave(components, data.length, interleave)

  function handleAddClick() {
    const entriesToAdd = getEntriesToAdd(interleave, components, valueKey, userInterfaceData)
    onChangeData &&
      onChangeData(
        set(
          valueKey,
          [
            ...(get(valueKey, userInterfaceData) || []),
            ...(unwrapped ? entriesToAdd.map((entry) => Object.values(entry)[0]) : entriesToAdd),
          ],
          userInterfaceData
        )
      )
  }

  return (
    <>
      <div
        className={classNames("ui-list", {
          "ui-list-horizontal": orientation === "horizontal",
          "ui-list-vertical": orientation === "vertical",
        })}>
        {components.length ? (
          <List
            data={data}
            components={finalComponents}
            interleave={interleave}
            onChangeData={onChangeData}
            orientation={orientation}
            unwrapped={unwrapped}
            userInterfaceData={userInterfaceData}
            valueKey={valueKey}
          />
        ) : (
          <Empty description={description} />
        )}
      </div>
      <Button
        style={{ display: "block", marginTop: "10px", marginBottom: "10px" }}
        onClick={handleAddClick}>
        {addItemLabel}
      </Button>
    </>
  )
}

function getEntriesToAdd(
  interleave: "none" | "round-robin" | "set" | undefined,
  components: ComponentDefinition[],
  valueKey: string,
  userInterfaceData?: UserInterfaceProps["data"]
) {
  return interleave === "set"
    ? components.map((component, index) => getDefaultsFromComponentDefinitions([component]))
    : interleave === "none"
    ? [getDefaultsFromComponentDefinitions([components[0]])]
    : interleave === "round-robin"
    ? [
        getDefaultsFromComponentDefinitions([
          components[(get(valueKey, userInterfaceData) || []) % components.length],
        ]),
      ]
    : []
}

function repeatedInterleave(
  items: any[],
  count: number,
  interleave?: InterleaveType
): ComponentDefinition[] {
  switch (interleave) {
    case "none": {
      const singleItem = items[0]
      return [...Array(count)].map(() => ({ ...singleItem }))
    }
    case "round-robin": {
      return [...Array(count)].map((_, index) => ({ ...items[index % items.length] }))
    }
    case "set": {
      const realCount = Math.ceil(count / (items.length || 1)) * items.length
      return [...Array(realCount)].map((_, index) => ({ ...items[index % items.length] }))
    }
    default: {
      return []
    }
  }
}
