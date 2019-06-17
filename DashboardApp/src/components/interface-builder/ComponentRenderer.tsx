import { Alert } from "antd"
import React from "react"
import { DataPathContext } from "../DataPathContext"
import { ComponentDefinition } from "./components/base/BaseInterfaceComponent"
import { Droppable, DroppableContextType, DroppablePlaceholder } from "./dnd"
import { ComponentRegistryContext } from "./registry"
import { RenderInterfaceComponent } from "./RenderInterfaceComponent"
import { UserInterfaceProps } from "./UserInterface"

interface ComponentRendererProps {
  components: ComponentDefinition[]
  mode?: UserInterfaceProps["mode"]
  onDrop?: DroppableContextType["onDrop"]
}

const ComponentRendererModeContext = React.createContext<UserInterfaceProps["mode"]>("display")

export const ComponentRenderer = ({
  components,
  mode: propMode,
  onDrop,
}: ComponentRendererProps) => {
  const { componentRegistry } = React.useContext(ComponentRegistryContext)
  const contextMode = React.useContext(ComponentRendererModeContext)
  const mode = propMode || contextMode

  const content = components.length ? (
    components.map((componentDefinition, index) => (
      <DataPathContext path={index} key={`${componentDefinition.component}-${index}`}>
        {(path) => (
          <RenderInterfaceComponent
            Component={componentRegistry.lookup(componentDefinition.component)}
            componentDefinition={componentDefinition}
            index={index}
            mode={mode}
            path={path}
          />
        )}
      </DataPathContext>
    ))
  ) : (
    <DroppablePlaceholder x={0} y={0} width={0} />
  )

  return (
    <div>
      <ComponentRendererModeContext.Provider value={mode}>
        {mode === "edit" ? (
          <DataPathContext>
            {(path) => (
              <Droppable droppableId={path || "UI-Root"} onDrop={onDrop} type="INTERFACE_COMPONENT">
                {({ isOver }) => {
                  return <>{content}</>
                }}
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
