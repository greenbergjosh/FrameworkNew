import {
  Button,
  Card,
  Icon,
  PageHeader,
  Table,
  Dropdown,
  Menu,
  Layout,
  Tag,
  Typography,
  List,
  Avatar,
} from "antd"
import { filter, takeWhile } from "fp-ts/lib/Array"
import { StrMap, insert, remove, lookup } from "fp-ts/lib/StrMap"
import React from "react"
import * as Reach from "@reach/router"
import { default as MonacoEditor, MonacoEditorProps } from "react-monaco-editor"

import { Atom, swap, useAtom } from "@dbeining/react-atom"

import { useRematch } from "../../../../../../hooks/use-rematch"
import { store } from "../../../../../../state/store"
import {
  ConfigLens,
  Config,
  ConfigType,
} from "../../../../../../data/GlobalConfig.Config"
import { AppState } from "../../../../../../state/store.types"
import { Route } from "antd/lib/breadcrumb/Breadcrumb"
import { ColumnProps } from "antd/lib/table"
import { RouteProps } from "../../../../../../state/navigation"

interface Props extends RouteProps {}

const atom = Atom.of({
  configDrafts: new StrMap<Config>({}),
  configsEditing: new StrMap<Config>({}),
  configNameFilterValue: "",
  configTypesFilterValue: [] as Array<ConfigType>,
  siderCollapsed: false,
})

function setSiderCollapsed(didCollapse: boolean): void {
  swap(atom, (s) => ({ ...s, siderCollapsed: didCollapse }))
}
function toggleSiderCollapsed(): void {
  swap(atom, (s) => ({ ...s, siderCollapsed: !s.siderCollapsed }))
}
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

function mapState(s: AppState) {
  return {
    configs: s.globalConfig.configs,
    configTypes: store.select.globalConfig.configTypes(s),
  }
}

//
// ────────────────────────────────────────────────────────────────  ──────────
//   :::::: C O N F I G   I N D E X : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────────────────────
//

export function ConfigIndex({
  children,
  location,
  navigate,
  path,
  uri,
}: Props): JSX.Element {
  const [{ configTypes, configs }] = useRematch(store, mapState)
  const {
    configDrafts,
    configNameFilterValue,
    configTypesFilterValue,
    configsEditing,
    siderCollapsed,
  } = useAtom(atom)

  const filteredConfigs = React.useMemo(() => {
    return filter<Config>(configs, function byNameAndtype(config) {
      return (
        (config.Name.toLowerCase().includes(configNameFilterValue.toLowerCase()) &&
          configTypesFilterValue.length === 0) ||
        configTypesFilterValue.some((type) => type === config.Type)
      )
    })
  }, [configs, configNameFilterValue, configTypesFilterValue])

  const columns: Array<ColumnProps<Config>> = [
    {
      title: "Type",
      dataIndex: "Type",
      key: "type",
    },
    {
      title: "Name",
      dataIndex: "Name",
      key: "Name",
    },
    {
      title: "Action",
      dataIndex: "",
      key: "actions",
      render(text: string, config: Config) {
        return (
          <Dropdown
            overlay={
              <Menu onClick={() => null}>
                <Menu.Item key="edit">Edit</Menu.Item>
                <Menu.Item key="delete">Delete</Menu.Item>
              </Menu>
            }>
            <Button>
              Actions <Icon type="down" />
            </Button>
          </Dropdown>
        )
      },
    },
  ]

  return (
    <Reach.Location>
      {({ location }) => (
        <div>
          <PageHeader
            backIcon={false}
            breadcrumb={{
              routes: location.pathname.split("/").map((x) => ({
                path: takeWhile(location.pathname.split("/"), (y) => y !== x)
                  .concat([x])
                  .join("/"),
                breadcrumbName: x,
              })),
              itemRender(route: Route) {
                return <Reach.Link to={route.path}>{route.breadcrumbName}</Reach.Link>
              },
            }}
            subTitle="View and edit GlobalConfig.Config entries"
            title="Global Config Admin"
          />
          <Card>
            <Layout hasSider={true}>
              <Layout.Sider
                style={{ overflowY: "scroll" }}
                theme="light"
                trigger={null}
                width={250}>
                <Menu theme="light" mode="inline">
                  {filteredConfigs.map((config) => (
                    <Menu.Item key={config.Id}>
                      <Typography.Text>{config.Name}</Typography.Text>
                      <Reach.Link to={config.Id} />
                    </Menu.Item>
                  ))}
                </Menu>
              </Layout.Sider>

              <Layout.Content>{children}</Layout.Content>
            </Layout>
          </Card>
        </div>
      )}
    </Reach.Location>
  )
}

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
