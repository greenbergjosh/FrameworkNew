import { Collapse, Icon, Tag } from "antd"
import { Dictionary } from "lodash"
import { groupBy } from "lodash/fp"
import React from "react"
import { LayoutDefinition } from "./components/base/BaseInterfaceComponent"
import { Draggable } from "./dnd"
import { ComponentRegistryCache, ComponentRegistryContext } from "./registry"

interface InterfaceComponentChoicesProps {}

export const InterfaceComponentChoices = ({}: InterfaceComponentChoicesProps) => {
  const { componentRegistry } = React.useContext(ComponentRegistryContext)

  return (
    <div>
      <Collapse accordion defaultActiveKey={["Form"]}>
        {Object.entries(sortedGroupedComponents(componentRegistry.cache)).map(([category, layoutDefinitions]) => (
          <Collapse.Panel header={category} key={category}>
            {layoutDefinitions.map((layoutDefinition, index) => (
              <Draggable
                key={layoutDefinition.name}
                data={layoutDefinition}
                draggableId={layoutDefinition.name}
                index={index}
                title={layoutDefinition.title}
                type="INTERFACE_COMPONENT">
                {({ isDragging }) => (
                  <div style={{ width: "100%", cursor: "pointer" }}>
                    <Tag
                      color={isDragging ? "#43C1FF" : "#108ee9"}
                      style={{
                        width: "95%",
                        margin: "auto",
                      }}>
                      {
                        // Use ant icon
                        layoutDefinition.icon && <Icon type={layoutDefinition.icon} style={{ marginRight: "1em" }} />
                      }
                      {
                        // Pass a custom icon component to ant icon (usually an SVG wrapped in a component).
                        layoutDefinition.iconComponent && (
                          <Icon component={layoutDefinition.iconComponent} style={{ marginRight: "1em" }} />
                        )
                      }
                      {layoutDefinition.title}
                    </Tag>
                  </div>
                )}
              </Draggable>
            ))}
          </Collapse.Panel>
        ))}
      </Collapse>
    </div>
  )
}

function sortedGroupedComponents(componentRegistry: ComponentRegistryCache): Dictionary<LayoutDefinition[]> {
  return groupBy(
    (layoutDefinition: LayoutDefinition) => layoutDefinition.category,
    Object.values(componentRegistry)
      .map((componentClass) => componentClass.getLayoutDefinition())
      .sort((a, b) => {
        return a.category.localeCompare(b.category) || a.title.localeCompare(b.title)
      })
  )
}
