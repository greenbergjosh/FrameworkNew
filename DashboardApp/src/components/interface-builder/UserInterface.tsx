import { Divider, Layout, Typography } from "antd"
import _ from "lodash"
import { get, set } from "lodash/fp"
import React from "react"
import { moveInList } from "../../lib/move-in-list"
import { ComponentRenderer } from "./ComponentRenderer"
import { ComponentDefinition } from "./components/BaseInterfaceComponent"
import { InterfaceComponentChoices } from "./InterfaceComponentChoices"
import { ComponentRegistryContext, registry } from "./registry"
import {
  DragDropContext,
  DragStart,
  DragUpdate,
  ResponderProvided,
  DropResult,
} from "react-beautiful-dnd"

interface IUserInterfaceProps {
  mode: "display" | "edit"
  components: ComponentDefinition[]
}

interface DisplayUserInterfaceProps extends IUserInterfaceProps {
  mode: "display"
}

interface EditUserInterfaceProps extends IUserInterfaceProps {
  mode: "edit"
  onChange: (schema: ComponentDefinition[]) => void
}

export type UserInterfaceProps = DisplayUserInterfaceProps | EditUserInterfaceProps

export class UserInterface extends React.Component<UserInterfaceProps> {
  onBeforeDragStart = (start: DragStart) => {
    console.log("Drag Start", start)
  }
  onDragStart = (start: DragStart, provided: ResponderProvided) => {}
  onDragUpdate = (update: DragUpdate, provided: ResponderProvided) => {
    // relocatePlaceholder(update.destination)
  }
  onDragEnd = (result: DropResult, provided: ResponderProvided) => {
    if (this.props.mode === "edit") {
      console.log("Drag End ", result)
      const { components, onChange } = this.props
      const { destination, source } = result
      // Whatever was dragged wasn't dropped anywhere, or was dropped in its original location
      if (
        !destination ||
        (destination.droppableId === source.droppableId && destination.index === source.index)
      ) {
        return
      }

      // Rearranged in the same list
      if (destination.droppableId === source.droppableId) {
        const list =
          destination.droppableId === "UI-Root"
            ? components
            : (get(destination.droppableId, components) as ComponentDefinition[])
        const updatedList = moveInList(list, source.index, destination.index)
        const newComponents =
          destination.droppableId === "UI-Root"
            ? updatedList
            : set(destination.droppableId, updatedList, components)

        onChange && onChange(newComponents)
      } else if (!selfContainedDrop(source.droppableId, source.index, destination.droppableId)) {
        const sourceList =
          source.droppableId === "UI-Root"
            ? components
            : (get(source.droppableId, components) as ComponentDefinition[])
        const updatedSourceList = [
          ...sourceList.slice(0, source.index),
          ...sourceList.slice(source.index + 1),
        ]

        const destinationList =
          destination.droppableId === "UI-Root"
            ? components
            : (get(destination.droppableId, components) as ComponentDefinition[])
        const updatedDestinationList = [
          ...destinationList.slice(0, destination.index),
          sourceList[source.index],
          ...destinationList.slice(destination.index),
        ]

        if (source.droppableId === "UI-Root") {
          const newComponents = set(
            destination.droppableId,
            updatedDestinationList,
            updatedSourceList
          )
          onChange && onChange(newComponents)
        } else if (destination.droppableId === "UI-Root") {
          const newComponents = set(source.droppableId, updatedSourceList, updatedDestinationList)
          onChange && onChange(newComponents)
        } else if (source.droppableId.startsWith(destination.droppableId)) {
          const interimComponents = set(source.droppableId, updatedSourceList, components)
          const destinationList =
            destination.droppableId === "UI-Root"
              ? interimComponents
              : (get(destination.droppableId, interimComponents) as ComponentDefinition[])
          const updatedDestinationList = [
            ...destinationList.slice(0, destination.index),
            sourceList[source.index],
            ...destinationList.slice(destination.index),
          ]

          const newComponents = set(
            destination.droppableId,
            updatedDestinationList,
            interimComponents
          )
          onChange && onChange(newComponents)
        } else {
          const newComponents = set(
            destination.droppableId,
            updatedDestinationList,
            set(source.droppableId, updatedSourceList, components)
          )
          onChange && onChange(newComponents)
        }
      }
    }
  }

  render() {
    const { mode, components } = this.props

    const content = <ComponentRenderer components={components} mode={mode} />

    return (
      <ComponentRegistryContext.Provider value={{ componentRegistry: registry }}>
        {mode === "edit" ? (
          <DragDropContext
            onBeforeDragStart={this.onBeforeDragStart}
            onDragStart={this.onDragStart}
            onDragUpdate={this.onDragUpdate}
            onDragEnd={this.onDragEnd}>
            <Layout>
              <Layout.Sider style={{ background: "#fff" }}>
                <Typography.Title level={4}>Components</Typography.Title>
                <Divider />
                <InterfaceComponentChoices />
              </Layout.Sider>
              <Layout>
                <Layout.Content
                  style={{
                    margin: "24px 16px",
                    padding: 24,
                    background: "#fff",
                    minHeight: 280,
                  }}>
                  {content}
                </Layout.Content>
              </Layout>
            </Layout>
          </DragDropContext>
        ) : (
          content
        )}
      </ComponentRegistryContext.Provider>
    )
  }
}

interface HasStyle {
  style: {}
}

function createPlaceholderFromShiftedItem(
  shiftedItem?: HTMLElement,
  PlaceholderComponent: string | React.ComponentType<HasStyle> = "div"
) {
  if (!shiftedItem || !shiftedItem.style.transform) return

  const [_, widthFactor, heightFactor] = shiftedItem.style.transform.match(
    /translate\((\d+)px, (\d+)px\)/
  )

  const rect = shiftedItem.getBoundingClientRect()
  const style = {
    position: "absolute",
    width: widthFactor || "100%",
    height: heightFactor || "100%",
    top: rect.top,
    left: rect.left,
  }

  return <PlaceholderComponent style={style} />
}

function relocatePlaceholder(destination: DragUpdate["destination"]) {
  if (destination) {
    const destinationDroppable = document.getElementById(destination.droppableId)

    if (destinationDroppable) {
      const shiftedItem = destinationDroppable.querySelectorAll(
        `[data-react-beautiful-dnd-draggable="${destination.index}"]`
      )[0] as HTMLElement

      const placeholderItem = destinationDroppable.querySelectorAll(
        `[data-react-beautiful-dnd-placeholder]`
      )[0] as HTMLElement

      if (placeholderItem) {
        if (shiftedItem && shiftedItem.style.transform) {
          const [_, widthFactor, heightFactor] = shiftedItem.style.transform.match(
            /translate\((\d+)px, (\d+)px\)/
          )
          const rect = shiftedItem.getBoundingClientRect()

          const style = {
            position: "absolute",
            // width: widthFactor || "100%",
            // height: heightFactor || "100%",
            top: rect.top,
            left: rect.left,
          }
          Object.assign(placeholderItem.style, style)
        } else {
          placeholderItem.style.position = "static"
        }
      }

      // if (!shiftedItem || !shiftedItem.style.transform) return
    }
  }
}

export function selfContainedDrop(
  sourceId: string,
  sourceIndex: number | null,
  destinationId: string
) {
  const sourcePath = `${
    sourceId === "UI-Root" ? sourceIndex : sourceId + (sourceIndex ? "." + sourceIndex : "")
  }.`
  console.log("selfContainedDrop", { destinationId, sourcePath })
  return destinationId.startsWith(sourcePath)
}
