import { Icon, Menu, Tag } from "antd"
import { Dictionary } from "lodash"
import { groupBy } from "lodash/fp"
import React from "react"
import { Draggable } from "../DragAndDrop"
import { ComponentRegistryCache, ComponentRegistryContext } from "../../services/ComponentRegistry"
import { LayoutDefinition } from "../../globalTypes"
import styles from "./styles.scss"

interface InterfaceComponentChoicesProps {}

export const ComponentMenu = ({}: InterfaceComponentChoicesProps) => {
  const { componentRegistry } = React.useContext(ComponentRegistryContext)

  return (
    <div className={styles.componentMenuWrapper}>
      <Menu mode="inline" inlineIndent={0} className={styles.componentMenu}>
        {Object.entries(sortedGroupedComponents(componentRegistry.cache)).map(([category, layoutDefinitions]) => (
          <Menu.SubMenu key={category} title={category}>
            {layoutDefinitions.map((layoutDefinition, index) => (
              <Menu.Item key={layoutDefinition.name}>
                <Draggable
                  key={layoutDefinition.name}
                  data={layoutDefinition}
                  draggableId={layoutDefinition.name}
                  index={index}
                  title={layoutDefinition.title}
                  type="INTERFACE_COMPONENT">
                  {({ isDragging }) => (
                    <Tag color={isDragging ? "#43C1FF" : "#108ee9"} className={styles.componentTag}>
                      {
                        // Use ant icon
                        layoutDefinition.icon && <Icon type={layoutDefinition.icon} />
                      }
                      {
                        // Pass a custom icon component to ant icon (usually an SVG wrapped in a component).
                        layoutDefinition.iconComponent && <Icon component={layoutDefinition.iconComponent as any} />
                      }
                      {layoutDefinition.title}
                    </Tag>
                  )}
                </Draggable>
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        ))}
      </Menu>
    </div>
  )
}

function sortedGroupedComponents(componentRegistry: ComponentRegistryCache): Dictionary<LayoutDefinition[]> {
  return groupBy(
    (layoutDefinition: LayoutDefinition) => layoutDefinition.category,
    Object.values(componentRegistry)
      .map((componentClass) => componentClass.getLayoutDefinition())
      .sort((a, b) => {
        return (a.category && a.category.localeCompare(b.category)) || a.title.localeCompare(b.title)
      })
  )
}
