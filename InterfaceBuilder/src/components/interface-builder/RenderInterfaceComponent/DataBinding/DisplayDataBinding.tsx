import React from "react"
import { ComponentDefinition } from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import { RenderInterfaceComponentProps } from "../types"
import { isEmpty } from "lodash/fp"
import { forOwn } from "lodash"
import jsonLogic from "json-logic-js"

/**
 *
 * @param props: {
 *   @property componentDefinition -- The component being data bound (bindings are here)
 *   @property onChangeData
 *   @property onChangeSchema
 *   @property userInterfaceData -- The page model that bindings will reference
 * }
 * @constructor
 */
export const DisplayDataBinding: React.FC<{
  componentDefinition: ComponentDefinition
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: RenderInterfaceComponentProps["onChangeSchema"]
  userInterfaceData: UserInterfaceProps["data"]
}> = (props): JSX.Element => {
  const { bindings } = props.componentDefinition

  if (isEmpty(bindings)) {
    return <>{props.children}</>
  }

  const childrenWithBoundProps = React.Children.map(props.children, (child) => {
    if (React.isValidElement(child)) {
      let boundProps = {}
      forOwn(bindings, (rule, key) => {
        const result = jsonLogic.apply(rule, props.userInterfaceData)
        boundProps = { ...boundProps, [key]: result }
      })

      /* Apply the bound props */
      return React.cloneElement(child, boundProps)
    }

    /* Not a valid element, so just return it */
    return child
  })

  return <>{childrenWithBoundProps}</>
}
