import Component from "@reach/component-component"
import React from "react"
import { Button, Icon } from "antd"
import { CodeEditorProps, CustomEditorWillMount, EditorLang } from "../types"
import Editor, { DiffEditor, EditorProps } from "@monaco-editor/react"
import { activeEditorSettings, diffEditorSettings } from "./constants"
import { editor, IDisposable, languages, MarkerSeverity, Range } from "monaco-editor"
import { isBoolean, isEmpty, isNull, isString, isUndefined } from "lodash/fp"
import { none, some, tryCatch } from "fp-ts/lib/Option"
import { UserInterfaceDataType } from "@opg/interface-builder"
import { _getCustomEditorWillMount } from "../registerMonacoEditorMount"

export const CodeEditor = React.memo(function CodeEditor(props: CodeEditorProps): JSX.Element | null {
  const defaultedLanguage = props.language || "json"
  const editorRef = React.useRef<editor.IStandaloneCodeEditor | null>(null)
  const formatDocumentPartial = (doc: CodeEditorProps["document"]) => formatDocument(doc, props.language)
  const [showDiff, setShowDiff] = React.useState(false)
  const [showMinimap, setShowMinimap] = React.useState<boolean>(
    isBoolean(props.showMinimap) ? props.showMinimap : false
  )
  const [draft, setDraft] = React.useState<string | undefined>()

  // TODO: using this React component key might allow the editor to update from external changes.
  //  would need a way to tell what is an external change from what is a change we pushed
  //  externally and is now propagating back into this component
  const [editorInstanceKey /*, setEditorInstanceKey*/] = React.useState<number>(0)

  /* ***********************************
   *
   * PROP WATCHERS
   */

  /**
   * Store original document version
   */
  const original = React.useMemo(() => {
    return formatDocumentPartial(props.original)
  }, [props.document, props.original, formatDocumentPartial])

  /**
   * Watch for external document changes
   */
  React.useEffect(() => {
    // TODO: see above note
    // setEditorInstanceKey(editorInstanceKey + 1)
    setDraft(formatDocumentPartial(props.document))
  }, [props.document, formatDocumentPartial])

  /* ***********************************
   *
   * EVENT HANDLERS
   */

  /**
   * Raise the event and pass editor value to CodeEditorInterfaceComponent's event handler
   * @param value
   */
  const handleChange: EditorProps["onChange"] = (value /*, event */) => {
    /*
     * Raise the event
     */
    props.raiseEvent && props.raiseEvent("valueChanged", { value }, CodeEditor)
    setDraft(value)

    if (!props.onChange || isUndefined(value) || isNull(value)) {
      return
    }

    /*
     * If the outputType is string then the document should remain a string,
     * push the editor document (which is already a string) to the parent (no parsing).
     */
    if (props.outputType === "string") {
      return props.onChange({ value, errors: none })
    }

    /*
     * If the language is not json then the document should remain a string,
     * push the editor document (which is already a string) to the parent (no parsing).
     */
    if (props.language !== "json") {
      return props.onChange({ value, errors: none })
    }

    /*
     * The editor's new document is empty,
     * so do nothing and wait for the user to fix it.
     */
    if (isNull(value) || isUndefined(value)) {
      return
    }

    /*
     * The language is json so parse the document
     */
    const parsed: UserInterfaceDataType = tryCatch(() => JSON.parse(value)).toUndefined()
    if (!isUndefined(parsed)) {
      return props.onChange({ value: parsed, errors: none })
    }

    /*
     * The editor's new document is invalid JSON,
     * so do nothing and wait for the user to fix it.
     */
  }

  /**
   * EditorDidMount
   */
  const handleEditorDidMount = React.useCallback(
    (getEditorValue, monaco: editor.IStandaloneCodeEditor, argsSetState) => {
      if (_getCustomEditorWillMount) {
        const customEditorWillMount = _getCustomEditorWillMount(
          languages.registerLinkProvider,
          languages.registerHoverProvider,
          Range
        )
        const willMountRegistry = [customEditorWillMount]
        const disposables = willMountRegistry.reduce(
          (acc: IDisposable[], customEditorWillMount: CustomEditorWillMount) => [
            ...acc,
            ...customEditorWillMount(monaco),
          ],
          []
        )

        monkeyPatchSetModelMarkers(props)
        argsSetState({ disposables })
      }

      /* Store editor in ref so we can get the current value from it later */
      editorRef.current = monaco

      /* Pass onMount to parent */
      if (props.editorDidMount) {
        props.editorDidMount && props.editorDidMount(getEditorValue, monaco)
      }
    },
    [props]
  )

  /* ***********************************
   *
   * RENDER
   */

  // The editor will only load external documents once,
  // so make sure we have a draft to edit.
  // TODO: see note above about editorInstanceKey
  if (!draft && props.mode === "display") {
    return null
  }

  return (
    <div style={{ lineHeight: "initial" }}>
      <Button.Group size="small" style={{ lineHeight: "initial" }}>
        <Button
          title="show diff"
          type={showDiff ? "primary" : "default"}
          onClick={() => setShowDiff(!showDiff)}
          style={{ borderBottomLeftRadius: 0 }}>
          <Icon theme="filled" type="diff" />
        </Button>
        <Button disabled>{defaultedLanguage}</Button>
        <Button
          style={{ borderBottomRightRadius: 0 }}
          type={showMinimap ? "primary" : "default"}
          onClick={() => setShowMinimap(!showMinimap)}>
          minimap
        </Button>
      </Button.Group>
      <div
        style={{
          resize: "vertical",
          overflow: "hidden",
          width: props.width,
          height: props.height,
          minHeight: 50,
          minWidth: 50,
          paddingBottom: 10,
          border: "solid 1px #a3a3a3",
          borderRadius: 3,
          borderTopLeftRadius: 0,
          backgroundColor: "#353535",
          lineHeight: "initial",
        }}>
        {showDiff ? (
          <DiffEditor
            height={props.height}
            language={defaultedLanguage}
            loading={<div>Loading...</div>}
            modified={draft}
            options={diffEditorSettings}
            original={original}
            theme={"vs-dark"}
            width={props.width}
          />
        ) : (
          <Component
            initialState={{ disposables: [] as IDisposable[] }}
            willUnmount={({ state }) => state.disposables.forEach((f: IDisposable) => f.dispose())}>
            {(args) => (
              <Editor
                key={editorInstanceKey}
                onMount={(editor /*, monaco*/) => {
                  handleEditorDidMount(editor.getValue, editor, args.setState)
                }}
                defaultValue={draft}
                height="100%"
                language={defaultedLanguage}
                loading={<div>Loading...</div>}
                onChange={handleChange}
                options={{ ...activeEditorSettings, minimap: { enabled: showMinimap } }}
                theme={props.theme || "vs-dark"}
                value={""}
                width="100%"
              />
            )}
          </Component>
        )}
      </div>
    </div>
  )
})

