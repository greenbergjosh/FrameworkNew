import { ROOT_CONFIG_COMPONENTS } from "../index"
import * as Reach from "@reach/router"
import { Alert, Button, Card, Empty, Form, Icon, Skeleton, Tabs, Tag, Tree, Typography } from "antd"
import { fromEither, none, tryCatch } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import JSON5 from "json5"
import React from "react"
import { Helmet } from "react-helmet"
import { AdminUserInterfaceContextManager } from "../../../../../data/AdminUserInterfaceContextManager.type"
import { PersistedConfig } from "../../../../../data/GlobalConfig.Config"
import { fromStrToJSONRec } from "../../../../../data/JSON"
import { None, Some } from "../../../../../data/Option"
import { useRematch } from "../../../../../hooks/use-rematch"
import { store } from "../../../../../state/store"
import { CodeEditor, ComponentDefinition, EditorLangCodec, UserInterface } from "@opg/interface-builder"
import { WithRouteProps } from "../../../../../state/navigation"
import { PageBeacon } from "../../../../../components/PageBeacon"

interface Props {
  configId: string
}

const normalizeURLParams = (param: string) => (typeof param === "string" ? param.toLowerCase() : param)

export function ShowGlobalConfig({
  children,
  configId,
  location,
  navigate,
  path,
  uri,
}: WithRouteProps<Props>): JSX.Element {
  const [fromStore, dispatch] = useRematch((appState) => ({
    associations: store.select.globalConfig.associations(appState),
    configs: appState.globalConfig.configs,
    configsById: store.select.globalConfig.configsById(appState),
    configNames: store.select.globalConfig.configNames(appState),
    configsByType: store.select.globalConfig.configsByType(appState),
    defaultEntityTypeConfig: appState.globalConfig.defaultEntityTypeConfig,
    entityTypes: store.select.globalConfig.entityTypeConfigs(appState),
    isUpdatingRemoteConfig: appState.loading.effects.globalConfig.updateRemoteConfig,
    reportDataByQuery: appState.reports.reportDataByQuery,
  }))

  const userInterfaceContextManager: AdminUserInterfaceContextManager = {
    executeQuery: dispatch.reports.executeQuery.bind(dispatch.reports),
    executeQueryUpdate: dispatch.reports.executeQueryUpdate.bind(dispatch.reports),
    executeHTTPRequestQuery: dispatch.reports.executeHTTPRequestQuery.bind(dispatch.reports),
    reportDataByQuery: fromStore.reportDataByQuery,
    navigation: dispatch.navigation,
    loadByFilter: (predicate: (item: PersistedConfig) => boolean): PersistedConfig[] => {
      return fromStore.configs.map((cfgs) => cfgs.filter(predicate)).toNullable() || []
    },
    loadById: (id: string) => {
      return record.lookup(id, fromStore.configsById).toNullable()
    },
    loadByURL: (url: string) => {
      return [] // axios
    },
  }

  const { focusedConfig, entityTypeConfig, editorLanguage } = React.useMemo(() => {
    const focusedConfig = record.lookup(normalizeURLParams(configId), fromStore.configsById)
    const entityTypeConfig = focusedConfig.chain((c) => record.lookup(c.type, fromStore.entityTypes))
    const editorLanguage = entityTypeConfig
      .chain((etc) => etc.config)
      .chain(fromStrToJSONRec)
      .chain((config) => record.lookup("lang", config))
      .chain((lang) => fromEither(EditorLangCodec.decode(lang)))
      .getOrElse(fromStore.defaultEntityTypeConfig.lang)

    return { focusedConfig, entityTypeConfig, editorLanguage }
  }, [configId, fromStore.configsById, fromStore.entityTypes, fromStore.defaultEntityTypeConfig.lang])

  const isRootConfig = entityTypeConfig.map(({ id }) => id === configId).getOrElse(false)
  const configComponents = isRootConfig
    ? ROOT_CONFIG_COMPONENTS
    : (() => {
        // First check in the manual overrides
        const layoutMappingRecords = record.lookup("LayoutMapping", fromStore.configsByType)
        // TODO: Traverse up the type-of relationship to find if a parent type has layout assignments
        const collectedLayoutOverrides = layoutMappingRecords
          .map((layoutMappings) =>
            layoutMappings.reduce(
              (result, layoutMapping) => {
                const configOption = tryCatch(() => JSON5.parse(layoutMapping.config.getOrElse("{}")))

                configOption.map(({ layout, entityTypes, configs }) => {
                  if (layout) {
                    if (configs && configs.includes(configId)) {
                      result.byConfigId.push(layout)
                    }
                    if (entityTypes && entityTypeConfig.map(({ id }) => entityTypes.includes(id)).getOrElse(false)) {
                      result.byEntityType.push(layout)
                    }
                  }
                })

                return result
              },
              { byEntityType: [] as string[], byConfigId: [] as string[] }
            )
          )
          .toNullable()

        // Were there any LayoutMapping assignments for this item?
        if (collectedLayoutOverrides) {
          if (collectedLayoutOverrides.byConfigId.length) {
            // TODO: Eventually merge these layouts, perhaps?
            const layout = record
              .lookup(collectedLayoutOverrides.byConfigId[0], fromStore.configsById)
              .chain(({ config }) =>
                tryCatch(() => JSON5.parse(config.getOrElse("{}")).layout as ComponentDefinition[])
              )
              .toNullable()

            if (layout) {
              return layout
            }
          }
        }

        return entityTypeConfig
          .map((parentType) => {
            return tryCatch(() => JSON5.parse(parentType.config.getOrElse("{}")).layout).getOrElse(
              ROOT_CONFIG_COMPONENTS
            )
          })
          .getOrElse(ROOT_CONFIG_COMPONENTS) as ComponentDefinition[]
      })()

  const config = focusedConfig.toNullable()
  const jsonData = (
    editorLanguage === "json" && config ? tryCatch(() => JSON5.parse(config.config.getOrElse(""))) : none
  ).toNullable()
  const jsonHasErrors = !jsonData

  const association = focusedConfig.chain(({ id }) => record.lookup(id, fromStore.associations))
  return (
    <>
      <Skeleton active loading={fromStore.configs.isPending()}>
        <Helmet>
          <title>No Configuration Found | Channel Admin | OPG</title>
        </Helmet>

        {focusedConfig.foldL(
          None(() => <Empty description={`No config found with id ${configId}`} />),
          Some((config) => (
            <>
              {entityTypeConfig.isNone() && (
                <Alert
                  banner
                  closable
                  description={`No config of type "EntityType" could be found for configs of type "${config.type}." For the best experience, please create an EntityType config for ${config.type}`}
                  message={`No EntityType exists for ${config.type}`}
                  type="warning"
                />
              )}
              <Helmet>
                <title>{config.name} | Configuration | Channel Admin | OPG</title>
              </Helmet>

              <Card
                bordered={false}
                extra={
                  <Button.Group>
                    {record.lookup(config.name, fromStore.entityTypes).fold(null, () => (
                      <Button size="small">
                        <Reach.Link to={`../create?type=${config.name}`}>
                          <Icon type="plus" /> New {config.name}
                        </Reach.Link>
                      </Button>
                    ))}
                    <Button size="small">
                      <Reach.Link
                        to={`../create?type=${encodeURIComponent(config.type)}&name=${encodeURIComponent(
                          fromStore.configNames
                            ? generateUniqueCopyName(config.name, fromStore.configNames)
                            : config.name
                        )}&config=${tryCatch(() => encodeURIComponent(config.config.getOrElse("{}"))).getOrElse("")}`}>
                        <Icon type="copy" /> Copy to New
                      </Reach.Link>
                    </Button>

                    <Button type="primary" size="small">
                      <Reach.Link to="./edit">
                        <Icon type="edit" /> Edit
                      </Reach.Link>
                    </Button>
                  </Button.Group>
                }
                title={`Config Details`}>
                <Form labelAlign="left" layout="horizontal" {...formItemLayout} style={{ width: "100%" }}>
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
                    <Tabs
                      defaultActiveKey={
                        configComponents && configComponents.length && !jsonHasErrors ? "form" : "editor"
                      }>
                      <Tabs.TabPane
                        key={"form"}
                        tab={"Properties"}
                        disabled={!configComponents || !configComponents.length || jsonHasErrors}>
                        {jsonHasErrors ? (
                          <Alert
                            type="error"
                            description="Please correct errors in the JSON before attempting to edit the layout."
                            message="JSON Errors"
                          />
                        ) : (
                          <UserInterface
                            contextManager={userInterfaceContextManager}
                            data={jsonData}
                            getRootUserInterfaceData={() => jsonData}
                            onChangeRootData={() => void 0}
                            mode="display"
                            components={configComponents}
                          />
                        )}
                        {/* <Alert type="info" message={form.values.config} /> */}
                      </Tabs.TabPane>
                      <Tabs.TabPane key={"editor"} tab={"Developer Editor"}>
                        <CodeEditor
                          document={config.config.getOrElse("")}
                          documentDraft={none}
                          height={500}
                          language={editorLanguage}
                          outputType="string"
                          width="100%"
                        />
                      </Tabs.TabPane>
                    </Tabs>
                  </Form.Item>
                </Form>
              </Card>
              <br />
              <Card bordered={false} title="Relationships">
                <div>
                  {/* <Typography.Title>Relationships</Typography.Title> */}
                  {association.foldL(
                    () => (
                      <Empty description={`No configs found related to ${configId}`} />
                    ),
                    (assoc) => (
                      <>
                        {config.name}
                        <Tree.DirectoryTree>
                          {record.toArray(assoc).map(([key, guidArray]) => (
                            <Tree.TreeNode selectable={false} title={`${key} (${guidArray.length})`} key={key}>
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
                                          <Reach.Link to={`../${guid}`}>{guid}</Reach.Link> is not a known Global Config
                                          ID
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
                                          <Reach.Link to={`../${guid}`}>{r.name}</Reach.Link>
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
      <PageBeacon
        data={{
          reportId: null,
          appName: "Legacy Site",
          pageTitle: "Global Configs - Show Config",
        }}
        pageReady={true}
      />
    </>
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

/**
 * Determines a unique name by appending Copy, Copy 1, Copy 2, Copy 3, etc until a unique name is found
 * @param baseName The starting name to use
 * @param existingNames The list of names from the store
 */
function generateUniqueCopyName(baseName: string, existingNames: string[] = []) {
  const nameSet = new Set(existingNames.map((str) => str.toLowerCase()))

  let resultingName = `${baseName} Copy`
  let copyIndex = 1
  while (nameSet.has(resultingName.toLowerCase())) {
    resultingName = `${baseName} Copy ${copyIndex++}`
  }

  return resultingName
}

export default ShowGlobalConfig
