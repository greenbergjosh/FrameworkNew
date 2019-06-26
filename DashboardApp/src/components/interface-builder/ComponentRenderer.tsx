import React from "react"
import { DataPathContext } from "../DataPathContext"
import { ComponentDefinition } from "./components/base/BaseInterfaceComponent"
import { Droppable, DroppableContextType } from "./dnd"
import { ComponentRegistryContext } from "./registry"
import { RenderInterfaceComponent } from "./RenderInterfaceComponent"
import { UserInterfaceProps } from "./UserInterface"

interface ComponentRendererProps {
  componentLimit?: number
  components: ComponentDefinition[]
  data: UserInterfaceProps["data"]
  mode?: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
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
  mode: propMode,
  onChangeData,
  onDrop,
}: ComponentRendererProps) => {
  const { componentRegistry } = React.useContext(ComponentRegistryContext)
  const contextMode = React.useContext(ComponentRendererModeContext)
  const mode = propMode || contextMode

  // console.log("ComponentRenderer.render", { components, data, onChangeData })

  const content = components.map((componentDefinition, index) => (
    <DataPathContext path={index} key={`${componentDefinition.component}-${index}`}>
      {(path) => (
        <RenderInterfaceComponent
          Component={componentRegistry.lookup(componentDefinition.component)}
          componentDefinition={componentDefinition}
          data={data}
          index={index}
          mode={mode}
          onChangeData={(newData) => {
            console.log("ComponentRenderer.render", "onChangeData", {
              componentDefinition,
              newData,
              onChangeData,
            })
            onChangeData && onChangeData(newData)
          }}
          path={path}
        />
      )}
    </DataPathContext>
  ))

  console.log("ComponentRenderer.render", components)

  return (
    <div>
      <ComponentRendererModeContext.Provider value={mode}>
        {mode === "edit" ? (
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
