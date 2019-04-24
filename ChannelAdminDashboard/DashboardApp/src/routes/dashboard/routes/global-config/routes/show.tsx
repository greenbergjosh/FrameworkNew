import * as Reach from "@reach/router"
import { Alert, Button, Card, Empty, Form, Icon, Skeleton, Typography } from "antd"
import { fromEither, none } from "fp-ts/lib/Option"
import { lookup } from "fp-ts/lib/Record"
import React from "react"
import { CodeEditor, EditorLangCodec } from "../../../../../components/code-editor"
import { fromStrToJSONRec } from "../../../../../data/JSON"
import { None, Some } from "../../../../../data/Option"
import { useRematch } from "../../../../../hooks/use-rematch"
import { WithRouteProps } from "../../../../../state/navigation"
import { store } from "../../../../../state/store"
interface Props {
  configId: string
}
export function ShowGlobalConfig({
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
    defaultEntityTypeConfig: s.globalConfig.defaultEntityTypeConfig,
    entityTypes: store.select.globalConfig.entityTypeConfigs(s),
    isUpdatingRemoteConfig: s.loading.effects.globalConfig.updateRemoteConfig,
  }))

  const { focusedConfig, entityTypeConfig, editorLanguage } = React.useMemo(() => {
    const focusedConfig = lookup(configId, fromStore.configsById)
    const entityTypeConfig = focusedConfig.chain((c) => lookup(c.type, fromStore.entityTypes))
    const editorLanguage = entityTypeConfig
      .chain((etc) => etc.config)
      .chain(fromStrToJSONRec)
      .chain((config) => lookup("lang", config))
      .chain((lang) => fromEither(EditorLangCodec.decode(lang)))
      .getOrElse(fromStore.defaultEntityTypeConfig.lang)

    return { focusedConfig, entityTypeConfig, editorLanguage }
  }, [
    configId,
    fromStore.configsById,
    fromStore.entityTypes,
    fromStore.defaultEntityTypeConfig.lang,
  ])

  return (
    <Skeleton active loading={fromStore.configs.isPending()}>
      {focusedConfig.foldL(
        None(() => <Empty description={`No config found with id ${configId}`} />),
        Some((config) => (
          <>
            {entityTypeConfig.isNone() && (
              <Alert
                banner
                closable
                description={`No config of type "EntityType" could be found for configs of type "${
                  config.type
                }." For the best experience, please create an EntityType config for ${config.type}`}
                message={`No EntityType exists for ${config.type}`}
                type="warning"
              />
            )}

            <Card
              bordered={false}
              extra={
                <Button type="primary" size="small">
                  <Reach.Link to={`./edit`}>
                    <Icon type="edit" /> Edit
                  </Reach.Link>
                </Button>
              }
              title={`Config Details`}>
              <Form
                labelAlign="left"
                layout="horizontal"
                {...formItemLayout}
                style={{ width: "100%" }}>
                {/* ---------- Config.Type Input ---------------- */}
                <Form.Item label="Type" style={{ width: "100%" }}>
                  <Typography.Text>
                    {entityTypeConfig.foldL(
                      None(() => <>{config.type}</>),
                      Some((etc) => <Reach.Link to={`../${etc.id}`}>{config.type}</Reach.Link>)
                    )}
                  </Typography.Text>
                </Form.Item>

                {/* ---------- Config.Name Input ---------------- */}
                <Form.Item label="Name">
                  <Typography.Text>{config.name}</Typography.Text>
                </Form.Item>

                {/* ---------- Config.Config Input ---------------- */}
                <Form.Item label="Config">
                  <CodeEditor
                    content={config.config.getOrElse("")}
                    contentDraft={none}
                    height={500}
                    language={editorLanguage}
                    width="100%"
                  />
                </Form.Item>
              </Form>
            </Card>
          </>
        ))
      )}
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
