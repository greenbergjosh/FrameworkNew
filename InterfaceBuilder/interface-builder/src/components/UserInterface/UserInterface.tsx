import React from "react"
import { ComponentRegistryContext, registry } from "../../services/ComponentRegistry"
import { DataPathContext } from "../../contexts/DataPathContext"
import { handleDropHelper } from "../DragAndDrop/lib/handleDropHelper"
import { DraggedItemProps, DropHelperResult, DroppableTargetProps } from "../DragAndDrop"
import "./userInterface.module.scss"
import { UserInterfaceProps } from "../../globalTypes"
import { ErrorBoundary } from "react-error-boundary"
import { ErrorMode } from "../RenderComponents/RenderComponent/ErrorMode"
import { Layout } from "./components/Layout"
import { EditMode } from "./components/EditMode"
import { EditableContextProvider } from "./components/EditableContextProvider"

export function UserInterface(props: UserInterfaceProps): JSX.Element {
  const [itemToAdd, setItemToAdd] = React.useState<DropHelperResult["itemToAdd"]>(null)
  const [itemToEdit, setItemToEdit] = React.useState<DropHelperResult["itemToEdit"]>(null)

  // React.useEffect(() => {
  //   console.log("UserInterface", { components: props.components })
  // }, [props.components])

  const handleDrop = (draggedItem: DraggedItemProps, dropTarget: DroppableTargetProps): void => {
    if (props.mode === "edit") {
      // You can't move a parent into a child, so we'll ignore those drops
      if (dropTarget.droppableId.startsWith(`${draggedItem.draggableId}.`)) return

      const dropHelperResult = handleDropHelper(props.components, draggedItem, dropTarget)
      console.log("UserInterface.onDrop", { dropHelperResult })
      if (!dropHelperResult.itemToAdd) {
        props.onChangeSchema(dropHelperResult.components)
      } else {
        setItemToEdit(dropHelperResult.itemToEdit)
        setItemToAdd(dropHelperResult.itemToAdd)
        // setDropComponents(dropHelperResult.components)
      }
    }
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorMode({
        dragDropDisabled: undefined,
        componentDefinition: props.components[0],
        getRootUserInterfaceData: props.getRootUserInterfaceData,
        index: -1,
        mode: props.mode,
        onChangeData: props.onChangeData,
        onChangeRootData: props.onChangeRootData,
        onChangeSchema: () => void 0, // Only use in edit mode
        onVisibilityChange: props.onVisibilityChange,
        path: "",
        submit: props.submit,
        userInterfaceData: props.data,
      })}>
      <div className={"user-interface-builder"}>
        <DataPathContext>
          {() => (
            <DataPathContext reset>
              <ComponentRegistryContext.Provider value={{ componentRegistry: registry }}>
                <EditableContextProvider
                  components={props.components}
                  mode={props.mode}
                  onChangeSchema={"onChangeSchema" in props ? props.onChangeSchema : () => void 0}
                  setItemToAdd={setItemToAdd}
                  setItemToEdit={setItemToEdit}>
                  {props.mode === "edit" ? (
                    <EditMode
                      components={props.components}
                      getComponents={props.getComponents}
                      contextManager={props.contextManager}
                      data={props.data}
                      getRootUserInterfaceData={props.getRootUserInterfaceData}
                      handleDrop={handleDrop}
                      hideMenu={props.hideMenu}
                      itemToAdd={itemToAdd}
                      itemToEdit={itemToEdit}
                      keyPrefix={props.keyPrefix}
                      mode={props.mode}
                      onChangeData={props.onChangeData}
                      onChangeRootData={props.onChangeRootData}
                      onChangeSchema={(schema) => {
                        props.onChangeSchema(schema)
                      }}
                      setItemToAdd={setItemToAdd}
                      setItemToEdit={setItemToEdit}
                      submit={props.submit}
                      title={props.title}
                    />
                  ) : (
                    <Layout
                      components={props.components}
                      getComponents={props.getComponents}
                      contextManager={props.contextManager}
                      data={props.data}
                      getRootUserInterfaceData={props.getRootUserInterfaceData}
                      handleDrop={handleDrop}
                      keyPrefix={props.keyPrefix}
                      mode={props.mode}
                      onChangeData={props.onChangeData}
                      onChangeRootData={props.onChangeRootData}
                      onChangeSchema={() => void 0} // Only use in edit mode
                      submit={props.submit}
                    />
                  )}
                </EditableContextProvider>
              </ComponentRegistryContext.Provider>
            </DataPathContext>
          )}
        </DataPathContext>
      </div>
    </ErrorBoundary>
  )
}
