// import "./lib/why-did-you-render"  // <-- Enable to trace unnecessary rendering
import "./styles/index.scss"
import getRegistry from "./services/registrySingleton"
import { UserInterfaceContextManager } from "./globalTypes/UserInterfaceContextManager"
import { JSONRecord } from "./globalTypes/JSONTypes"
import { TSEnum } from "./@types/ts-enum"
import { BaseInterfaceComponentProps, GetValue, SetValue } from "./components/BaseInterfaceComponent/types"
import { LBMFunctionType } from "./lib/parseLBM"
import { EventPayloadType } from "./components/withEvents/types"
import { ImportFactory, RegisterableComponent } from "./services/ComponentRegistry"

/*
 * IMPORTANT:
 * Each export path must be preceded by "./"
 * to work in client projects.
 */

/**
 * Types
 */
export * from "./globalTypes"
export type { UserInterfaceContextManager }
export type { JSONRecord }
export type { TSEnum }
export type { BaseInterfaceComponentProps, GetValue, SetValue }
export type { LBMFunctionType }
export type { EventPayloadType }
export type { ImportFactory, RegisterableComponent }
export { JSONEditorProps } from "./components/JSONEditor/types"
export { AbstractBaseInterfaceComponentType, KVPTuple } from "./components/BaseInterfaceComponent/types"
export { DraggedItemProps, DroppableTargetProps, Droppable } from "./components/DragAndDrop"
export { ComponentRendererProps } from "./components/RenderComponents/types"

/**
 * Contexts
 */
export { default as DragDropContext } from "./contexts/DragDropContext"
export { DataPathContext } from "./contexts/DataPathContext"
export { UserInterfaceContext } from "./contexts/UserInterfaceContext"
export { ComponentRendererModeContext } from "./contexts/ComponentRendererModeContext"

/**
 * Components
 */
export { BaseInterfaceComponent } from "./components/BaseInterfaceComponent/BaseInterfaceComponent"
export { RenderComponent as RenderInterfaceComponent } from "./components/RenderComponents/RenderComponent/RenderComponent"
export { Undraggable } from "./components/DragAndDrop/Undraggable"
export { Draggable } from "./components/DragAndDrop/Draggable"
export { RenderComponents as ComponentRenderer } from "./components/RenderComponents/RenderComponents"
export { ConfirmableDeleteButton } from "./components/ConfirmableDeleteButton"
export { baseManageForm } from "./components/BaseInterfaceComponent/base-manage-form"
export { getDefaultsFromComponentDefinitions } from "./components/BaseInterfaceComponent/componentDefinitionUtils"
export { JSONEditor } from "./components/JSONEditor/JSONEditor"
export { getMergedData } from "./components/BaseInterfaceComponent/getMergedData"
export { EventBus } from "./components/withEvents/EventBus"
export { EditPanelWrapper } from "./components/RenderComponents/ComponentDecorators/withEditPanel/EditPanelWrapper"

/**
 * Services
 */
export const registry = getRegistry()
export { UserInterface } from "./components/UserInterface/UserInterface"

/**
 * Lib
 */
export * as utils from "./lib/parseLBM"
export { cheapHash } from "./lib/json"
export { deepDiff } from "./lib/deepDiff"
export { evalExpression } from "./lib/evalExpression"
export { Right } from "./lib/Either"
export { usePrevious } from "./lib/usePrevious"
export { sanitizeText } from "./lib/sanitizeText"
export * from "./lib/Option"
export * from "./lib/formatNumber"
export * from "./lib/valueFormatter"
export * from "./lib/getValue"
export { ComponentModifierProps } from "components/RenderComponents/types"
