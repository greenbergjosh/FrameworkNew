import React from "react"
import { RenderComponents } from "../../RenderComponents"
import { UserInterfaceContext } from "contexts/UserInterfaceContext"
import { LayoutProps } from "components/UserInterface/types"
import { ComponentDefinition } from "globalTypes"

export function Layout(props: LayoutProps): JSX.Element {
  // React.useEffect(() => {
  //   console.log("UserInterface > Layout", { components: props.components })
  // }, [props.components])

  function getOnChangeSchema() {
    return props.mode === "edit"
      ? props.onChangeSchema
      : (schema: ComponentDefinition[]) => {
          console.warn(
            "UserInterface.render",
            "ComponentRenderer/onChangeSchema",
            "Cannot invoke onChangeSchema when UserInterface is not in 'edit' mode",
            { schema }
          )
        }
  }

  const content = (
    <RenderComponents
      id={`ComponentRenderer_UserInterface_Layout_${props.components.length.toString()}`}
      components={props.components}
      getComponents={props.getComponents}
      data={props.data}
      getRootUserInterfaceData={props.getRootUserInterfaceData}
      onChangeRootData={props.onChangeRootData}
      mode={props.mode}
      onChangeData={props.onChangeData}
      onChangeSchema={getOnChangeSchema()}
      submit={props.submit}
      onDrop={props.handleDrop}
      keyPrefix={props.keyPrefix}
    />
  )

  return props.contextManager ? (
    <UserInterfaceContext.Provider value={props.contextManager}>{content}</UserInterfaceContext.Provider>
  ) : (
    <>{content}</>
  )
}
