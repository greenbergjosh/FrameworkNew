import React from "react"
import { ComponentDefinition } from "../../../globalTypes"
import { ComponentModifierProps } from "../types"
import { forOwn } from "lodash"
import { isEmpty, set } from "lodash/fp"
import jsonLogic from "json-logic-js"
import { ComposableFn } from "lib/compose"

export const withDataBinding: ComposableFn<React.ComponentType<ComponentModifierProps>> = (Wrapper) => {
  return (hocProps: ComponentModifierProps) => {
    /**
     * Bind componentDefinition props
     */
    const boundComponentDefinition = React.useMemo(() => {
      const hasBindings = !isEmpty(hocProps.componentDefinition.bindings)

      /* Nothing to bind so return the componentDefinition */
      if (!hasBindings) {
        return hocProps.componentDefinition
      }

      /* Do bindings with jsonLogic */
      let def: ComponentDefinition = { ...hocProps.componentDefinition }
      forOwn(hocProps.componentDefinition.bindings, (rule, key) => {
        const result = jsonLogic.apply(rule, {
          $root: hocProps.getRootUserInterfaceData(),
          $: hocProps.userInterfaceData,
          ...hocProps.userInterfaceData,
        })
        def = set(key, result, def)
      })

      /* INCOMING EVENT BINDINGS */
      /*
       * TODO: Either change EditDataBinding to put binding in main component's bindings,
       *  and remove this loop below (problem may be that you don't have the parent component's context);
       *  Or keep this loop below and make it more generic.
       */
      if (hocProps.componentDefinition.incomingEventHandlers) {
        const handlers = hocProps.componentDefinition.incomingEventHandlers as any[]
        handlers.forEach((handler, idx) => {
          const hasEventBindings = !isEmpty(handler.bindings)

          /* Nothing to bind so return the componentDefinition */
          if (!hasEventBindings) {
            return
          }

          /* Do bindings with jsonLogic */
          forOwn(handler.bindings, (rule, key) => {
            const result = jsonLogic.apply(rule, {
              $root: hocProps.getRootUserInterfaceData(),
              $: hocProps.userInterfaceData,
              ...hocProps.userInterfaceData,
            })
            def = set(`incomingEventHandlers[${idx}].${key}`, result, def)
          })
        })
      }

      return def
    }, [hocProps.userInterfaceData, hocProps.componentDefinition])

    return <Wrapper {...hocProps} componentDefinition={boundComponentDefinition} />
  }
}
