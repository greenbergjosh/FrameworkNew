import { DataPathContext } from "contexts/DataPathContext"
import { ErrorBoundary } from "react-error-boundary"
import { ErrorMode } from "components/RenderComponents/RenderComponent/ErrorMode"
import { ComponentRendererProps, RenderComponent } from "./"
import { ComponentRendererModeContext } from "contexts/ComponentRendererModeContext"
import React from "react"
import { isEqual } from "lodash/fp"
import { deepDiff } from "lib/deepDiff"

export const RenderDisplayMode = React.memo((props: ComponentRendererProps): JSX.Element => {
  const mode = props.mode === "preview" ? "preview" : "display"

  return (
    <ComponentRendererModeContext.Provider value={mode}>
      {props.components.map((componentDefinition, index) => (
        <DataPathContext
          path={index}
          key={`${props.keyPrefix || ""}${componentDefinition.component}-datapathcontext-${index}-${mode}`}>
          {(path) => (
            <ErrorBoundary
              FallbackComponent={ErrorMode({
                componentDefinition,
                dragDropDisabled: props.dragDropDisabled,
                getRootUserInterfaceData: props.getRootUserInterfaceData,
                index,
                mode,
                onChangeData: props.onChangeData,
                onChangeRootData: props.onChangeRootData,
                onChangeSchema: () => void 0,
                onVisibilityChange: props.onVisibilityChange,
                path,
                submit: props.submit,
                userInterfaceData: props.data,
              })}>
              <RenderComponent
                componentDefinition={componentDefinition}
                dragDropDisabled={props.dragDropDisabled}
                getRootUserInterfaceData={props.getRootUserInterfaceData}
                index={index}
                key={`${props.keyPrefix || ""}${componentDefinition.component}-rendercomponent-${index}-${mode}`}
                mode={mode}
                onChangeData={props.onChangeData}
                onChangeRootData={props.onChangeRootData}
                onChangeSchema={() => void 0}
                onVisibilityChange={props.onVisibilityChange}
                path={path}
                submit={props.submit}
                userInterfaceData={props.data}
              />
            </ErrorBoundary>
          )}
        </DataPathContext>
      ))}
    </ComponentRendererModeContext.Provider>
  )
}, propsAreEqual)

function propsAreEqual(prevProps: ComponentRendererProps, nextProps: ComponentRendererProps) {
  debugger
  const eqData = isEqual(prevProps.data, nextProps.data)
  const eqComponents = isEqual(prevProps.components, nextProps.components)
  const eqMode = isEqual(prevProps.mode, nextProps.mode)
  /*
   * NOTE: these functions will trigger a re-render because of different functions with the same name:
   *  getRootUserInterfaceData
   *  onChangeRootData
   *  onChangeSchema
   *  onDrop
   */
  const runDeepDiff = () =>
    deepDiff(prevProps, nextProps, (k) =>
      ["getRootUserInterfaceData", "onChangeRootData", "onChangeSchema", "onChangeData", "onDrop"].includes(k)
    )

  return eqData && eqComponents && eqMode && !runDeepDiff()
}
