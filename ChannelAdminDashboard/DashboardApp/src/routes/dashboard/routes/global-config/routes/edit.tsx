import * as Reach from "@reach/router"
import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Skeleton,
  Typography
  } from "antd"
import * as Formik from "formik"
import { array } from "fp-ts/lib/Array"
import { findFirst } from "fp-ts/lib/Foldable2v"
import { Identity } from "fp-ts/lib/Identity"
import {
  fromEither,
  none,
  Option,
  some
  } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import { getStructSetoid, setoidString } from "fp-ts/lib/Setoid"
import React from "react"
import { ConfirmableDeleteButton } from "../../../../../components/button/confirmable-delete"
import { CodeEditor, EditorLangCodec } from "../../../../../components/code-editor"
import { fromStrToJSONRec } from "../../../../../data/JSON"
import { None, Some } from "../../../../../data/Option"
import { useMemoPlus } from "../../../../../hooks/use-memo-plus"
import { useRematch } from "../../../../../hooks/use-rematch"
import { isWhitespace } from "../../../../../lib/string"
import { WithRouteProps } from "../../../../../state/navigation"
import { store } from "../../../../../state/store"
import {
  PersistedConfig,
  InProgressRemoteUpdateDraft,
} from "../../../../../data/GlobalConfig.Config"

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
  const [fromStore, dispatch] = useRematch((s) => ({
    configs: s.globalConfig.configs,
    configsById: store.select.globalConfig.configsById(s),
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
      {focusedConfig.foldL(
        None(() => <Empty description={`No config found with id ${configId}`} />),
        Some((config) => <UpdatePersistedConfigForm config={config} />)
      )}
    </Skeleton>
  )
}

function UpdatePersistedConfigForm(props: { config: PersistedConfig }) {
  const [fromStore, dispatch] = useRematch((s) => ({
    configs: s.globalConfig.configs,
    configNames: store.select.globalConfig.configNames(s),
    defaultEntityTypeConfig: s.globalConfig.defaultEntityTypeConfig,
    entityTypes: store.select.globalConfig.entityTypeConfigs(s),
    isUpdatingRemoteConfig: s.loading.effects.globalConfig.updateRemoteConfig,
    isDeletingRemoteConfig: s.loading.effects.globalConfig.deleteRemoteConfigsById,
  }))

  const [updatedConfig, setUpdatedConfig] = React.useState<Option<InProgressRemoteUpdateDraft>>(
    none
  )

  const entityTypeConfig = React.useMemo(
    () => record.lookup(props.config.type, fromStore.entityTypes),
    [fromStore.entityTypes, props.config.type]
  )

  const configLang = React.useMemo(() => {
    return entityTypeConfig
      .chain((etc) => etc.config)
      .chain(fromStrToJSONRec)
      .chain((config) => record.lookup("lang", config))
      .chain((lang) => fromEither(EditorLangCodec.decode(lang)))
      .getOrElse(fromStore.defaultEntityTypeConfig.lang)
  }, [entityTypeConfig, fromStore.defaultEntityTypeConfig.lang])

  const existingConfigNames = React.useMemo(() => {
    return fromStore.configNames.filter((name) => name !== props.config.name)
  }, [fromStore.configNames, props.config.name])

  const initialFormState = {
    config: props.config.config.map((c) => c.toString()).getOrElse(""),
    name: props.config.name,
  }

  /* afterCreate */
  React.useEffect(() => {
    updatedConfig.chain(findInStore).foldL(
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
          description={`No config of type "EntityType" could be found for configs of type "${
            props.config.type
          }." For the best experience, please create an EntityType config for ${props.config.type}`}
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
              config: isWhitespace(vs.config) ? some("Cannot be empty") : none,
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
              ...props.config,
              ...values,
            })
            .then(() => setSubmitting(false))
        }}>
        {(form) => (
          <>
            <Card
              bordered={false}
              extra={
                <Button.Group size="small">
                  <Button
                    form="edit-config-form"
                    htmlType="submit"
                    icon={fromStore.isUpdatingRemoteConfig ? "loading" : "save"}
                    key="save"
                    loading={fromStore.isUpdatingRemoteConfig}
                    size="small"
                    type="primary">
                    Save
                  </Button>

                  {form.dirty ? (
                    <Button
                      icon="close-circle"
                      key="cancel"
                      size="small"
                      type="default"
                      onClick={form.handleReset}>
                      Cancel
                    </Button>
                  ) : (
                    <ConfirmableDeleteButton
                      confirmationMessage={`Are you sure want to delete?`}
                      confirmationTitle={`Confirm Delete`}
                      loading={fromStore.isDeletingRemoteConfig}
                      size="small"
                      onDelete={() =>
                        dispatch.globalConfig.deleteRemoteConfigsById([props.config.id])
                      }>
                      Delete
                    </ConfirmableDeleteButton>
                  )}
                </Button.Group>
              }
              title={`Create Config`}>
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
                      Some((etc) => (
                        <Reach.Link to={`../../${etc.id}`}>{props.config.type}</Reach.Link>
                      ))
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
                    content={props.config.config.getOrElse("")}
                    contentDraft={some(form.values.config)}
                    height={500}
                    language={configLang}
                    width="100%"
                    onChange={(val) => {
                      form.setFieldValue("config", val)
                      form.setFieldTouched("config", true)
                    }}
                  />
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
