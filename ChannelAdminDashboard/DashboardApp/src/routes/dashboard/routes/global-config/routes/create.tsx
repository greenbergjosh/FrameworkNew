import { Button, Col, Icon, Input, PageHeader, Row, Select, Skeleton, Typography, Form } from "antd"
import { fromEither, none, Option, some } from "fp-ts/lib/Option"
import { insert, lookup } from "fp-ts/lib/Record"
import React from "react"
import { CodeEditor, EditorLangCodec } from "../../../../../components/code-editor"
import { fromStrToJSONRec } from "../../../../../data/JSON"
import { useRematch } from "../../../../../hooks/use-rematch"
import { WithRouteProps } from "../../../../../state/navigation"
import { store } from "../../../../../state/store"
import { findFirst } from "fp-ts/lib/Array"
interface Props {
  configId: "create"
}
export function CreateGlobalConfig({
  children,
  configId,
  location,
  navigate,
  path,
  uri,
}: WithRouteProps<Props>): JSX.Element {
  const [fromStore, dispatch] = useRematch((s) => ({
    configs: s.globalConfig.configs,
    configsById: store.select.globalConfig.configsById(s),
    configsByType: store.select.globalConfig.configsByType(s),
    defaultEntityTypeConfig: s.globalConfig.defaultEntityTypeConfig,
    draftConfig: s.globalConfig.draftConfig,
    entityTypeConfigs: store.select.globalConfig.entityTypeConfigs(s),
    isUpdatingRemoteConfig: s.loading.effects.globalConfig.updateRemoteConfig,
  }))

  const [state, setState] = React.useState({
    draft: {
      config: some(""),
      name: none as Option<string>,
      type: none as Option<string>,
    },
  })

  const { entityTypeConfig, editorLanguage } = React.useMemo(() => {
    const entityTypeConfig = state.draft.type.chain((t) => lookup(t, fromStore.entityTypeConfigs))
    const editorLanguage = entityTypeConfig
      .chain((etc) => etc.config)
      .chain(fromStrToJSONRec)
      .chain((config) => lookup("lang", config))
      .chain((lang) => fromEither(EditorLangCodec.decode(lang)))
      .getOrElse(fromStore.defaultEntityTypeConfig.lang)

    return { entityTypeConfig, editorLanguage }
  }, [state.draft.type, fromStore.entityTypeConfigs, fromStore.defaultEntityTypeConfig.lang])

  const entityTypeNames = React.useMemo(() => {
    return Object.values(fromStore.entityTypeConfigs).map((c) => c.name)
  }, [fromStore.entityTypeConfigs])

  const configNameIsDuplicate = React.useMemo(() => {
    return state.draft.type
      .chain((type) => lookup(type, fromStore.configsByType))
      .chain((cs) => state.draft.name.chain((name) => findFirst(cs, (c) => c.name === name)))
      .isSome()
  }, [fromStore.configsByType, state.draft.name, state.draft.type])

  return (
    <Skeleton active loading={fromStore.configs.isPending()}>
      <>
        <PageHeader
          extra={
            <>
              <Button
                disabled={true}
                icon={fromStore.isUpdatingRemoteConfig ? "loading" : "save"}
                key="save"
                loading={fromStore.isUpdatingRemoteConfig}
                size="small"
                type="primary"
                onClick={console.log}>
                Save
              </Button>
            </>
          }
          title={`Create Config`}>
          <Form labelAlign="left" layout="inline" {...formItemLayout}>
            <Form.Item label="Name" style={{ width: "100%" }}>
              <Input
                placeholder="Enter a unique config name"
                value={state.draft.name.toUndefined()}
                onChange={({ target: t }) =>
                  setState((s) => insert("draft", { ...s.draft, name: some(t.value) }, s))
                }
              />
            </Form.Item>
            <Form.Item label="Type" style={{ width: "100%" }}>
              <Select
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Button block ghost type="primary">
                      <Icon type="plus-circle" /> New Entity Type
                    </Button>
                  </>
                )}
                placeholder="Select a config type"
                style={{ width: "100%" }}
                value={state.draft.type.toUndefined()}
                onChange={(type) =>
                  setState((s) => insert("draft", { ...s.draft, type: some(type) }, s))
                }>
                {entityTypeNames.map((type) => (
                  <Select.Option key={type}>{type}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </PageHeader>

        <CodeEditor
          content={state.draft.config.getOrElse("")}
          contentDraft={state.draft.config}
          height={500}
          language={editorLanguage}
          width="100%"
          onChange={(config) =>
            setState((s) => insert("draft", { ...s.draft, config: some(config) }, s))
          }
        />
      </>
    </Skeleton>
  )
}

const formItemLayout = {
  labelCol: {
    xs: { span: 12 },
    sm: { span: 8 },
    md: { span: 4 },
    lg: { span: 2 },
  },
  wrapperCol: {
    xs: { span: 12 },
    sm: { span: 16 },
    md: { span: 20 },
    lg: { span: 22 },
  },
}
