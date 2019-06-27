import {
  Alert,
  Divider,
  Layout,
  Typography
  } from "antd"
import _ from "lodash"
import { get, set } from "lodash/fp"
import React from "react"
import rainy_window_png from "../../images/rainy-window.png"
import { moveInList } from "../../lib/move-in-list"
import { DataPathContext } from "../DataPathContext"
import { ComponentRenderer, UI_ROOT } from "./ComponentRenderer"
import { ComponentDefinition, LayoutDefinition } from "./components/base/BaseInterfaceComponent"
import { DraggedItemProps, DroppableTargetProps } from "./dnd"
import DragDropContext from "./dnd/util/DragDropContext"
import { DraggableContext, DraggableContextProps } from "./dnd/util/DraggableContext"
import { InterfaceComponentChoices } from "./InterfaceComponentChoices"
import { ManageComponentModal } from "./manage/ManageComponentModal"
import { ComponentRegistryContext, registry } from "./registry"
import "./user-interface.scss"
import { UserInterfaceContext, UserInterfaceContextManager } from "./UserInterfaceContextManager"

interface IUserInterfaceProps {
  data?: any
  contextManager?: UserInterfaceContextManager
  mode: "display" | "edit"
  onChangeData?: (data: UserInterfaceProps["data"]) => void
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
  clipboardComponent: null | DraggedItemProps
  confirmDeleteComponent: null | DraggedItemProps
  error: null | string
}

export class UserInterface extends React.Component<UserInterfaceProps, UserInterfaceState> {
  state = {
    clipboardComponent: null,
    components: [],
    confirmDeleteComponent: null,
    error: null,
    itemToAdd: null,
    itemToEdit: null,
  } as UserInterfaceState

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
    const { components, contextManager, data, mode, onChangeData } = this.props
    const { clipboardComponent, error, itemToAdd, itemToEdit } = this.state

    if (error) {
      return (
        <img
          src={rainy_window_png}
          alt="A window showing a rainy day with text 'Something went wrong'"
        />
      )
    }

    const content = (
      <ComponentRenderer
        components={components}
        data={data}
        mode={mode}
        onChangeData={onChangeData}
        onDrop={this.handleDrop}
      />
    )

    const draggableContextHandlers: DraggableContextProps = {
      canPaste: !!clipboardComponent,
      onCopy: (draggedItem) => {
        console.log("UserInterface.draggableContextHandlers", "onCopy", draggedItem)
        this.setState({ clipboardComponent: draggedItem })
      },
      onDelete: (draggedItem) => {
        console.log("UserInterface.draggableContextHandlers", "onDelete", draggedItem)
        this.setState({ itemToAdd: null, itemToEdit: null, confirmDeleteComponent: draggedItem })
      },
      onEdit: (draggedItem) => {
        console.log(
          "UserInterface.draggableContextHandlers",
          "onEdit",
          draggedItem,
          components,
          get(draggedItem.draggableId, components)
        )
        this.setState({
          components,
          itemToAdd: null,
          itemToEdit: {
            componentDefinition: draggedItem.item as Partial<ComponentDefinition>,
            path: draggedItem.parentDroppableId || UI_ROOT,
            index: draggedItem.index,
          },
          confirmDeleteComponent: null,
        })
      },
      onPaste: (draggedItem) => {
        console.log("UserInterface.draggableContextHandlers", "onPaste", draggedItem)
      },
    }

    const contentWithContext = contextManager ? (
      <UserInterfaceContext.Provider value={contextManager}>
        {content}
      </UserInterfaceContext.Provider>
    ) : (
      content
    )

