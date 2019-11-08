import { TSEnum } from "./@types/ts-enum"
import { JSONRecord } from "./components/interface-builder/@types/JSONTypes"
import { ComponentDefinition } from "./components/interface-builder/components/base/BaseInterfaceComponent"
import { ComponentDefinitionNamedProps } from "./components/interface-builder/components/base/BaseInterfaceComponent"
import { ComponentRenderMetaProps } from "./components/interface-builder/components/base/BaseInterfaceComponent"
import { FormInterfaceComponentProps } from "./components/interface-builder/components/form/FormInterfaceComponent"
import { UserInterfaceProps } from "./components/interface-builder/UserInterface"
import { UserInterfaceContextManager } from "./components/interface-builder/UserInterfaceContextManager"

/**
 * Framework
 */
export { default as antComponents } from "./plugins/ant.ibplugin"
export {
  BaseInterfaceComponent,
} from "./components/interface-builder/components/base/BaseInterfaceComponent"
export { baseManageForm } from "./components/interface-builder/components/base/base-component-form"
export {
  CodeEditor,
} from "./components/interface-builder/components/special/code-editor/code-editor"
export { ComponentRenderer } from "./components/interface-builder/ComponentRenderer"
export { DataPathContext } from "./components/interface-builder/util/DataPathContext"
export {
  getDefaultsFromComponentDefinitions,
} from "./components/interface-builder/components/base/BaseInterfaceComponent"
export {
  registerMonacoEditorMount,
} from "./components/interface-builder/components/special/code-editor/code-editor"
export { registry } from "./components/interface-builder/registry"
export { UserInterface } from "./components/interface-builder/UserInterface"
export { UserInterfaceContext } from "./components/interface-builder/UserInterfaceContextManager"

/**
 * Types
 */
export {
  EditorLangCodec,
} from "./components/interface-builder/components/special/code-editor/code-editor"

/**
 * Utility
 */
export { cheapHash } from "./components/interface-builder/util/json"
export { deepDiff } from "./components/interface-builder/lib/deep-diff"
export { evalExpression } from "./components/interface-builder/lib/eval-expression"
export { Right } from "./components/interface-builder/lib/Either"
export { sanitizeText } from "./components/interface-builder/lib/sanitize-text"
export { shallowPropCheck } from "./components/interface-builder/dnd"

/**
 * Non-Framework Components
 */
export { ConfirmableDeleteButton } from "./components/button/confirmable-delete"

/**
 * Re-exported Types
 * Because you can't export a type directly from another module
 */
export type ComponentDefinition = ComponentDefinition
export type ComponentDefinitionNamedProps = ComponentDefinitionNamedProps
export type ComponentRenderMetaProps = ComponentRenderMetaProps
export type FormInterfaceComponentProps = FormInterfaceComponentProps
export type JSONRecord = JSONRecord
export type TSEnum<T extends string | undefined> = TSEnum<T>
export type UserInterfaceContextManager = UserInterfaceContextManager
export type UserInterfaceProps = UserInterfaceProps
