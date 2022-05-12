import React from "react"
import { isEqual, isString, isUndefined } from "lodash/fp"
import { CodeEditor } from "../components/CodeEditor"
import { ChangeManagerProps, CodeEditorProps } from "../types"
import { usePrevious } from "./usePrevious"
import { UserInterfaceDataType } from "@opg/interface-builder"
import { normalize } from "./normalize"

export function ChangeManager(props: ChangeManagerProps) {
  const {
    autoSync,
    defaultValue,
    getValue,
    internalDocument,
    onEditorDocumentChange,
    onExternalDocumentChange,
    setValue,
    valueKey,
  } = props
  const prevInternalDocument = usePrevious<UserInterfaceDataType>(internalDocument)
  const prevExternalDocument = usePrevious<UserInterfaceDataType>(props.getValue(props.valueKey) || props.defaultValue)
  const [originalDocument, setOriginalDocument] = React.useState<UserInterfaceDataType>()

  /**
   * Synchronize document changes
   */
  React.useEffect(() => {
    if (!autoSync) {
      return
    }
    const externalDocument: UserInterfaceDataType = getValue(valueKey) || defaultValue

    // This props update does not involve the document. Do nothing.
    if (isEqual(normalize(externalDocument), normalize(internalDocument))) {
      return
    }

    // internalDocument has changed, push internalDocument to externalDocument.
    if (!isEqual(normalize(prevInternalDocument), normalize(internalDocument))) {
      // Set external document
      setValue([valueKey, internalDocument])
      return
    }

    // externalDocument has changed, put externalDocument into internalDocument.
    if (!isEqual(normalize(prevExternalDocument), normalize(externalDocument))) {
      if (!isUndefined(externalDocument) && isUndefined(originalDocument)) {
        // Capture the external document the first time.
        // Used for diffing in the editor.
        setOriginalDocument(externalDocument)
      }
      onExternalDocumentChange(externalDocument)
    }
  }, [
    autoSync,
    defaultValue,
    getValue,
    internalDocument,
    onExternalDocumentChange,
    originalDocument,
    prevExternalDocument,
    prevInternalDocument,
    setValue,
    valueKey,
  ])

  /**
   * Handle code editor changes.
   * If the editor's document has changed, put the editor's document into internalDocument state,
   * and push the editor document to the external model.
   * @param value
   * @param errors
   */
  const handleCodeEditorChange: CodeEditorProps["onChange"] = ({ value, errors }): void => {
    if (errors.isSome()) {
      console.error("CodeEditorInterfaceComponent.handleChange", { errors })
    }
    const externalDocument: UserInterfaceDataType = props.getValue(props.valueKey) || props.defaultValue

    if (!isEqual(normalize(externalDocument), normalize(value))) {
      onEditorDocumentChange(value)
      if (autoSync) {
        // Set external document
        setValue([valueKey, value])
      }
    }
  }

  /* ***********************************
   *
   * RENDER
   */

  return (
    <CodeEditor
      document={internalDocument}
      height={props.height || "400px"}
      language={props.defaultLanguage}
      mode={props.mode}
      onChange={handleCodeEditorChange}
      original={originalDocument}
      outputType={isString(prevExternalDocument) ? "string" : "json"}
      raiseEvent={props.raiseEvent}
      showMinimap={props.showMinimap}
      theme={props.defaultTheme}
      width={props.width || "100%"}
    />
  )
}
