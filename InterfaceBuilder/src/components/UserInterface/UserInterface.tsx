import { Col, Divider, Layout, Row, Typography } from "antd"
import classNames from "classnames"
import { get, getOr, set } from "lodash/fp"
import React from "react"
import { ComponentRenderer, UI_ROOT } from "../ComponentRenderer"
import { DraggableContext, DraggableContextProps } from "../../contexts/DraggableContext"
import { InterfaceComponentChoices } from "./InterfaceComponentChoices"
import { ManageComponentModal } from "../ManageComponent/ManageComponentModal"
import { ComponentRegistryContext, registry } from "../../services/ComponentRegistry"
import { UserInterfaceContext } from "../../contexts/UserInterfaceContext"
import { DataPathContext } from "../../contexts/DataPathContext"
import { UserInterfaceState } from "./types"
import { handleDropHelper } from "../../components/DragAndDrop/lib/handleDropHelper"
import { DraggedItemProps, DroppableTargetProps } from "../../components/DragAndDrop"
import "./userInterface.module.scss"
import rainy_window_png from "../../images/rainy-window.png"
import { ComponentDefinition, UserInterfaceProps } from "../../globalTypes"

export class UserInterface extends React.Component<UserInterfaceProps, UserInterfaceState> {
  state = {
    clipboardComponent: null,
    components: [],
    error: null,
    itemToAdd: null,
    itemToEdit: null,
    fullscreen: false,
  } as UserInterfaceState

  handleDrop = (draggedItem: DraggedItemProps, dropTarget: DroppableTargetProps): void => {
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

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error("UserInterface.componentDidCatch", error, info)
    this.setState({ error: error.toString() })
  }

  getRootData = () => (this.props.getRootUserInterfaceData && this.props.getRootUserInterfaceData()) || this.props.data

  render(): JSX.Element {
    const { components, contextManager, data, mode, onChangeData, submit } = this.props
    const { clipboardComponent, error, fullscreen, itemToAdd, itemToEdit } = this.state

    if (error) {
      return <img src={rainy_window_png} alt="A window showing a rainy day with text 'Something went wrong'" />
    }

    const content = (
      <ComponentRenderer
        components={components}
        data={data}
        getRootData={this.getRootData}
        mode={mode}
        onChangeData={onChangeData}
        onChangeSchema={
          this.props.mode === "edit"
            ? this.props.onChangeSchema
            : (newSchema: any) => {
                console.warn(
                  "UserInterface.render",
                  "ComponentRenderer/onChangeSchema",
                  "Cannot invoke onChangeSchema when UserInterface is not in 'edit' mode",
                  { newSchema }
                )
              }
        }
        submit={submit}
        onDrop={this.handleDrop}
        keyPrefix={this.props.keyPrefix}
      />
    )

    const draggableContextHandlers: DraggableContextProps = {
      canCopy: true,
      canDelete: true,
      canEdit: true,
      canPaste: !!clipboardComponent,
      onCopy: (draggedItem) => {
        console.log("UserInterface.draggableContextHandlers", "onCopy", draggedItem)
        this.setState({ clipboardComponent: draggedItem })
      },
      onDelete: (deleteItem) => {
        console.log("UserInterface.draggableContextHandlers", "onDelete", deleteItem)

        // Must be in edit mode in order to delete things
        if (this.props.mode === "edit") {
          // Can't invoke delete on things that aren't in a list container
          if (deleteItem.parentDroppableId) {
            // List containing this item
            const originalList =
              deleteItem.parentDroppableId === UI_ROOT
                ? components
                : (getOr([], deleteItem.parentDroppableId, components) as ComponentDefinition[])

            // Remove item from list
            const updatedList = [
              ...originalList.slice(0, deleteItem.index),
              ...originalList.slice(deleteItem.index + 1),
            ]

            const updatedComponents =
              deleteItem.parentDroppableId === UI_ROOT
                ? updatedList
                : (set(deleteItem.parentDroppableId, updatedList, components) as ComponentDefinition[])

            // Clean out anything in the add/edit state
            this.setState({ itemToAdd: null, itemToEdit: null })
            // Fire the schema change event
            this.props.onChangeSchema(updatedComponents)
          }
        }
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
        })
      },
      onPaste: (draggedItem) => {
        console.log("UserInterface.draggableContextHandlers", "onPaste", draggedItem)
      },
    }

    const contentWithContext = contextManager ? (
      <UserInterfaceContext.Provider value={contextManager}>{content}</UserInterfaceContext.Provider>
    ) : (
      content
    )

    return (
      <div className={classNames("user-iterface-builder", { fullscreen })}>
        <DataPathContext>
          {(parentPath) => (
            <DataPathContext reset>
              <ComponentRegistryContext.Provider value={{ componentRegistry: registry }}>
                <DraggableContext.Provider value={draggableContextHandlers}>
                  {mode === "edit" ? (
                    <>
                      <Layout>
                        <Layout.Sider style={{ background: "#fff" }}>
                          <Row>
                            <Col span={19}>
                              <Typography.Title level={4}>Components</Typography.Title>
                            </Col>
                            <Col span={5}>
                              {/*<Tooltip
                                title={`${fullscreen ? "Exit" : "Enter"} Full Screen Designer`}>
                                <Button
                                  type="link"
                                  icon={`fullscreen${fullscreen ? "-exit" : ""}`}
                                  size="large"
                                  style={{ fontSize: 28 }}
                                  onClick={() => this.setState({ fullscreen: !fullscreen })}
                                />
                              </Tooltip>*/}
                            </Col>
                          </Row>
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
                        getRootUserInterfaceData={this.getRootData}
                        userInterfaceData={data}
                        componentDefinition={
                          (itemToAdd && itemToAdd.componentDefinition) || (itemToEdit && itemToEdit.componentDefinition)
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
                                (itemToAdd.path === UI_ROOT ? components : getOr([], itemToAdd.path, components)) || []

                              if (typeof relevantList.slice !== "function") {
                                console.warn(
                                  "UserInterface",
                                  "The path",
                                  itemToAdd.path,
                                  "yields",
                                  relevantList,
                                  "which is not an array!"
                                )
                              }

                              // Slice this item into the list
                              const updatedList = [
                                ...relevantList.slice(0, itemToAdd.index),
                                componentDefinition,
                                ...relevantList.slice(itemToAdd.index),
                              ]
                              // Merge back into the parent component list
                              const updatedComponents =
                                itemToAdd.path === UI_ROOT ? updatedList : set(itemToAdd.path, updatedList, components)

                              // Clear the modal and all adding state
                              this.setState({ itemToAdd: null, itemToEdit: null })
                              // Fire the schema change up the chain
                              this.props.onChangeSchema(updatedComponents)
                            } else if (itemToEdit) {
                              // Find which component list we're inserting into
                              const relevantList =
                                (itemToEdit.path === UI_ROOT ? components : getOr([], itemToEdit.path, components)) ||
                                []

                              if (typeof relevantList.slice !== "function") {
                                console.warn(
                                  "UserInterface",
                                  "The path",
                                  itemToEdit.path,
                                  "yields",
                                  relevantList,
                                  "which is not an array!"
                                )
                              }

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
                    </>
                  ) : (
                    contentWithContext
                  )}
                </DraggableContext.Provider>
              </ComponentRegistryContext.Provider>
            </DataPathContext>
          )}
        </DataPathContext>
      </div>
    )
  }
}
