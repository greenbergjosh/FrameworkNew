import React from "react"
import { withDataBinding } from "../ComponentDecorators/withDataBinding"
import { withDataBindingEditor } from "../ComponentDecorators/withDataBindingEditor/withDataBindingEditor"
import { withFormField } from "../ComponentDecorators/withFormField"
import { withRender } from "../ComponentDecorators/withRender"
import { withTokens } from "../ComponentDecorators/withTokens/withTokens"
import { withVisibility } from "../ComponentDecorators/withVisibility"
import { ComponentModifierProps } from "../index"
import { compose } from "lib/compose"

/*
 * Add Component Decorators
 * NOTE: Add outer decorators before inner.
 */
export const DisplayMode = compose<React.ComponentType<ComponentModifierProps>>(
  withDataBinding,
  withTokens,
  withFormField,
  withDataBindingEditor,
  withVisibility,
  withRender
)((p) => <>{p.children}</>)
