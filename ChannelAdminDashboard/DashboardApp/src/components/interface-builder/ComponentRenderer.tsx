import { set } from "lodash/fp"
import React from "react"
import { DataPathContext } from "../DataPathContext"
import { ComponentDefinition } from "./components/base/BaseInterfaceComponent"
import { Droppable, DroppableContextType } from "./dnd"
import { ComponentRegistryContext } from "./registry"
import { RenderInterfaceComponent } from "./RenderInterfaceComponent"
import { EditUserInterfaceProps, UserInterfaceProps } from "./UserInterface"

interface ComponentRendererProps {
  componentLimit?: number
  components: ComponentDefinition[]
  data: UserInterfaceProps["data"]
  dragDropDisabled?: boolean
  mode?: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: EditUserInterfaceProps["onChangeSchema"]
  onDrop?: DroppableContextType["onDrop"]
}

export const ComponentRendererModeContext = React.createContext<UserInterfaceProps["mode"]>(
  "display"
)

export const UI_ROOT = "UI-Root"

export const ComponentRenderer = ({
  componentLimit,
  components,
  data,
  dragDropDisabled,
  mode: propMode,
  onChangeData,
  onChangeSchema,
  onDrop,
}: ComponentRendererProps) => {
  const { componentRegistry } = React.useContext(ComponentRegistryContext)
  const contextMode = React.useContext(ComponentRendererModeContext)
  const mode = propMode || contextMode

  const content = components.map((componentDefinition, index) => (
    <DataPathContext path={index} key={`${componentDefinition.component}-${index}`}>
      {(path) => (
        <RenderInterfaceComponent
          Component={componentRegistry.lookup(componentDefinition.component)}
          componentDefinition={componentDefinition}
          data={data}
          dragDropDisabled={dragDropDisabled}
          index={index}
          mode={mode}
          onChangeData={(newData) => {
            console.log("ComponentRenderer.render", "onChangeData", {
              componentDefinition,
              newData,
              onChangeData,
              data,
            })
            onChangeData && onChangeData(newData)
          }}
          onChangeSchema={(newComponentDefinition) => {
            if (mode === "edit") {
              console.log("ComponentRenderer.render", "onChangeSchema", {
                componentDefinition,
                newComponentDefinition,
                onChangeSchema,
                path,
                index,
                components,
              })
              // onChangeSchema && onChangeSchema(set(path, newComponentDefinition, components))
              onChangeSchema && onChangeSchema(set(index, newComponentDefinition, components))
            }
          }}
          path={path}
        />
      )}
    </DataPathContext>
  ))

  console.log("ComponentRenderer.render", { components, data })

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
                {({ isOver }) => content}
              </Droppable>
            )}
          </DataPathContext>
        ) : (
          content
        )}

        {/* <Alert
          type="info"
          message={
            <>
              Mode: {mode}
              <pre>{JSON.stringify(components, null, 2)}</pre>
            </>
          }
        /> */}
      </ComponentRendererModeContext.Provider>
    </div>
  )
}

ComponentRenderer.defaultProps = {
  components: [],
}
