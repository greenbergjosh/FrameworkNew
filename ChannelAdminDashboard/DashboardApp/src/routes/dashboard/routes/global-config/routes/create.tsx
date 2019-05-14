import { Button, Card, Col, Form, Icon, Input, Modal, Row, Select, Skeleton } from "antd"
import * as Formik from "formik"
import { Do } from "fp-ts-contrib/lib/Do"
import { array } from "fp-ts/lib/Array"
import { findFirst } from "fp-ts/lib/Foldable2v"
import { Identity } from "fp-ts/lib/Identity"
import {
  fromEither,
  getSetoid as getOptionSetoid,
  none,
  Option,
  option,
  some,
} from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import { getStructSetoid, setoidString } from "fp-ts/lib/Setoid"
import React from "react"
import { CodeEditor, EditorLangCodec, editorLanguages } from "../../../../../components/code-editor"
import { Space } from "../../../../../components/space"
import {
  InProgressLocalDraftConfig,
  PersistedConfig,
} from "../../../../../data/GlobalConfig.Config"
import { fromStrToJSONRec } from "../../../../../data/JSON"
import { None, Some } from "../../../../../data/Option"
import { useRematch } from "../../../../../hooks/use-rematch"
import { useStatePlus } from "../../../../../hooks/use-state-plus"
import { isWhitespace } from "../../../../../lib/string"
import { WithRouteProps } from "../../../../../state/navigation"
import { store } from "../../../../../state/store"

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
    configNames: store.select.globalConfig.configNames(s),
    defaultEntityTypeConfig: s.globalConfig.defaultEntityTypeConfig,
    entityTypeConfigs: store.select.globalConfig.entityTypeConfigs(s),
    isCreatingConfig: s.loading.effects.globalConfig.createRemoteConfig,
  }))

  const [setState, state, prevState] = useStatePlus({
    shouldShowConfigTypeSelectDropdown: false,
    shouldShowCreateEntityModal: false,
    createdConfig: none as Option<InProgressLocalDraftConfig>,
  })

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
              config: isWhitespace(vs.config) ? some("Cannot be empty") : none,
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
        {(form) => (
          <>
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
                    onChange={(val) => form.setFieldValue("type", val)}>
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
                    onChange={(val) => {
                      form.setFieldValue("config", val)
                      form.setFieldTouched("config", true)
                    }}
                  />
                </Form.Item>
              </Form>
            </Card>
            <CreateEntityTypeModal
              isVisible={state.shouldShowCreateEntityModal}
              onDidCreate={(config) => form.setFieldValue("type", config.name)}
              onRequestClose={toggleCreateEntityTypeModal}
            />
          </>
        )}
      </Formik.Formik>
    </Skeleton>
  )
}

const initialFormState = {
  config: "",
  name: "",
  type: "",
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

export default CreateGlobalConfig
