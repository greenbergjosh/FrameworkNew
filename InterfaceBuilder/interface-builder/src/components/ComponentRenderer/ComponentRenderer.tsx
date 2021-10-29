import { isEqual, set } from "lodash/fp"
import React from "react"
import { deepDiff } from "../../lib/deepDiff"
import { DataPathContext } from "../../contexts/DataPathContext"
import { Droppable } from "../DragAndDrop"
import { ComponentRendererProps } from "./types"
import { ComponentRendererModeContext } from "../../contexts/ComponentRendererModeContext"
import { ComponentDefinition } from "../../globalTypes"
import { RenderInterfaceComponent } from "../../components/ComponentRenderer/components/RenderInterfaceComponent"
import { ErrorFallback } from "./components/ErrorFallback"
import { ErrorBoundary } from "react-error-boundary"

export const UI_ROOT = "UI-Root"

export const ComponentRenderer = React.memo(
  ({
    componentLimit,
    components,
    getComponents,
    data,
    getRootUserInterfaceData,
    onChangeRootData,
    onVisibilityChange,
    dragDropDisabled,
    mode: propMode,
    onChangeData,
    onChangeSchema,
    submit,
    onDrop,
    keyPrefix,
  }: ComponentRendererProps): JSX.Element => {
    const contextMode = React.useContext(ComponentRendererModeContext)
    const mode = propMode || contextMode
    const handleChangeSchema = (index: number) => (newComponentDefinition: ComponentDefinition) => {
      if (mode === "edit" && getComponents) {
        const cmps = getComponents()
        onChangeSchema && onChangeSchema(set(index, newComponentDefinition, cmps))
      }
    }

    const content = components.map((componentDefinition, index) => {
      return (
        <DataPathContext path={index} key={`${keyPrefix || ""}${componentDefinition.component}-${index}`}>
          {(path) => (
            <ErrorBoundary
              FallbackComponent={ErrorFallback({
                componentDefinition,
                dragDropDisabled,
                getRootUserInterfaceData,
                index,
                mode,
                onChangeData,
                onChangeRootData,
                onChangeSchema: handleChangeSchema(index),
                onVisibilityChange,
                path,
                submit,
                userInterfaceData: data,
              })}>
              <RenderInterfaceComponent
                componentDefinition={componentDefinition}
                userInterfaceData={data}
                dragDropDisabled={dragDropDisabled}
                getRootUserInterfaceData={getRootUserInterfaceData}
                onChangeRootData={onChangeRootData}
                onVisibilityChange={onVisibilityChange}
                index={index}
                mode={mode}
                onChangeData={onChangeData}
                onChangeSchema={handleChangeSchema(index)}
                path={path}
                submit={submit}
              />
            </ErrorBoundary>
          )}
        </DataPathContext>
      )
    })

    return (
      <ComponentRendererModeContext.Provider value={mode}>
        {mode === "edit" && !dragDropDisabled ? (
          <DataPathContext>
            {(path) => (
              <Droppable
                data={components}
                allowDrop={!componentLimit || components.length < componentLimit}
                droppableId={path || UI_ROOT}
                onDrop={onDrop}
                type="INTERFACE_COMPONENT">
                {(/*{ isOver }*/) => content}
              </Droppable>
            )}
          </DataPathContext>
        ) : (
          content
        )}
      </ComponentRendererModeContext.Provider>
    )
  },
  propsAreEqual
)

// ComponentRenderer.defaultProps = {
//   components: [],
// }

function propsAreEqual(prevProps: ComponentRendererProps, nextProps: ComponentRendererProps) {
  const eqData = isEqual(prevProps.data, nextProps.data)
  const eqComponents = isEqual(prevProps.components, nextProps.components)
  const eqMode = isEqual(prevProps.mode, nextProps.mode)
  const runDeepDiff = () => deepDiff(prevProps, nextProps, (k) => ["onChangeSchema", "onChangeData"].includes(k))

  return eqData && eqComponents && eqMode && !runDeepDiff()
}

// export const ComponentRenderer = React.memo(_ComponentRenderer, propsAreEqual)
