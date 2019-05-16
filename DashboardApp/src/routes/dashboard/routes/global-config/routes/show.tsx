import * as Reach from "@reach/router"
import { TreeNode } from "antd/lib/tree-select"
import { fromEither, none } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import React from "react"
import { CodeEditor, EditorLangCodec } from "../../../../../components/code-editor"
import { fromStrToJSONRec } from "../../../../../data/JSON"
import { None, Some } from "../../../../../data/Option"
import { useRematch } from "../../../../../hooks/use-rematch"
import { WithRouteProps } from "../../../../../state/navigation"
import { store } from "../../../../../state/store"
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Icon,
  Row,
  Skeleton,
  Tree,
  Typography,
  Tag,
} from "antd"
interface Props {
  configId: string
}

const normalizeURLParams = (param: string) =>
  typeof param === "string" ? param.toLowerCase() : param

export function ShowGlobalConfig({
  children,
  configId,
  location,
  navigate,
  path,
  uri,
}: WithRouteProps<Props>): JSX.Element {
  const [fromStore, dispatch] = useRematch((s) => ({
    associations: store.select.globalConfig.associations(s),
    configs: s.globalConfig.configs,
    configsById: store.select.globalConfig.configsById(s),
    defaultEntityTypeConfig: s.globalConfig.defaultEntityTypeConfig,
    entityTypes: store.select.globalConfig.entityTypeConfigs(s),
    isUpdatingRemoteConfig: s.loading.effects.globalConfig.updateRemoteConfig,
  }))

  const { focusedConfig, entityTypeConfig, editorLanguage } = React.useMemo(() => {
    const focusedConfig = record.lookup(normalizeURLParams(configId), fromStore.configsById)
    const entityTypeConfig = focusedConfig.chain((c) =>
      record.lookup(c.type, fromStore.entityTypes)
    )
    const editorLanguage = entityTypeConfig
      .chain((etc) => etc.config)
      .chain(fromStrToJSONRec)
      .chain((config) => record.lookup("lang", config))
      .chain((lang) => fromEither(EditorLangCodec.decode(lang)))
      .getOrElse(fromStore.defaultEntityTypeConfig.lang)

    return { focusedConfig, entityTypeConfig, editorLanguage }
  }, [
    configId,
    fromStore.configsById,
    fromStore.entityTypes,
    fromStore.defaultEntityTypeConfig.lang,
  ])

  const association = focusedConfig.chain(({ id }) => record.lookup(id, fromStore.associations))
  console.log("associations", fromStore.associations)
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
            <Card>
              <div>
                <Typography.Title>Relationships</Typography.Title>
                {association.foldL(
                  () => (
                    <Empty description={`No configs found related to ${configId}`} />
                  ),
                  (assoc) => (
                    <>
                      {config.name}
                      <Tree.DirectoryTree showLine>
                        {record.toArray(assoc).map(([key, guidArray]) => (
                          <Tree.TreeNode
                            selectable={false}
                            title={`${key} (${guidArray.length})`}
                            key={key}>
                            {guidArray.map((guid) => {
                              const associatedRecord = record.lookup(guid, fromStore.configsById)
                              return associatedRecord.foldL(
                                () => (
                                  <Tree.TreeNode
                                    isLeaf
                                    selectable={false}
                                    title={
                                      <>
                                        <Tag>Unknown GUID</Tag>
                                        {guid} is not a known Global Config ID
                                      </>
                                    }
                                    key={guid}
                                  />
                                ),
                                (r) => (
                                  <Tree.TreeNode
                                    isLeaf
                                    selectable={false}
                                    title={
                                      <>
                                        <Tag>{r.type}</Tag>
                                        {r.name}
                                      </>
                                    }
                                    key={guid}
                                  />
                                )
                              )
                            })}
                          </Tree.TreeNode>
                        ))}
                      </Tree.DirectoryTree>
                    </>
                  )
                )}
              </div>
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

export default ShowGlobalConfig
