import { Divider, Layout, Typography } from "antd"
import _ from "lodash"
import { get, set } from "lodash/fp"
import React from "react"
import rainy_window_png from "../../images/rainy-window.png"
import { moveInList } from "../../lib/move-in-list"
import { ComponentRenderer } from "./ComponentRenderer"
import { ComponentDefinition, LayoutDefinition } from "./components/base/BaseInterfaceComponent"
import { DraggedItemProps, DroppableTargetProps } from "./dnd"
import DragDropContext from "./dnd/util/DragDropContext"
import { InterfaceComponentChoices } from "./InterfaceComponentChoices"
import { ManageComponentModal } from "./manage/ManageComponentModal"
import { ComponentRegistryContext, registry } from "./registry"
import "./user-interface.scss"

interface IUserInterfaceProps {
  data?: any
  mode: "display" | "edit"
  onChangeData?: () => void
  components: ComponentDefinition[]
}

interface DisplayUserInterfaceProps extends IUserInterfaceProps {
  mode: "display"
}

interface EditUserInterfaceProps extends IUserInterfaceProps {
  mode: "edit"
  onChangeSchema: (schema: ComponentDefinition[]) => void
}

export type UserInterfaceProps = DisplayUserInterfaceProps | EditUserInterfaceProps

export interface UserInterfaceState extends DropHelperResult {
  error: null | string
}

export class UserInterface extends React.Component<UserInterfaceProps, UserInterfaceState> {
  state = { components: [], itemToAdd: null, error: null } as UserInterfaceState

