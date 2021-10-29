import React from "react"
import { ComponentDefinition } from "../../../../globalTypes"
import { ComponentModifierProps } from "../../types"
import { forIn } from "lodash"
import { getValue } from "lib/getValue"
import { isEmpty } from "lodash/fp"
import { replaceTokens } from "./tokenUtils"
import { ComposableFn } from "lib/compose"

export const withTokens: ComposableFn<React.ComponentType<ComponentModifierProps>> = (Wrapper) => {
  return (hocProps: ComponentModifierProps) => {
    /**
     * Allow any prop to use a token that gets parentRowData from the model.
     * @param componentDefinition
     * @param data
     */
    const tokenReplacedComponentDefinition = React.useMemo(() => {
      if (hocProps.mode === "edit") {
        return hocProps.componentDefinition
      }

      const newDef: ComponentDefinition = { ...hocProps.componentDefinition }
      const valueKey = (hocProps.componentDefinition.valueKey as string) || ""
      const localUserInterfaceData = getValue(valueKey, hocProps.userInterfaceData, hocProps.getRootUserInterfaceData)

      // Scan this component's definition for string
      // properties, and mutate them.
      forIn(newDef, (value: unknown, key: string) => {
        // Never process these ComponentDefinition properties
        const blockedProps = [
          "abstract",
          "bindable",
          "bindings",
          "component",
          "defaultValue",
          "getRootUserInterfaceData",
          "help",
          "hidden",
          "hideLabel",
          "invisible",
          "key",
          "label",
          "onChangeRootData",
          "preview",
          "valueKey",
          "visibilityConditions",
        ]

        // Replace tokens
        if (
          value &&
          !blockedProps.includes(key) &&
          typeof value === "string" &&
          !isEmpty(value) &&
          value.includes("{")
        ) {
          newDef[key] = replaceTokens(value, valueKey, localUserInterfaceData, hocProps.getRootUserInterfaceData)
        }
      })
      return newDef
    }, [hocProps.componentDefinition, hocProps.userInterfaceData, hocProps.mode])

    return <Wrapper {...hocProps} componentDefinition={tokenReplacedComponentDefinition} />
  }
}
