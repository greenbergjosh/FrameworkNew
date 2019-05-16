import { Button, Card, Icon } from "antd"
import { identity } from "fp-ts/lib/function"
import { Option } from "fp-ts/lib/Option"
import * as iots from "io-ts"
import React from "react"
import { None, Some } from "../data/Option"
import MonacoEditor, {
  MonacoDiffEditor,
  MonacoEditorBaseProps,
  MonacoEditorProps,
} from "react-monaco-editor"

export type EditorTheme = "vs" | "vs-dark" | "hc-black"
export type EditorLang = iots.TypeOf<typeof EditorLangCodec>

export const editorLanguages = {
  csharp: identity<"csharp">("csharp"),
  json: identity<"json">("json"),
  javascript: identity<"javascript">("javascript"),
  typescript: identity<"typescript">("typescript"),
  sql: identity<"sql">("sql"),
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
                editorWillMount={editorWillMount}
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

function editorWillMount(monaco: any) {
  monaco.languages.registerLinkProvider("json", new GUIDLinkAdapter(monaco))
  monaco.languages.registerHoverProvider("json", new GUIDHoverAdapter(monaco))
}

class GUIDLinkAdapter {
  _monaco: any

  constructor(_monaco: MonacoEditor) {
    this._monaco = _monaco
  }

  provideLinks(model: any, token: any) {
    return extractGuidRangeItems(model, this._monaco).map(({ range, guid }) => ({
      range,
      url: `${window.location.origin}/dashboard/global-config/${guid}`,
    }))
  }
}

class GUIDHoverAdapter {
  _monaco: any

  constructor(_monaco: MonacoEditor) {
    this._monaco = _monaco
  }

  provideHover(model: any, position: Position) {
    const hoveredGuid = extractGuidRangeItems(model, this._monaco).find(({ range, guid }) =>
      range.containsPosition(position)
    )

    if (hoveredGuid) {
      return {
        range: hoveredGuid.range,
        contents: [{ value: `**${hoveredGuid.guid}**` }],
      }
    }
  }
}

interface TextModel {
  getValue(): string
}

function extractGuidRangeItems(model: TextModel, monaco: any) {
  const guidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi
  const text: string = model.getValue()

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
      range: new monaco.Range(lineNumber, startColumnNumber, lineNumber, endColumnNumber),
      guid: match[0],
    })
  }

  return items
}
