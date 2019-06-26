import { Icon, Tag } from "antd"
import React from "react"
import { LayoutDefinition } from "./components/base/BaseInterfaceComponent"
import { Draggable } from "./dnd"
import { ComponentRegistryCache, ComponentRegistryContext } from "./registry"

interface InterfaceComponentChoicesProps {}

export const InterfaceComponentChoices = ({  }: InterfaceComponentChoicesProps) => {
  const { componentRegistry } = React.useContext(ComponentRegistryContext)

  return (
    // <Droppable droppableId="InterfaceComponentChoices" disabled={false} type="INTERFACE_COMPONENT">
    //   {(props) => (
    <div>
      {sortedComponents(componentRegistry.cache).map((layoutDefinition, index) => (
        <Draggable
          key={layoutDefinition.name}
          data={layoutDefinition}
          draggableId={layoutDefinition.name}
          index={index}
          title={layoutDefinition.title}
          type="INTERFACE_COMPONENT">
          {({ isDragging }) => (
            <div style={{ width: "100%", cursor: "pointer" }}>
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
    </div>
    //   )}
    // </Droppable>
  )
}

function sortedComponents(componentRegistry: ComponentRegistryCache): LayoutDefinition[] {
  return Object.values(componentRegistry)
    .map((componentClass) => componentClass.getLayoutDefinition())
    .sort((a, b) => {
      return a.title.localeCompare(b.title)
    })
}