  handleDrop = (draggedItem: DraggedItemProps, dropTarget: DroppableTargetProps) => {
    if (this.props.mode === "edit") {
      // You can't move a parent into a child, so we'll ignore those drops
      if (dropTarget.droppableId.startsWith(`${draggedItem.draggableId}.`)) return

      const { components, onChangeSchema } = this.props

      const dropHelperResult = handleDropHelper(components, draggedItem, dropTarget)
      console.log("UserInterface.onDrop", { dropHelperResult })
      if (!dropHelperResult.itemToAdd) {
        onChangeSchema(dropHelperResult.components)
      } else {
        this.setState(dropHelperResult)
      }
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("UserInterface.componentDidCatch", error, info)
    this.setState({ error: error.toString() })
  }

  render() {
    const { mode, components } = this.props
    const { error, itemToAdd } = this.state

    if (error) {
      return (
        <img
          src={rainy_window_png}
          alt="A window showing a rainy day with text 'Something went wrong'"
        />
      )
    }

    const content = (
      <ComponentRenderer components={components} mode={mode} onDrop={this.handleDrop} />
    )

    return (
      <div className="user-iterface-builder">
        <ComponentRegistryContext.Provider value={{ componentRegistry: registry }}>
          {mode === "edit" ? (
            <DragDropContext.HTML5>
              <Layout>
                <Layout.Sider style={{ background: "#fff" }}>
                  <Typography.Title level={4}>Components</Typography.Title>
                  <Divider />
                  <InterfaceComponentChoices />
                </Layout.Sider>
                <Layout>
                  <Layout.Content
                    style={{
                      margin: "24px 16px",
                      padding: 24,
                      background: "#fff",
                      minHeight: 280,
                    }}>
                    {content}
                  </Layout.Content>
                </Layout>
              </Layout>
              {console.log(
                "UserInterface.render",
                "itemToAdd.componentDefinition",
                itemToAdd && itemToAdd.componentDefinition
              )}
              <ManageComponentModal
                componentDefinition={itemToAdd && itemToAdd.componentDefinition}
                onCancel={() => {
                  console.log("UserInterface.onCancel")
                  this.setState({ itemToAdd: null })
                }}
                onConfirm={(componentDefinition) => {
                  // TODO: If we're adding the item, insert it
                  // If we're editing the item, replace it in
                  //        onChangeSchema(updatedComponents)
                }}
              />
            </DragDropContext.HTML5>
          ) : (
            content
          )}
        </ComponentRegistryContext.Provider>
      </div>
    )
  }
}

interface HasStyle {
  style: {}
}

function createPlaceholderFromShiftedItem(
  shiftedItem?: HTMLElement,
  PlaceholderComponent: string | React.ComponentType<HasStyle> = "div"
) {
  if (!shiftedItem || !shiftedItem.style.transform) return

  const [_, widthFactor, heightFactor] = shiftedItem.style.transform.match(
    /translate\((\d+)px, (\d+)px\)/
  )

  const rect = shiftedItem.getBoundingClientRect()
  const style = {
    position: "absolute",
    width: widthFactor || "100%",
    height: heightFactor || "100%",
    top: rect.top,
    left: rect.left,
  }

  return <PlaceholderComponent style={style} />
}

export interface DropHelperResult {
  components: ComponentDefinition[]
  itemToAdd: null | {
    componentDefinition: Partial<ComponentDefinition>
    path: string
    index: number
  }
}

export function handleDropHelper(
  components: ComponentDefinition[],
  draggedItem: DraggedItemProps,
  dropTarget: DroppableTargetProps
): DropHelperResult {
  console.log("UserInterface/handleDropHelper", ...components)

  // If this dragged item has a componentDefinition, it must be to create a new component, not rearrange existing ones
  if (draggedItem.item && (draggedItem.item as LayoutDefinition).componentDefinition) {
    return {
      components,
      itemToAdd: {
        componentDefinition: (draggedItem.item as LayoutDefinition).componentDefinition,
        path: dropTarget.droppableId,
        index: dropTarget.dropIndex,
      },
    }
  }
  // Rearranged in the same list
  else if (dropTarget.droppableId === draggedItem.parentDroppableId) {
    const originalList =
      dropTarget.droppableId === "UI-Root"
        ? components
        : (get(dropTarget.droppableId, components) as ComponentDefinition[])
    const updatedList = moveInList(originalList, draggedItem.index, dropTarget.dropIndex)
    return {
      components:
        dropTarget.droppableId === "UI-Root"
          ? updatedList
          : set(dropTarget.droppableId, updatedList, components),
      itemToAdd: null,
    }
  }
  // This item came from another droppable list. We should remove it from that list and move it to this one
  else if (draggedItem.parentDroppableId) {
    // If one of the two lists is the root, we have to take some special actions
    if (draggedItem.parentDroppableId === "UI-Root" || dropTarget.droppableId === "UI-Root") {
      // Find the sublist the dragged item came from and remove it
      const sourceList =
        draggedItem.parentDroppableId === "UI-Root"
          ? components
          : (get(draggedItem.parentDroppableId, components) as ComponentDefinition[])
      const updatedSourceList = [
        ...sourceList.slice(0, draggedItem.index),
        ...sourceList.slice(draggedItem.index + 1),
      ]

      // Find the sublist the drop occurred in, and add the dragged item
      const destinationList =
        dropTarget.droppableId === "UI-Root"
          ? components
          : (get(dropTarget.droppableId, components) as ComponentDefinition[])
      const updatedDestinationList = [
        ...destinationList.slice(0, dropTarget.dropIndex),
        sourceList[draggedItem.index],
        ...destinationList.slice(dropTarget.dropIndex),
      ]

      // We know both lists can't be "root" because then we'd have hit the outer if instead
      // If the item was dragged from the root, take the update source list as the new root
      // Alter it to add the updated destination information
      if (draggedItem.parentDroppableId === "UI-Root") {
        return {
          components: set(dropTarget.droppableId, updatedDestinationList, updatedSourceList),
          itemToAdd: null,
        }
      }
      // If the item was dragged from a sublist to the root, take the destination as the new root
      // Alter it to add the updated source information
      else if (dropTarget.droppableId === "UI-Root") {
        return {
          components: set(draggedItem.parentDroppableId, updatedSourceList, updatedDestinationList),
          itemToAdd: null,
        }
      }
    }
    // Neither list was the root, so we have to modify the root to account for both sets of changes without
    // having the changes overwrite each other
    // Check to see if the dropTarget is a parent/ancestor of the item being dragged
    else if (draggedItem.parentDroppableId.startsWith(`${dropTarget.droppableId}.`)) {
      // Find the sublist the dragged item came from and remove it
      const sourceList = get(draggedItem.parentDroppableId, components) as ComponentDefinition[]
      const updatedSourceList = [
        ...sourceList.slice(0, draggedItem.index),
        ...sourceList.slice(draggedItem.index + 1),
      ]

      // We modify the component list to get a new component list for the deeper item that
      // will fail if we modify the outer item first
      const interimComponents = set(draggedItem.parentDroppableId, updatedSourceList, components)

      // Find the sublist the drop occurred in, and add the dragged item
      // By using the interim components, we'll include the dragged item removal from above
      const destinationList = get(
        dropTarget.droppableId,
        interimComponents
      ) as ComponentDefinition[]
      const updatedDestinationList = [
        ...destinationList.slice(0, dropTarget.dropIndex),
        sourceList[draggedItem.index],
        ...destinationList.slice(dropTarget.dropIndex),
      ]

      return {
        components: set(dropTarget.droppableId, updatedDestinationList, interimComponents),
        itemToAdd: null,
      }
    }
    // Check to see if the draggedItem comes from a parent/ancestor of the dropTarget
    else if (dropTarget.droppableId.startsWith(`${draggedItem.parentDroppableId}.`)) {
      const tmpSourceList = get(draggedItem.parentDroppableId, components) as ComponentDefinition[]

      // Find the sublist the dropTarget came from and add the dragged item into it
      const destinationList = get(dropTarget.droppableId, components) as ComponentDefinition[]
      const updatedDestinationList = [
        ...destinationList.slice(0, dropTarget.dropIndex),
        tmpSourceList[draggedItem.index],
        ...destinationList.slice(dropTarget.dropIndex),
      ]

      // We modify the component list to get a new component list for the deeper item that
      // will fail if we modify the outer item first
      const interimComponents = set(dropTarget.droppableId, updatedDestinationList, components)

      // Find the sublist the draggedItem came from, and remote it
      // By using the interim components, we'll include the dragged item addition from above
      const sourceList = get(
        draggedItem.parentDroppableId,
        interimComponents
      ) as ComponentDefinition[]
      const updatedSourceList = [
        ...sourceList.slice(0, draggedItem.index),
        ...sourceList.slice(draggedItem.index + 1),
      ]

      return {
        components: set(draggedItem.parentDroppableId, updatedSourceList, interimComponents),
        itemToAdd: null,
      }
    } else {
      // Find the sublist the dragged item came from and remove it
      const sourceList = get(draggedItem.parentDroppableId, components) as ComponentDefinition[]
      const updatedSourceList = [
        ...sourceList.slice(0, draggedItem.index),
        ...sourceList.slice(draggedItem.index + 1),
      ]

      // Capture the interim modification state of the whole component list
      const interimComponents = set(draggedItem.parentDroppableId, updatedSourceList, components)

      // Find the sublist the drop occurred in, and add the dragged item
      const destinationList = get(
        dropTarget.droppableId,
        interimComponents
      ) as ComponentDefinition[]
      const updatedDestinationList = [
        ...destinationList.slice(0, dropTarget.dropIndex),
        sourceList[draggedItem.index],
        ...destinationList.slice(dropTarget.dropIndex),
      ]

      return {
        components: set(dropTarget.droppableId, updatedDestinationList, interimComponents),
        itemToAdd: null,
      }
    }
  }
  // The dragged item did not come from a droppable list, so we simply need to add to the destination
  else {
    // Find the destination list and add the dragged item contents
    const destinationList =
      dropTarget.droppableId === "UI-Root"
        ? components
        : (get(dropTarget.droppableId, components) as ComponentDefinition[])
    const updatedDestinationList = [
      ...destinationList.slice(0, dropTarget.dropIndex),
      draggedItem.item as ComponentDefinition,
      ...destinationList.slice(dropTarget.dropIndex),
    ]
    return {
      components:
        dropTarget.droppableId === "UI-Root"
          ? updatedDestinationList
          : set(dropTarget.droppableId, updatedDestinationList, components),
      itemToAdd: null,
    }
  }

  console.warn("UserInterface/handleDrop", "Failed to handle component update")
  return { components, itemToAdd: null }
}
