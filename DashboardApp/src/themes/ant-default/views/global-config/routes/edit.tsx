import { ROOT_CONFIG_COMPONENTS } from "../index"
import * as Reach from "@reach/router"
import { Alert, Button, Card, Empty, Form, Input, Skeleton, Tabs, Typography } from "antd"
import * as Formik from "formik"
import { array } from "fp-ts/lib/Array"
import { findFirst } from "fp-ts/lib/Foldable2v"
import { Identity } from "fp-ts/lib/Identity"
import { fromEither, none, Option, some, tryCatch } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import { getStructSetoid, setoidString } from "fp-ts/lib/Setoid"
import JSON5 from "json5"
import React from "react"
import { Helmet } from "react-helmet"
import { ConfirmableDeleteButton } from "../../../../../components/ConfirmableDeleteButton"
import { AdminUserInterfaceContextManager } from "../../../../../data/AdminUserInterfaceContextManager.type"
import { fromStrToJSONRec } from "../../../../../data/JSON"
import { None, Some } from "../../../../../data/Option"
import { useMemoPlus } from "../../../../../hooks/use-memo-plus"
import { useRematch } from "../../../../../hooks/use-rematch"
import { isWhitespace } from "../../../../../lib/string"
import { store } from "../../../../../state/store"
import { CodeEditor, ComponentDefinition, EditorLangCodec, UserInterface } from "@opg/interface-builder"
import { InProgressRemoteUpdateDraft, PersistedConfig } from "../../../../../data/GlobalConfig.Config"
import * as iots from "io-ts"
import { WithRouteProps } from "../../../../../state/navigation"
import styles from "./edit.module.scss"

interface Props {
  configId: string
}

export function EditGlobalConfig({
  children,
  configId,
  location,
  navigate,
  path,
  uri,
}: WithRouteProps<Props>): JSX.Element {
  const [fromStore, dispatch] = useRematch((appState) => ({
    configs: appState.globalConfig.configs,
    configsById: store.select.globalConfig.configsById(appState),
  }))

  const [focusedConfig, prevFocusedConfig] = useMemoPlus(
    () => record.lookup(configId.toLowerCase(), fromStore.configsById),
    [configId, fromStore.configsById]
  )

  /* afterDelete */
  React.useEffect(() => {
    if (prevFocusedConfig.isSome() && focusedConfig.isNone()) {
      dispatch.navigation.goToGlobalConfigs(none)
    }
  }, [dispatch.navigation, focusedConfig, prevFocusedConfig])

  return (
    <Skeleton active loading={fromStore.configs.isPending()}>
      <Helmet>
        <title>No Configuration Found | Channel Admin | OPG</title>
      </Helmet>

      {focusedConfig.foldL(
        None(() => <Empty description={`No config found with id ${configId}`} />),
        Some((config) => <UpdatePersistedConfigForm config={config} />)
      )}
    </Skeleton>
  )
}

