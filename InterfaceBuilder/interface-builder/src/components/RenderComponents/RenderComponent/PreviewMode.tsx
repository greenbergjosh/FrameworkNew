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
const _PreviewMode = (p: React.PropsWithChildren<any>) => <>{p.children}</>
export const PreviewMode = compose<React.ComponentType<ComponentModifierProps>>(
  withTokens,
  withDataBinding,
  withVisibility,
  withRender
)(_PreviewMode)
