import { Icon, Menu, Tag } from "antd"
import { groupBy } from "lodash/fp"
import React from "react"
import { Draggable } from "../../DragAndDrop"
import { CachedComponent, ComponentRegistryCache, ComponentRegistryContext } from "../../../services/ComponentRegistry"
import { LayoutDefinition } from "../../../globalTypes"
import styles from "../styles.scss"
import { MenuCategory } from "components/UserInterface/types"

export const ComponentMenu = () => {
  const { componentRegistry } = React.useContext(ComponentRegistryContext)
  const menuCategories = getMenuCategories(componentRegistry._cache)

  return (
    <div className={styles.componentMenuWrapper}>
      <Menu mode="inline" inlineIndent={0} className={styles.componentMenu}>
        {menuCategories.map(([category, layoutDefinitions]) => (
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

const sortLayoutDefinition = (a: LayoutDefinition, b: LayoutDefinition): number => {
  const groupRank = a.category.localeCompare(b.category)
  const titleRank = a.title.localeCompare(b.title)
  return groupRank || titleRank
}

function getMenuCategories(componentRegistry: ComponentRegistryCache): MenuCategory[] {
  const cachedComponents = Object.values(componentRegistry)
  const layoutDefinitions = cachedComponents.map(
    (componentPkg: CachedComponent) => componentPkg.layoutDefinition as unknown as LayoutDefinition
  )
  const sorted: LayoutDefinition[] = layoutDefinitions.sort(sortLayoutDefinition)
  const grouped = groupBy((layoutDefinition: LayoutDefinition) => layoutDefinition.category, sorted)

  return Object.entries(grouped)
}
