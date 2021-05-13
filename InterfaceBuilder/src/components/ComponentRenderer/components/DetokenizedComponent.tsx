import React from "react"
import { forIn } from "lodash"
import { hasTokens, replaceTokens } from "../../../lib/tokenReplacer"
import { registry } from "../../../services/ComponentRegistry"
import { RenderInterfaceComponent } from "./RenderInterfaceComponent"
import { RenderInterfaceComponentProps } from "../types"
import { ComponentDefinition, UserInterfaceProps } from "../../../globalTypes"

export function DetokenizedComponent(props: {
  componentDefinition: ComponentDefinition & { valueKey?: string; defaultValue?: any }
  data: UserInterfaceProps["data"]
  dragDropDisabled?: boolean
  getRootData: () => UserInterfaceProps["data"]
  index: number
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: RenderInterfaceComponentProps["onChangeSchema"]
  path: string
  submit?: UserInterfaceProps["submit"]
}): JSX.Element {
  const {
    componentDefinition,
    data,
    dragDropDisabled,
    getRootData,
    index,
    mode,
    onChangeData,
    onChangeSchema,
    path,
    submit,
  } = props

  /**
   * Allow any prop to use a token that gets parentRowData from the model.
   * @param componentDefinition
   * @param data
   */
  const componentDef = React.useMemo(() => {
    if (mode === "edit") {
      return componentDefinition
    }
    const newDef: ComponentDefinition = { ...componentDefinition }

    forIn(newDef, (value: any, key: string) => {
      let newValue = value
      if (typeof value === "string" && hasTokens(value)) {
        newValue = replaceTokens(newDef[key] as string, data, componentDefinition.valueKey || "", mode)
      }
      newDef[key] = newValue
    })
    return newDef
  }, [componentDefinition, data, mode])

  return (
    <RenderInterfaceComponent
      Component={registry.lookup(componentDef.component)}
      componentDefinition={componentDef}
      userInterfaceData={data}
      dragDropDisabled={dragDropDisabled}
      getRootData={getRootData}
      index={index}
      mode={mode}
      onChangeData={onChangeData}
      onChangeSchema={onChangeSchema}
      path={path}
      submit={submit}
    />
  )
}
