import { Icon, Tag } from "antd"
import React from "react"
import { LayoutDefinition } from "./components/BaseInterfaceComponent"
import { ComponentRegistry, ComponentRegistryCache, ComponentRegistryContext } from "./registry"
import {
  Draggable,
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot,
} from "react-beautiful-dnd"

interface InterfaceComponentChoicesProps {}

export const InterfaceComponentChoices = ({  }: InterfaceComponentChoicesProps) => {
  const { componentRegistry } = React.useContext(ComponentRegistryContext)

  return (
    <Droppable droppableId="InterfaceComponentChoices" isDropDisabled type="INTERFACE_COMPONENT">
      {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
        <div ref={provided.innerRef} {...provided.droppableProps}>
          {sortedComponents(componentRegistry.cache).map((layoutDefinition, index) => (
            <Draggable
              key={layoutDefinition.name}
              draggableId={layoutDefinition.name}
              index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{ width: "100%", cursor: "pointer", ...provided.draggableProps.style }}>
                  <Tag color="#108ee9" style={{ width: "95%", margin: "auto" }}>
                    {layoutDefinition.icon && (
                      <Icon type={layoutDefinition.icon} style={{ marginRight: "1em" }} />
                    )}
                    {layoutDefinition.title}
                  </Tag>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}

function sortedComponents(componentRegistry: ComponentRegistryCache): LayoutDefinition[] {
  return Object.values(componentRegistry)
    .map((componentClass) => componentClass.getLayoutDefinition())
    .sort((a, b) => {
      return a.title.localeCompare(b.title)
    })
}
