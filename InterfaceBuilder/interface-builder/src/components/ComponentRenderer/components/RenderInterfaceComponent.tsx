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
  const [CodeEditor, setCodeEditor] = React.useState<AbstractBaseInterfaceComponentType>()

  React.useEffect(() => {
    let isMounted = true
    registry.lookup(props.componentDefinition.component).then((component) => {
      // isMounted check prevents setting state on unmounted component
      if (isMounted && setComponent) {
        // Why do we need to set an anonymous function into state?
        // Otherwise we get "Can't set props of undefined" error.
        setComponent(() => component)
      }
    })
    registry.lookup("code-editor").then((codeEditor) => {
      // isMounted check prevents setting state on unmounted component
      if (isMounted) {
        // We set an anonymous function into state,
        // otherwise we get "Can't set props of undefined" error.
        setCodeEditor(() => codeEditor)
      }
    })

    /* Prevent memory leaks */
    return () => {
      isMounted = false
    }
  }, [props.componentDefinition.component])

  if (!Component) {
    return null
  }

  switch (props.mode) {
    case "display":
      return (
        <DisplayMode
          Component={Component}
          CodeEditor={CodeEditor}
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
          CodeEditor={CodeEditor}
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
