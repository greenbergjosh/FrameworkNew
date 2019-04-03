import React from "react"
import { RouteProps } from "../../../../../../../../state/navigation"
import { Card, Form, Typography, Empty, Divider } from "antd"
import { useRematch } from "../../../../../../../../hooks/use-rematch"
import { findFirst } from "fp-ts/lib/Array"
import MonacoEditor, { MonacoEditorProps } from "react-monaco-editor"
import { Atom, swap } from "@libre/atom"
import { StrMap, insert, lookup, remove } from "fp-ts/lib/StrMap"
import {
  Config,
  ConfigType,
  ConfigLens,
} from "../../../../../../../../data/GlobalConfig.Config"
import { useAtom } from "@dbeining/react-atom"

interface State {
  configDrafts: StrMap<Config>
  configsEditing: StrMap<Config>
  configNameFilterValue: string
  configTypesFilterValue: Array<ConfigType>
}

const atom = Atom.of<State>({
  configDrafts: new StrMap({}),
  configsEditing: new StrMap({}),
  configNameFilterValue: "",
  configTypesFilterValue: [],
})

function enableEditingConfig(c: Config): void {
  swap(atom, (s) => ({
    ...s,
    configDrafts: insert(c.Id, c, s.configDrafts),
    configsEditing: insert(c.Id, c, s.configsEditing),
  }))
}

function disableEditingConfig(c: Config): void {
  swap(atom, (s) => ({
    ...s,
    configDrafts: remove(c.Id, s.configDrafts),
    configsEditing: remove(c.Id, s.configsEditing),
  }))
}

function updateConfigConfigById(id: string, configConfig: string): void {
  swap(atom, (s) => ({
    ...s,
    configDrafts: lookup(id, s.configDrafts)
      .map(ConfigLens.Config.modify((c) => c.map(() => configConfig)))
      .fold(s.configDrafts, (updated) => insert(id, updated, s.configDrafts)),
  }))
}

function setConfigNameFilterValue(evt: React.ChangeEvent<HTMLInputElement>): void {
  swap(atom, (s) => ({ ...s, configNameFilterValue: evt.target.value }))
}

function setConfigTypesFilterValue(xs: Array<ConfigType>): void {
  swap(atom, (s) => ({ ...s, configTypesFilterValue: xs }))
}

interface Props extends RouteProps {
  configId?: string
}

export const ConfigEditor = React.memo(function ConfigEditor(props: Props) {
  console.log("editor rendered", props.configId)
  const { configDrafts, configsEditing } = useAtom(atom)
  const [{ config }] = useRematch(
    (s) => ({
      config: findFirst(s.globalConfig.configs, (c) => c.Id === props.configId),
    }),
    [props.configId]
  )
  return config.foldL(
    () => <Empty />,
    (config) => (
      <Card bordered={false}>
        <Form>
          <Form.Item>
            <Typography.Title level={3}>{config.Name}</Typography.Title>
            <Typography.Text>Type: {config.Type}</Typography.Text>
            <Divider />

            <MonacoEditor
              width="100%"
              height="500"
              // language="csharp"
              theme="vs"
              value={config.Config.getOrElse("")}
              options={activeEditorSettings}
              onChange={(txt) => updateConfigConfigById(config.Id, txt)}
            />
          </Form.Item>
        </Form>
      </Card>
    )
  )
})

const activeEditorSettings: NotNil<MonacoEditorProps["options"]> = {
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
  readOnly: false,
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
