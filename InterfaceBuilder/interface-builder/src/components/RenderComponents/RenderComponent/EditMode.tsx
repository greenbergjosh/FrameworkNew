import React from "react"
import { ComponentModifierProps } from "../index"
import { withDataBinding } from "../ComponentDecorators/withDataBinding"
import { withDataBindingEditor } from "../ComponentDecorators/withDataBindingEditor/withDataBindingEditor"
import { withDraggable } from "../ComponentDecorators/withDraggable"
import { withEditPanel } from "../ComponentDecorators/withEditPanel/withEditPanel"
import { withFormField } from "../ComponentDecorators/withFormField"
import { withRender } from "components/RenderComponents/ComponentDecorators/withRender"
import { withTokens } from "../ComponentDecorators/withTokens/withTokens"
import { compose } from "../../../lib/compose"

/*
 * Add Component Decorators
 * NOTE: Add outer decorators before inner.
 */
const _EditMode = (p: React.PropsWithChildren<any>) => <>{p.children}</>
export const EditMode = compose<React.ComponentType<ComponentModifierProps>>(
  withDataBinding,
  withTokens,
  withDraggable,
  withEditPanel,
  withFormField,
  withDataBindingEditor,
  withRender
)(_EditMode)
