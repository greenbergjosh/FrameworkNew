import { Alert } from "antd"
import React from "react"
import { Draggable, Droppable } from "react-beautiful-dnd"
import { DataPathContext } from "../DataPathContext"
import { BaseInterfaceComponent, ComponentDefinition } from "./components/BaseInterfaceComponent"
import { ComponentRegistryContext } from "./registry"
import { selfContainedDrop, UserInterfaceProps } from "./UserInterface"

interface ComponentRendererProps {
  components: ComponentDefinition[]
  mode: UserInterfaceProps["mode"]
}

export const ComponentRenderer = ({ components, mode }: ComponentRendererProps) => {
  const { componentRegistry } = React.useContext(ComponentRegistryContext)
  const content = components.map((componentDefinition, index) => (
    <DataPathContext path={index}>
      {(path) => (
        <RenderInterfaceComponent
          key={`${componentDefinition.component}-${index}`}
          Component={componentRegistry.lookup(componentDefinition.component)}
          componentDefinition={componentDefinition}
          index={index}
          mode={mode}
          path={path}
        />
      )}
    </DataPathContext>
  ))

  const droppableId = `InterfaceComponentPreview-${Math.round(Math.random() * 10000)}`

  return (
    <div>
      {mode === "edit" ? (
        <DataPathContext>
          {(path) =>
            (console.log("Component Renderer path", path), 0) || (
              <Droppable droppableId={path || "UI-Root"} type="INTERFACE_COMPONENT">
                {(provided, snapshot, ...args) => {
                  const badDrop = selfContainedDrop(
                    snapshot.draggingOverWith || "",
                    null,
                    path || "UI-Root"
                  )
                  return (
                    <div
                      ref={provided.innerRef}
                      id={path || "UI-Root"}
                      {...provided.droppableProps}
                      style={{
                        minHeight: "40px",
                        borderWidth: "1px",
                        borderStyle: badDrop ? "solid" : "dashed",
                        borderColor: snapshot.isDraggingOver
                          ? badDrop
                            ? "red"
                            : "gray"
                          : "transparent",
                      }}>
                      {content}
                      {!badDrop && provided.placeholder}
                      {provided.placeholder && (
                        <div data-react-beautiful-dnd-placeholder>
                          {/* Drop Components Here */}
                          {
                            (console.log("Rendering Placeholder", {
                              path,
                              provided,
                              snapshot,
                              args,
                            }),
                            null)
                          }
                        </div>
                      )}
                    </div>
                  )
                }}
              </Droppable>
            )
          }
        </DataPathContext>
      ) : (
        content
      )}

      <Alert
        type="info"
        message={
          <>
            Mode: {mode}
            <pre>{JSON.stringify(components, null, 2)}</pre>
          </>
        }
      />
    </div>
  )
}

interface RenderInterfaceComponentProps {
  Component: typeof BaseInterfaceComponent
  componentDefinition: ComponentDefinition
  index: number
  mode: UserInterfaceProps["mode"]
  path: string
}

const RenderInterfaceComponent = ({
  Component,
  componentDefinition,
  index,
  mode,
  path,
}: RenderInterfaceComponentProps) => {
  if (!Component) {
    console.error("Missing Component", { componentDefinition, index, mode })
  }
  const content = Component ? (
    <Component {...componentDefinition} mode={mode} />
  ) : (
    <DebugComponent componentDefinition={componentDefinition} index={index} mode={mode} />
  )

  const wrapper = componentDefinition.label ? (
    <div className="label-wrapper">
      <div>
        <label>{componentDefinition.label}</label>
      </div>
      {content}
    </div>
  ) : (
    content
  )

  return mode === "edit" ? (
    <Draggable key={path} draggableId={path} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ width: "100%", ...provided.draggableProps.style }}>
          {wrapper}
        </div>
      )}
    </Draggable>
  ) : (
    wrapper
  )
}

const DebugComponent = (props: any) => (
  <Alert closable={false} message={<pre>{JSON.stringify(props, null, 2)}</pre>} type="warning" />
)
