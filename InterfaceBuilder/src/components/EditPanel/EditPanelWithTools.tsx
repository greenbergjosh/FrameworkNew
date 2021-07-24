import React from "react"
import { EditPanel } from "./components/EditPanel"
import { EditButtons } from "./components/EditButtons"
import { EditPanelWithToolsProps, VISIBILITY_MODES } from "./types"

/**
 * Disabled: User has chosen make this component
 * not in the DOM and not functioning
 *
 * Invisible: User has chosen to hide this component
 * but it is still in the DOM and functioning
 *
 * Blocked: JsonLogic rules are making this component
 * not in the DOM and not functioning.
 *
 * @param props
 * @constructor
 */
export const EditPanelWithTools: React.FC<EditPanelWithToolsProps> = (props): JSX.Element => {
  let visibilityMode = VISIBILITY_MODES.default

  if (props.hasError) {
    visibilityMode = VISIBILITY_MODES.error
  } else if (props.hidden) {
    visibilityMode = VISIBILITY_MODES.disabled
  } else if (props.invisible) {
    visibilityMode = VISIBILITY_MODES.invisible
  } else if (props.blocked) {
    visibilityMode = VISIBILITY_MODES.blocked
  }

  return (
    <EditPanel
      component={props.component}
      componentDefinition={props.componentDefinition}
      showGripper={true}
      title={props.title}
      visibilityMode={visibilityMode}
      tools={
        props.editable ? (
          <EditButtons
            canDelete={props.canDelete}
            canEdit={props.canEdit}
            onDelete={() => (props.draggableItem && props.onDelete ? props.onDelete(props.draggableItem) : void 0)}
            onEdit={() => (props.draggableItem && props.onEdit ? props.onEdit(props.draggableItem) : void 0)}
            title={props.title}
          />
        ) : null
      }>
      {props.children}
    </EditPanel>
  )
}
