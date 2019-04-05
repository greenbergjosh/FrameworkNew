import { useAtom } from "@dbeining/react-atom"
import { Atom, AtomState, swap } from "@libre/atom"
import {
  Button,
  Card,
  Col,
  Divider,
  Dropdown,
  Empty,
  Form,
  Icon,
  Input,
  Menu,
  Row,
  Skeleton,
} from "antd"
import { isEmpty, lookup } from "fp-ts/lib/Record"
import * as These from "fp-ts/lib/These"
import React from "react"
import MonacoEditor, { MonacoEditorProps } from "react-monaco-editor"
import { Space } from "../../../../../../components/space"
import { useRematch } from "../../../../../../hooks/use-rematch"
import { WithRouteProps } from "../../../../../../state/navigation"

type SupportedEditorLang = "csharp" | "javascript" | "json" | "typescript" | "sql" | "xml"
type SupportedEditorTheme = "vs" | "vs-dark" | "hc-black"

const atom = Atom.of({
  editorLang: "json" as SupportedEditorLang,
  editorTheme: "vs" as SupportedEditorTheme,
  editorShowDiff: false,
})

function setEditorLang(lang: AtomState<typeof atom>["editorLang"]): void {
  swap(atom, (s) => ({ ...s, editorLang: lang }))
}
function setEditorTheme(them: AtomState<typeof atom>["editorTheme"]): void {
  swap(atom, (s) => ({ ...s, editorTheme: them }))
}

interface Props {
  configId: string
}

export const ConfigEditor = React.memo(function ConfigEditor(
  props: WithRouteProps<Props>
) {
  const { editorLang, editorTheme } = useAtom(atom)
  const [fromRematch, dispatch] = useRematch(
    (s) => ({
      config: lookup(props.configId, s.globalConfig.configs),
      configNeedsToBeLoaded: lookup(props.configId, s.globalConfig.configs)
        .chain((c) => c.config)
        .isNone(),
      configIsLoading: s.loading.effects.globalConfig.loadConfigById,
      configsAreEmpty: isEmpty(s.globalConfig.configs),
      configsAreLoading: s.loading.effects.globalConfig.loadAllConfigsMetaOnly,
      draftConfig: lookup(props.configId, s.globalConfig.draftConfigs),
    }),
    [props.configId]
  )

  React.useEffect(() => {
    if (fromRematch.configsAreEmpty) {
      dispatch.globalConfig.loadAllConfigsMetaOnly()
    } else if (fromRematch.configNeedsToBeLoaded) {
      dispatch.globalConfig.loadConfigById(props.configId)
    }
  }, [
    dispatch,
    props.configId,
    fromRematch.configsAreEmpty,
    fromRematch.configNeedsToBeLoaded,
  ])

  return (
    <Card bordered={false}>
      <Form
        colon={false}
        labelAlign="left"
        labelCol={{
          xs: { span: 4 },
          xl: { span: 2 },
        }}
        layout="inline"
        wrapperCol={{
          xs: { span: 20 },
          xl: { span: 22 },
        }}>
        {These.fromOptions(fromRematch.draftConfig, fromRematch.config).foldL(
          function None() {
            return <Empty />
          },
          function Some(theseConfigs) {
            return theseConfigs.fold(
              // This case is _theoretically_ possible but programmatically impossible;
              // you can't have a draft unless you have a config in the first place.
              // It's good to handle the case nevertheless
              function This(/* draft */) {
                return <Empty />
              },

              function That(original) {
                return (
                  <>
                    <Row>
                      <Input addonBefore="Name" disabled={true} value={original.name} />
                    </Row>
                    <Space.Horizontal height={15} />
                    <Row>
                      <Input addonBefore="Type" disabled={true} value={original.type} />
                    </Row>
                    <Space.Horizontal height={15} />
                    <Row>
                      <Col span={12} />
                      <Col
                        span={12}
                        style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button.Group size="small">
                          <Button
                            type="primary"
                            onClick={() => dispatch.globalConfig.createDraft(original)}>
                            <Icon type="edit" /> Edit
                          </Button>
                        </Button.Group>
                      </Col>
                    </Row>
                    <Skeleton
                      active={true}
                      loading={
                        fromRematch.configIsLoading || fromRematch.configsAreLoading
                      }>
                      <Row>
                        <EditorSettingsControls
                          editorLang={editorLang}
                          editorTheme={editorTheme}
                        />
                      </Row>

                      <Divider />

                      <MonacoEditor
                        height="500"
                        language={editorLang}
                        options={inactiveEditorSettings}
                        theme={editorTheme}
                        value={original.config.getOrElse("")}
                        width="100%"
                      />
                    </Skeleton>
                  </>
                )
              },

              function Both(draft, original) {
                return (
                  <>
                    <Row>
                      <Input
                        addonBefore="Name"
                        disabled={false}
                        value={draft.name}
                        onChange={(evt) =>
                          dispatch.globalConfig.updateDraftConfig({
                            ...draft,
                            name: evt.target.value,
                          })
                        }
                      />
                    </Row>
                    <Space.Horizontal height={15} />
                    <Row>
                      <Input
                        addonBefore="Type"
                        disabled={false}
                        value={draft.type}
                        onChange={(evt) =>
                          dispatch.globalConfig.updateDraftConfig({
                            ...draft,
                            type: evt.target.value,
                          })
                        }
                      />
                    </Row>
                    <Space.Horizontal height={15} />
                    <Row>
                      <Col span={12} />
                      <Col
                        span={12}
                        style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                          size="small"
                          type="danger"
                          onClick={() =>
                            dispatch.globalConfig.rmDraftConfigById(draft.id)
                          }>
                          <Icon type="close" /> Cancel
                        </Button>

                        <Space.Vertical width={15} />

                        <Button
                          size="small"
                          type="primary"
                          onClick={() =>
                            dispatch.globalConfig.rmDraftConfigById(draft.id)
                          }>
                          <Icon type="save" /> Save
                        </Button>
                      </Col>
                    </Row>

                    <Row>
                      <EditorSettingsControls
                        editorLang={editorLang}
                        editorTheme={editorTheme}
                      />
                    </Row>

                    <Divider />

                    <MonacoEditor
                      defaultValue={draft.config.getOrElse("")}
                      height="500"
                      language={editorLang}
                      options={activeEditorSettings}
                      theme={editorTheme}
                      value={draft.config.getOrElse("")}
                      width="100%"
                    />
                  </>
                )
              }
            )
          }
        )}
      </Form>
    </Card>
  )
})

