import Component from "@reach/component-component"
import { Button, Card, Icon } from "antd"
import { none, Option, some } from "fp-ts/lib/Option"
import * as iots from "io-ts"
import { editor, IDisposable, MarkerSeverity } from "monaco-editor"
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api"
import React from "react"
import MonacoEditor, { MonacoDiffEditor, MonacoEditorProps } from "react-monaco-editor"
import { None, Some } from "../../../lib/Option"
// import { pathTypeLib } from "./pathTypeLib"

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

interface Props extends Required<Pick<MonacoEditorProps, "height" | "width">> {
  /** the read-only code to display */
  content: string
  /** the text being edited */
  contentDraft: Option<string>
  theme?: EditorTheme
  language: EditorLang
  onChange?: (x: { value: string; errors: Option<string[]> }) => void
}

export type CustomEditorWillMount = (monaco: typeof monacoEditor) => IDisposable[]

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
    monaco: null as typeof monacoEditor | null,
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

  const onChange = (draft: string) => {
    if (props.onChange) {
      return props.onChange({ value: draft, errors: none })
    }
  }

  const handleEditorWillMount = React.useCallback(
    (monaco: typeof monacoEditor, setLocalState) => {
      const disposables = willMountRegistry.reduce(
        (acc: IDisposable[], customEditorWillMount: CustomEditorWillMount) => [
          ...acc,
          ...customEditorWillMount(monaco),
        ],
        []
      )

      /*
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      })

      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2015,
        allowNonTsExtensions: true,
        noLib: true,
      })

      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        pathTypeLib,
        "ts:filename/pathTypeLib.d.ts"
      )
      */

      /**
       * Monkey patch setModelMarkers
       */
      //@ts-ignore
      if (!monaco.editor.setModelMarkers._monkeyPatched) {
        const oldSetModelMarkers = monaco.editor.setModelMarkers
        monaco.editor.setModelMarkers = (model, language, markers) => {
          oldSetModelMarkers.call(monaco.editor, model, language, markers)
          const errors = markers
            .filter((marker) => marker.severity === MarkerSeverity.Error)
            .map(
              (marker) =>
                `${marker.message} on line ${marker.startLineNumber}:${marker.startColumn}`
            )
          if (props.onChange) {
            props.onChange({
              value: model.getValue(),
              errors: some(errors),
            })
          }
        }
        //@ts-ignore
        monaco.editor.setModelMarkers._monkeyPatched = true
      }
      setLocalState({ disposables })
      setState({ ...state, monaco })
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
              <MonacoDiffEditor theme="vs-dark" {...props} {...editorProps} onChange={onChange} />
            ) : (
              <Component
                initialState={{ disposables: [] as IDisposable[] }}
                willUnmount={({ state }) => state.disposables.forEach((f) => f.dispose())}>
                {({ setState: setLocalState }) => (
                  <MonacoEditor
                    theme="vs-dark"
                    {...props}
                    {...editorProps}
                    onChange={onChange}
                    editorWillMount={(monaco) => handleEditorWillMount(monaco, setLocalState)}
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