function UpdatePersistedConfigForm(props: { config: PersistedConfig }) {
  const [fromStore, dispatch] = useRematch((appState) => ({
    configs: appState.globalConfig.configs,
    configsById: store.select.globalConfig.configsById(appState),
    configNames: store.select.globalConfig.configNames(appState),
    configsByType: store.select.globalConfig.configsByType(appState),
    defaultEntityTypeConfig: appState.globalConfig.defaultEntityTypeConfig,
    entityTypes: store.select.globalConfig.entityTypeConfigs(appState),
    isUpdatingRemoteConfig: appState.loading.effects.globalConfig.updateRemoteConfig,
    isDeletingRemoteConfig: appState.loading.effects.globalConfig.deleteRemoteConfigs,
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

  const [updatedConfig, setUpdatedConfig] = React.useState<Option<InProgressRemoteUpdateDraft>>(none)

  const entityTypeConfig = React.useMemo(() => record.lookup(props.config.type, fromStore.entityTypes), [
    fromStore.entityTypes,
    props.config.type,
  ])

  const isRootConfig = entityTypeConfig.map(({ id }) => id === props.config.id).getOrElse(false)
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
                    if (configs && configs.includes(props.config.id)) {
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
          console.log("GlobalConfig.edit", collectedLayoutOverrides)
          if (collectedLayoutOverrides.byConfigId.length) {
            // TODO: Eventually merge these layouts, perhaps?
            const layout = record
              .lookup(collectedLayoutOverrides.byConfigId[0], fromStore.configsById)
              .chain(({ config }) => {
                const parseResult = tryCatch(() => JSON5.parse(config.getOrElse("{}")).layout as ComponentDefinition[])

                if (!parseResult) {
                  console.warn("GlobalConfig.edit", "Failed to parse", config.getOrElse("null"))
                }

                return parseResult
              })
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

  const { configLang, configNameMaxLength } = React.useMemo(() => {
    const configOption = entityTypeConfig.chain((etc) => etc.config).chain(fromStrToJSONRec)
    const configLang = configOption
      .chain((config) => record.lookup("lang", config))
      .chain((lang) => fromEither(EditorLangCodec.decode(lang)))
      .getOrElse(fromStore.defaultEntityTypeConfig.lang)
    const configNameMaxLength = configOption
      .chain((config) => record.lookup("nameMaxLength", config))
      .chain((nameMaxLength) => fromEither(iots.union([iots.undefined, iots.number]).decode(nameMaxLength)))
      .getOrElse(fromStore.defaultEntityTypeConfig.nameMaxLength)

    return { configLang, configNameMaxLength }
  }, [entityTypeConfig, fromStore.defaultEntityTypeConfig])

  const existingConfigNames = React.useMemo(() => {
    return fromStore.configNames.filter((name) => name !== props.config.name)
  }, [fromStore.configNames, props.config.name])

  const initialFormState = {
    config: props.config.config.map((c) => c.toString()).getOrElse(""),
    name: props.config.name,
  }

  const [configErrors, setConfigErrors] = React.useState([] as string[])

  const [previewData, setPreviewData] = React.useState({})

  /* afterCreate */
  React.useEffect(() => {
    updatedConfig.chain(findInStore).foldL(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      None(() => {}),
      Some((c) => {
        dispatch.navigation.showGlobalConfigById({ id: c.id, navOpts: { replace: true } })
      })
    )

    function findInStore(c: InProgressRemoteUpdateDraft): Option<PersistedConfig> {
      return findFirst(array)(fromStore.configs.getOrElse([]), (c1) =>
        equals(c, { ...c1, config: c1.config.getOrElse("") })
      )
    }
    function equals<T extends InProgressRemoteUpdateDraft>(a: T, b: T): boolean {
      return getStructSetoid({
        config: setoidString,
        id: setoidString,
        name: setoidString,
        type: setoidString,
      }).equals(a, b)
    }
  }, [dispatch, fromStore.configs, updatedConfig])

  return (
    <>
      {entityTypeConfig.isNone() && (
        <Alert
          banner
          closable
          description={`No config of type "EntityType" could be found for configs of type "${props.config.type}." For the best experience, please create an EntityType config for ${props.config.type}`}
          message={`No EntityType exists for ${props.config.type}`}
          type="warning"
        />
      )}

      <Formik.Formik
        initialValues={initialFormState}
        enableReinitialize
        validate={(vs) =>
          new Identity({})
            .map((errs) => ({
              ...errs,
              config: configErrors.length
                ? some(configErrors.join("\n"))
                : isWhitespace(vs.config)
                ? some("Cannot be empty")
                : none,
            }))
            .map((errs) => ({
              ...errs,
              name: isWhitespace(vs.name)
                ? some("Cannot be empty")
                : existingConfigNames.map((n) => n.toLowerCase()).includes(vs.name.toLowerCase())
                ? some("Name already taken")
                : none,
            }))
            .map(record.compact)
            .extract()
        }
        onSubmit={(values, { setSubmitting }) => {
          setUpdatedConfig(some({ ...props.config, ...values }))
          dispatch.globalConfig
            .updateRemoteConfig({
              prevState: { ...props.config },
              nextState: { ...props.config, ...values },
              parent: record.lookup(props.config.type, fromStore.entityTypes).toUndefined(),
            })
            .then(() => setSubmitting(false))
        }}>
        {(form) => (
          <>
            <Helmet>
              <title>{form.values.name} | Edit Configuration | Channel Admin | OPG</title>
            </Helmet>

            <Card
              bordered={false}
              extra={
                <Button.Group size="small">
                  <Button
                    disabled={!form.isValid}
                    form="edit-config-form"
                    htmlType="submit"
                    icon={fromStore.isUpdatingRemoteConfig ? "loading" : "save"}
                    key="save"
                    loading={fromStore.isUpdatingRemoteConfig}
                    size="small"
                    type="primary">
                    Save
                  </Button>

                  <Button
                    icon="rollback"
                    key="revert"
                    size="small"
                    type="default"
                    disabled={!form.dirty}
                    onClick={form.handleReset}>
                    Revert
                  </Button>

                  <ConfirmableDeleteButton
                    confirmationMessage={`Are you sure want to delete?`}
                    confirmationTitle={`Confirm Delete`}
                    loading={fromStore.isDeletingRemoteConfig}
                    size="small"
                    onDelete={() =>
                      dispatch.globalConfig.deleteRemoteConfigs([
                        {
                          prevState: props.config,
                          parent: record.lookup(props.config.type, fromStore.entityTypes).toUndefined(),
                        },
                      ])
                    }>
                    Delete
                  </ConfirmableDeleteButton>
                </Button.Group>
              }
              title={`Edit Config`}>
              <Form
                id="edit-config-form"
                labelAlign="left"
                layout="horizontal"
                onSubmit={form.handleSubmit}
                {...formItemLayout}
                style={{ width: "100%" }}>
                {/* ---------- Config.Type Input ---------------- */}
                <Form.Item label="Type" style={{ width: "100%" }}>
                  <Typography.Text>
                    {entityTypeConfig.foldL(
                      None(() => <>{props.config.type}</>),
                      Some((etc) => <Reach.Link to={`../../${etc.id}`}>{props.config.type}</Reach.Link>)
                    )}
                  </Typography.Text>
                </Form.Item>

                {/* ---------- Config.Name Input ---------------- */}
                <Form.Item
                  hasFeedback={!!form.touched.name}
                  help={form.touched.name && form.errors.name}
                  label="Name"
                  required={true}
                  validateStatus={form.touched.name && form.errors.name ? "error" : "success"}>
                  <Input
                    placeholder="Enter a unique config name"
                    name="name"
                    value={form.values.name}
                    onBlur={form.handleBlur}
                    onChange={form.handleChange}
                    maxLength={configNameMaxLength}
                  />
                </Form.Item>

                {/* ---------- Config.Config Input ---------------- */}
                <Form.Item
                  hasFeedback={form.touched.config}
                  help={form.touched.config && form.errors.config}
                  label="Config"
                  required={true}
                  validateStatus={form.errors.config ? "error" : "success"}>
                  <Tabs
                    defaultActiveKey={configComponents && configComponents.length ? "form" : "editor"}
                    className={styles.antTabsNoOverflowHiddenHack}>
                    <Tabs.TabPane
                      key={"form"}
                      tab={"Properties"}
                      disabled={!configComponents || !configComponents.length || !!form.errors.config}>
                      {form.errors.config ? (
                        <Alert
                          type="error"
                          description="Please correct errors in the JSON before attempting to edit the layout."
                          message="JSON Errors"
                        />
                      ) : (
                        <UserInterface
                          contextManager={userInterfaceContextManager}
                          data={tryCatch(() => JSON5.parse(form.values.config)).getOrElse({})}
                          onChangeData={(value: any) => {
                            console.log("edit", "UserInterface.onChangeData", "new config", value)
                            form.setFieldValue("config", JSON.stringify(value, null, 2))
                            form.setFieldTouched("config", true)
                          }}
                          mode="display"
                          components={configComponents}
                        />
                      )}
                      {/* <Alert type="info" message={form.values.config} /> */}
                    </Tabs.TabPane>
                    <Tabs.TabPane key={"editor"} tab={"Developer Editor"}>
                      <CodeEditor
                        content={props.config.config.getOrElse("")}
                        contentDraft={some(form.values.config)}
                        height={500}
                        language={configLang}
                        width="100%"
                        onChange={({ value, errors }) => {
                          errors.map((errors) => {
                            setConfigErrors(errors)
                          })
                          form.setFieldValue("config", value)
                          form.setFieldTouched("config", true)
                        }}
                      />
                    </Tabs.TabPane>
                  </Tabs>
                </Form.Item>
              </Form>
            </Card>
          </>
        )}
      </Formik.Formik>
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

export default EditGlobalConfig
