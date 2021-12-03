import jsonLogic from "json-logic-js"
import React from "react"
import { ComponentModifierProps, RenderInterfaceComponentProps } from "../ComponentRenderer/types"
import _, { forOwn } from "lodash"
import { isEmpty, set } from "lodash/fp"
import { ComponentDefinition, UserInterfaceProps } from "../../globalTypes"

/**
 * Add operators and libraries to jsonLogic
 */
jsonLogic.add_operation("Math", Math)
jsonLogic.add_operation("_", _)

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
    children: (props: unknown & { boundComponentDefinition: ComponentDefinition }) => JSX.Element
    getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  }
> = (props): React.ReactElement<any, any> | null => {
  const { userInterfaceData, componentDefinition, getRootUserInterfaceData } = props
  /**
   * Bind componentDefinition props
   */
  const boundComponentDefinition = React.useMemo(() => {
    const hasBindings = !isEmpty(componentDefinition.bindings)

    /* Nothing to bind so return the componentDefinition */
    if (!hasBindings) {
      return componentDefinition
    }

    /* Do bindings with jsonLogic */
    let def: ComponentDefinition = { ...componentDefinition }
    forOwn(componentDefinition.bindings, (rule, key) => {
      const result = jsonLogic.apply(rule, {
        $root: getRootUserInterfaceData(),
        $: userInterfaceData,
        ...userInterfaceData,
      })
      def = set(key, result, def)
    })

    /* INCOMING EVENT BINDINGS */
    /*
     * TODO: Either change EditDataBinding to put binding in main component's bindings,
     *  and remove this loop below (problem may be that you don't have the parent component's context);
     *  Or keep this loop below and make it more generic.
     */
    if (componentDefinition.incomingEventHandlers) {
      const handlers = componentDefinition.incomingEventHandlers as any[]
      handlers.forEach((handler, idx) => {
        const hasEventBindings = !isEmpty(handler.bindings)

        /* Nothing to bind so return the componentDefinition */
        if (!hasEventBindings) {
          return
        }

        /* Do bindings with jsonLogic */
        forOwn(handler.bindings, (rule, key) => {
          const result = jsonLogic.apply(rule, {
            $root: getRootUserInterfaceData(),
            $: userInterfaceData,
            ...userInterfaceData,
          })
          def = set(`incomingEventHandlers[${idx}].${key}`, result, def)
        })
      })
    }

    return def
  }, [userInterfaceData, componentDefinition, getRootUserInterfaceData])

  return <>{props.children({ boundComponentDefinition })}</>
}