    return (
      <div className="user-iterface-builder">
        <DataPathContext>
          {(parentPath) => (
            <DataPathContext reset>
              <ComponentRegistryContext.Provider value={{ componentRegistry: registry }}>
                {mode === "edit" ? (
                  <DragDropContext.HTML5>
                    <DraggableContext.Provider value={draggableContextHandlers}>
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
                            {contentWithContext}
                          </Layout.Content>
                        </Layout>
                      </Layout>

                      <ManageComponentModal
                        componentDefinition={
                          (itemToAdd && itemToAdd.componentDefinition) ||
                          (itemToEdit && itemToEdit.componentDefinition)
                        }
                        onCancel={() => {
                          // console.log("UserInterface.onCancel")
                          this.setState({ itemToAdd: null, itemToEdit: null })
                        }}
                        onConfirm={(componentDefinition) => {
                          // TODO: Cleanup and consolidate these code branches
                          if (this.props.mode === "edit") {
                            // If we're adding the item, insert it
                            if (itemToAdd) {
                              // Find which component list we're inserting into
                              const relevantList =
                                itemToAdd.path === UI_ROOT
                                  ? components
                                  : get(itemToAdd.path, components)
                              // Slice this item into the list
                              const updatedList = [
                                ...relevantList.slice(0, itemToAdd.index),
                                componentDefinition,
                                ...relevantList.slice(itemToAdd.index),
                              ]
                              // Merge back into the parent component list
                              const updatedComponents =
                                itemToAdd.path === UI_ROOT
                                  ? updatedList
                                  : set(itemToAdd.path, updatedList, components)

                              // Clear the modal and all adding state
                              this.setState({ itemToAdd: null, itemToEdit: null })
                              // Fire the schema change up the chain
                              this.props.onChangeSchema(updatedComponents)
                            } else if (itemToEdit) {
                              // Find which component list we're inserting into
                              const relevantList =
                                itemToEdit.path === UI_ROOT
                                  ? components
                                  : get(itemToEdit.path, components)
                              // Slice this item into the list, replacing the existing item
                              const updatedList = [
                                ...relevantList.slice(0, itemToEdit.index),
                                componentDefinition,
                                ...relevantList.slice(itemToEdit.index + 1),
                              ]
                              // Merge back into the parent component list
                              const updatedComponents =
                                itemToEdit.path === UI_ROOT
                                  ? updatedList
                                  : set(itemToEdit.path, updatedList, components)

                              // Clear the modal and all adding state
                              this.setState({ itemToAdd: null, itemToEdit: null })
                              // Fire the schema change up the chain
                              this.props.onChangeSchema(updatedComponents)
                            }
                          }
                        }}
                      />
                    </DraggableContext.Provider>
                  </DragDropContext.HTML5>
                ) : (
                  contentWithContext
                )}
              </ComponentRegistryContext.Provider>
            </DataPathContext>
          )}
        </DataPathContext>
      </div>
    )
  }
}

export interface DropHelperResult {
  components: ComponentDefinition[]
  itemToAdd: null | {
    componentDefinition: Partial<ComponentDefinition>
    path: string
    index: number
  }
  itemToEdit: null | {
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
      itemToEdit: null,
    }
  }
  // Rearranged in the same list
  else if (dropTarget.droppableId === draggedItem.parentDroppableId) {
    const originalList =
      dropTarget.droppableId === UI_ROOT
        ? components
        : (get(dropTarget.droppableId, components) as ComponentDefinition[])
    const updatedList = moveInList(originalList, draggedItem.index, dropTarget.dropIndex)
    return {
      components:
        dropTarget.droppableId === UI_ROOT
          ? updatedList
          : set(dropTarget.droppableId, updatedList, components),
      itemToAdd: null,
      itemToEdit: null,
    }
  }
  // This item came from another droppable list. We should remove it from that list and move it to this one
  else if (draggedItem.parentDroppableId) {
    // If one of the two lists is the root, we have to take some special actions
    if (draggedItem.parentDroppableId === UI_ROOT || dropTarget.droppableId === UI_ROOT) {
      // Find the sublist the dragged item came from and remove it
      const sourceList =
        draggedItem.parentDroppableId === UI_ROOT
          ? components
          : (get(draggedItem.parentDroppableId, components) as ComponentDefinition[])
      const updatedSourceList = [
        ...sourceList.slice(0, draggedItem.index),
        ...sourceList.slice(draggedItem.index + 1),
      ]

      // Find the sublist the drop occurred in, and add the dragged item
      const destinationList =
        dropTarget.droppableId === UI_ROOT
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
      if (draggedItem.parentDroppableId === UI_ROOT) {
        return {
          components: set(dropTarget.droppableId, updatedDestinationList, updatedSourceList),
          itemToAdd: null,
          itemToEdit: null,
        }
      }
      // If the item was dragged from a sublist to the root, take the destination as the new root
      // Alter it to add the updated source information
      else if (dropTarget.droppableId === UI_ROOT) {
        return {
          components: set(draggedItem.parentDroppableId, updatedSourceList, updatedDestinationList),
          itemToAdd: null,
          itemToEdit: null,
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
        itemToEdit: null,
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
        itemToEdit: null,
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
        itemToEdit: null,
      }
    }
  }
  // The dragged item did not come from a droppable list, so we simply need to add to the destination
  else {
    // Find the destination list and add the dragged item contents
    const destinationList =
      dropTarget.droppableId === UI_ROOT
        ? components
        : (get(dropTarget.droppableId, components) as ComponentDefinition[])
    const updatedDestinationList = [
      ...destinationList.slice(0, dropTarget.dropIndex),
      draggedItem.item as ComponentDefinition,
      ...destinationList.slice(dropTarget.dropIndex),
    ]
    return {
      components:
        dropTarget.droppableId === UI_ROOT
          ? updatedDestinationList
          : set(dropTarget.droppableId, updatedDestinationList, components),
      itemToAdd: null,
      itemToEdit: null,
    }
  }

  console.warn("UserInterface/handleDrop", "Failed to handle component update")
  return { components, itemToAdd: null, itemToEdit: null }
}
