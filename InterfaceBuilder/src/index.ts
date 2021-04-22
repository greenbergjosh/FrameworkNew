import "./styles/index.scss"

/*
 * IMPORTANT:
 * Each export path must be preceded by "./"
 * to work in client projects.
 */

/**
 * Types
 */
export * from "./globalTypes"
export { UserInterfaceContextManager } from "./globalTypes/UserInterfaceContextManager"
export { JSONRecord } from "./globalTypes/JSONTypes"
export { TSEnum } from "./@types/ts-enum"
export { ComponentRegistryCache } from "./services/ComponentRegistry"
export { EventPayloadType } from "./services/EventBus"
export { BaseInterfaceComponentProps } from "./components/BaseInterfaceComponent/types"

/**
 * Contexts
 */
export { default as DragDropContext } from "./contexts/DragDropContext"
export { DataPathContext } from "./contexts/DataPathContext"
export { UserInterfaceContext } from "./contexts/UserInterfaceContext"

/**
 * Components
 */
export {
  BaseInterfaceComponent,
  getDefaultsFromComponentDefinitions,
} from "./components/BaseInterfaceComponent/BaseInterfaceComponent"
export { ComponentRenderer } from "./components/ComponentRenderer/ComponentRenderer"
export { ConfirmableDeleteButton } from "./components/ConfirmableDeleteButton"
export { baseManageForm } from "./components/BaseInterfaceComponent/baseManageForm"

/**
 * Services
 */
export { EventBus, EventBusEventHandler } from "./services/EventBus"
export { registry } from "./services/ComponentRegistry"
export { UserInterface } from "./components/UserInterface/UserInterface"

/**
 * Lib
 */
export * as utils from "./lib/parseLBM"
export { cheapHash } from "./lib/json"
export { deepDiff } from "./lib/deepDiff"
export { evalExpression } from "./lib/evalExpression"
export { Right } from "./lib/Either"
export { sanitizeText } from "./lib/sanitizeText"
export { shallowPropCheck } from "./lib/shallowPropCheck"

/**
 * Plugins
 */
export * from "./plugins"

/* Components to be overridden by clients */
// TODO: export each plugin component from its plugin index
export * as Link from "./plugins/ant/link"
export * as Pie from "./plugins/nivo/pie"
export * as QueryBuilder from "./plugins/ant/query-builder"
export * as StringTemplate from "./plugins/ant/string-template"
export * as Table from "./plugins/syncfusion/table"
export { getIconSelectConfig } from "./plugins/ant/_shared/icon-select-form-config"
export { FormInterfaceComponentProps } from "./plugins/ant/form/FormInterfaceComponent"

/* Component piecemeal */
// TODO: Get rid of references to these and use the plugins
export { SortableGroupableColumnModel } from "./plugins/syncfusion/table/types"
export { EnrichedColumnDefinition } from "./plugins/syncfusion/table/StandardGrid/types"
export { default as StandardGrid } from "./plugins/syncfusion/table/StandardGrid/StandardGrid"
export {
  CodeEditor,
  editorLanguages,
  EditorLangCodec,
  registerMonacoEditorMount,
  supportedEditorTheme,
  EditorLang,
  EditorTheme,
} from "./plugins/monaco/code-editor/code-editor"