/**
 *
 * @param doc
 * @param language
 */
function formatDocument(doc: CodeEditorProps["document"], language: EditorLang): string {
  if (isEmpty(doc)) {
    return isString(doc) ? doc : ""
  }

  /* Reformat json */
  if (language === "json" && isString(doc)) {
    const value = tryCatch(() => JSON.parse(doc)).getOrElse({})
    return JSON.stringify(value, null, 2)
  }

  /* Don't stringify strings. For instance the language may be csharp or some text */
  if (isString(doc)) {
    return doc
  }

  /* Stringify anything else */
  return JSON.stringify(doc, null, 2) || ""
}

/**
 * Mutates editor with a setModelMarker method override
 * @param props
 */
function monkeyPatchSetModelMarkers(props: CodeEditorProps) {
  /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
  //@ts-ignore
  if (!editor.setModelMarkers._monkeyPatched) {
    const oldSetModelMarkers = editor.setModelMarkers
    editor.setModelMarkers = (model, language, markers) => {
      oldSetModelMarkers.call(editor, model, language, markers)
      const errors = markers
        .filter((marker) => marker.severity === MarkerSeverity.Error)
        .map((marker) => `${marker.message} on line ${marker.startLineNumber}:${marker.startColumn}`)
      if (props.onChange) {
        props.onChange({ value: model.getValue(), errors: some(errors) })
      }
    }
    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    //@ts-ignore
    editor.setModelMarkers._monkeyPatched = true
  }
}
