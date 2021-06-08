import React from "react"
import { ComponentModifierProps, RenderInterfaceComponentProps } from "../../ComponentRenderer/types"
import { forIn } from "lodash"
import { ComponentDefinition, UserInterfaceProps } from "../../../globalTypes"
import { replaceTokens } from "./tokenUtils"
import { getValue } from "lib/getValue"

/**
 *
 * @param props: {
 *   @property componentDefinition
 *   @property onChangeData
 *   @property onChangeSchema
 *   @property userInterfaceData
 * }
 * @constructor
 */
export const ReplaceTokens: React.FC<
  ComponentModifierProps & {
    onChangeData: UserInterfaceProps["onChangeData"]
    onChangeSchema: RenderInterfaceComponentProps["onChangeSchema"]
    userInterfaceData: UserInterfaceProps["data"]
    children: (props: unknown & { tokenReplacedComponentDefinition: ComponentDefinition }) => JSX.Element
    getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
    mode: UserInterfaceProps["mode"]
  }
> = (props): React.ReactElement<any, any> | null => {
  /**
   * Allow any prop to use a token that gets parentRowData from the model.
   * @param componentDefinition
   * @param data
   */
  const tokenReplacedComponentDefinition = React.useMemo(() => {
    if (props.mode === "edit") {
      return props.componentDefinition
    }

    const newDef: ComponentDefinition = { ...props.componentDefinition }
    const valueKey = (props.componentDefinition.valueKey as string) || ""
    const localUserInterfaceData = getValue(valueKey, props.userInterfaceData, props.getRootUserInterfaceData)

    // Scan this component's definition for string
    // properties, and mutate them.
    forIn(newDef, (value: unknown, key: string) => {
      // Never process these ComponentDefinition properties
      if (["component", "key", "valueKey", "help"].includes(key)) {
        return
      }

      // Replace tokens
      if (typeof value === "string") {
        newDef[key] = replaceTokens(value, valueKey, localUserInterfaceData, props.getRootUserInterfaceData)
      }
    })
    return newDef
  }, [props.componentDefinition, props.userInterfaceData, props.mode])

  return <>{props.children({ tokenReplacedComponentDefinition })}</>
}
