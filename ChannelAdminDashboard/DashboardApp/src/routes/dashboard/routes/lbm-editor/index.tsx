/* eslint-disable react/jsx-key */
import React from "react"
import MonacoEditor, { MonacoEditorProps } from "react-monaco-editor"

import { RouteProps } from "../../../../state/navigation"
import { PageHeader, List, Icon, Card, Skeleton, Divider } from "antd"
import { useRematch } from "../../../../hooks/use-rematch"
import { store } from "../../../../state/store"

const IconText = ({ type, text }: { type: string; text: string }) => (
  <span>
    <Icon type={type} style={{ marginRight: 8 }} />
    {text}
  </span>
)

interface Props extends RouteProps {}

export function LbmEditor(props: Props): JSX.Element {
  const [state, dispatch] = useRematch(store, (s) => ({
    lbmConfigs: store.select.globalConfig.ofTypeLBM(s),
  }))

  return (
    <div>
      <PageHeader backIcon={false} title={props.displayName} subTitle="An web interface to code stuff" />

      <List
        itemLayout="vertical"
        size="large"
        pagination={{
          onChange: (page) => {
            console.log(page)
          },
          pageSize: 3,
        }}
        dataSource={state.lbmConfigs}
        footer={
          <div>
            <b>ant design</b> footer part
          </div>
        }
        renderItem={(item: typeof state.lbmConfigs[number]) => (
          <List.Item key={item.Id}>
            <Card actions={[<Icon type="setting" />, <Icon type="edit" />, <Icon type="ellipsis" />]}>
              <Card.Meta title={item.Name} />
              <Divider dashed={true} />
              <Skeleton loading={false} avatar active>
                <MonacoEditor
                  width="100%"
                  height="250"
                  language="csharp"
                  theme="vs"
                  value={item.Config.getOrElse("")}
                  options={inactiveEditorSettings}
                  // onChange={::this.onChange}
                  // editorDidMount={::this.editorDidMount}
                />
              </Skeleton>
            </Card>
          </List.Item>
        )}
      />
    </div>
  )
}

const inactiveEditorSettings: NotNil<MonacoEditorProps["options"]> = {
  // model: null,
  // value: undefined,
  language: "csharp",
  theme: "vs",
  rulers: [],
  selectionClipboard: true,
  lineNumbers: "on",
  renderFinalNewline: true,
  selectOnLineNumbers: true,
  lineNumbersMinChars: 4,
  glyphMargin: false,
  lineDecorationsWidth: 10,
  revealHorizontalRightPadding: 30,
  roundedSelection: true,
  renderLineHighlight: "none",
  extraEditorClassName: "",
  readOnly: true,
  // scrollbar: {},
  minimap: {
    enabled: false,
  },
  // find: {},
  fixedOverflowWidgets: false,
  overviewRulerLanes: 2,
  overviewRulerBorder: true,
  cursorBlinking: "blink", // 'blink', 'smooth', 'phase', 'expand' and 'solid'
  mouseWheelZoom: false,
  cursorSmoothCaretAnimation: false,
  cursorStyle: "line",
  /**
   * Control the wrapping of the editor.
   * When `wordWrap` = "off", the lines will never wrap.
   * When `wordWrap` = "on", the lines will wrap at the viewport width.
   * When `wordWrap` = "wordWrapColumn", the lines will wrap at `wordWrapColumn`.
   * When `wordWrap` = "bounded", the lines will wrap at min(viewport width, wordWrapColumn).
   * Defaults to "off".
   */
  wordWrap: "off", // 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  /**
   * Control the wrapping of the editor.
   * When `wordWrap` = "off", the lines will never wrap.
   * When `wordWrap` = "on", the lines will wrap at the viewport width.
   * When `wordWrap` = "wordWrapColumn", the lines will wrap at `wordWrapColumn`.
   * When `wordWrap` = "bounded", the lines will wrap at min(viewport width, wordWrapColumn).
   * Defaults to 80.
   */
  wordWrapColumn: 80,

  wrappingIndent: "same",
  quickSuggestions: {
    comments: false,
    other: true,
    strings: false,
  },
  snippetSuggestions: "none", // 'top' | 'bottom' | 'inline' | 'none';
  wordBasedSuggestions: false,
  // fontFamily?: string;
  // fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | 'initial' | 'inherit' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  // fontSize?: number;
  // lineHeight?: number;
  // letterSpacing?: number;
  showUnused: true,
  scrollBeyondLastLine: false,
}
