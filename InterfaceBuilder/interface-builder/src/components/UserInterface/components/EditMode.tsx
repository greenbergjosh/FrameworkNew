import { ComponentMenuWrapper } from "../ComponentMenu/ComponentMenuWrapper"
import { UISettingsModal } from "../SettingsModal/UISettingsModal"
import React from "react"
import { Layout } from "components/UserInterface/components/Layout"
import { EditModeProps } from "components/UserInterface/types"

export function EditMode(props: EditModeProps): JSX.Element {
  // React.useEffect(() => {
  //   console.log("UserInterface > EditMode", { components: props.components })
  // }, [props.components])

  return (
    <>
      <ComponentMenuWrapper
        itemToAdd={props.itemToAdd}
        itemToEdit={props.itemToEdit}
        hideMenu={props.hideMenu}
        title={props.title}>
        <Layout
          components={props.components}
          getComponents={props.getComponents}
          contextManager={props.contextManager}
          data={props.data}
          getRootUserInterfaceData={props.getRootUserInterfaceData}
          handleDrop={props.handleDrop}
          keyPrefix={props.keyPrefix}
          mode={props.mode}
          onChangeData={props.onChangeData}
          onChangeRootData={props.onChangeRootData}
          onChangeSchema={props.onChangeSchema}
          submit={props.submit}
        />
      </ComponentMenuWrapper>
      <UISettingsModal
        components={props.components}
        data={props.data}
        getRootUserInterfaceData={props.getRootUserInterfaceData}
        itemToAdd={props.itemToAdd}
        itemToEdit={props.itemToEdit}
        mode={props.mode}
        onChangeRootData={props.onChangeRootData}
        onChangeSchema={props.onChangeSchema}
        setItemToAdd={props.setItemToAdd}
        setItemToEdit={props.setItemToEdit}
      />
    </>
  )
}
