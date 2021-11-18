import { Layout } from "antd"
import classNames from "classnames"
import { getOr, set } from "lodash/fp"
import React from "react"
import { ComponentRenderer, UI_ROOT } from "../ComponentRenderer"
import { EditableContext, EditableContextProps } from "../../contexts/EditableContext"
import { ComponentRegistryContext, registry } from "../../services/ComponentRegistry"
import { UserInterfaceContext } from "../../contexts/UserInterfaceContext"
import { DataPathContext } from "../../contexts/DataPathContext"
import { UserInterfaceState } from "./types"
import { handleDropHelper } from "../DragAndDrop/lib/handleDropHelper"
import { DraggedItemProps, DroppableTargetProps } from "../DragAndDrop"
import "./userInterface.module.scss"
import rainy_window_png from "../../images/rainy-window.png"
import { ComponentDefinition, UserInterfaceProps } from "../../globalTypes"
import styles from "./styles.scss"
import { EditPanel } from "../EditPanel/components/EditPanel"
import { PersistedSettingsModal } from "./SettingsModal/PersistedSettingsModal"
import { CollapsibleComponentMenu } from "components/UserInterface/ComponentMenu/CollapsibleComponentMenu"

export class UserInterface extends React.Component<UserInterfaceProps, UserInterfaceState> {
  state = {
    clipboardComponent: null,
    components: [],
    error: null,
    itemToAdd: null,
    itemToEdit: null,
    fullscreen: false,
    collapsed: true,
  } as UserInterfaceState

  handleDrop = (draggedItem: DraggedItemProps, dropTarget: DroppableTargetProps): void => {
    if (this.props.mode === "edit") {
      // You can't move a parent into a child, so we'll ignore those drops
      if (dropTarget.droppableId.startsWith(`${draggedItem.draggableId}.`)) return

      const dropHelperResult = handleDropHelper(this.props.components, draggedItem, dropTarget)
      console.log("UserInterface.onDrop", { dropHelperResult })

      if (!dropHelperResult.itemToAdd) {
        this.props.onChangeSchema(dropHelperResult.components)
      } else {
        this.setState(dropHelperResult)
      }
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error("UserInterface.componentDidCatch", error, info)
    this.setState({ error: error.toString() })
  }

  getRootUserInterfaceData = (): UserInterfaceProps["data"] =>
    (this.props.getRootUserInterfaceData && this.props.getRootUserInterfaceData()) || this.props.data

  // onChangeRootData = (newData: UserInterfaceProps["data"]): void =>
  //   this.props.onChangeRootData && this.props.onChangeRootData(newData)

  render(): JSX.Element {
    const { components, getComponents, contextManager, data, mode, onChangeData, submit } = this.props
    const { error, fullscreen, itemToAdd, itemToEdit } = this.state

    if (error) {
      return <img src={rainy_window_png} alt="A window showing a rainy day with text 'Something went wrong'" />
    }

    const content = (
      <ComponentRenderer
        components={components}
        getComponents={getComponents} // See CHN-551 Workaround
        data={data}
        getRootUserInterfaceData={this.getRootUserInterfaceData}
        onChangeRootData={this.props.onChangeRootData /*this.onChangeRootData*/}
        mode={mode}
        onChangeData={onChangeData}
        onChangeSchema={
          this.props.mode === "edit"
            ? this.props.onChangeSchema
            : (newSchema) => {
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

    const editableContextHandlers: EditableContextProps = {
      canDelete: true,
      canEdit: true,
      onDelete: (deleteItem) => {
        console.log("UserInterface.editableContextHandlers", "onDelete", deleteItem)

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
        /*console.log(
          "UserInterface.editableContextHandlers",
          "onEdit",
          draggedItem,
          components,
          get(draggedItem.draggableId, components)
        )*/
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
    }

    const contentWithContext = contextManager ? (
      <UserInterfaceContext.Provider value={contextManager}>{content}</UserInterfaceContext.Provider>
    ) : (
      content
    )

    return (
      <div className={classNames("user-interface-builder", { fullscreen })}>
        <DataPathContext>
          {() => (
            /*{ parentPath }*/
            <DataPathContext reset>
              <ComponentRegistryContext.Provider value={{ componentRegistry: registry }}>
                <EditableContext.Provider value={editableContextHandlers}>
                  {mode === "edit" ? (
                    <>
                      <Layout className={styles.uiEditor}>
                        {!this.props.hideMenu && <CollapsibleComponentMenu />}
                        <Layout.Content className={styles.uiEditorContent}>
                          <EditPanel
                            title={this.props.title || "User Interface"}
                            style={{ width: "100%" }}
                            visibilityMode="user-interface"
                            componentDefinition={
                              (itemToAdd && itemToAdd.componentDefinition) ||
                              (itemToEdit && itemToEdit.componentDefinition)
                            }>
                            {contentWithContext}
                          </EditPanel>
                        </Layout.Content>
                      </Layout>
                      <PersistedSettingsModal
                        components={components}
                        data={data}
                        getRootUserInterfaceData={this.getRootUserInterfaceData}
                        itemToAdd={itemToAdd}
                        itemToEdit={itemToEdit}
                        mode={this.props.mode}
                        onChangeRootData={this.props.onChangeRootData}
                        onChangeSchema={(c) => this.props.mode === "edit" && this.props.onChangeSchema(c)}
                        clearModalItems={() => this.setState({ itemToAdd: null, itemToEdit: null })}
                      />
                    </>
                  ) : (
                    contentWithContext
                  )}
                </EditableContext.Provider>
              </ComponentRegistryContext.Provider>
            </DataPathContext>
          )}
        </DataPathContext>
      </div>
    )
  }
}
