import Component from "@reach/component-component"
import { Button, Card, Icon } from "antd"
import { none, Option, some } from "fp-ts/lib/Option"
import * as iots from "io-ts"
import { editor, IDisposable, MarkerSeverity } from "monaco-editor"
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api"
import React from "react"
import { ControlledEditor, DiffEditor, EditorProps, monaco } from "@monaco-editor/react"
import { None, Some } from "../../../lib/Option"

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

/*******************************
 * Types & Interfaces
 */

export type EditorTheme = "vs" | "vs-dark" | "hc-black"
export type EditorLang = iots.TypeOf<typeof EditorLangCodec>

export const editorLanguages = {
  csharp: "csharp" as const,
  json: "json" as const,
  javascript: "javascript" as const,
  typescript: "typescript" as const,
  sql: "sql" as const,
}
export const EditorLangCodec = iots.keyof(editorLanguages)

interface Props extends Required<Pick<EditorProps, "height" | "width">> {
  /** the read-only code to display */
  content: string
  /** the text being edited */
  contentDraft: Option<string>
  theme?: EditorTheme
  language: EditorLang
  onChange?: (x: { value: string; errors: Option<string[]> }) => void
  onMonacoInit?: (monacoInstance: typeof monacoEditor) => void
  editorDidMount?: (getEditorValue: () => string, editor: monacoEditor.editor.IStandaloneCodeEditor) => void
}

export type CustomEditorWillMount = (monaco: editor.IStandaloneCodeEditor) => IDisposable[]

/*******************************
 * Constants
 */

const willMountRegistry: CustomEditorWillMount[] = []

export const registerMonacoEditorMount = (customEditorWillMount: CustomEditorWillMount) => {
  willMountRegistry.push(customEditorWillMount)
}

export const activeEditorSettings: NonNullable<editor.IEditorConstructionOptions> = {
  cursorBlinking: "blink",
  cursorSmoothCaretAnimation: false,
  cursorStyle: "block",
  extraEditorClassName: "",
  fixedOverflowWidgets: false,
  glyphMargin: false,
  lineDecorationsWidth: 10,
  lineNumbers: "on",
  lineNumbersMinChars: 4,
  minimap: {
    enabled: false,
  },
  mouseWheelZoom: false,
  overviewRulerBorder: false,
  overviewRulerLanes: 2,
  quickSuggestions: {
    comments: true,
    other: true,
    strings: true,
  },
  readOnly: false,
  renderFinalNewline: true,
  renderLineHighlight: "none",
  revealHorizontalRightPadding: 30,
  roundedSelection: true,
  rulers: [],
  scrollBeyondLastLine: false,
  selectionClipboard: true,
  selectOnLineNumbers: true,
  showUnused: true,
  snippetSuggestions: "none",
  // @ts-ignore
  wordBasedSuggestions: false,
  wordWrap: "off",
  wordWrapColumn: 80,
  wrappingIndent: "same",
}

const inactiveEditorSettings: NonNullable<editor.IEditorConstructionOptions> = {
  ...activeEditorSettings,
  readOnly: true,
}

const diffEditorSettings = {
  ...activeEditorSettings,
  renderSideBySide: true,
}

// function editorWillMount(monaco: typeof monacoEditor) {
//   const adapter = new GUIDEditorServiceAdapter(monaco)
//   monaco.languages.registerLinkProvider("json", adapter)
//   monaco.languages.registerHoverProvider("json", adapter)
// }

/*******************************
 * CodeEditor Component
 */

export const CodeEditor = React.memo(function CodeEditor(props: Props): JSX.Element {
  const [state, setState] = React.useState({
    showDiff: false,
    monaco: null as editor.IStandaloneCodeEditor | null,
  })

  const editorProps = React.useMemo(() => {
    return props.contentDraft.foldL(
      None(() => ({
        defaultValue: props.content,
        options: inactiveEditorSettings,
        original: props.content,
        value: props.content,
      })),
      Some((contentDraft) => ({
        defaultValue: contentDraft,
        options: diffEditorSettings,
        original: props.content,
        value: contentDraft,
      }))
    )
  }, [props.content, props.contentDraft])

  /**
   * Monaco Instance
   * https://github.com/suren-atoyan/monaco-react#monaco-instance
   */
  if (props.onMonacoInit) {
    monaco
      .init()
      .then((monacoInstance) => {
        /* here is the instance of monaco, so you can use the `monaco.languages` or whatever you want */
        props.onMonacoInit!(monacoInstance)
      })
      .catch((error) => console.error("An error occurred during initialization of Monaco: ", error))
  }

  //type ControlledEditorOnChange = (ev: monacoEditor.editor.IModelContentChangedEvent, value: string | undefined) => string | void
  const onChange = (ev: editor.IModelContentChangedEvent, value: string | undefined) => {
    if (props.onChange) {
      return props.onChange({ value: value!, errors: none })
    }
  }

  const handleEditorDidMount = React.useCallback(
    (monaco: editor.IStandaloneCodeEditor, setLocalState, getEditorValue) => {
      const disposables = willMountRegistry.reduce(
        (acc: IDisposable[], customEditorWillMount: CustomEditorWillMount) => [
          ...acc,
          ...customEditorWillMount(monaco),
        ],
        []
      )

      /**
       * Monkey patch setModelMarkers
       */
      //@ts-ignore
      if (!editor.setModelMarkers._monkeyPatched) {
        const oldSetModelMarkers = editor.setModelMarkers
        editor.setModelMarkers = (model, language, markers) => {
          oldSetModelMarkers.call(editor, model, language, markers)
          const errors = markers
            .filter((marker) => marker.severity === MarkerSeverity.Error)
            .map((marker) => `${marker.message} on line ${marker.startLineNumber}:${marker.startColumn}`)
          if (props.onChange) {
            props.onChange({
              value: model.getValue(),
              errors: some(errors),
            })
          }
        }
        //@ts-ignore
        editor.setModelMarkers._monkeyPatched = true
      }
      setLocalState({ disposables })
      setState({ ...state, monaco })
      if (props.editorDidMount) {
        props.editorDidMount!(getEditorValue, monaco)
      }
    },
    [willMountRegistry, state, setState]
  )

  return (
    <div>
      <Card
        bodyStyle={{ display: "none" }}
        bordered={false}
        cover={
          <>
            <Button.Group size="small">
              <Button
                title="show diff"
                type={state.showDiff ? "primary" : "default"}
                onClick={() => setState({ ...state, showDiff: !state.showDiff })}>
                <Icon theme="filled" type="diff" />
              </Button>
              <Button disabled>{props.language}</Button>
            </Button.Group>
            {state.showDiff ? (
              // @ts-ignore
              <DiffEditor theme="vs-dark" {...props} {...editorProps} onChange={onChange} />
            ) : (
              <Component
                initialState={{ disposables: [] as IDisposable[] }}
                willUnmount={({ state }) => state.disposables.forEach((f) => f.dispose())}>
                {({ setState: setLocalState }) => (
                  <ControlledEditor
                    theme="vs-dark"
                    {...props}
                    {...editorProps}
                    onChange={onChange} // <-- onChange provided by <ControlledEditor> but not <Editor>
                    editorDidMount={(getEditorValue: () => string, editor: editor.IStandaloneCodeEditor) =>
                      handleEditorDidMount(editor, setLocalState, getEditorValue)
                    }
                  />
                )}
              </Component>
            )}
          </>
        }
        size="default"
        type="inner"
      />
    </div>
  )
})
