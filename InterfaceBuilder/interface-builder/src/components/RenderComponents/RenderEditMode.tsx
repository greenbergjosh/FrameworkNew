import { DataPathContext } from "contexts/DataPathContext"
import { Droppable } from "components/DragAndDrop"
import { ComponentRendererProps, RenderComponent, UI_ROOT } from "./"
import { ErrorBoundary } from "react-error-boundary"
import { ErrorMode } from "components/RenderComponents/RenderComponent/ErrorMode"
import { ComponentRendererModeContext } from "contexts/ComponentRendererModeContext"
import React from "react"
import { ComponentDefinition } from "globalTypes"
import { isEqual, set } from "lodash/fp"
import { deepDiff } from "lib/deepDiff"

export const RenderEditMode = React.memo((props: ComponentRendererProps): JSX.Element => {
  const handleChangeSchema = (index: number) => (newComponentDefinition: ComponentDefinition) => {
    if (props.getComponents) {
      const cmps = props.getComponents()
      props.onChangeSchema && props.onChangeSchema(set(index, newComponentDefinition, cmps))
    }
  }

  return (
    <ComponentRendererModeContext.Provider value="edit">
      <DataPathContext>
        {(path) => (
          <Droppable
            data={props.components}
            allowDrop={!props.componentLimit || props.components.length < props.componentLimit}
            droppableId={path || UI_ROOT}
            onDrop={props.onDrop}
            type="INTERFACE_COMPONENT">
            {
              (/*{ isOver }*/) =>
                props.components.map((componentDefinition, index) => (
                  <DataPathContext
                    path={index}
                    key={`${props.keyPrefix || ""}${componentDefinition.component}-datapathcontext-${index}-edit`}>
                    {(path) => (
                      <ErrorBoundary
                        FallbackComponent={ErrorMode({
                          componentDefinition,
                          dragDropDisabled: props.dragDropDisabled,
                          getRootUserInterfaceData: props.getRootUserInterfaceData,
                          index,
                          mode: "edit",
                          onChangeData: props.onChangeData,
                          onChangeRootData: props.onChangeRootData,
                          onChangeSchema: handleChangeSchema(index),
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
                          key={`${props.keyPrefix || ""}${componentDefinition.component}-rendercomponent-${index}-edit`}
                          mode="edit"
                          onChangeData={props.onChangeData}
                          onChangeRootData={props.onChangeRootData}
                          onChangeSchema={handleChangeSchema(index)}
                          onVisibilityChange={props.onVisibilityChange}
                          path={path}
                          submit={props.submit}
                          userInterfaceData={props.data}
                        />
                      </ErrorBoundary>
                    )}
                  </DataPathContext>
                ))
            }
          </Droppable>
        )}
      </DataPathContext>
    </ComponentRendererModeContext.Provider>
  )
}, propsAreEqual)

function propsAreEqual(prevProps: ComponentRendererProps, nextProps: ComponentRendererProps) {
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
