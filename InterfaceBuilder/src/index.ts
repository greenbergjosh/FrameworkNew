// import "./lib/why-did-you-render"  // <-- Enable to trace unnecessary rendering
import "./styles/index.scss"
import { getRegistry } from "./services/registrySingleton"
import { UserInterfaceContextManager } from "./globalTypes/UserInterfaceContextManager"
import { JSONRecord } from "./globalTypes/JSONTypes"
import { TSEnum } from "./@types/ts-enum"
import { BaseInterfaceComponentProps, GetValue } from "./components/BaseInterfaceComponent/types"
import { LBMFunctionType } from "./lib/parseLBM"
import { CodeEditorProps } from "./plugins/monaco/code-editor/types"
import { EventPayloadType } from "./components/withEvents/types"
import { FormInterfaceComponentProps } from "./plugins/ant/form/FormInterfaceComponent"
import { SortableGroupableColumnModel } from "./plugins/syncfusion/table/types"

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
export type { BaseInterfaceComponentProps, GetValue }
export type { LBMFunctionType }
export type { CodeEditorProps }

/**
 * Contexts
 */
export { default as DragDropContext } from "./contexts/DragDropContext"
export { DataPathContext } from "./contexts/DataPathContext"
export { UserInterfaceContext } from "./contexts/UserInterfaceContext"

/**
 * Components
 */
export { BaseInterfaceComponent } from "./components/BaseInterfaceComponent/BaseInterfaceComponent"
export { ComponentRenderer } from "./components/ComponentRenderer/ComponentRenderer"
export { ConfirmableDeleteButton } from "./components/ConfirmableDeleteButton"
export { baseManageForm } from "./components/BaseInterfaceComponent/base-manage-form"
export { getDefaultsFromComponentDefinitions } from "./components/BaseInterfaceComponent/componentDefinitionUtils"
export { JSONEditor } from "./components/JSONEditor/JSONEditor"
export { getMergedData } from "./components/BaseInterfaceComponent/getMergedData"
export type { EventPayloadType }

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
export { sanitizeText } from "./lib/sanitizeText"

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
export type { FormInterfaceComponentProps }

/* Component piecemeal */
// TODO: Get rid of references to these and use the plugins
export type { SortableGroupableColumnModel }
export * as StandardGridTypes from "./plugins/syncfusion/table/StandardGrid/types"
export { default as StandardGrid } from "./plugins/syncfusion/table/StandardGrid/StandardGrid"
export { CodeEditor, supportedEditorTheme, editor, languages, Range } from "./plugins/monaco/code-editor/CodeEditor"
export { editorLanguages, EditorLangCodec, registerMonacoEditorMount } from "./plugins/monaco/code-editor/constants"
export * as CodeEditorTypes from "./plugins/monaco/code-editor/types"
