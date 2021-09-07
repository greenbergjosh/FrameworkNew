import Component from "@reach/component-component"
import { Button, Card, Icon } from "antd"
import { none, some, tryCatch } from "fp-ts/lib/Option"
import { editor, IDisposable, MarkerSeverity } from "monaco-editor"
import React from "react"
import { ControlledEditor, DiffEditor, EditorProps } from "@monaco-editor/react"
import { None, Some } from "../../lib/Option"
import { CodeEditorProps, CustomEditorWillMount, MonacoEditorProps } from "./types"
import { diffEditorSettings, inactiveEditorSettings, willMountRegistry } from "./constants"
import { isNull, isString, isUndefined } from "lodash/fp"
import { UserInterfaceDataType } from "../../globalTypes"

export { editor, languages, Range } from "monaco-editor"
export { supportedEditorTheme } from "./code-editor-manage-form"

/* ########################################################################
 *
 * ABOUT @monaco-editor/react and service workers
 *
 * We use @monaco-editor/react instead of react-monaco-editor because
 * this lib does not require a webpack plugin, and this repo uses rollup.
 * https://github.com/suren-atoyan/monaco-react
 *
 * Register language service workers (below) using the "manual" method.
 * https://github.com/Microsoft/monaco-editor/blob/master/docs/integrate-esm.md#option-2-using-plain-webpack
 * https://github.com/microsoft/monaco-editor-samples/blob/master/browser-esm-webpack-small/webpack.config.js
 */
;(window as any).MonacoEnvironment = {
  getWorkerUrl(moduleId: string, label: string) {
    if (label === "json") {
      return "/monaco/json.worker.js"
    }
    if (label === "typescript" || label === "javascript") {
      return "/monaco/ts.worker.js"
    }
    return "/monaco/editor.worker.js"
  },
}

/**
 * CodeEditor
 */
export const CodeEditor = React.memo(function CodeEditor(props: CodeEditorProps): JSX.Element {
  const monacoRef = React.useRef<editor.IStandaloneCodeEditor | null>(null)
  const [showDiff, setShowDiff] = React.useState(false)

  /* ***********************************
   *
   * PROP WATCHERS
   */

  /**
   * Watch for external changes
   */
  const monacoEditorProps: MonacoEditorProps = React.useMemo(() => {
    const documentFormattedString = isString(props.document) ? props.document : JSON.stringify(props.document, null, 2)

    return props.documentDraft.foldL(
      None(() => ({
        defaultValue: documentFormattedString,
        options: inactiveEditorSettings,
        originalValue: documentFormattedString,
        value: documentFormattedString,
      })),
      Some((documentDraft: string) => {
        const documentFormattedDraftString = isString(documentDraft)
          ? documentDraft
          : JSON.stringify(documentDraft, null, 2)

        return {
          defaultValue: documentFormattedDraftString,
          options: diffEditorSettings,
          originalValue: documentFormattedString,
          value: documentFormattedDraftString,
        }
      })
    )
  }, [props.document, props.documentDraft])

  /* ***********************************
   *
   * EVENT HANDLERS
   */

  /**
   * Pass editor value to parent's event handler
   * @param event
   * @param value
   */
  const handleChange = (event: editor.IModelContentChangedEvent, value: EditorProps["value"]) => {
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
      /* https://github.com/microsoft/monaco-editor/issues/32 */
      // monaco.getAction("editor.action.formatDocument").run()

      const disposables = willMountRegistry.reduce(
        (acc: IDisposable[], customEditorWillMount: CustomEditorWillMount) => [
          ...acc,
          ...customEditorWillMount(monaco),
        ],
        []
      )

      /*
       * Monkey patch setModelMarkers
       */
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
      argsSetState({ disposables })

      /*
       * Save the monaco instance in a ref
       * https://github.com/suren-atoyan/monaco-react#monaco-instance
       */
      monacoRef.current = monaco
      // formatDocument(monaco)

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

  const defaultedLanguage = props.language || "json"

  return (
    <Card
      bodyStyle={{ display: "none" }}
      bordered={false}
      cover={
        <>
          <Button.Group size="small">
            <Button title="show diff" type={showDiff ? "primary" : "default"} onClick={() => setShowDiff(!showDiff)}>
              <Icon theme="filled" type="diff" />
            </Button>
            <Button disabled>{defaultedLanguage}</Button>
          </Button.Group>
          {showDiff ? (
            <DiffEditor
              height={props.height}
              language={defaultedLanguage}
              onChange={handleChange}
              options={monacoEditorProps.options}
              original={monacoEditorProps.originalValue}
              /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
              // @ts-ignore
              theme={"vs-dark"}
              value={monacoEditorProps.value}
              width={props.width}
            />
          ) : (
            <Component
              initialState={{ disposables: [] as IDisposable[] }}
              willUnmount={({ state }) => state.disposables.forEach((f) => f.dispose())}>
              {(args) => (
                <ControlledEditor
                  editorDidMount={(getEditorValue, editor) =>
                    handleEditorDidMount(getEditorValue, editor, args.setState)
                  }
                  height={props.height}
                  language={defaultedLanguage}
                  onChange={handleChange}
                  options={monacoEditorProps.options}
                  theme={props.theme || "vs-dark"}
                  value={monacoEditorProps.value}
                  width={props.width}
                />
              )}
            </Component>
          )}
        </>
      }
      size="default"
      type="inner"
    />
  )
})
