import * as Formik from "formik"
import { Do } from "fp-ts-contrib/lib/Do"
import { array } from "fp-ts/lib/Array"
import { findFirst } from "fp-ts/lib/Foldable2v"
import { Identity } from "fp-ts/lib/Identity"
import * as record from "fp-ts/lib/Record"
import { getStructSetoid, setoidString } from "fp-ts/lib/Setoid"
import JSON5 from "json5"
import queryString from "query-string"
import React from "react"
import { Helmet } from "react-helmet"
import { Space } from "../../../../../components/space"
import { AdminUserInterfaceContextManager } from "../../../../../data/AdminUserInterfaceContextManager"
import { fromStrToJSONRec } from "../../../../../data/JSON"
import { None, Some } from "../../../../../data/Option"
import { useRematch, useStatePlus } from "../../../../../hooks"
import { determineLayoutComponents } from "../../../../../lib/determine-layout-components"
import { isWhitespace } from "../../../../../lib/string"
import { WithRouteProps } from "../../../../../state/navigation"
import { store } from "../../../../../state/store"
import { AppSelectors } from "../../../../../state/store.types"
import {
  CodeEditor,
  EditorLangCodec,
  editorLanguages,
  getDefaultsFromComponentDefinitions,
  UserInterface,
} from "@opg/interface-builder"
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Icon,
  Input,
  Modal,
  Row,
  Select,
  Skeleton,
  Tabs,
} from "antd"
import {
  fromEither,
  getSetoid as getOptionSetoid,
  none,
  Option,
  option,
  some,
  tryCatch,
} from "fp-ts/lib/Option"
import {
  InProgressLocalDraftConfig,
  PersistedConfig,
} from "../../../../../data/GlobalConfig.Config"

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
    configNames: store.select.globalConfig.configNames(s),
    defaultEntityTypeConfig: s.globalConfig.defaultEntityTypeConfig,
    entityTypes: store.select.globalConfig.entityTypeConfigs(s),
    entityTypeConfigs: store.select.globalConfig.entityTypeConfigs(s),
    isCreatingConfig: s.loading.effects.globalConfig.createRemoteConfig,
    reportDataByQuery: s.reports.reportDataByQuery,
  }))

  const [setState, state, prevState] = useStatePlus({
    shouldShowConfigTypeSelectDropdown: false,
    shouldShowCreateEntityModal: false,
    createdConfig: none as Option<InProgressLocalDraftConfig>,
  })

  const [configErrors, setConfigErrors] = React.useState([] as string[])

  const entityTypeNames = React.useMemo(() => {
    return Object.values(fromStore.entityTypeConfigs).map((c) => c.name)
  }, [fromStore.entityTypeConfigs])

  const toggleCreateEntityTypeModal = React.useCallback(() => {
    setState((s) => ({ ...s, shouldShowCreateEntityModal: !s.shouldShowCreateEntityModal }))
  }, [setState])

  const setShouldShowConfigTypeSelectDropdown = React.useCallback(() => {
    setState((s) => ({
      ...s,
      shouldShowConfigTypeSelectDropdown: !s.shouldShowConfigTypeSelectDropdown,
    }))
  }, [setState])

  const userInterfaceContextManager: AdminUserInterfaceContextManager = {
    executeQuery: dispatch.reports.executeQuery.bind(dispatch.reports),
    reportDataByQuery: fromStore.reportDataByQuery,
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

  const initialFormState = React.useMemo(() => {
    const formState = {
      config: '{"lang":"json"}',
      name: "",
      type: "",
      ...queryString.parse(window.location.search),
    }

    const countConfigLines = formState.config.split("\n").length

    if (formState.type && countConfigLines <= 3) {
      // When changing the type, if there are 3 or fewer lines of config
      // then it's pretty safe to assume that the config has not been edited
      // So, set the form to its defaults
      formState.config = determineConfigDefaults(
        formState.type,
        fromStore.entityTypes,
        fromStore.configsByType,
        fromStore.configsById
      )
    }

    return formState
  }, [
    window.location.search,
    fromStore.entityTypes,
    fromStore.configsByType,
    fromStore.configsById,
  ])

  const [previewData, setPreviewData] = React.useState({})

  /* afterCreate */
  React.useEffect(() => {
    state.createdConfig.chain(findInStore).foldL(
      None(() => {}),
      Some((c) => {
        dispatch.navigation.showGlobalConfigById({ id: c.id, navOpts: { replace: true } })
      })
    )

    function findInStore(c: InProgressLocalDraftConfig): Option<PersistedConfig> {
      return findFirst(array)(fromStore.configs.getOrElse([]), (c1) =>
        equals(c, { ...c1, config: c1.config.getOrElse("") })
      )
    }
    function equals<T extends InProgressLocalDraftConfig>(a: T, b: T): boolean {
      return getStructSetoid({
        config: setoidString,
        name: setoidString,
        type: setoidString,
      }).equals(a, b)
    }
  }, [dispatch, fromStore.configs, prevState.createdConfig, state.createdConfig])

  //
  // ─── RENDER ─────────────────────────────────────────────────────────────────────
  //

  return (
    <Skeleton active loading={fromStore.configs.isPending()}>
      <Formik.Formik
        initialValues={initialFormState}
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
                : fromStore.configNames.map((n) => n.toLowerCase()).includes(vs.name.toLowerCase())
                ? some("Name already taken")
                : none,
            }))
            .map((errs) => ({
              ...errs,
              type: isWhitespace(vs.type)
                ? some("Cannot be empty")
                : !entityTypeNames.some((name) => name === vs.type)
                ? some("Type does not exist")
                : none,
            }))
            .map(record.compact)
            .extract()
        }
        onSubmit={(values, { setSubmitting }) => {
          setState({ createdConfig: some(values) })
          dispatch.globalConfig.createRemoteConfig(values).then(() => setSubmitting(false))
        }}>
        {(form) => {
          const entityTypeConfig = record.lookup(form.values.type, fromStore.entityTypes)

          const configComponents = determineLayoutComponents(
            fromStore.configsById,
            fromStore.configsByType,
            entityTypeConfig
          )

          return (
            <>
              <Helmet>
                <title>
                  {form.values.name || "New Item"} | Create Configuration | Channel Admin | OPG
                </title>
              </Helmet>

              <Card
                bordered={false}
                extra={
                  <>
                    {/* --------- Save Button ----------- */}
                    <Button
                      htmlType="submit"
                      form="create-config-form"
                      icon={fromStore.isCreatingConfig ? "loading" : "save"}
                      key="save"
                      loading={fromStore.isCreatingConfig}
                      size="small"
                      type="primary">
                      Save
                    </Button>
                  </>
                }
                title={`Create Config`}>
                <Form
                  id="create-config-form"
                  labelAlign="left"
                  layout="horizontal"
                  onSubmit={form.handleSubmit}
                  {...formItemLayout}
                  style={{ width: "100%" }}>
                  {/* ---------- Config.Type Input ---------------- */}
                  <Form.Item
                    hasFeedback={form.touched.type}
                    help={form.touched.type && form.errors.type}
                    label="Type"
                    required={true}
                    validateStatus={form.touched.type && form.errors.type ? "error" : "success"}>
                    <Select
                      dropdownRender={(menu) => (
                        <>
                          {menu}
                          <Button
                            block
                            ghost
                            type="primary"
                            onMouseDown={toggleCreateEntityTypeModal}>
                            <Icon type="plus-circle" /> New Entity Type
                          </Button>
                        </>
                      )}
                      open={state.shouldShowConfigTypeSelectDropdown}
                      placeholder="Select a config type"
                      style={{ width: "100%" }}
                      onDropdownVisibleChange={setShouldShowConfigTypeSelectDropdown}
                      value={form.values.type}
                      onBlur={() => form.handleBlur({ target: { name: "type" } })}
                      onChange={(val: any) => {
                        form.setFieldValue("type", val)
                        const countConfigLines = form.values.config.split("\n").length

                        if (countConfigLines <= 3) {
                          // When changing the type, if there are 3 or fewer lines of config
                          // then it's pretty safe to assume that the config has not been edited
                          // So, set the form to its defaults
                          const configDefaults = determineConfigDefaults(
                            val,
                            fromStore.entityTypes,
                            fromStore.configsByType,
                            fromStore.configsById
                          )
                          form.setFieldValue("config", configDefaults)
                        }
                      }}>
                      {entityTypeNames.map((type) => (
                        <Select.Option key={type}>{type}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {/* ---------- Config.Name Input ---------------- */}
                  <Form.Item
                    hasFeedback={form.touched.name}
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
                      defaultActiveKey={
                        configComponents && configComponents.length ? "form" : "editor"
                      }>
                      <Tabs.TabPane
                        key={"form"}
                        tab={"Properties"}
                        disabled={
                          !configComponents || !configComponents.length || !!form.errors.config
                        }>
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
                            onChangeData={(value) => {
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
                      <Tabs.TabPane key={"display"} tab={"Preview"} disabled={!!form.errors.config}>
                        {form.errors.config ? (
                          <Alert
                            type="error"
                            description="Please correct errors in the JSON before attempting to preview the layout."
                            message="JSON Errors"
                          />
                        ) : (
                          <UserInterface
                            contextManager={userInterfaceContextManager}
                            data={previewData}
                            onChangeData={(value) => {
                              console.log(
                                "edit",
                                "UserInterface.onChangeData",
                                "display config",
                                value
                              )
                              setPreviewData(value)
                              // form.setFieldValue("config", JSON.stringify(value, null, 2))
                              // form.setFieldTouched("config", true)
                            }}
                            mode="display"
                            components={tryCatch(() => {
                              const layout = JSON5.parse(form.values.config).layout
                              return layout && (Array.isArray(layout) ? layout : [layout])
                            }).getOrElse([])}
                          />
                        )}
                      </Tabs.TabPane>
                      <Tabs.TabPane key={"editor"} tab={"Developer Editor"}>
                        <CodeEditor
                          content={""}
                          contentDraft={some(form.values.config)}
                          height={500}
                          language={record
                            .lookup(form.values.type, fromStore.entityTypeConfigs)
                            .chain((etc) => etc.config)
                            .chain(fromStrToJSONRec)
                            .chain((config) => record.lookup("lang", config))
                            .chain((lang) => fromEither(EditorLangCodec.decode(lang)))
                            .getOrElse(fromStore.defaultEntityTypeConfig.lang)}
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
              <CreateEntityTypeModal
                isVisible={state.shouldShowCreateEntityModal}
                onDidCreate={(config) => form.setFieldValue("type", config.name)}
                onRequestClose={toggleCreateEntityTypeModal}
              />
            </>
          )
        }}
      </Formik.Formik>
    </Skeleton>
  )
}

// ────────────────────────────────────────────────────────────────────────────────

function CreateEntityTypeModal(props: {
  isVisible: boolean
  onDidCreate: (c: PersistedConfig) => void
  onRequestClose: () => void
}) {
  const [fromStore, dispatch] = useRematch((s) => ({
    configs: s.globalConfig.configs,
    configsByType: store.select.globalConfig.configsByType(s),
    isCreatingConfig: s.loading.effects.globalConfig.createRemoteConfig,
  }))

  const initialFormState = React.useMemo(() => ({ name: "", lang: "" }), [])

  const [submittedDraft, setSubmittedDraft] = React.useState<Option<InProgressLocalDraftConfig>>(
    none
  )

  const resetState = React.useCallback(() => setSubmittedDraft(none), [])

  const existingEntityTypes = React.useMemo(() => {
    return record.lookup("EntityType", fromStore.configsByType).getOrElse([])
  }, [fromStore.configsByType])

  const validateForm = React.useCallback(
    (vs: typeof initialFormState) => {
      return new Identity({})
        .map((errs) => ({
          ...errs,
          name: isWhitespace(vs.name)
            ? some("Required")
            : existingEntityTypes.map((et) => et.name.toLowerCase()).includes(vs.name.toLowerCase())
            ? some("Name already taken")
            : none,
        }))
        .map((errs) => ({ ...errs, lang: isWhitespace(vs.lang) ? some("Required") : none }))
        .map(record.compact)
        .extract()
    },
    [existingEntityTypes, initialFormState]
  )

  const resetForm = React.useCallback(
    (values: typeof initialFormState, form: Formik.FormikActions<typeof initialFormState>) => {
      props.onRequestClose()
      resetState()
    },
    [initialFormState, props, resetState]
  )

  const submitForm = React.useCallback(
    async function(
      values: typeof initialFormState,
      form: Formik.FormikActions<typeof initialFormState>
    ): Promise<void> {
      const draft = {
        type: "EntityType",
        name: values.name,
        config: JSON.stringify({ lang: values.lang }),
      }

      await dispatch.globalConfig.createRemoteConfig(draft)
      setSubmittedDraft(some(draft))
      form.setSubmitting(false)
    },
    [dispatch.globalConfig, initialFormState]
  )

  React.useEffect(
    function afterCreate() {
      Do(option)
        .bind("configs", fromStore.configs.toOption())
        .bind("draft", submittedDraft)
        .done()
        .chain(({ configs, draft }) => findFirst(array)(configs, (c) => isSame(c, draft)))
        .foldL(
          None(() => {}),
          Some((c) => {
            props.onDidCreate(c)
            props.onRequestClose()
            resetState()
          })
        )

      function isSame(a: PersistedConfig, b: InProgressLocalDraftConfig): boolean {
        return getStructSetoid({
          config: getOptionSetoid(setoidString),
          name: setoidString,
          type: setoidString,
        }).equals(a, { ...b, config: some(b.config) })
      }
    },
    [dispatch, fromStore.configs, props, resetState, submittedDraft]
  )
  // ────────────────────────────────────────────────────────────────────────────────
  if (!props.isVisible) return null
  return (
    <Formik.Formik
      initialValues={initialFormState}
      validate={validateForm}
      validateOnChange={true}
      onReset={resetForm}
      onSubmit={submitForm}>
      {(form) => (
        <Modal
          centered
          closable={false}
          destroyOnClose
          footer={null}
          title="Create New Entity Type"
          visible={props.isVisible}
          onCancel={form.handleReset}>
          <Form id="create-entity-type-form" layout="vertical" onSubmit={form.handleSubmit}>
            <Form.Item
              hasFeedback={form.touched.name}
              help={form.touched.name && form.errors.name}
              label="Name"
              required={true}
              validateStatus={form.errors.name ? "error" : "success"}>
              <Input
                name="name"
                placeholder={`Enter a unique EntityType name`}
                value={form.values.name}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
              />
            </Form.Item>
            <Form.Item
              hasFeedback={form.touched.lang}
              help={form.touched.lang && form.errors.lang}
              label="Language"
              required={true}
              validateStatus={form.errors.lang ? "error" : "success"}>
              <Select
                placeholder={
                  form.values.name
                    ? `Select the config language for ${form.values.name}`
                    : `Select the config language`
                }
                onBlur={() => form.handleBlur({ target: { name: "lang" } })}
                onChange={(val) => {
                  form.setFieldTouched("lang")
                  form.setFieldValue("lang", val)
                }}>
                {Object.values(editorLanguages).map((lang) => (
                  <Select.Option key={lang} title={lang} value={lang}>
                    {lang}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Row type="flex">
              <Col span={12} />
              <Col span={12}>
                <Row align="middle" justify="end" type="flex">
                  <Button
                    disabled={fromStore.isCreatingConfig}
                    icon="close-circle"
                    onClick={form.handleReset}>
                    Cancel
                  </Button>
                  <Space.Vertical width={8} />
                  <Button
                    form="create-entity-type-form"
                    htmlType="submit"
                    icon="save"
                    loading={fromStore.isCreatingConfig}
                    type="primary">
                    Save
                  </Button>
                </Row>
              </Col>
            </Row>
          </Form>
        </Modal>
      )}
    </Formik.Formik>
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

const determineConfigDefaults = (
  selectedType: string,
  entityTypes: ReturnType<AppSelectors["globalConfig"]["entityTypeConfigs"]>,
  configsById: ReturnType<AppSelectors["globalConfig"]["configsById"]>,
  configsByType: ReturnType<AppSelectors["globalConfig"]["configsByType"]>
) => {
  const newEntityTypeConfig = record.lookup(selectedType, entityTypes)

  const newComponents = determineLayoutComponents(configsById, configsByType, newEntityTypeConfig)

  return newComponents
    ? JSON.stringify(getDefaultsFromComponentDefinitions(newComponents))
    : newEntityTypeConfig
        .chain(({ config }) =>
          config.chain((cfg) => tryCatch(() => JSON5.parse(cfg).lang as string))
        )
        .map((lang) => (lang === "json" ? JSON.stringify({ lang: "json" }) : ""))
        .getOrElse("")
}

export default CreateGlobalConfig
