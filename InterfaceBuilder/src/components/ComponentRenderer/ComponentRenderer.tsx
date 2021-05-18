import { set } from "lodash/fp"
import React from "react"
import { deepDiff } from "../../lib/deepDiff"
import { DataPathContext } from "../../contexts/DataPathContext"
import { Droppable } from "../DragAndDrop"
import { shallowPropCheck } from "../../lib/shallowPropCheck"
import { DetokenizedComponent } from "./components/DetokenizedComponent"
import { ComponentRendererProps } from "./types"
import { ComponentRendererModeContext } from "../../contexts/ComponentRendererModeContext"
import { ComponentDefinition } from "../../globalTypes"

export const UI_ROOT = "UI-Root"

export const _ComponentRenderer = ({
  componentLimit,
  components,
  data,
  getRootData,
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
  const handleChangeSchema = React.useCallback(
    (index: number) => (newComponentDefinition: ComponentDefinition) => {
      if (mode === "edit") {
        onChangeSchema && onChangeSchema(set(index, newComponentDefinition, components))
      }
    },
    [components, mode, onChangeSchema]
  )

  const content = components.map((componentDefinition, index) => {
    return (
      <DataPathContext path={index} key={`${keyPrefix || ""}${componentDefinition.component}-${index}`}>
        {(path) => (
          <DetokenizedComponent
            componentDefinition={componentDefinition}
            data={data}
            dragDropDisabled={dragDropDisabled}
            getRootData={getRootData}
            index={index}
            mode={mode}
            onChangeData={onChangeData}
            onChangeSchema={handleChangeSchema(index)}
            path={path}
            submit={submit}
          />
        )}
      </DataPathContext>
    )
  })

  // console.log("ComponentRenderer.render", { components, data })

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
}

_ComponentRenderer.defaultProps = {
  components: [],
}

export const ComponentRenderer = React.memo(_ComponentRenderer, (prevProps, nextProps) => {
  const simplePropEquality = shallowPropCheck(["components", "data", "mode"])(prevProps, nextProps)
  const runDeepDiff = () => deepDiff(prevProps, nextProps, (k) => ["onChangeSchema", "onChangeData"].includes(k))
  // console.log("ComponentRenderer.memo", simplePropEquality, runDeepDiff())

  return simplePropEquality && !runDeepDiff()
})
