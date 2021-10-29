import React from "react"
import { withDataBinding } from "../ComponentDecorators/withDataBinding"
import { withRender } from "../ComponentDecorators/withRender"
import { withTokens } from "../ComponentDecorators/withTokens/withTokens"
import { withVisibility } from "../ComponentDecorators/withVisibility"
import { ComponentModifierProps } from "../index"
import { compose } from "lib/compose"

/*
 * Add Component Decorators
 * NOTE: Add outer decorators before inner.
 */
export const PreviewMode = compose<React.ComponentType<ComponentModifierProps>>(
  withVisibility,
  withTokens,
  withDataBinding,
  withRender
)((p) => <>{p.children}</>)
