import { TSEnum as _TSEnum } from "./@types/ts-enum"
import { JSONRecord as _JSONRecord } from "./components/interface-builder/@types/JSONTypes"
import {
  ComponentDefinition as _ComponentDefinition,
  ComponentDefinitionNamedProps as _ComponentDefinitionNamedProps,
  ComponentRenderMetaProps as _ComponentRenderMetaProps,
} from "./components/interface-builder/components/base/BaseInterfaceComponent"
import { FormInterfaceComponentProps as _FormInterfaceComponentProps } from "./components/interface-builder/components/form/FormInterfaceComponent"
import { UserInterfaceProps as _UserInterfaceProps } from "./components/interface-builder/UserInterface"
import { UserInterfaceContextManager as _UserInterfaceContextManager } from "./components/interface-builder/UserInterfaceContextManager"
import { EnrichedColumnDefinition as _EnrichedColumnDefinition } from "./components/grid/types"
import "./styles/index.scss"
/**
 * Framework Components
 */
import * as utils from "./components/interface-builder/components/_shared/LBM/parseLBM"
import * as StringTemplate from "./components/interface-builder/components/special/string-template"
import * as QueryBuilder from "./components/interface-builder/components/special/query-builder"

/**
 * Framework
 */
export { default as DragDropContext } from "./components/interface-builder/dnd/util/DragDropContext"
export { default as antComponents } from "./plugins/ant.ibplugin"
export { default as nivoComponents } from "./plugins/nivo.ibplugin"
export { default as htmlComponents } from "./plugins/html.ibplugin"
export { BaseInterfaceComponent } from "./components/interface-builder/components/base/BaseInterfaceComponent"
export { baseManageForm } from "./components/interface-builder/components/base/base-component-form"
export { ComponentRenderer } from "./components/interface-builder/ComponentRenderer"
export { DataPathContext } from "./components/interface-builder/util/DataPathContext"
export { getDefaultsFromComponentDefinitions } from "./components/interface-builder/components/base/BaseInterfaceComponent"
export { registry } from "./components/interface-builder/registry"
export { UserInterface } from "./components/interface-builder/UserInterface"
export { UserInterfaceContext } from "./components/interface-builder/UserInterfaceContextManager"

/**
 * Utility
 */
export { cheapHash } from "./components/interface-builder/util/json"
export { deepDiff } from "./components/interface-builder/lib/deep-diff"
export { evalExpression } from "./components/interface-builder/lib/eval-expression"
export { Right } from "./components/interface-builder/lib/Either"
export { sanitizeText } from "./components/interface-builder/lib/sanitize-text"
export { shallowPropCheck } from "./components/interface-builder/dnd"
export { getIconSelectConfig } from "./components/interface-builder/components/form/_shared/icon-select-form-config"

export { utils }
export {
  CodeEditor,
  editorLanguages,
  EditorLangCodec,
  registerMonacoEditorMount,
  supportedEditorTheme,
  EditorLang,
  EditorTheme,
} from "./components/interface-builder/components/special/code-editor/code-editor"
export { StringTemplate, QueryBuilder }

/**
 * Non-Framework Components
 */
export { ConfirmableDeleteButton } from "./components/button/confirmable-delete"
export { StandardGrid } from "./components/grid/StandardGrid"

/**
 * Re-exported Types
 * Because you can't export a type directly from another module
 */
export type ComponentDefinition = _ComponentDefinition
export type ComponentDefinitionNamedProps = _ComponentDefinitionNamedProps
export type ComponentRenderMetaProps = _ComponentRenderMetaProps
export type FormInterfaceComponentProps = _FormInterfaceComponentProps
export type JSONRecord = _JSONRecord
export type TSEnum<T extends string | undefined> = _TSEnum<T>
export type UserInterfaceContextManager<T> = _UserInterfaceContextManager<T>
export type UserInterfaceProps = _UserInterfaceProps
export type EnrichedColumnDefinition = _EnrichedColumnDefinition
