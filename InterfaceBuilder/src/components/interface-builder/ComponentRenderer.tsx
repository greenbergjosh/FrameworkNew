import { set } from "lodash/fp"
import React from "react"
import { deepDiff } from "./lib/deep-diff"
import { DataPathContext } from "./util/DataPathContext"
import { ComponentDefinition } from "./components/base/BaseInterfaceComponent"
import { Droppable, DroppableContextType, shallowPropCheck } from "./dnd"
import { registry } from "./registry"
import { RenderInterfaceComponent } from "./RenderInterfaceComponent"
import { EditUserInterfaceProps, UserInterfaceProps } from "./UserInterface"

interface ComponentRendererProps {
  componentLimit?: number
  components: ComponentDefinition[]
  data: UserInterfaceProps["data"]
  getRootData: () => UserInterfaceProps["data"]
  dragDropDisabled?: boolean
  mode?: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: EditUserInterfaceProps["onChangeSchema"]
  submit?: UserInterfaceProps["submit"]
  onDrop?: DroppableContextType["onDrop"]
}

export const ComponentRendererModeContext = React.createContext<UserInterfaceProps["mode"]>("display")

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
}: ComponentRendererProps): JSX.Element => {
  // const { componentRegistry } = React.useContext(ComponentRegistryContext)
  const contextMode = React.useContext(ComponentRendererModeContext)
  const mode = propMode || contextMode

  const handleChangeSchema = React.useCallback(
    (index: number) => (newComponentDefinition: ComponentDefinition) => {
      if (mode === "edit") {
        // console.log("ComponentRenderer.render", "onChangeSchema", {
        //   componentDefinition,
        //   newComponentDefinition,
        //   onChangeSchema,
        //   path,
        //   index,
        //   components,
        // })
        // onChangeSchema && onChangeSchema(set(path, newComponentDefinition, components))
        onChangeSchema && onChangeSchema(set(index, newComponentDefinition, components))
      }
    },
    [components, mode, onChangeSchema]
  )

  const content = components.map((componentDefinition, index) => (
    <DataPathContext path={index} key={`${componentDefinition.component}-${index}`}>
      {(path) => (
        <RenderInterfaceComponent
          Component={registry.lookup(componentDefinition.component)}
          componentDefinition={componentDefinition}
          data={data}
          getRootData={getRootData}
          dragDropDisabled={dragDropDisabled}
          index={index}
          mode={mode}
          onChangeData={onChangeData}
          onChangeSchema={handleChangeSchema(index)}
          submit={submit}
          path={path}
        />
      )}
    </DataPathContext>
  ))

  // console.log("ComponentRenderer.render", { components, data })

  return (
    <div>
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
    </div>
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
