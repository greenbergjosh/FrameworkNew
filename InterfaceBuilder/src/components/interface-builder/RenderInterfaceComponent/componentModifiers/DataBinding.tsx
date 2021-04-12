import React from "react"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import { ComponentModifierProps, RenderInterfaceComponentProps } from "../types"
import { isEmpty } from "lodash/fp"
import { forOwn } from "lodash"
import jsonLogic from "json-logic-js"

/**
 * Add operators and libraries to jsonLogic
 */
jsonLogic.add_operation("Math", Math)

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
export const DataBinding: React.FC<
  ComponentModifierProps & {
    onChangeData: UserInterfaceProps["onChangeData"]
    onChangeSchema: RenderInterfaceComponentProps["onChangeSchema"]
    userInterfaceData: UserInterfaceProps["data"]
  }
> = (props): JSX.Element => {
  const hasBindings = !isEmpty(props.componentDefinition.bindings)

  /**
   * Bind componentDefinition props
   */
  const childrenWithBoundProps = React.useMemo(() => {
    /* Nothing to bind so return the children */
    if (!hasBindings) {
      return props.children
    }

    /* Bind children props */
    return React.Children.map(props.children, (child) => {
      if (React.isValidElement(child)) {
        let boundComponentDefinition = { ...props.componentDefinition }
        forOwn(props.componentDefinition.bindings, (rule, key) => {
          const result = jsonLogic.apply(rule, props.userInterfaceData)
          boundComponentDefinition = { ...boundComponentDefinition, [key]: result }
        })

        /* Apply the bound props */
        return React.cloneElement(child, { componentDefinition: boundComponentDefinition })
      }

      /* Not a valid element, so just return it */
      return child
    })
  }, [hasBindings, props.userInterfaceData, props.children, props.componentDefinition])

  return <>{childrenWithBoundProps}</>
}