function EditorSettingsControls(props: {
  editorLang: SupportedEditorLang
  editorTheme: SupportedEditorTheme
}) {
  return (
    <>
      <Dropdown
        placement="bottomCenter"
        trigger={["click"]}
        overlay={
          <Menu
            defaultOpenKeys={[props.editorLang]}
            selectedKeys={[props.editorLang]}
            onClick={({ key }) => {
              setEditorLang(key as SupportedEditorLang)
            }}>
            <Menu.Item key="csharp">C#</Menu.Item>
            <Menu.Item key="javascript">JavaScript</Menu.Item>
            <Menu.Item key="json">JSON</Menu.Item>
            <Menu.Item key="typescript">TypeScript</Menu.Item>
            <Menu.Item key="sql">SQL</Menu.Item>
            <Menu.Item key="xml">XML</Menu.Item>
          </Menu>
        }>
        <Button size="small" style={{ marginLeft: 8 }}>
          {`Language: ${props.editorLang}`} <Icon type="down" />
        </Button>
      </Dropdown>
      <Dropdown
        placement="bottomCenter"
        trigger={["click"]}
        overlay={
          <Menu
            defaultOpenKeys={[props.editorTheme]}
            selectedKeys={[props.editorTheme]}
            onClick={({ key }) => {
              setEditorTheme(key as SupportedEditorTheme)
            }}>
            <Menu.Item key="vs">VS (default)</Menu.Item>
            <Menu.Item key="vs-dark">Dark Mode</Menu.Item>
            <Menu.Item key="hc-black">High Contrast Dark</Menu.Item>
          </Menu>
        }>
        <Button size="small" style={{ marginLeft: 8 }}>
          {`Theme: ${props.editorTheme}`} <Icon type="down" />
        </Button>
      </Dropdown>
    </>
  )
}

const activeEditorSettings: NonNullable<MonacoEditorProps["options"]> = {
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
  minimap: {
    enabled: false,
  },
  fixedOverflowWidgets: false,
  overviewRulerLanes: 2,
  overviewRulerBorder: true,
  cursorBlinking: "blink",
  mouseWheelZoom: false,
  cursorSmoothCaretAnimation: false,
  cursorStyle: "line",
  wordWrap: "off",
  wordWrapColumn: 80,

  wrappingIndent: "same",
  quickSuggestions: {
    comments: false,
    other: true,
    strings: false,
  },
  snippetSuggestions: "none",
  wordBasedSuggestions: false,
  showUnused: true,
  scrollBeyondLastLine: false,
}

const inactiveEditorSettings: NonNullable<MonacoEditorProps["options"]> = {
  ...activeEditorSettings,
  readOnly: true,
}
