import React from "react"
import { Option } from "fp-ts/lib/Option"
import * as Record from "fp-ts/lib/Record"
import { None, Some } from "../data/Option"
import {
  Empty,
  Dropdown,
  Menu,
  Button,
  Icon,
  Card,
  PageHeader,
  Typography,
  Row,
  Col,
  Switch,
} from "antd"
import * as iots from "io-ts"
import { This, That, Both } from "../data/These"
import MonacoEditor, { MonacoEditorProps, MonacoDiffEditor } from "react-monaco-editor"
import { ConfigLang } from "../data/GlobalConfig.Config"

export type EditorTheme = "vs" | "vs-dark" | "hc-black"
export type EditorLang = iots.TypeOf<typeof EditorLangCodec>
export const EditorLangCodec = iots.union([
  iots.literal("csharp"),
  iots.literal("json"),
  iots.literal("javascript"),
  iots.literal("typescript"),
  iots.literal("sql"),
  iots.literal("xml"),
])

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
          state.showDiff ? (
            <MonacoDiffEditor theme="vs-dark" {...props} {...editorProps} />
          ) : (
            <MonacoEditor theme="vs-dark" {...props} {...editorProps} />
          )
        }
        size="default"
        type="inner"
      />
      <Button.Group size="small">
        <Button title="settings">
          <Icon theme="filled" type="setting" />
        </Button>
        <Button
          title="show diff"
          type={state.showDiff ? "primary" : "default"}
          onClick={() => setState({ ...state, showDiff: !state.showDiff })}>
          <Icon theme="filled" type="diff" />
        </Button>
        <Button title="Change color theme">Theme</Button>
        <Button>{props.language}</Button>
      </Button.Group>
    </div>
  )
})

// function EditorSettingsControls(props: {
//   editorLang: ConfigLang
//   editorTheme: EditorTheme
//   showDiff: boolean
//   onEditorLangChanged: (lang: ConfigLang) => void
//   onShowDiffchanged?: (b: boolean) => void
// }) {
//   return (
//     <>
//       <Dropdown
//         placement="bottomCenter"
//         trigger={["click"]}
//         overlay={
//           <Menu
//             defaultOpenKeys={[props.editorLang]}
//             selectedKeys={[props.editorLang]}
//             onClick={({ key }) => {
//               props.onEditorLangChanged(key as ConfigLang)
//             }}>
//             <Menu.Item key="csharp">C#</Menu.Item>
//             <Menu.Item key="javascript">JavaScript</Menu.Item>
//             <Menu.Item key="json">JSON</Menu.Item>
//             <Menu.Item key="typescript">TypeScript</Menu.Item>
//             <Menu.Item key="sql">SQL</Menu.Item>
//             <Menu.Item key="xml">XML</Menu.Item>
//           </Menu>
//         }>
//         <Button size="small" style={{ marginLeft: 8 }}>
//           {`Lang: ${props.editorLang}`} <Icon type="down" />
//         </Button>
//       </Dropdown>
//       <Dropdown
//         placement="bottomCenter"
//         trigger={["click"]}
//         overlay={
//           <Menu
//             defaultOpenKeys={[props.editorTheme]}
//             selectedKeys={[props.editorTheme]}
//             onClick={({ key }) => {
//               setEditorTheme(key as EditorTheme)
//             }}>
//             <Menu.Item key="vs">VS (default)</Menu.Item>
//             <Menu.Item key="vs-dark">Dark Mode</Menu.Item>
//             <Menu.Item key="hc-black">High Contrast Dark</Menu.Item>
//           </Menu>
//         }>
//         <Button size="small" style={{ marginLeft: 8 }}>
//           {`Theme: ${props.editorTheme}`} <Icon type="down" />
//         </Button>
//       </Dropdown>
//       {/* <Space.Vertical width={8} /> */}{" "}
//       <Switch
//         checked={props.showDiff}
//         checkedChildren="Diff"
//         unCheckedChildren="Diff"
//         onChange={props.onShowDiffchanged}
//       />
//     </>
//   )
// }

const activeEditorSettings: NonNullable<MonacoEditorProps["options"]> = {
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
