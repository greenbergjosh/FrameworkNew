import React from "react"
import { RenderInterfaceComponentProps } from "../types"
import { EditMode } from "../../../components/ComponentRenderer/components/EditMode"
import { PreviewMode } from "../../../components/ComponentRenderer/components/PreviewMode"
import { DisplayMode } from "../../../components/ComponentRenderer/components/DisplayMode"
import { registry } from "../../../services/ComponentRegistry"
import { AbstractBaseInterfaceComponentType } from "../../../components/BaseInterfaceComponent/types"

export function RenderInterfaceComponent(props: RenderInterfaceComponentProps): JSX.Element | null {
  const {
    componentDefinition,
    dragDropDisabled,
    getRootUserInterfaceData,
    index,
    mode,
    onChangeData,
    onChangeRootData,
    onChangeSchema,
    onVisibilityChange,
    path,
    submit,
    userInterfaceData,
  } = props
  const [Component, setComponent] = React.useState<AbstractBaseInterfaceComponentType>()

  React.useEffect(() => {
    registry.lookup(props.componentDefinition.component).then((component) => {
      // Why do we need to set an anonymous function into state?
      // Otherwise we get "Can't set props of undefined" error.
      setComponent(() => component)
    })
  }, [props.componentDefinition.component])

  if (!Component) {
    return null
  }

  switch (props.mode) {
    case "display":
      return (
        <DisplayMode
          Component={Component}
          componentDefinition={componentDefinition}
          getRootUserInterfaceData={getRootUserInterfaceData}
          mode={mode}
          onChangeData={onChangeData}
          onChangeRootData={onChangeRootData}
          onChangeSchema={onChangeSchema}
          onVisibilityChange={onVisibilityChange}
          submit={submit}
          userInterfaceData={userInterfaceData}
        />
      )
    case "preview":
      return (
        <PreviewMode
          Component={Component}
          componentDefinition={componentDefinition}
          getRootUserInterfaceData={getRootUserInterfaceData}
          mode={mode}
          onChangeData={onChangeData}
          onChangeRootData={onChangeRootData}
          onChangeSchema={onChangeSchema}
          onVisibilityChange={onVisibilityChange}
          submit={submit}
          userInterfaceData={userInterfaceData}
        />
      )
    case "edit":
      return (
        <EditMode
          Component={Component}
          componentDefinition={componentDefinition}
          dragDropDisabled={dragDropDisabled}
          getRootUserInterfaceData={getRootUserInterfaceData}
          index={index}
          mode={mode}
          onChangeData={onChangeData}
          onChangeRootData={onChangeRootData}
          onChangeSchema={onChangeSchema}
          path={path}
          submit={submit}
          userInterfaceData={userInterfaceData}
        />
      )
  }
}
