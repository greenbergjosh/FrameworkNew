import { Button, Card, Icon } from "antd"
import { identity } from "fp-ts/lib/function"
import { Option, some } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import * as iots from "io-ts"
import { IPosition, Range } from "monaco-editor"
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api"
import React from "react"
import { None, Some } from "../data/Option"
import { store } from "../state/store"
import MonacoEditor, {
  MonacoDiffEditor,
  MonacoEditorBaseProps,
  MonacoEditorProps,
} from "react-monaco-editor"

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
  onChange?: (draft: string) => void
}

export const CodeEditor = React.memo(function CodeEditor(props: Props): JSX.Element {
  const [state, setState] = React.useState({
    showDiff: false,
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
              <MonacoDiffEditor theme="vs-dark" {...props} {...editorProps} />
            ) : (
              <MonacoEditor
                theme="vs-dark"
                {...props}
                {...editorProps}
                editorWillMount={(monaco) => {
                  const adapter = new GUIDEditorServiceAdapter(monaco, store)
                  monaco.languages.registerLinkProvider("json", adapter)
                  monaco.languages.registerHoverProvider("json", adapter)
                }}
              />
            )}
          </>
        }
        size="default"
        type="inner"
      />
    </div>
  )
})

export const activeEditorSettings: NonNullable<MonacoEditorProps["options"]> = {
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
  theme: "vs-dark",
  wordBasedSuggestions: false,
  wordWrap: "off",
  wordWrapColumn: 80,
  wrappingIndent: "same",
}

const inactiveEditorSettings: NonNullable<MonacoEditorProps["options"]> = {
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

class GUIDEditorServiceAdapter
  implements monacoEditor.languages.LinkProvider, monacoEditor.languages.HoverProvider {
  constructor(private monaco: typeof monacoEditor, private applicationStore: typeof store) {}

  provideLinks(model: monacoEditor.editor.ITextModel, token: monacoEditor.CancellationToken) {
    return extractGuidRangeItems(model).map(({ range, guid }) => ({
      range,
      url: `${window.location.origin}/dashboard/global-config/${guid}`,
    }))
  }

  provideHover(model: monacoEditor.editor.ITextModel, position: IPosition) {
    const hoveredGuid = extractGuidRangeItems(model).find(({ range, guid }) =>
      range.containsPosition(position)
    )

    if (hoveredGuid) {
      const configsById = this.applicationStore.select.globalConfig.configsById(
        this.applicationStore.getState()
      )
      return record
        .lookup(hoveredGuid.guid.toLowerCase(), configsById)
        .map((config) => ({
          range: hoveredGuid.range,
          contents: [{ value: `**${config.type}:** ${config.name}` }],
        }))
        .alt(
          some({
            range: hoveredGuid.range,
            contents: [
              {
                value: `**Unknown GUID**\n\n_${hoveredGuid.guid}_ is not a known Global Config ID`,
              },
            ],
          })
        )
        .toUndefined()
    }
  }
}

function extractGuidRangeItems(model: monacoEditor.editor.ITextModel) {
  const guidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi
  const text = model.getValue()

  let match
  const items = []
  while ((match = guidPattern.exec(text)) !== null) {
    const index = match.index
    const textBeforeMatch = text.substr(0, index)
    const lines = textBeforeMatch.split(/\n/g)
    const lineNumber = lines.length
    const lastNewLine = textBeforeMatch.lastIndexOf("\n")
    const startColumnNumber = index - lastNewLine
    const endColumnNumber = startColumnNumber + match[0].length

    items.push({
      range: new Range(lineNumber, startColumnNumber, lineNumber, endColumnNumber),
      guid: match[0],
    })
  }

  return items
}
